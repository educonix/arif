import { query } from './_lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await query<Record<string, unknown>>(
      'select * from projects_table where coalesce(is_visible, true) = true order by sort_order asc nulls last, created_at desc nulls last',
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching projects rows from Neon:', error);
    return res.status(200).json([]);
  }
}
