export function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path d="M8 5v14l11-7-11-7z" fill="currentColor"/>
    </svg>
  );
}
export function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>
    </svg>
  );
}
export function BackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function VolumeMuteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path d="M4 9h4l5-4v14l-5-4H4V9z" fill="currentColor" opacity=".35"/>
      <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
export function VolumeLowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path d="M4 9h4l5-4v14l-5-4H4V9z" fill="currentColor"/>
      <path d="M18 12a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
export function VolumeHighIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path d="M4 9h4l5-4v14l-5-4H4V9z" fill="currentColor"/>
      <path d="M18 8a7 7 0 0 1 0 8M18 12a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
