import { query } from './db';
import { STORAGE_BUCKETS } from './tableConfig';

const parseDataUrl = (dataUrl: string) => {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);

  if (!match) {
    throw new Error('Invalid data URL payload.');
  }

  return {
    contentType: match[1],
    dataBase64: match[2],
  };
};

const normalizePath = (value: string) => {
  const trimmed = value.trim().replace(/^\/+/, '');

  if (!trimmed || trimmed.includes('..')) {
    throw new Error('Invalid storage path.');
  }

  return trimmed;
};

const assertBucketAllowed = (bucket: string) => {
  if (!STORAGE_BUCKETS.has(bucket)) {
    throw new Error(`Storage bucket \"${bucket}\" is not allowed.`);
  }
};

export const uploadStorageFile = async ({
  bucket,
  path,
  dataUrl,
}: {
  bucket: string;
  path: string;
  dataUrl: string;
}) => {
  assertBucketAllowed(bucket);
  const normalizedPath = normalizePath(path);
  const { contentType, dataBase64 } = parseDataUrl(dataUrl);

  await query(
    `insert into \"storage_files\" (\"bucket\", \"path\", \"content_type\", \"data_base64\", \"created_at\", \"updated_at\")
     values ($1, $2, $3, $4, now(), now())
     on conflict (\"bucket\", \"path\") do update
     set \"content_type\" = excluded.\"content_type\",\n         \"data_base64\" = excluded.\"data_base64\",\n         \"updated_at\" = now()`,
    [bucket, normalizedPath, contentType, dataBase64],
  );

  return { path: normalizedPath };
};

export const deleteStorageFiles = async ({ bucket, paths }: { bucket: string; paths: string[] }) => {
  assertBucketAllowed(bucket);

  const normalizedPaths = paths.map((path) => normalizePath(path));

  if (!normalizedPaths.length) {
    return;
  }

  await query('delete from "storage_files" where "bucket" = $1 and "path" = any($2::text[])', [bucket, normalizedPaths]);
};

export const getStorageFile = async ({ bucket, path }: { bucket: string; path: string }) => {
  assertBucketAllowed(bucket);
  const normalizedPath = normalizePath(path);

  const rows = await query<{ content_type: string; data_base64: string }>(
    'select "content_type", "data_base64" from "storage_files" where "bucket" = $1 and "path" = $2 limit 1',
    [bucket, normalizedPath],
  );

  return rows[0] || null;
};
