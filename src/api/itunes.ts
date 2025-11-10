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

export async function lookupAlbum(collectionId: number) {
  const url = import.meta.env.DEV
    ? `https://itunes.apple.com/lookup?id=${collectionId}&entity=song` // local: directo a Apple
    : `/api/itunes/lookup?id=${collectionId}`;                         // prod: tu función en Vercel

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`lookup ${res.status} ${res.statusText}`);

  const data = await res.json();
  const results = (data.results || []) as any[];
  const album = results.find(r => r.wrapperType === 'collection') as ITunesAlbum;
  const tracks = results.filter(r => r.wrapperType === 'track') as ITunesTrack[];

  if (!album) throw new Error('Álbum no encontrado en iTunes');
  return { album, tracks };
}
