import { SearchPlace } from "./searchPlace";

const closenessThreshold = 0.05;

const getName = (p: SearchPlace) => p.name.toLowerCase()
    .replace("mt", "mount")
    .replace(" / ", "/");

const getDist = (p1: SearchPlace, p2: SearchPlace) => {
    const dlat = p1.lat - p2.lat;
    const dlon = p1.lon - p2.lon;

    return Math.sqrt(dlat ** 2 + dlon ** 2);
}

export const findClose = (p1: SearchPlace, places: SearchPlace[], threshold: number=0.0000001) => {
    return places.filter(p => getDist(p1, p) < threshold)
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

    const result: SearchPlace[] = []
    const seen = new Set<SearchPlace>()
    for (const place of deduplicated) {
        if (seen.has(place)) continue

        const close = findClose(place, deduplicated).filter(c => c.type === place.type)
        for (const place of close) seen.add(place)
        result.push(place)
    }

    console.log(`Went from ${places.length} places to ${result.length} after deduplication`)
    return result;
}

export const fixups = (places: SearchPlace[]) => {
    const typeOverrides: { [type: string]: string } = {
        "reserve (non-cpa)": 'reserve',
        "hill": "peak",
        "pinnacle": "peak"
    }

    for (const place of places) {
        if (typeOverrides[place.type]) {
            place.type = typeOverrides[place.type]
        }
    }

    const isGood = /^[A-Z a-z_]+$/g
    const fixed = places.filter(p => p.type.match(isGood))
    return fixed;
}

export const filterBadResults = (places: SearchPlace[]) => places
    .filter(c => c.lat !== 0 && c.lon !== 0)
