export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://arifeq.blogspot.com/feeds/posts/default/-/Research?alt=json&max-results=50');

    if (!response.ok) {
      throw new Error(`Blogger API returned ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying research feed:', error);
    return res.status(500).json({ error: 'Failed to fetch research posts' });
  }
}
