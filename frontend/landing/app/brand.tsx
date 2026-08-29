export default function Brand({ href = '/' }: { href?: string }) {
  return (
    <a href={href} className="brand-lockup" aria-label="Deprotector home">
      <svg className="brand-mark" viewBox="0 0 128 128" fill="none" aria-hidden="true">
        <path d="M64 7 113 28v31c0 29-18 50-49 62C33 109 15 88 15 59V28L64 7Z" stroke="currentColor" strokeWidth="7" />
        <path d="M43 35h20c18 0 30 11 30 29S81 93 63 93H43V35Z" stroke="currentColor" strokeWidth="7" />
        <path d="M43 35v58" stroke="#c81b1c" strokeWidth="7" />
        <path d="M43 35h20c18 0 30 11 30 29S81 93 63 93H43" stroke="currentColor" strokeWidth="7" strokeLinejoin="miter" />
      </svg>
      <span>DEPROTECTOR</span>
    </a>
  );
}
