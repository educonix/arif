import { setAdminSession, verifyAdminCredentials } from '../_lib/auth';
import { methodNotAllowed, readJsonBody } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  try {
    const body = await readJsonBody<{ email?: string; password?: string }>(req);
    const email = body.email || '';
    const password = body.password || '';

    const result = verifyAdminCredentials(email, password);

    if (!result.valid) {
      return res.status(401).json({ error: result.reason });
    }

    setAdminSession(res, email);
    return res.status(200).json({ user: { email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to process login request.' });
  }
}
