import fetch from "node-fetch";
import fs from "fs";
import { OSMResult } from "./osmPlace";
import { SearchPlace } from "./searchPlace";

const query = "https://www.overpass-api.de/api/interpreter?[out:json];node[natural](-47.9,165.9,-34.0,179.0);out;";
const fullFile = "data/osm_natural_nz_places.json";
const minFile = "data/min_nz_places.json";

const writeFile = async (path: string, data: any) => {
    return new Promise((accept, rej) => {
        fs.writeFile(path, data, (err) => {
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

const refetchData = async () => {
    console.log("Fetching", query);
    const response = await fetch(query);
    const text = await response.json();
    console.log("Fetched data from OSM");

    await writeFile(fullFile, JSON.stringify(text));
    console.log("Wrote to ", fullFile);
};

const stripData = async () => {
    console.log("Removing unneeded data...");
    const osmPlaces = await readJsonFile(fullFile) as OSMResult;

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

    await writeFile(minFile, JSON.stringify(result));
    console.log("Wrote minified data to", minFile);
}

(async () => {
    if (!fs.existsSync(fullFile))
        await refetchData();
    await stripData();
})();