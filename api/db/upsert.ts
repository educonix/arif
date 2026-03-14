import { requireAdmin } from '../_lib/auth';
import { upsertRows } from '../_lib/dbCrud';
import { methodNotAllowed, readJsonBody } from '../_lib/http';

interface UpsertPayload {
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
    const body = await readJsonBody<UpsertPayload>(req);
    const rows = Array.isArray(body.values) ? body.values : [body.values];
    const data = await upsertRows({ table: body.table, values: rows });
    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('DB upsert error:', error);
    return res.status(400).json({ error: error.message || 'Failed to upsert data.' });
  }
}
