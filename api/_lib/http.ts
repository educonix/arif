export const readJsonBody = async <T = Record<string, unknown>>(req: any): Promise<T> => {
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }

  if (typeof req.body === 'string' && req.body.length) {
    return JSON.parse(req.body) as T;
  }

  if (typeof req.on !== 'function') {
    return {} as T;
  }

  return await new Promise<T>((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk: Buffer | string) => {
      raw += chunk.toString();
    });

    req.on('end', () => {
      if (!raw) {
        resolve({} as T);
        return;
      }

      try {
        resolve(JSON.parse(raw) as T);
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (error: Error) => {
      reject(error);
    });
  });
};

export const methodNotAllowed = (res: any) => res.status(405).json({ error: 'Method not allowed' });
