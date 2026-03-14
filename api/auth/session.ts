import { getAdminSession } from '../_lib/auth';
import { methodNotAllowed } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const session = getAdminSession(req);

  if (!session) {
    return res.status(200).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      email: session.email,
    },
  });
}
