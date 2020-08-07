import fetch from "node-fetch";
import fs from "fs";
import { OSMResult } from "./osmPlace";
import { SearchPlace } from "./searchPlace";

const osmQuery = "https://www.overpass-api.de/api/interpreter?[out:json];node[natural](-47.9,165.9,-34.0,179.0);out;";
const fullOSMFile = "data/osm_natural_nz_places.json";
const minOSMFile = "data/min_nz_places.json";

const writeJsonFile = async (path: string, data: any) => {
    return new Promise((accept, rej) => {
        fs.writeFile(path, JSON.stringify(data), (err) => {
            if (!err)
                accept();
            else rej(err)
        });
    });
}

const readJsonFile = async (path: string) => {
    return new Promise((accept, rej) => {
        fs.readFile(path, (err, data) => {
            if (!err)
                accept(JSON.parse(data.toString()));
            else rej(err);
        })
    });
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

(async () => {
    if (!fs.existsSync(fullOSMFile))
        await refetchOSMData();
    await stripOSMData();
})();