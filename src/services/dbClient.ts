interface ApiError {
  message: string;
}

interface DbFilter {
  column: string;
  value: unknown;
}

interface DbOrder {
  column: string;
  ascending?: boolean;
  nullsFirst?: boolean;
}

type QueryAction = 'select' | 'insert' | 'update' | 'upsert' | 'delete';

const apiFetch = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
};

const toError = async (response: Response): Promise<ApiError> => {
  try {
    const payload = await response.json();

    if (payload?.error && typeof payload.error === 'string') {
      return { message: payload.error };
    }

    if (payload?.error?.message) {
      return { message: payload.error.message };
    }
  } catch {
    // ignore json parsing errors
  }

  return { message: `Request failed with status ${response.status}` };
};

class QueryBuilder<T = any> implements PromiseLike<{ data: T; error: ApiError | null }> {
  private readonly table: string;
  private action: QueryAction = 'select';
  private columns = '*';
  private filters: DbFilter[] = [];
  private orders: DbOrder[] = [];
  private singleResult = false;
  private payload: unknown = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*') {
    this.action = 'select';
    this.columns = columns;
    return this;
  }

  insert(values: unknown[] | unknown) {
    this.action = 'insert';
    this.payload = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.action = 'update';
    this.payload = values;
    return this;
  }

  upsert(values: unknown[] | unknown) {
    this.action = 'upsert';
    this.payload = values;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    this.orders.push({ column, ...options });
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  then<TResult1 = { data: T; error: ApiError | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T; error: ApiError | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }

  private async execute(): Promise<{ data: any; error: ApiError | null }> {
    try {
      if (this.action === 'select') {
        const response = await apiFetch('/api/db/select', {
          method: 'POST',
          body: JSON.stringify({
            table: this.table,
            columns: this.columns,
            filters: this.filters,
            orders: this.orders,
            single: this.singleResult,
          }),
        });

        if (!response.ok) {
          return { data: this.singleResult ? null : [], error: await toError(response) };
        }

        const payload = await response.json();

        if (payload?.error) {
          return {
            data: this.singleResult ? null : [],
            error: typeof payload.error === 'string' ? { message: payload.error } : payload.error,
          };
        }

        return { data: payload.data ?? (this.singleResult ? null : []), error: null };
      }

      const endpoint = `/api/db/${this.action}`;
      const body: Record<string, unknown> = { table: this.table };

      if (this.action === 'insert' || this.action === 'upsert') {
        body.values = this.payload as unknown[];
      }

      if (this.action === 'update') {
        body.values = this.payload as Record<string, unknown>;
        body.filters = this.filters;
      }

      if (this.action === 'delete') {
        body.filters = this.filters;
      }

      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return { data: null, error: await toError(response) };
      }

      const payload = await response.json();
      if (payload?.error) {
        return {
          data: null,
          error: typeof payload.error === 'string' ? { message: payload.error } : payload.error,
        };
      }

      return { data: payload.data ?? null, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Unexpected API error' } };
    }
  }
}

const readFileAsDataUrl = async (file: File | Blob): Promise<string> => {
  if (typeof FileReader === 'undefined') {
    throw new Error('FileReader is not available in this environment.');
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to encode file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

const createStorageBucketClient = (bucket: string) => {
  return {
    upload: async (path: string, file: File | Blob) => {
      try {
        const dataUrl = await readFileAsDataUrl(file);

        const response = await apiFetch('/api/storage/upload', {
          method: 'POST',
          body: JSON.stringify({ bucket, path, dataUrl }),
        });

        if (!response.ok) {
          return { data: null, error: await toError(response) };
        }

        const payload = await response.json();
        if (payload?.error) {
          return {
            data: null,
            error: typeof payload.error === 'string' ? { message: payload.error } : payload.error,
          };
        }

        return { data: payload.data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message || 'Failed to upload file.' } };
      }
    },

    remove: async (paths: string[]) => {
      try {
        const response = await apiFetch('/api/storage/delete', {
          method: 'POST',
          body: JSON.stringify({ bucket, paths }),
        });

        if (!response.ok) {
          return { data: null, error: await toError(response) };
        }

        const payload = await response.json();
        if (payload?.error) {
          return {
            data: null,
            error: typeof payload.error === 'string' ? { message: payload.error } : payload.error,
          };
        }

        return { data: payload.data, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message || 'Failed to delete file.' } };
      }
    },

    getPublicUrl: (path: string) => {
      const safePath = path
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');

      return {
        data: {
          publicUrl: `/api/storage/${encodeURIComponent(bucket)}/${safePath}`,
        },
      };
    },
  };
};

const neonClient = {
  from: (table: string) => new QueryBuilder(table),

  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          return { data: { user: null }, error: await toError(response) };
        }

        const payload = await response.json();
        return { data: { user: payload.user || null }, error: null };
      } catch (error: any) {
        return { data: { user: null }, error: { message: error.message || 'Login failed.' } };
      }
    },

    signOut: async () => {
      try {
        const response = await apiFetch('/api/auth/logout', {
          method: 'POST',
        });

        if (!response.ok) {
          return { error: await toError(response) };
        }

        return { error: null };
      } catch (error: any) {
        return { error: { message: error.message || 'Logout failed.' } };
      }
    },
  },

  storage: {
    from: (bucket: string) => createStorageBucketClient(bucket),
  },
};

export const db: any = neonClient;
