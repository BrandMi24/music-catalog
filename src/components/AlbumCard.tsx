import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAlbumTracks } from '../api/itunes'
import type { ITunesAlbum, ITunesTrack } from '../api/itunes'
import AppleMusicIcon from './AppleMusicIcon'

type Props = { album: ITunesAlbum }

export default function AlbumCard({ album }: Props) {
  const [open, setOpen] = useState(false)
  const [tracks, setTracks] = useState<ITunesTrack[]>([])
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    // (si quieres mantener el comportamiento desplegable en la card)
    if (!open && tracks.length === 0) {
      setLoading(true)
      try {
        const t = await fetchAlbumTracks(album.collectionId)
        setTracks(t)
      } finally {
        setLoading(false)
      }
    }
    setOpen(o => !o)
  }

  const cover = album.artworkUrl100?.replace('100x100', '600x600')

  return (
    <div className="card">
      <img src={cover} alt={album.collectionName} />
      <div className="meta">
        <p className="title">{album.collectionName}</p>
        <p className="subtitle">
          {album.artistName} · {new Date(album.releaseDate).getFullYear()}
        </p>
        <div className="row" style={{marginTop: 8}}>
          {/* Enlace a página de detalle */}
          <Link className="tab" to={`/album/${album.collectionId}`}>Ver tracks</Link>

          <a className="icon-btn" href={album.collectionViewUrl} target="_blank" rel="noreferrer" aria-label="Abrir en iTunes" title="Abrir en iTunes">
            <AppleMusicIcon />
            <span className="sr-only">Abrir en iTunes</span>
          </a>
        </div>
      </div>

      {/* Si quieres, puedes quitar totalmente el bloque expandible: */}
      {false && open && (
        <div className="album-tracks">
          {loading && <div className="small">Cargando tracks…</div>}
          {!loading && tracks.map(t => (
            <div key={t.trackId} className="track">
              <div>
                <div>{t.trackNumber}. {t.trackName}</div>
                <div className="small">{msToMSS(t.trackTimeMillis)}</div>
              </div>
              {t.previewUrl ? <audio controls src={t.previewUrl} style={{width: 180}} /> : <span className="small">Sin preview</span>}
              <a className="small" href={t.trackViewUrl} target="_blank" rel="noreferrer">Abrir</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function msToMSS(ms?: number) {
  if (!ms) return '—:—';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString();
  const s = (total % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
