import { requireAdmin } from '../_lib/auth';
import { DbFilter, DbOrder, selectRows } from '../_lib/dbCrud';
import { methodNotAllowed, readJsonBody } from '../_lib/http';

interface SelectPayload {
  table: string;
  columns?: string;
  filters?: DbFilter[];
  orders?: DbOrder[];
  single?: boolean;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const body = await readJsonBody<SelectPayload>(req);

    const data = await selectRows({
      table: body.table,
      columns: body.columns,
      filters: body.filters,
      orders: body.orders,
      single: body.single,
    });

    if (body.single && !data) {
      return res.status(200).json({ data: null, error: { message: 'No rows found' } });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error('DB select error:', error);
    return res.status(400).json({ error: error.message || 'Failed to query database.' });
  }
}
