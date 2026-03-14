export const TABLE_COLUMNS: Record<string, string[]> = {
  site_settings: [
    'id',
    'full_name',
    'nickname',
    'tagline',
    'subtag',
    'about_me',
    'about_short_intro',
    'vision_goals',
    'profile_image',
    'footer_profile_image',
    'email',
    'phone',
    'facebook',
    'linkedin',
    'github',
    'x',
    'youtube',
    'whatsapp',
    'motto',
    'created_at',
    'updated_at',
  ],
  education_table: [
    'id',
    'title',
    'institution',
    'group_name',
    'year',
    'result',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  projects_table: [
    'id',
    'title',
    'short_description',
    'full_description',
    'project_url',
    'cover_image',
    'sort_order',
    'is_visible',
    'created_at',
    'updated_at',
  ],
  gallery_table: [
    'id',
    'image_url',
    'caption',
    'photo_date',
    'sort_order',
    'is_visible',
    'created_at',
    'updated_at',
  ],
  blog_posts: [
    'id',
    'title',
    'slug',
    'excerpt',
    'content',
    'cover_image',
    'author',
    'publish_date',
    'status',
    'featured',
    'created_at',
    'updated_at',
  ],
  research_papers: [
    'id',
    'title',
    'subtitle',
    'slug',
    'author',
    'authors',
    'abstract',
    'content',
    'keywords',
    'keywords_text',
    'category',
    'tags',
    'cover_image',
    'pdf_url',
    'youtube_url',
    'institution',
    'status',
    'featured',
    'publish_date',
    'published_at',
    'created_at',
    'updated_at',
  ],
  site_content: ['section', 'content', 'updated_at'],
  storage_files: ['bucket', 'path', 'content_type', 'data_base64', 'created_at', 'updated_at'],
};

export const ADMIN_MUTATION_TABLES = new Set([
  'site_settings',
  'education_table',
  'projects_table',
  'gallery_table',
  'blog_posts',
  'research_papers',
  'site_content',
]);

export const STORAGE_BUCKETS = new Set([
  'project_cover',
  'blog_cover',
  'research_cover',
  'gallery_photo',
  'profile_photo',
]);

export const assertTableAllowed = (table: string) => {
  if (!Object.prototype.hasOwnProperty.call(TABLE_COLUMNS, table)) {
    throw new Error(`Table \"${table}\" is not allowed.`);
  }
};

export const assertColumnAllowed = (table: string, column: string) => {
  const allowedColumns = TABLE_COLUMNS[table] || [];
  if (!allowedColumns.includes(column)) {
    throw new Error(`Column \"${column}\" is not allowed for table \"${table}\".`);
  }
};
