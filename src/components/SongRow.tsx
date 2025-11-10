import type { ITunesSong } from '../api/itunes'

type Props = { song: ITunesSong }

export default function SongRow({ song }: Props) {
  return (
    <div className="card" style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:12, alignItems:'center', padding:10}}>
      <img src={song.artworkUrl100} alt={song.trackName} style={{borderRadius:10, width:64, height:64}} />
      <div>
        <div className="row" style={{justifyContent:'space-between'}}>
          <strong>{song.trackName}</strong>
          <span className="small">{new Date(song.releaseDate).getFullYear()}</span>
        </div>
        <div className="small">{song.artistName} · {song.collectionName}</div>
      </div>
      {song.previewUrl ? <audio controls src={song.previewUrl} style={{width: 200}} /> : <span className="small">Sin preview</span>}
    </div>
  )
}
