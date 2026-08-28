'use client';

import { useEffect, useRef, useState } from 'react';
import './landing.css';
import Brand from './brand';
import WalletButton from './wallet-button';

const VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_132544_b6ef0174-ed95-45ad-9a2f-ccb8acfbdce8.mp4';

function Arrow() { return <svg viewBox="0 0 22 18" aria-hidden="true" className="arrow"><path d="M0 9H20.1" /><path d="M12.1 1L20.1 9L12.1 17" /></svg>; }

function Button({ children }: { children: string }) { return <a className="cta" href="/dashboard"><span>{children}</span><Arrow /></a>; }

export default function Home() {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [master, ...rest] = videos.current;
    if (master && !reduced) {
      const sync = () => rest.forEach(video => { if (video && Math.abs(video.currentTime - master.currentTime) > 0.12) video.currentTime = master.currentTime; });
      master.addEventListener('timeupdate', sync);
      return () => master.removeEventListener('timeupdate', sync);
    }
    setIntro(false);
  }, []);
  useEffect(() => {
    if (!intro) return;
    const timer = window.setTimeout(() => setIntro(false), 2100);
    return () => window.clearTimeout(timer);
  }, [intro]);
  return <main className={`screen ${intro ? 'intro' : ''}`}>
    <div className="bg"><video ref={el => { videos.current[0] = el; }} autoPlay muted loop playsInline preload="auto"><source src={VIDEO} type="video/mp4" /></video></div>
    <div className="bg2"><video ref={el => { videos.current[1] = el; }} autoPlay muted loop playsInline preload="auto"><source src={VIDEO} type="video/mp4" /></video></div>
    <div className="scrim" />
    <div className="frame">
      <header><Brand />
        <nav aria-label="Primary navigation"><a className="active" href="/">Security</a><a href="/phishing-shield">Phishing shield <small>⌄</small></a><a href="/auto-revoke">Auto-revoke <small>⌄</small></a></nav>
        <div className="header-actions"><WalletButton /><Button children="Secure wallet" /></div>
        <button className={`burger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><i /><i /><i /></button>
      </header>
      <section className="hero"><h1><span>Security built into</span><span>every Onchain layer</span></h1><p>Engineered to stay resilient, controlled,<br />and uncompromised under pressure.</p><Button children="Secure wallet" /></section>
      <section className="stats"><div><b>300+</b><span>Protected wallets</span></div><div><b>99%</b><span>Threat visibility</span></div><div><b>24/7</b><span>Active monitoring</span></div></section>
    </div>
    <div className={`menu ${menuOpen ? 'visible' : ''}`} aria-hidden={!menuOpen}><div className="menu-tex"><video ref={el => { videos.current[2] = el; }} autoPlay muted loop playsInline preload="auto"><source src={VIDEO} type="video/mp4" /></video></div><div className="menu-inner"><p>DEPROTECTOR / MENU</p><a href="/">Security</a><a href="/dashboard?view=phishing">Phishing shield</a><a href="/dashboard?view=revocation">Auto-revoke</a><a href="/dashboard">Dashboard</a><Button children="Secure system" /></div></div>
  </main>;
}
