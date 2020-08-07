# NZ Place Search

This repository provides a simple tool for searching places in NZ.

## Run a local search server
`npm run start`

The server should be accessible on `localhost:3000`.

## Querying

Query the server at `/search/{query}`.

For example:

Querying `http://localhost:3000/search/Aoraki` will result in the following json:

```json
[
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