import { query } from './db';
import { ADMIN_MUTATION_TABLES, TABLE_COLUMNS, assertColumnAllowed, assertTableAllowed } from './tableConfig';

export interface DbFilter {
  column: string;
  value: unknown;
}

export interface DbOrder {
  column: string;
  ascending?: boolean;
  nullsFirst?: boolean;
}

const parseList = (value?: string) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseCsv = (value: string) =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const normalizeInputRow = (table: string, input: Record<string, unknown>) => {
  const row: Record<string, unknown> = { ...input };

  if (table === 'site_settings') {
    if (row.id === undefined || row.id === null) {
      row.id = 1;
    }
  }

  if (table === 'site_content') {
    if (row.section === undefined && typeof row.key === 'string') {
      row.section = row.key;
    }

    if (row.content === undefined && row.value !== undefined) {
      row.content = row.value;
    }

    if (row.content !== undefined) {
      row.content = JSON.stringify(row.content);
    }
  }

  if (table === 'research_papers') {
    if (typeof row.keywords === 'string') {
      row.keywords_text = row.keywords;
      row.keywords = parseCsv(row.keywords);
    }

    if (typeof row.tags === 'string') {
      row.tags = parseCsv(row.tags);
    }

    if (typeof row.authors === 'string' && !row.author) {
      row.author = row.authors;
    }

    if (typeof row.author === 'string' && !row.authors) {
      row.authors = row.author;
    }

    if (!row.published_at && row.publish_date && row.status === 'published') {
      row.published_at = row.publish_date;
    }

    if (typeof row.pdfLink === 'string' && !row.pdf_url) {
      row.pdf_url = row.pdfLink;
    }
  }

  return row;
};

const normalizeOutputRow = (table: string, input: Record<string, unknown>) => {
  const row: Record<string, unknown> = { ...input };

  if (table === 'research_papers') {
    if ((!Array.isArray(row.keywords) || row.keywords.length === 0) && typeof row.keywords_text === 'string') {
      row.keywords = parseCsv(row.keywords_text);
    }

    if (!row.author && typeof row.authors === 'string') {
      row.author = row.authors;
    }

    if (!row.published_at && row.publish_date) {
      row.published_at = row.publish_date;
    }

    if (!row.pdfLink && typeof row.pdf_url === 'string') {
      row.pdfLink = row.pdf_url;
    }
  }

  return row;
};

const buildWhereClause = (table: string, filters: DbFilter[] = [], startIndex = 1) => {
  if (!filters.length) {
    return { clause: '', values: [] as unknown[], nextIndex: startIndex };
  }

  const values: unknown[] = [];
  let currentIndex = startIndex;

  const clauses = filters.map((filter) => {
    assertColumnAllowed(table, filter.column);
    values.push(filter.value);
    const clause = `\"${filter.column}\" = $${currentIndex}`;
    currentIndex += 1;
    return clause;
  });

  return {
    clause: ` where ${clauses.join(' and ')}`,
    values,
    nextIndex: currentIndex,
  };
};

const buildOrderClause = (table: string, orders: DbOrder[] = []) => {
  if (!orders.length) return '';

  const parts = orders.map((order) => {
    assertColumnAllowed(table, order.column);
    const direction = order.ascending === false ? 'desc' : 'asc';

    if (order.nullsFirst === true) {
      return `\"${order.column}\" ${direction} nulls first`;
    }

    if (order.nullsFirst === false) {
      return `\"${order.column}\" ${direction} nulls last`;
    }

    return `\"${order.column}\" ${direction}`;
  });

  return ` order by ${parts.join(', ')}`;
};

const getInsertableFields = (table: string, row: Record<string, unknown>) => {
  const allowed = new Set(TABLE_COLUMNS[table] || []);

  return Object.keys(row).filter((key) => allowed.has(key) && row[key] !== undefined);
};

const requireAdminTable = (table: string) => {
  if (!ADMIN_MUTATION_TABLES.has(table)) {
    throw new Error(`Mutations are not allowed for table \"${table}\".`);
  }
};

export const selectRows = async ({
  table,
  columns = '*',
  filters = [],
  orders = [],
  single = false,
}: {
  table: string;
  columns?: string;
  filters?: DbFilter[];
  orders?: DbOrder[];
  single?: boolean;
}) => {
  assertTableAllowed(table);

  const requestedColumns = columns === '*' ? ['*'] : parseList(columns);
  const selectSql =
    requestedColumns.length === 1 && requestedColumns[0] === '*'
      ? '*'
      : requestedColumns
          .map((column) => {
            assertColumnAllowed(table, column);
            return `\"${column}\"`;
          })
          .join(', ');

  const where = buildWhereClause(table, filters, 1);
  const orderBy = buildOrderClause(table, orders);

  const rows = await query<Record<string, unknown>>(
    `select ${selectSql} from \"${table}\"${where.clause}${orderBy}`,
    where.values,
  );

  const normalizedRows = rows.map((row) => normalizeOutputRow(table, row));

  if (single) {
    return normalizedRows[0] ?? null;
  }

  return normalizedRows;
};

