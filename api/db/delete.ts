import { requireAdmin } from '../_lib/auth';
import { DbFilter, deleteRows } from '../_lib/dbCrud';
import { methodNotAllowed, readJsonBody } from '../_lib/http';

interface DeletePayload {
  table: string;
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
    const body = await readJsonBody<DeletePayload>(req);
    const data = await deleteRows({ table: body.table, filters: body.filters || [] });
    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('DB delete error:', error);
    return res.status(400).json({ error: error.message || 'Failed to delete data.' });
  }
}
