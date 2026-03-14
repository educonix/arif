import { query } from './_lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await query<Record<string, unknown>>(
      'select * from gallery_table where coalesce(is_visible, true) = true order by photo_date desc nulls last, sort_order asc nulls last',
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching gallery rows from Neon:', error);
    return res.status(200).json([]);
  }
}
