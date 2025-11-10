import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lookupAlbum } from '../api/itunes'
import type { ITunesAlbum, ITunesTrack } from '../api/itunes'
import AppleMusicIcon from '../components/AppleMusicIcon'
import { PlayerProvider, usePlayer } from '../player/PlayerContext'
import type { TrackLite } from '../player/PlayerContext'
import { PlayIcon, PauseIcon, BackIcon, VolumeHighIcon, VolumeLowIcon, VolumeMuteIcon } from '../components/Icons'

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>()
  const albumId = Number(id)

  const [album, setAlbum] = useState<ITunesAlbum | null>(null)
  const [tracks, setTracks] = useState<ITunesTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setError(null)
      setLoading(true)
      try {
        const { album, tracks } = await lookupAlbum(albumId)
        if (cancelled) return
        setAlbum(album)
        setTracks(tracks)
      } catch (e: any) {
        if (cancelled) return
        console.error('lookupAlbum failed', e)
        setError(e?.message ?? 'Error al cargar el álbum')
        setAlbum(null)
        setTracks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [albumId, reloadTick])

  if (loading) return <div className="app"><div className="small">Cargando álbum…</div></div>

  if (error) {
    return (
      <div className="app">
        <div className="row" style={{marginBottom:8}}>
          <Link className="back-chip" to="/" aria-label="Volver">
            <BackIcon style={{marginRight: 6}} /> Volver
          </Link>
        </div>
        <div className="small" style={{marginBottom:12}}>{error}</div>
        <button className="tab" onClick={() => setReloadTick(n => n + 1)}>Reintentar</button>
      </div>
    )
  }

  if (!album) return <div className="app"><div className="small">Álbum no encontrado.</div></div>

  const cover = album.artworkUrl100?.replace('100x100', '1200x1200')
  const year  = new Date(album.releaseDate).getFullYear()

  const queue: TrackLite[] = tracks.map(t => ({
    id: t.trackId,
    title: t.trackName,
    artist: album.artistName,
    previewUrl: t.previewUrl,
    durationMs: t.trackTimeMillis,
    cover,
    trackUrl: t.trackViewUrl,
  }))

  return (
    <PlayerProvider>
      <div className="app">

        {/* Breadcrumb / volver arriba */}
        <div className="row" style={{marginBottom:8}}>
          {/* Si quieres parar al volver, convierte este Link en un BackLink con usePlayer y onClick={() => p.stop()} */}
          <Link className="back-chip" to="/" aria-label="Volver">
            <BackIcon style={{marginRight: 6}} /> Volver
          </Link>
        </div>

        <div className="album-hero">
          <img className="cover-lg" src={cover} alt={album.collectionName} />
          <div className="album-meta">
            <span className="eyebrow">Álbum · {year}</span>
            <h1 className="album-title">{album.collectionName}</h1>
            <div className="album-sub">{album.artistName}</div>

            <div className="hero-actions">
              <a className="icon-btn" href={album.collectionViewUrl} target="_blank" rel="noreferrer" title="Abrir en iTunes" aria-label="Abrir en iTunes">
                <AppleMusicIcon />
                <span className="sr-only">Abrir en iTunes</span>
              </a>
            </div>
          </div>
        </div>

        <TrackList queue={queue} />

        <MiniPlayer />
      </div>
    </PlayerProvider>
  )
}

function TrackList({ queue }: { queue: TrackLite[] }) {
  const player = usePlayer()
  useEffect(() => { if (queue.length) player.loadQueue(queue) }, [JSON.stringify(queue)])
  return (
    <div className="tracks-list">
      {queue.map((t, i) => <TrackRow key={t.id} i={i} t={t} />)}
    </div>
  )
}

function TrackRow({ i, t }: { i: number; t: TrackLite }) {
  const p = usePlayer()
  const active = p.index === i

  return (
    <div className={`track ${active ? 'track-active' : ''}`}>
      <div>
        <div>{i + 1}. {t.title}</div>
        <div className="small">{mmss(t.durationMs)}</div>
      </div>

      <div className="ctrls">
        <button className="pill" onClick={() => (active ? p.toggle() : p.playAt(i))} aria-label={active && p.isPlaying ? 'Pausar' : 'Reproducir'}>
          {active && p.isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div
          className="bar"
          onClick={(e) => {
            if (!active) return
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            p.seek(Math.max(0, Math.min(1, ratio)))
          }}
        >
          <div className="bar-fill" style={{ width: active ? `${p.progress * 100}%` : 0 }} />
        </div>

        <div className="small" style={{ minWidth: 70, textAlign: 'right' }}>
          {active ? fmt(p.currentTime) : '0:00'} / {active ? fmt(p.duration) : '0:30'}
        </div>
      </div>

      <a
        className="small"
        href={t.trackUrl ?? t.previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => p.stop()}  // opcional: para que no quede sonando
      >
        Abrir
      </a>
    </div>
  )
}

function MiniPlayer() {
  const p = usePlayer()
  if (!p.current || !p.isPlaying) return null

  const VolIcon =
    p.volume === 0 ? VolumeMuteIcon :
    p.volume < 0.4 ? VolumeLowIcon : VolumeHighIcon

  return (
    <>
      <div className="mini-spacer" />
      <div className="mini-dock">
        <div className="mini-container">
          <div className="mini mini--row">
            <img src={p.current.cover} alt="" />
            <div className="mini-meta">
              <strong>{p.current.title}</strong>
              <div className="small">{p.current.artist}</div>
            </div>

            <div className="mini-controls">
              <button className="pill" onClick={p.prev} aria-label="Anterior">⏮</button>
              <button className="pill" onClick={p.toggle} aria-label={p.isPlaying ? 'Pausar' : 'Reproducir'}>
                {p.isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button className="pill" onClick={p.next} aria-label="Siguiente">⏭</button>
            </div>

            <div className="mini-progress">
              <div
                className="bar"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                  const ratio = (e.clientX - rect.left) / rect.width
                  p.seek(Math.max(0, Math.min(1, ratio)))
                }}
              >
                <div className="bar-fill" style={{ width: `${p.progress * 100}%` }} />
              </div>
              <div className="small mini-time">{fmt(p.currentTime)} / {fmt(p.duration)}</div>
            </div>

            <div className="mini-volume">
              <button
                className="pill"
                onClick={() => p.setVolume(p.volume === 0 ? 0.8 : 0)}
                aria-label={p.volume === 0 ? 'Quitar silencio' : 'Silenciar'}
                title={p.volume === 0 ? 'Quitar silencio' : 'Silenciar'}
              >
                <VolIcon />
              </button>

              <input
                className="volume-range"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={p.volume}
                onChange={(e) => p.setVolume(parseFloat(e.target.value))}
                aria-label="Volumen"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* utils */
function mmss(ms?: number) {
  if (!ms) return '0:30'
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), r = (s % 60).toString().padStart(2, '0')
  return `${m}:${r}`
}
function fmt(s: number) {
  const m = Math.floor(s / 60), r = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${r}`
}
