import { query } from './_lib/db';

const normalizeSettingsRow = (row: Record<string, unknown> | undefined) => {
  if (!row) return {};
  if (row.settings && typeof row.settings === 'object') return row.settings;
  if (row.content && typeof row.content === 'object') return row.content;
  return row;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await query<Record<string, unknown>>(
      'select * from site_settings order by id asc limit 1',
    );

    return res.status(200).json(normalizeSettingsRow(rows[0]));
  } catch (error) {
    console.error('Error fetching site settings from Neon:', error);
    return res.status(200).json({});
  }
}
