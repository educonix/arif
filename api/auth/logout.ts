import { clearAdminSession } from '../_lib/auth';
import { methodNotAllowed } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  clearAdminSession(res);
  return res.status(200).json({ success: true });
}
