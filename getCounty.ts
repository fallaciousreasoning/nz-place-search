import fetch from 'node-fetch';
import { SearchPlace } from './searchPlace';
import { writeJsonFile, readJsonFile } from './files';
import fs from 'fs';

export const getCounty = async (lat: number, lng: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lng}&zoom=8&format=jsonv2&addressdetails=0`;
    const request = await fetch(url);
    const response = await request.json();

    return response.name;
}

export const getCounties = async (places: SearchPlace[]) => {
    const result: { [id: string]: string } = fs.existsSync('data/counties.json')
        ? require('./data/counties.json')
        : {};

    const logProgress = (done: number) => {
        console.log(`Done ${done}/${places.length} (${Math.round(done / places.length * 10000)/100}%)`);
    }
    const dumpEvery = 10;

    for (let i = 0; i < places.length; ++i) {
        logProgress(i);
        const place = places[i];
        if (place.county)
            continue;

        const id = `${place.lat}_${place.lon}`;
        if (result[id]) {
            place.county = result[id];
            continue;
        }

        try {
            const county = await getCounty(place.lat, place.lon);
            place.county = county;
            result[id] = county;
        } catch {

        }

        if ((i + 1) % dumpEvery === 0) {
            await writeJsonFile('data/counties.json', result);
        }
    }

    return result;
}

(async () => {
    const places = require('./data/min_nz_places.json');
    const counties = getCounties(places);
    writeJsonFile('data/counties.json', counties);
})();