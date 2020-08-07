import fetch from "node-fetch";
import fs from "fs";
import { OSMResult } from "./osmPlace";
import { SearchPlace } from "./searchPlace";
import { deduplicate } from "./deduplicate";

const osmQuery = "https://www.overpass-api.de/api/interpreter?[out:json];node[natural](-47.9,165.9,-34.0,179.0);out;";
const fullOSMFile = "data/osm_natural_nz_places.json";
const minOSMFile = "data/min_osm_nz_places.json";

const nzGazetteerUrl = "https://gazetteer.linz.govt.nz/gaz.csv";
const nzGazetteerFile = "data/gazetteer.json";
const minNZGazetteerFile = "data/min_gazetteer.json";

const searchFile = "data/min_nz_places.json"

const writeFile = async (path: string, data: string) => {
    return new Promise((accept, rej) => {
        fs.writeFile(path, data, (err) => {
            if (!err)
                accept();
            else rej(err)
        });
    });
}

const writeJsonFile = async (path: string, data: any) => {
    await writeFile(path, JSON.stringify(data));
}

const readFile = async (path: string): Promise<string> => {
    return new Promise((accept, rej) => {
        fs.readFile(path, (err, data) => {
            if (!err)
                accept(data.toString());
            else rej(err);
        })
    });
}

const readJsonFile = async (path: string) => {
    const text = await readFile(path);
    return JSON.parse(text);
}

const refetchOSMData = async () => {
    console.log("Fetching OSM data from", osmQuery);
    const response = await fetch(osmQuery);
    const text = await response.json();
    console.log("Fetched data from OSM");

    await writeJsonFile(fullOSMFile, text);
    console.log("Wrote OSM data to ", fullOSMFile);
};

const stripOSMData = async () => {
    console.log("Removing unneeded OSM data...");
    const osmPlaces = await readJsonFile(fullOSMFile) as OSMResult;

    const result: SearchPlace[] = [];
    for (const place of osmPlaces.elements) {
        result.push({
            osmId: place.id,
            name: place.tags.name,
            lat: place.lat,
            lon: place.lon,
            type: place.tags.natural
        });
    }

    await writeJsonFile(minOSMFile, result);
    console.log("Wrote minified OSM data to", minOSMFile);
}

const fetchGazetteerData = async () => {
    console.log("Fetching nz gazetteer data");
    const response = await fetch(nzGazetteerUrl);
    const text = await response.text();

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
    await writeFile(nzGazetteerFile, JSON.stringify(result, null, 4));
    console.log("Wrote nz gazetteer data to", nzGazetteerFile);
}

const stripGazetteerData = async () => {
    console.log("Minifying gazetteer data");
    const places: any[] = await readJsonFile(nzGazetteerFile);
    
    const result: SearchPlace[] = [];
    for (const place of places) {
        const minPlace = {
            gazId: place.feat_id,
            name: place.name,
            lon: place.crd_longitude,
            lat: place.crd_latitude,
            type: place.feat_type
                ? place.feat_type.toLowerCase()
                : undefined
        };
        if (isNaN(minPlace.lat) || isNaN(minPlace.lon) || !minPlace.name)
            continue;
        result.push(minPlace);
    }

    await writeJsonFile(minNZGazetteerFile, result);
    console.log("Wrote minified gazetter data to", minNZGazetteerFile);
}

const joinOutputs = async () => {
    console.log("Joining outputs and deduplicating");
    const gazPlaces = await readJsonFile(minNZGazetteerFile);
    const osmPlaces = await readJsonFile(minOSMFile);

    const result = [
        ...gazPlaces,
        ...osmPlaces
    ].filter(r => !!r.name);

    const deduplicated = deduplicate(result);

    await writeJsonFile(searchFile, deduplicate);
    console.log("Wrote joined file", searchFile);
}

(async () => {
    if (!fs.existsSync(fullOSMFile))
        await refetchOSMData();
    await stripOSMData();

    if (!fs.existsSync(nzGazetteerFile))
        await fetchGazetteerData();
    await stripGazetteerData();

    await joinOutputs();
})();