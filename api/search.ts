import { NowRequest, NowResponse } from '@vercel/node'

const places = require("../data/min_nz_places.json");

export default (req: NowRequest, res: NowResponse) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ name: 'JohnFoo', email: 'john@example.com' });
}
