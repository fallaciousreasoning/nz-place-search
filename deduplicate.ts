import { SearchPlace } from "./searchPlace";

const closenessThreshold = 0.05;

const getName = (p: SearchPlace) => p.name.toLowerCase()
    .replace("mt", "mount")
    .replace(" / ", "/");

const getDist = (p1: SearchPlace, p2: SearchPlace) => {
    const dlat = p1.lat - p2.lat;
    const dlon = p1.lon - p2.lon;

    return Math.sqrt(dlat**2 + dlon**2);
}

const minimalSet = (places: SearchPlace[]) => {
    places = [...places];
    const result: SearchPlace[] = [];

    const getMatchIndex = (place: SearchPlace) => {
        for (let i = 0; i < result.length; ++i) {
            if (getDist(result[i], place) < closenessThreshold)
                return i;
        }
        return -1;
    }

    while (places.length) {
        const place = places.pop();
        const matchIndex = getMatchIndex(place);

        if (matchIndex === -1) {
            result.push(place);
            continue;
        }

        result[matchIndex] = {
            ...place,
            ...result[matchIndex]
        }
    }

    return result;
}

export const deduplicate = (places: SearchPlace[]) => {
    const dict: { [name: string]: SearchPlace[] } = {};

    for (const place of places) {
        const name = getName(place);

        if (!dict[name])
            dict[name] = [];

        dict[name].push(place);
    }

    const deduplicated: SearchPlace[] = [];
    for (const name in dict) {
        const minSet = minimalSet(dict[name]);
        deduplicated.push(...minSet);
    }

    console.log(`Went from ${places.length} places to ${deduplicated.length} after deduplication`)
    return deduplicated;
}