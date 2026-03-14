import { query } from './_lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await query<Record<string, unknown>>(
      "select * from research_papers where coalesce(status, 'draft') = 'published' order by coalesce(published_at, publish_date::timestamptz) desc nulls last, created_at desc nulls last",
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching research papers from Neon:', error);
    return res.status(200).json([]);
  }
}
