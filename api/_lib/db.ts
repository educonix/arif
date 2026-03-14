import { Pool } from 'pg';

let pool: Pool | null = null;

export const getPool = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return pool;
};

export const query = async <T>(text: string, params: unknown[] = []) => {
  const activePool = getPool();
  const result = await activePool.query<T>(text, params);
  return result.rows;
};
