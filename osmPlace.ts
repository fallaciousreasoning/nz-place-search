export interface OSMPlace {
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags: {
        [key: string]: string;
    } & {
        name: string;
    }
}

export interface OSMResult {
    version: number;
    elements: OSMPlace[];
}