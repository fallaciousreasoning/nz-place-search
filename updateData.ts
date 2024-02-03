import fetch from "node-fetch";
import fs from "fs";
import { OSMResult } from "./osmPlace";
import { SearchPlace } from "./searchPlace";
import { deduplicate, filterBadResults, fixups } from "./deduplicate";
import { writeJsonFile, readJsonFile, writeFile } from "./files";
import path from 'path'

const outputFile = 'data/min_nz_places.json'

interface DataSource {
    name: string,
    getData: () => Promise<any>,
    transformData: (data: any) => SearchPlace[]
}

const sources: DataSource[] = [
    {
        name: 'osm',
        getData: () => fetch('https://www.overpass-api.de/api/interpreter?[out:json];node[natural](-47.9,165.9,-34.0,179.0);out;').then(r => r.json()),
        transformData: (data: any) => data.elements.map((place: any) => ({
            name: place.tags.name,
            lat: place.lat,
            lon: place.lon,
            type: place.tags.natural
        }))
    },
    {
        name: 'gazetteer',
        getData: async () => {
            const text = await fetch('https://gazetteer.linz.govt.nz/gaz.csv').then(r => r.text())
            const lines = text.split('\n');
            const header = lines[0].split(',');
            const result = [];
            for (let i = 1; i < lines.length; ++i) {
                const values = lines[i].split(',');
                const place: any = {};
                for (let j = 0; j < header.length; ++j) {
                    const key = header[j];
                    const value = values[j];
                    if (!key) continue;
                    if (!value) continue;

                    place[key] = value;
                }
                result.push(place);
            }
            return result
        },
        transformData: (data: any) => data.map((place: any) => ({
            name: place.name,
            lon: parseFloat(place.crd_longitude),
            lat: parseFloat(place.crd_latitude),
            type: place.feat_type
                ? place.feat_type.toLowerCase()
                : undefined
        })).filter((p: SearchPlace) => !isNaN(p.lat) && !isNaN(p.lon))
    },
    {
        name: 'huts',
        getData: async () => fetch('https://api.doc.govt.nz/v2/huts?coordinates=wgs84', {
            headers: {
                'x-api-key': 'yNyjpuXvMJ1g2d0YEpUmW7VZhePMqbCv96GRjq8L'
            }
        }).then(r => r.json()),
        transformData: (data) => data.map((hut: any) => ({
            name: hut.name,
            lat: hut.lat,
            lon: hut.lon,
            type: 'hut'
        }))
    },
    {
        name: 'mountains',
        getData: async () => fetch('https://raw.githubusercontent.com/fallaciousreasoning/nz-mountains/main/mountains.json').then(r => r.json()),
        transformData: data => {
            return Object.values(data)
                .filter((mountain: any) => mountain.latlng?.length >= 2)
                .map((mountain: any) => ({
                    name: mountain.name,
                    type: 'peak',
                    lat: parseFloat(mountain.latlng[0]),
                    lon: parseFloat(mountain.latlng[1]),
                }))
        }
    }
]

const processSource = async (source: DataSource) => {
    console.log(`Processing ${source.name}`)

    const baseName = path.join('data', source.name)
    const name = baseName + '.json'
    const minName = baseName + '.min.json'

    let data: any
    if (!fs.existsSync(name)) {
        console.log(`Fetching ${source.name} data`)
        data = await source.getData()
        await writeJsonFile(name, data)
        console.log(`Fetched ${source.name} data`)
    } else {
        data = await readJsonFile(name)
    }

    console.log(`Minifying ${source.name}`)
    const minified = source.transformData(data)
    await writeJsonFile(minName, minified)
    console.log(`Minified ${source.name}`)
}

const joinOutputs = async () => {
    console.log("Joining outputs and deduplicating");
    const minFiles = sources.map(s => path.join('data', s.name + '.min.json'))

    const result = (await Promise.all(minFiles.map(f => readJsonFile(f)))
        .then(r => r.flatMap(i => i)))
        .filter(r => !!r.name)

    const fixed = fixups(result);
    const filtered = filterBadResults(fixed);
    const deduplicated = deduplicate(filtered);

    await writeJsonFile(outputFile, deduplicated);
    console.log("Wrote joined file", outputFile);
}

(async () => {
    if (!fs.existsSync('data')) fs.mkdirSync('data')
    for (const source of sources)
        await processSource(source)

    await joinOutputs();
})();
