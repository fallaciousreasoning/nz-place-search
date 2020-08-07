# NZ Place Search

This repository provides a simple tool for searching places in NZ.

## Live version

A live test site is available at https://nz-places.now.sh

(the API is available at https://nz-places.now.sh/api/search?query=Aoraki)

## Run a local search server
`npm run start`

The server should be accessible on `localhost:3000`.

## Querying

Query the server at `/search/query={query}`.

For example:

Querying `http://localhost:3000/search?query=Aoraki` will result in the following json:

```json
[
    {
        "gazId": "26004",
        "name": "Aoraki/Mount Cook",
        "lon": "170.141926",
        "lat": "-43.595348",
        "type": "hill"
    },
    {
        "gazId": "26005",
        "name": "Aoraki/Mount Cook",
        "lon": "170.098209",
        "lat": "-43.735107",
        "type": "town"
    },
    {
        "gazId": "48301",
        "name": "Aoraki/Mount Cook National Park",
        "lon": "170.285431",
        "lat": "-43.599748",
        "type": "national park"
    },
    {
        "osmId": 2625064349,
        "name": "Aoraki / Mount Cook",
        "lat": -43.5950017,
        "lon": 170.1421677,
        "type": "peak"
    }
]
```

## Update place data
1. rm `data/osm_natural_nz_places.json`
2. `npm run update-data` to refetch the data from OSM.