export interface SearchPlace {
    osmId?: number;
    gazId?: number;
    name: string;
    type: string;
    lat: number;
    lon: number;
    county?: string;
}