export const insertRows = async ({ table, values }: { table: string; values: Record<string, unknown>[] }) => {
  assertTableAllowed(table);
  requireAdminTable(table);

  const inserted: Record<string, unknown>[] = [];

  for (const rawRow of values) {
    const row = normalizeInputRow(table, rawRow);
    const fields = getInsertableFields(table, row);

    if (!fields.length) {
      throw new Error(`No insertable fields were provided for table \"${table}\".`);
    }

    const placeholders = fields.map((_, index) => `$${index + 1}`);
    const params = fields.map((field) => row[field]);

    const rows = await query<Record<string, unknown>>(
      `insert into \"${table}\" (${fields.map((field) => `\"${field}\"`).join(', ')}) values (${placeholders.join(', ')}) returning *`,
      params,
    );

    inserted.push(...rows.map((insertedRow) => normalizeOutputRow(table, insertedRow)));
  }

  return inserted;
};

export const updateRows = async ({
  table,
  values,
  filters,
}: {
  table: string;
  values: Record<string, unknown>;
  filters: DbFilter[];
}) => {
  assertTableAllowed(table);
  requireAdminTable(table);

  if (!filters?.length) {
    throw new Error('Update operation requires at least one filter.');
  }

  const normalizedValues = normalizeInputRow(table, values);
  const fields = getInsertableFields(table, normalizedValues).filter((field) => field !== 'id');

  if (!fields.length) {
    throw new Error('Update operation did not include any mutable fields.');
  }

  const setParts = fields.map((field, index) => `\"${field}\" = $${index + 1}`);
  const setValues = fields.map((field) => normalizedValues[field]);

  if ((TABLE_COLUMNS[table] || []).includes('updated_at')) {
    setParts.push(`\"updated_at\" = now()`);
  }

  const where = buildWhereClause(table, filters, setValues.length + 1);

  const rows = await query<Record<string, unknown>>(
    `update \"${table}\" set ${setParts.join(', ')}${where.clause} returning *`,
    [...setValues, ...where.values],
  );

  return rows.map((row) => normalizeOutputRow(table, row));
};

const upsertOneRow = async (table: string, rawRow: Record<string, unknown>) => {
  const row = normalizeInputRow(table, rawRow);
  const fields = getInsertableFields(table, row);

  if (!fields.length) {
    throw new Error(`No upsertable fields were provided for table \"${table}\".`);
  }

  let conflictColumn: string | null = null;

  if (table === 'site_settings') {
    conflictColumn = 'id';
    if (row.id === undefined || row.id === null) {
      row.id = 1;
      if (!fields.includes('id')) fields.push('id');
    }
  } else if (table === 'site_content') {
    conflictColumn = 'section';
  } else if (row.id !== undefined && row.id !== null) {
    conflictColumn = 'id';
  } else if (typeof row.slug === 'string' && row.slug.length > 0) {
    conflictColumn = 'slug';
  }

  if (!conflictColumn) {
    const inserted = await insertRows({ table, values: [row] });
    return inserted[0] ?? null;
  }

  assertColumnAllowed(table, conflictColumn);

  if (row[conflictColumn] === undefined || row[conflictColumn] === null) {
    throw new Error(`Upsert requires conflict value for column \"${conflictColumn}\".`);
  }

  const params = fields.map((field) => row[field]);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const updateFields = fields.filter((field) => field !== conflictColumn);
  const updateSql = updateFields.length
    ? updateFields.map((field) => `\"${field}\" = excluded.\"${field}\"`).join(', ')
    : `\"${conflictColumn}\" = excluded.\"${conflictColumn}\"`;

  const touchUpdatedAt = (TABLE_COLUMNS[table] || []).includes('updated_at')
    ? ', \"updated_at\" = now()'
    : '';

  const rows = await query<Record<string, unknown>>(
    `insert into \"${table}\" (${fields.map((field) => `\"${field}\"`).join(', ')}) values (${placeholders.join(', ')}) on conflict (\"${conflictColumn}\") do update set ${updateSql}${touchUpdatedAt} returning *`,
    params,
  );

  return normalizeOutputRow(table, rows[0]);
};

export const upsertRows = async ({ table, values }: { table: string; values: Record<string, unknown>[] }) => {
  assertTableAllowed(table);
  requireAdminTable(table);

  const rows: Record<string, unknown>[] = [];

  for (const value of values) {
    const upserted = await upsertOneRow(table, value);
    if (upserted) rows.push(upserted);
  }

  return rows;
};

export const deleteRows = async ({ table, filters }: { table: string; filters: DbFilter[] }) => {
  assertTableAllowed(table);
  requireAdminTable(table);

  if (!filters?.length) {
    throw new Error('Delete operation requires at least one filter.');
  }

  const where = buildWhereClause(table, filters, 1);

  const rows = await query<Record<string, unknown>>(
    `delete from \"${table}\"${where.clause} returning *`,
    where.values,
  );

  return rows.map((row) => normalizeOutputRow(table, row));
};
