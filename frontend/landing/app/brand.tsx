export default function Brand({ href = '/' }: { href?: string }) {
  return <a href={href} className="brand-lockup" aria-label="Deprotector home"><img src="/brand/deprotector-mark.svg" alt="" aria-hidden="true" className="brand-mark" /><span>DEPROTECTOR</span></a>;
}
