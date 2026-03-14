import { requireAdmin } from '../_lib/auth';
import { insertRows } from '../_lib/dbCrud';
import { methodNotAllowed, readJsonBody } from '../_lib/http';

interface InsertPayload {
  table: string;
  values: Record<string, unknown>[] | Record<string, unknown>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const body = await readJsonBody<InsertPayload>(req);
    const rows = Array.isArray(body.values) ? body.values : [body.values];
    const data = await insertRows({ table: body.table, values: rows });
    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('DB insert error:', error);
    return res.status(400).json({ error: error.message || 'Failed to insert data.' });
  }
}
