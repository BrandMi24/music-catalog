// /api/itunes/lookup.ts
export const config = { runtime: 'edge' }; // <- Edge Function

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  if (!id) {
    return new Response(JSON.stringify({ error: 'missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song`;

  try {
    const r = await fetch(url, { cache: 'no-store' });
    const text = await r.text();

    const headers = new Headers();
    headers.set('Content-Type', r.headers.get('content-type') || 'application/json');
    headers.set('Cache-Control', 'no-store');
    // (opcional) si un día llamas este endpoint desde otro origen:
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(text, { status: r.status, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'proxy error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
