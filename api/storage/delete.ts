import { requireAdmin } from '../_lib/auth';
import { deleteStorageFiles } from '../_lib/storage';
import { methodNotAllowed, readJsonBody } from '../_lib/http';

interface DeletePayload {
  bucket: string;
  paths: string[];
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
    await deleteStorageFiles({ bucket: body.bucket, paths: body.paths || [] });
    return res.status(200).json({ data: true });
  } catch (error: any) {
    console.error('Storage delete error:', error);
    return res.status(400).json({ error: error.message || 'Failed to delete file.' });
  }
}
