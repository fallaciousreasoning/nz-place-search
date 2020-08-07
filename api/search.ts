import { NowRequest, NowResponse } from '@vercel/node'
import { SearchPlace } from '../searchPlace';

const places: SearchPlace[] = require("../data/min_nz_places.json");

function* filterPlaces(query: string) {
  for (const place of places) {
      const name = place.name;
      if (!name) continue;
      if (!name.includes(query)) continue;

      yield place;
  }
}

export default (req: NowRequest, res: NowResponse) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ name: 'JohnFoo', email: 'john@example.com' });
}
