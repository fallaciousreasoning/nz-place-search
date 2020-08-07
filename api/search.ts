import { NowRequest, NowResponse } from '@vercel/node'
import { SearchPlace } from '../searchPlace';

const places: SearchPlace[] = require("../data/min_nz_places.json");

function* filterPlaces(query: string) {
  for (const place of places) {
      const name = place.name;
      if (!name) continue;
      if (!name.toLowerCase().includes(query.toLowerCase())) continue;

      yield place;
  }
}

export default (req: NowRequest, res: NowResponse) => {
  res.setHeader("Content-Type", "application/json");
  const query = (req.query.query || '') as string;
  const matchingPlaces = Array.from(filterPlaces(query));
  res.json(matchingPlaces);
}
