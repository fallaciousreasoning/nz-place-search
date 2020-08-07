const places = require("../data/min_nz_places.json");

function* filterPlaces(query) {
    for (const place of places) {
        const name = place.name;
        if (!name) continue;
        if (!name.includes(query)) continue;

        yield place;
    }
}

module.exports = (req, res) => {
    const query = req.params.query;
    const matchingPlaces = Array.from(filterPlaces(query));

    res.setHeader("Content-Type", "application/json");
    res.send(matchingPlaces);
}