import { requireAdmin } from '../_lib/auth';
import { DbFilter, updateRows } from '../_lib/dbCrud';
import { methodNotAllowed, readJsonBody } from '../_lib/http';

interface UpdatePayload {
  table: string;
  values: Record<string, unknown>;
  filters: DbFilter[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const body = await readJsonBody<UpdatePayload>(req);
    const data = await updateRows({ table: body.table, values: body.values, filters: body.filters || [] });
    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('DB update error:', error);
    return res.status(400).json({ error: error.message || 'Failed to update data.' });
  }
}
