import { methodNotAllowed } from '../../_lib/http';
import { getStorageFile } from '../../_lib/storage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  try {
    const bucket = Array.isArray(req.query.bucket) ? req.query.bucket[0] : req.query.bucket;
    const pathParts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    const path = pathParts.filter(Boolean).map((part) => decodeURIComponent(part)).join('/');

    if (!bucket || !path) {
      return res.status(400).send('Invalid path.');
    }

    const file = await getStorageFile({ bucket, path });

    if (!file) {
      return res.status(404).send('Not found');
    }

    const content = Buffer.from(file.data_base64, 'base64');
    res.setHeader('Content-Type', file.content_type || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(content);
  } catch (error) {
    console.error('Storage public fetch error:', error);
    return res.status(404).send('Not found');
  }
}
