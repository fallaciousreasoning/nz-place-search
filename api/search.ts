import { NowRequest, NowResponse } from '@vercel/node'

export default (req: NowRequest, res: NowResponse) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ name: 'JohnFoo', email: 'john@example.com' });
}
