import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const csvPath = path.join(process.cwd(), 'data', '1926-2024_COMBINED_NFL_SCORES.csv');
  const csv = fs.readFileSync(csvPath, 'utf-8');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.status(200).send(csv);
}
