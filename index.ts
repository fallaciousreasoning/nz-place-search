import express from "express";
import { SearchPlace } from "./searchPlace";

const app = express();
const places: SearchPlace[] = require("./data/min_nz_places.json");

function* filterPlaces(query: string) {
    for (const place of places) {
        const name = place.name;
        if (!name) continue;
        if (!name.includes(query)) continue;

        yield place;
    }
}

console.log(places.length)

app.use("/search/:query", (req, res) => {
    const query = req.params.query;
    const matchingPlaces = Array.from(filterPlaces(query));

    res.setHeader("Content-Type", "application/json");
    res.send(matchingPlaces);
});

const server = app.listen(3000, () => {
    console.log("Listening on ", server.address());
})