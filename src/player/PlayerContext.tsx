// player/PlayerContext.tsx
import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react'

export type TrackLite = {
  id: number
  title: string
  artist: string
  previewUrl?: string
  durationMs?: number
  cover?: string
  trackUrl?: string
}

type PlayerCtx = {
  queue: TrackLite[]
  index: number
  current: TrackLite | null
  isPlaying: boolean
  progress: number
  currentTime: number
  duration: number
  volume: number

  loadQueue: (q: TrackLite[], startIndex?: number) => void
  playAt: (i: number) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (ratio: number) => void
  setVolume: (v: number) => void
  stop: () => void
}

const Ctx = createContext<PlayerCtx | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [queue, setQueue] = useState<TrackLite[]>([])
  const [index, setIndex] = useState<number>(-1)
  const [current, setCurrent] = useState<TrackLite | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  // crea el audio una sola vez
  if (!audioRef.current) {
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'
  }
  const audio = audioRef.current!

  // listeners básicos
  useEffect(() => {
    const onTime = () => {
      if (!isFinite(audio.duration)) return
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration)
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    }
    const onEnded = () => {
      // auto-siguiente
      if (index >= 0 && index < queue.length - 1) {
        _playIndex(index + 1)
      } else {
        setIsPlaying(false)
      }
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio, index, queue])

  // aplica volumen del estado al elemento
  useEffect(() => {
    audio.volume = Math.max(0, Math.min(1, volume))
  }, [audio, volume])

  function _playIndex(i: number) {
    const t = queue[i]
    if (!t?.previewUrl) {
      setIsPlaying(false)
      return
    }

    // actualizamos estado
    setIndex(i)
    setCurrent(t)

    // 1) pausa SIEMPRE antes de cambiar de pista
    audio.pause()

    // 2) cambia src solo si es distinto
    if (audio.src !== t.previewUrl) {
      audio.src = t.previewUrl
    }

    // 3) resetea y fuerza carga
    audio.currentTime = 0
    audio.load()

    // 4) intenta reproducir y, si falla, reintenta cuando el audio esté listo
    const tryPlay = () => {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          const onCanPlay = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => {})
          }
          audio.addEventListener('canplay', onCanPlay, { once: true })
        })
    }

    tryPlay()
  }

  const loadQueue = (q: TrackLite[], startIndex = -1) => {
    setQueue(q)
    if (startIndex >= 0 && startIndex < q.length) {
      // reproducir desde startIndex
      setTimeout(() => _playIndex(startIndex), 0)
    } else {
      // sólo cargar
      setIndex(-1)
      setCurrent(null)
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)
    }
  }

  const playAt = (i: number) => {
    if (i < 0 || i >= queue.length) return
    _playIndex(i)
  }

  const toggle = () => {
    if (!current) {
      // si no hay nada sonando, arranca desde index 0
      if (queue.length) _playIndex(index >= 0 ? index : 0)
      return
    }
    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const next = () => {
    if (index >= 0 && index < queue.length - 1) {
      _playIndex(index + 1) // ¡aquí sí cambiamos src y play!
    }
  }

  const prev = () => {
    if (index > 0) {
      _playIndex(index - 1)
    } else if (index === 0) {
      // reiniciar la actual
      audio.currentTime = 0
    }
  }

  const seek = (ratio: number) => {
    if (!isFinite(audio.duration)) return
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration
  }

  const setVolume = (v: number) => setVolumeState(Math.max(0, Math.min(1, v)))

  const stop = () => {
    audio.pause()
    // Eliminar la fuente para evitar que quede sonando al navegar
    audio.removeAttribute('src')
    audio.load()

    setIsPlaying(false)
    setIndex(-1)
    setCurrent(null)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
  }

  const value = useMemo<PlayerCtx>(() => ({
    queue, index, current, isPlaying, progress, currentTime, duration, volume,
    loadQueue, playAt, toggle, next, prev, seek, setVolume, stop
  }), [queue, index, current, isPlaying, progress, currentTime, duration, volume])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePlayer() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
