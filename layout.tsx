@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Libre+Franklin:wght@300;400;500;600&display=swap');

html { scroll-behavior: smooth; }
body { background: #060911; color: #E8E6E0; font-family: 'Libre Franklin', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
::selection { background: #D4A843; color: #060911; }

/* ── Glass card — Puzzle style ── */
.glass {
  background: rgba(12,16,25,0.7);
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
  transition: all 0.4s cubic-bezier(0.22,1,0.36,1);
}
.glass:hover {
  background: rgba(17,22,32,0.8);
  border-color: rgba(212,168,67,0.2);
  box-shadow: 0 4px 40px rgba(0,0,0,0.4), 0 0 30px rgba(212,168,67,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
  transform: translateY(-2px);
}

/* ── Pill tag ── */
.pill { display: inline-flex; align-items: center; gap: 6px; font-size: 0.62rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.3rem 0.75rem; border-radius: 100px; border: 1px solid rgba(255,255,255,0.08); color: #9B98A0; }
.pill-gold { border-color: rgba(212,168,67,0.25); color: #D4A843; }

/* ── Gold gradient text ── */
.gold-text { background: linear-gradient(135deg, #D4A843 0%, #F0D078 50%, #D4A843 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

/* ── Glow orbs ── */
.orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(60px); }
.orb-gold { background: radial-gradient(circle, rgba(212,168,67,0.2) 0%, transparent 70%); }
.orb-purple { background: radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%); }
.orb-pink { background: radial-gradient(circle, rgba(255,97,216,0.08) 0%, transparent 70%); }

/* ── Scroll reveal ── */
.sr { opacity:0; transform:translateY(30px); transition: opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1); }
.sr.v { opacity:1; transform:translateY(0); }
.sr-d1{transition-delay:.12s} .sr-d2{transition-delay:.24s} .sr-d3{transition-delay:.36s} .sr-d4{transition-delay:.48s}

/* ── Hero load ── */
.ha { opacity:0; transform:translateY(30px); animation: hu .9s cubic-bezier(.22,1,.36,1) forwards; }
.ha-1{animation-delay:.15s} .ha-2{animation-delay:.3s} .ha-3{animation-delay:.5s} .ha-4{animation-delay:.7s}
@keyframes hu { to { opacity:1; transform:translateY(0); } }

/* ── Mobile menu ── */
.mob-menu { position:fixed;inset:0;z-index:150;background:rgba(6,9,17,0.97);backdrop-filter:blur(24px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;opacity:0;pointer-events:none;transition:opacity .3s; }
.mob-menu.open { opacity:1; pointer-events:auto; }

/* ── Form selects ── */
select { background-color: #0C1019 !important; color: #E8E6E0; }
select option { background-color: #0C1019; color: #E8E6E0; padding: 8px; }
select option:checked { background-color: #D4A843; color: #060911; }
select option:hover { background-color: #111620; }
.modal-bg { position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s;padding:1.5rem; }
.modal-bg.open { opacity:1; pointer-events:auto; }

/* ── Gradient border effect ── */
.gradient-border { position: relative; }
.gradient-border::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(212,168,67,0.3), rgba(123,97,255,0.2), rgba(255,97,216,0.15)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
