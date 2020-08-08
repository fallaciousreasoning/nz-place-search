import { NowRequest, NowResponse } from '@vercel/node'
import { SearchPlace } from '../searchPlace';

const places: SearchPlace[] = require("../data/min_nz_places.json");

function* filterPlaces(query: string) {
  const queries = [query.toLowerCase()];
  // Search for "Mount Foo" as well as "Mt Foo"
  if (queries[0].includes("mt"))
    queries.push(queries[0].replace("mt", "mount"));
  // Search for "Mt Foo" as well as "Mount Foo"
  if (queries[0].includes("mount"))
    queries.push(queries[0].replace("mount", "mt"));

  for (const place of places) {
      const name = place.name;
      if (!name) continue;

      const lowerName = name.toLowerCase();
      if (!queries.some(q => lowerName.includes(q)))
        continue;

      yield place;
  }
}

export default (req: NowRequest, res: NowResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  const query = (req.query.query || '') as string;
  const matchingPlaces = Array.from(filterPlaces(query));
  res.json(matchingPlaces);
}
