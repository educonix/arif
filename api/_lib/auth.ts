import crypto from 'crypto';

const COOKIE_NAME = 'arif_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

interface SessionPayload {
  email: string;
  exp: number;
}

const base64UrlEncode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const getSessionSecret = () => process.env.ADMIN_SESSION_SECRET || '';

const sign = (payload: string) => {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured.');
  }

  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
};

const createToken = (email: string) => {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
};

const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return {} as Record<string, string>;

  return cookieHeader
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const equalIndex = item.indexOf('=');
      if (equalIndex === -1) return acc;
      const key = item.slice(0, equalIndex).trim();
      const value = item.slice(equalIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);
};

const verifyToken = (token: string | undefined): SessionPayload | null => {
  if (!token) return null;

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return null;

  let expectedSignature: string;

  try {
    expectedSignature = sign(payloadEncoded);
  } catch {
    return null;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as SessionPayload;

    if (!payload.email || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const appendSetCookie = (res: any, cookieValue: string) => {
  const existing = res.getHeader?.('Set-Cookie');

  if (!existing) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }

  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieValue]);
    return;
  }

  res.setHeader('Set-Cookie', [existing, cookieValue]);
};

const buildCookie = (value: string, maxAge: number) => {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
};

export const verifyAdminCredentials = (email: string, password: string) => {
  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredEmail || !configuredPassword) {
    return { valid: false, reason: 'Admin credentials are not configured on the server.' };
  }

  if (email !== configuredEmail || password !== configuredPassword) {
    return { valid: false, reason: 'Invalid email or password.' };
  }

  return { valid: true, reason: '' };
};

export const setAdminSession = (res: any, email: string) => {
  const token = createToken(email);
  appendSetCookie(res, buildCookie(token, SESSION_TTL_SECONDS));
  return token;
};

export const clearAdminSession = (res: any) => {
  appendSetCookie(res, buildCookie('', 0));
};

export const getAdminSession = (req: any) => {
  const cookies = parseCookies(req.headers?.cookie);
  const token = cookies[COOKIE_NAME];
  return verifyToken(token);
};

export const requireAdmin = (req: any, res: any) => {
  const session = getAdminSession(req);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
};
