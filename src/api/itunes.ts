const BASE = 'https://itunes.apple.com';

export type ITunesAlbum = {
  collectionId: number;
  collectionName: string;
  artworkUrl100: string;
  artistName: string;
  releaseDate: string;
  collectionViewUrl: string;
};

export type ITunesSong = {
  trackId: number;
  trackName: string;
  artworkUrl100: string;
  artistName: string;
  collectionName: string;
  trackTimeMillis?: number;
  releaseDate: string;
  previewUrl?: string;
  trackViewUrl: string;
};

type SearchResponse<T> = { resultCount: number; results: T[] };

export async function searchArtist(term: string): Promise<{albums: ITunesAlbum[]; songs: ITunesSong[]}> {
  const q = encodeURIComponent(term.trim());
  const albumsUrl = `${BASE}/search?term=${q}&entity=album&attribute=artistTerm&limit=50`;
  const songsUrl  = `${BASE}/search?term=${q}&entity=song&attribute=artistTerm&limit=50`;

  const [albumsRes, songsRes] = await Promise.all([fetch(albumsUrl), fetch(songsUrl)]);
  const [albumsData, songsData] = await Promise.all<SearchResponse<any>>([albumsRes.json(), songsRes.json()]);

  const seen = new Set<number>();
  const albums = (albumsData.results || []).filter((a: ITunesAlbum) => {
    if (seen.has(a.collectionId)) return false;
    seen.add(a.collectionId); return true;
  });

  const songs = (songsData.results || []) as ITunesSong[];
  return { albums, songs };
}

export type ITunesTrack = {
  trackId: number;
  trackName: string;
  trackNumber: number;
  trackTimeMillis?: number;
  previewUrl?: string;
  trackViewUrl: string;
  wrapperType: 'track';
};

export async function fetchAlbumTracks(collectionId: number): Promise<ITunesTrack[]> {
  const url = `${BASE}/lookup?id=${collectionId}&entity=song`;
  const res = await fetch(url);
  const data: SearchResponse<ITunesTrack> & { results: any[] } = await res.json();
  return (data.results || []).filter(r => r.wrapperType === 'track') as ITunesTrack[];
}

export async function lookupAlbum(collectionId: number): Promise<{ album: ITunesAlbum; tracks: ITunesTrack[] }> {
  const url = `${BASE}/lookup?id=${collectionId}&entity=song&country=US&lang=en_us`

  const fetchOnce = async (signal?: AbortSignal) => {
    const res = await fetch(url, { signal, cache: 'no-store', mode: 'cors' })
    if (!res.ok) throw new Error(`iTunes ${res.status} ${res.statusText}`)
    const data = await res.json()
    const results = (data.results || []) as any[]
    const album = results.find(r => r.wrapperType === 'collection') as ITunesAlbum
    const tracks = results.filter(r => r.wrapperType === 'track') as ITunesTrack[]
    if (!album) throw new Error('Álbum no encontrado en respuesta de iTunes')
    return { album, tracks }
  }

  // Timeout de 8s + 1 reintento
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 8000)
    try {
      const r = await fetchOnce(ctl.signal)
      clearTimeout(t)
      return r
    } catch (err) {
      clearTimeout(t)
      if (attempt === 2) throw err
      // breve espera y reintenta
      await new Promise(r => setTimeout(r, 400))
    }
  }
  // por tipos
  throw new Error('lookupAlbum falló')
}
