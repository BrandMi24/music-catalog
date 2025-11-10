export default function AppleMusicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      {...props}
    >
      {/* fondo redondeado */}
      <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" opacity="0.12" />
      {/* nota musical */}
      <path
        d="M14.5 4.8v8.3a2.8 2.8 0 1 1-1.4-2.4V7.1l4.4-1.1v6.9a2.8 2.8 0 1 1-1.4-2.4V4.8l-1.6.4-0 .0Z"
        fill="currentColor"
      />
    </svg>
  );
}
