import { useEffect, useMemo, useState } from 'react'
import { searchArtist } from './api/itunes'
import type { ITunesAlbum } from './api/itunes'
import AlbumCard from './components/AlbumCard'

export default function App() {
  const [term, setTerm] = useState('Twenty One Pilots')
  const [albums, setAlbums] = useState<ITunesAlbum[]>([])
  const [loading, setLoading] = useState(false)

  // tema
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // buscar solo álbumes (ignoramos canciones del resultado)
  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
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
          {/* tu icono */}
          <h1>Music Catalog</h1>
          <span className="badge">{totalText}</span>
        </div>

        <div className="row">
          <button className="tab" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            Tema: {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </button>
        </div>
      </div>

      <form className="search" onSubmit={doSearch}>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Busca un artista"
        />
        <button type="submit">Buscar</button>
      </form>

      {/* Solo la pestaña de Álbumes */}
      <div className="tabs">
        <button className="tab active" disabled>Álbumes</button>
      </div>

      {loading && <div className="small">Cargando…</div>}

      {!loading && (
        <div className="grid">
          {albums.map(a => <AlbumCard key={a.collectionId} album={a} />)}
        </div>
      )}

      <footer>Datos: iTunes Search API · Solo educativo · Previews 30s</footer>
    </div>
  )
}
