import { useEffect, useMemo, useState } from 'react'
import { searchArtist } from './api/itunes'
import type { ITunesAlbum } from './api/itunes'
import AlbumCard from './components/AlbumCard'

export default function App() {
  // Artista fijo
  const term = 'Twenty One Pilots'

  const [albums, setAlbums] = useState<ITunesAlbum[]>([])
  const [loading, setLoading] = useState(false)

  // Tema
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) return saved
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // Buscar solo álbumes del artista fijo
  const doSearch = async () => {
    setLoading(true)
    try {
      const { albums } = await searchArtist(term)
      albums.sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))
      setAlbums(albums)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void doSearch() }, [])

  const totalText = useMemo(() => `${albums.length} álbum(es)`, [albums.length])

  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 8v8a2 2 0 0 0 2 2h3l3 3 3-3h3a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"
              stroke="currentColor" strokeWidth="1.5"
            />
            <path
              d="M7 12h4m2 0h4"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            />
          </svg>

          <div>
            <h1>Music Catalog</h1>
            {/* Subtítulo con el artista */}
            <div className="eyebrow">{term}</div>
          </div>

          <span className="badge">{totalText}</span>
        </div>

        <div className="row">
          <button
            className="tab"
            onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
          >
            Tema: {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </button>
        </div>
      </div>

      {/* Sin buscador, sin pestañas */}
      <div className="tabs">
        <button className="tab active" disabled>Álbumes</button>
      </div>

      {loading && <div className="small">Cargando…</div>}

      {!loading && (
        <div className="grid">
          {albums.map(a => (
            <AlbumCard key={a.collectionId} album={a} />
          ))}
        </div>
      )}

      <footer>Datos: iTunes Search API · Solo educativo · Previews 30s</footer>
    </div>
  )
}
