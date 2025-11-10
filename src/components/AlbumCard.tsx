import { Link } from 'react-router-dom'
import type { ITunesAlbum } from '../api/itunes'
import AppleMusicIcon from './AppleMusicIcon'

type Props = { album: ITunesAlbum }

export default function AlbumCard({ album }: Props) {
  const cover = album.artworkUrl100?.replace('100x100', '600x600')

  return (
    <div className="card">
      <img src={cover} alt={album.collectionName} />
      <div className="meta">
        <p className="title">{album.collectionName}</p>
        <p className="subtitle">
          {album.artistName} · {new Date(album.releaseDate).getFullYear()}
        </p>

        <div className="row" style={{ marginTop: 8 }}>
          {/* Ir a la página de detalle del álbum */}
          <Link className="tab" to={`/album/${album.collectionId}`}>
            Ver tracks
          </Link>

          {/* Abrir en iTunes / Apple Music */}
          <a
            className="icon-btn"
            href={album.collectionViewUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir en iTunes"
            title="Abrir en iTunes"
          >
            <AppleMusicIcon />
            <span className="sr-only">Abrir en iTunes</span>
          </a>
        </div>
      </div>
    </div>
  )
}
