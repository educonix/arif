import { requireAdmin } from '../_lib/auth';
import { methodNotAllowed, readJsonBody } from '../_lib/http';
import { uploadStorageFile } from '../_lib/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

interface UploadPayload {
  bucket: string;
  path: string;
  dataUrl: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  try {
    const body = await readJsonBody<UploadPayload>(req);
    const result = await uploadStorageFile(body);
    return res.status(200).json({ data: result });
  } catch (error: any) {
    console.error('Storage upload error:', error);
    return res.status(400).json({ error: error.message || 'Failed to upload file.' });
  }
}
