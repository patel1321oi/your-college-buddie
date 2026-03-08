import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════
//  HOOKS
// ════════════════════════════════════════════════

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 640, isTablet: w < 1024, w };
}

function useRateLimit(max = 3, ms = 60000) {
  const [clicks, setClicks] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [cd, setCd] = useState(0);

  useEffect(() => {
    if (!blocked) return;
    const id = setInterval(() => {
      const now = Date.now();
      const valid = clicks.filter(t => now - t < ms);
      setClicks(valid);
      if (valid.length < max) { setBlocked(false); setCd(0); }
      else setCd(Math.ceil((ms - (now - Math.min(...valid))) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [blocked, clicks, max, ms]);

  const attempt = useCallback((fn) => {
    const now = Date.now();
    const valid = clicks.filter(t => now - t < ms);
    if (valid.length >= max) {
      setBlocked(true);
      setCd(Math.ceil((ms - (now - Math.min(...valid))) / 1000));
      return false;
    }
    const next = [...valid, now];
    setClicks(next);
    if (next.length >= max) setBlocked(true);
    fn();
    return true;
  }, [clicks, max, ms]);

  return { attempt, blocked, cd, rem: max - clicks.filter(t => Date.now() - t < ms).length };
}

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function useCounter(target, dur = 1800, go = false) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!go) return;
    let x = 0;
    const step = target / (dur / 16);
    const id = setInterval(() => {
      x = Math.min(x + step, target);
      setV(Math.floor(x));
      if (x >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [go, target, dur]);
  return v;
}

// ════════════════════════════════════════════════
//  SECURE CONTACT
// ════════════════════════════════════════════════
const C = {
  wa:  () => ["https://wa",".me/","91","98765","43210"].join(""),
  em:  () => { const [u,d,t] = ["hello","yourcollegebuddie","com"]; return `mailto:${u}@${d}.${t}`; },
  msg: s  => encodeURIComponent(`Hi! I'm interested in your ${s} service. Can you share more details?`),
};
const openSafe = url => {
  const a = document.createElement("a");
  a.href = url; a.rel = "noopener noreferrer"; a.target = "_blank";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

// ════════════════════════════════════════════════
//  THEME
// ════════════════════════════════════════════════
const T = {
  bg:     "#0b0917",
  card:   "#110f1d",
  mid:    "#16132a",
  surf:   "#1c1830",
  bdr:    "rgba(124,85,255,0.18)",
  bdrA:   "rgba(124,85,255,0.5)",
  v:      "#7c55ff",   // violet
  vL:     "#aa88ff",   // violet light
  vD:     "#5833d4",   // violet dark
  fuc:    "#d946ef",   // fuchsia
  teal:   "#2dd4bf",
  rose:   "#f43f5e",
  tx:     "#eceaf8",
  txM:    "rgba(236,234,248,0.6)",
  txL:    "rgba(236,234,248,0.32)",
  glow:   "rgba(124,85,255,0.38)",
  glowS:  "rgba(124,85,255,0.1)",
};
const GR   = `linear-gradient(135deg,${T.v},${T.fuc})`;
const GT   = { background:GR, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" };

// ════════════════════════════════════════════════
//  GLOBAL STYLES  (injected once)
// ════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { background:${T.bg}; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar{ width:4px; }
  ::-webkit-scrollbar-track{ background:${T.bg}; }
  ::-webkit-scrollbar-thumb{ background:rgba(124,85,255,0.45); border-radius:4px; }
  button:focus-visible{ outline:2px solid ${T.v}; outline-offset:3px; }
  /* ── Animations ── */
  @keyframes bgDrift    { from{transform:translate(-52%,-50%) rotate(-1deg)} to{transform:translate(-48%,-50%) rotate(1deg)} }
  @keyframes orbDrift   { from{transform:translateY(0) scale(1)} to{transform:translateY(-55px) scale(1.1)} }
  @keyframes fc0        { 0%,100%{transform:rotate(-5deg) translateY(0)}  50%{transform:rotate(-5deg) translateY(-10px)} }
  @keyframes fc1        { 0%,100%{transform:rotate(3deg) translateY(0)}   50%{transform:rotate(3deg) translateY(-14px)} }
  @keyframes fc2        { 0%,100%{transform:rotate(-1.5deg) translateY(0)}50%{transform:rotate(-1.5deg) translateY(-8px)} }
  @keyframes marquee    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes fabPulse   { 0%,100%{box-shadow:0 6px 20px rgba(37,211,102,0.35)} 50%{box-shadow:0 6px 32px rgba(37,211,102,0.65)} }
  @keyframes pop        { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideDown  { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  /* ── Responsive helpers ── */
  .hide-mobile{ display:flex!important; }
  @media(max-width:639px){ .hide-mobile{ display:none!important; } }
  .show-mobile{ display:none!important; }
  @media(max-width:639px){ .show-mobile{ display:flex!important; } }
`;

// ════════════════════════════════════════════════
//  SMALL PRIMITIVES
// ════════════════════════════════════════════════
const GlowBar = () => (
  <div style={{height:1,background:`linear-gradient(90deg,transparent,${T.v}80,transparent)`}}/>
);

const Pill = ({ children, vis=true }) => (
  <div style={{
    display:"inline-flex", alignItems:"center", gap:"0.45rem",
    fontFamily:"'Instrument Sans',sans-serif", fontSize:"0.66rem",
    fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
    color:T.v, background:"rgba(124,85,255,0.08)",
    border:`1px solid rgba(124,85,255,0.22)`, borderRadius:"40px",
    padding:"0.38rem 0.9rem", marginBottom:"1.1rem",
    opacity:vis?1:0, transform:vis?"none":"translateY(8px)",
    transition:"all 0.55s",
  }}>
    <span style={{width:5,height:5,borderRadius:"50%",background:T.v,display:"inline-block",boxShadow:`0 0 7px ${T.v}`}}/>
    {children}
  </div>
);

// ════════════════════════════════════════════════
//  CONTACT BUTTON
// ════════════════════════════════════════════════
function Btn({ service, label, icon, rl, variant="wa", primary=false, full=false }) {
  const [hov,setHov] = useState(false);
  const [toast,setToast] = useState(null);

  const fire = () => {
    const ok = rl.attempt(() => {
      openSafe(variant==="wa" ? `${C.wa()}?text=${C.msg(service)}` : C.em());
      setToast(`Opening ${variant==="wa"?"WhatsApp":"Email"}…`);
      setTimeout(()=>setToast(null), 2400);
    });
    if (!ok) { setToast(`⏱ Wait ${rl.cd}s`); setTimeout(()=>setToast(null),3000); }
  };

  return (
    <div style={{position:"relative",display:full?"block":"inline-block",width:full?"100%":"auto"}}>
      <button onClick={fire}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        disabled={rl.blocked}
        style={{
          width:full?"100%":"auto",
          fontFamily:"'Instrument Sans',sans-serif",
          fontSize:"0.75rem", fontWeight:700,
          letterSpacing:"0.06em", textTransform:"uppercase",
          padding:"0.85rem 1.8rem",
          border: primary?"none":`1px solid ${hov?T.v:T.bdr}`,
          background: primary ? (hov?T.vL:T.v) : (hov?"rgba(124,85,255,0.12)":"transparent"),
          color: primary?"#fff":(hov?T.vL:T.txM),
          cursor: rl.blocked?"not-allowed":"pointer",
          display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
          transition:"all 0.2s",
          opacity:rl.blocked?0.4:1,
          boxShadow: primary&&hov?`0 0 28px ${T.glow}`:"none",
          borderRadius:"6px",
          whiteSpace:"nowrap",
        }}>
        <span>{icon}</span>
        <span>{label}</span>
        <span style={{fontSize:"0.52rem",opacity:0.4,marginLeft:"0.1rem"}}>{rl.rem}/3</span>
      </button>
      {toast && (
        <div style={{
          position:"absolute", bottom:"calc(100% + 8px)", left:"50%",
          transform:"translateX(-50%)", zIndex:300,
          background:rl.blocked?T.rose:T.teal,
          color:"#fff", fontSize:"0.64rem",
          fontFamily:"'Instrument Sans',sans-serif", fontWeight:600,
          padding:"0.4rem 0.9rem", borderRadius:"5px",
          whiteSpace:"nowrap", boxShadow:"0 4px 18px rgba(0,0,0,0.4)",
          animation:"pop 0.18s ease",
        }}>{toast}</div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
//  BG
// ════════════════════════════════════════════════
const Bg = () => (
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {[
      {s:660,top:"-12%",left:"-8%",c:"rgba(124,85,255,0.1)",d:"24s",dl:"0s"},
      {s:480,top:"52%",left:"66%",c:"rgba(217,70,239,0.07)",d:"30s",dl:"4s"},
      {s:380,top:"76%",left:"4%",c:"rgba(45,212,191,0.05)",d:"20s",dl:"2s"},
    ].map((o,i)=>(
      <div key={i} style={{
        position:"absolute",top:o.top,left:o.left,
        width:o.s,height:o.s,borderRadius:"50%",
        background:`radial-gradient(circle,${o.c} 0%,transparent 70%)`,
        animation:`orbDrift ${o.d} ease-in-out infinite alternate`,
        animationDelay:o.dl,
      }}/>
    ))}
    <div style={{
      position:"absolute",inset:0,
      backgroundImage:`linear-gradient(rgba(124,85,255,0.03) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(124,85,255,0.03) 1px,transparent 1px)`,
      backgroundSize:"60px 60px",
    }}/>
  </div>
);

// ════════════════════════════════════════════════
//  NAV
// ════════════════════════════════════════════════
function Nav({ scrolled }) {
  const { isMobile } = useBreakpoint();
  const [open, setOpen] = useState(false);
  const go = id => { document.querySelector(id)?.scrollIntoView({behavior:"smooth"});setOpen(false); };
  const links = [["Services","#services"],["Pricing","#pricing"],["Process","#process"],["Reviews","#reviews"]];

  return (
    <>
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:999,
        padding: isMobile ? "0.9rem 5vw" : (scrolled?"0.75rem 5vw":"1.35rem 5vw"),
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background: scrolled||open ? "rgba(11,9,23,0.94)" : "transparent",
        backdropFilter: scrolled||open ? "blur(22px)" : "none",
        borderBottom: scrolled||open ? `1px solid ${T.bdr}` : "1px solid transparent",
        transition:"all 0.35s ease",
      }}>
        {/* Logo */}
        <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"1rem":"1.18rem",fontWeight:800,color:T.tx,letterSpacing:"-0.02em"}}>
          Your College <span style={GT}>Buddie</span>
        </div>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{display:"flex",alignItems:"center",gap:"0.15rem"}}>
            {links.map(([l,h])=>(
              <button key={l} onClick={()=>go(h)} style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",color:T.txL,padding:"0.45rem 0.85rem",transition:"color 0.2s"}}
                onMouseEnter={e=>e.target.style.color=T.vL}
                onMouseLeave={e=>e.target.style.color=T.txL}
              >{l}</button>
            ))}
            <button onClick={()=>go("#contact")} style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:GR,color:"#fff",border:"none",padding:"0.6rem 1.4rem",cursor:"pointer",borderRadius:"6px",boxShadow:`0 0 20px rgba(124,85,255,0.35)`,transition:"all 0.25s",marginLeft:"0.6rem"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 32px rgba(124,85,255,0.6)`;e.currentTarget.style.transform="translateY(-1px)"}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 0 20px rgba(124,85,255,0.35)`;e.currentTarget.style.transform="none"}}
            >Contact Us</button>
          </div>
        )}

        {/* Hamburger */}
        {isMobile && (
          <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:`1px solid ${T.bdr}`,color:T.txM,cursor:"pointer",padding:"0.5rem 0.7rem",borderRadius:"6px",fontSize:"1rem",lineHeight:1,transition:"border-color 0.2s"}}
            aria-label="Toggle menu"
          >{open ? "✕" : "☰"}</button>
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobile && open && (
        <div style={{
          position:"fixed",top:"60px",left:0,right:0,zIndex:998,
          background:"rgba(11,9,23,0.97)",
          backdropFilter:"blur(24px)",
          borderBottom:`1px solid ${T.bdr}`,
          padding:"1.5rem 5vw 2rem",
          display:"flex",flexDirection:"column",gap:"0.25rem",
          animation:"slideDown 0.25s ease",
        }}>
          {links.map(([l,h])=>(
            <button key={l} onClick={()=>go(h)} style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"1rem",fontWeight:600,letterSpacing:"0.04em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",color:T.txM,padding:"0.9rem 0",textAlign:"left",borderBottom:`1px solid ${T.bdr}`,transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color=T.vL}
              onMouseLeave={e=>e.target.style.color=T.txM}
            >{l}</button>
          ))}
          <button onClick={()=>go("#contact")} style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.9rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:GR,color:"#fff",border:"none",padding:"1rem",cursor:"pointer",borderRadius:"8px",marginTop:"1.2rem",boxShadow:`0 0 24px rgba(124,85,255,0.4)`}}>
            Contact Us
          </button>
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════
//  HERO
// ════════════════════════════════════════════════
function Hero({ rl }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [on, setOn] = useState(false);
  const [ref, inV] = useInView(0.05);
  const n1 = useCounter(1200,2000,inV);
  const n2 = useCounter(98,1800,inV);
  useEffect(()=>{ setTimeout(()=>setOn(true),120); },[]);

  const anim = delay => ({
    opacity:on?1:0,
    transform:on?"none":"translateY(22px)",
    transition:`opacity 0.85s ${delay}s, transform 0.85s ${delay}s`,
  });

  const cards = [
    {label:"Literature Review",sub:"Deep source synthesis",    price:"₹999",  r:"-5deg", t:"0",   l:"20px",d:"0.9"},
    {label:"Thesis Paper",    sub:"End-to-end writing",       price:"₹1299", r:"3deg",  t:"115px",l:"0",   d:"1.1"},
    {label:"AI & Plagiarism", sub:"Detection-proof content",  price:"₹499",  r:"-1.5deg",t:"240px",l:"50px",d:"1.3"},
  ];

  return (
    <section style={{
      minHeight:"100vh",
      display:"grid",
      gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
      alignItems:"center",
      padding: isMobile ? "7.5rem 5vw 4rem" : isTablet ? "9rem 6vw 5rem" : "9rem 5vw 6rem",
      gap: isMobile ? "3rem" : "4rem",
      position:"relative", zIndex:2, background:"transparent",
    }}>
      {/* Ghost word */}
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",
        fontFamily:"'Plus Jakarta Sans',sans-serif",
        fontSize:"clamp(4.5rem,15vw,17rem)", fontWeight:800,
        color:"transparent",
        WebkitTextStroke:"1px rgba(124,85,255,0.055)",
        whiteSpace:"nowrap",pointerEvents:"none",userSelect:"none",
        animation:"bgDrift 22s ease-in-out infinite alternate",
      }}>ACADEMIA</div>

      {/* ── Left ── */}
      <div ref={ref} style={{position:"relative",zIndex:2}}>
        <div style={{...anim(0.2),display:"inline-block",marginBottom:"1.8rem"}}>
          <Pill vis={on}>Academic Excellence Partner</Pill>
        </div>

        <h1 style={{
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          fontSize: isMobile?"2.4rem":isTablet?"3.2rem":"clamp(2.8rem,5vw,4.8rem)",
          fontWeight:800, lineHeight:1.06, letterSpacing:"-0.03em", color:T.tx,
          ...anim(0.38),
        }}>
          Your <span style={GT}>trusted</span><br/>
          college writing<br/>companion
        </h1>

        <p style={{
          fontFamily:"'Instrument Sans',sans-serif",
          fontSize: isMobile?"0.95rem":"1rem",
          color:T.txM, lineHeight:1.8, marginTop:"1.4rem",
          maxWidth: isTablet?"100%":"430px",
          ...anim(0.55),
        }}>
          From literature reviews to thesis papers — polished, plagiarism-free, AI-detection-safe academic writing. Fast. Reliable. Guaranteed.
        </p>

        <div style={{
          display:"flex", flexDirection: isMobile?"column":"row",
          gap:"0.8rem", marginTop:"2.2rem", flexWrap:"wrap",
          ...anim(0.7),
        }}>
          <Btn service="academic writing" label="WhatsApp Us" icon="💬" rl={rl} variant="wa" primary full={isMobile}/>
          <Btn service="academic writing" label="Email Us"    icon="✉️" rl={rl} variant="email" full={isMobile}/>
        </div>

        {rl.blocked && (
          <div style={{marginTop:"1rem",fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.7rem",color:T.rose,background:"rgba(244,63,94,0.08)",border:`1px solid rgba(244,63,94,0.22)`,padding:"0.65rem 1rem",borderRadius:"6px",display:"inline-block"}}>
            ⚠ Rate limit reached — wait {rl.cd}s
          </div>
        )}

        {/* Stats */}
        <div style={{display:"flex",gap: isMobile?"2rem":"3rem",marginTop:"2.8rem",flexWrap:"wrap",...anim(0.88)}}>
          {[[n1+"+","Students helped"],[n2+"%","Satisfaction"],["24h","Turnaround"]].map(([n,l])=>(
            <div key={l}>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"1.7rem":"2.1rem",fontWeight:800,lineHeight:1,...GT}}>{n}</div>
              <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.6rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.txL,marginTop:"0.3rem"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: floating cards (hidden on mobile) ── */}
      {!isTablet && (
        <div style={{position:"relative",height:420,zIndex:2}}>
          {cards.map((c,i)=>(
            <div key={i} style={{
              position:"absolute",top:c.t,left:c.l,width:265,
              background:T.card, border:`1px solid ${T.bdr}`,
              padding:"1.6rem", borderRadius:"10px",
              boxShadow:`0 24px 48px rgba(0,0,0,0.5),inset 0 0 0 1px rgba(124,85,255,0.05)`,
              opacity:on?1:0,
              transform:on?`rotate(${c.r})`:`rotate(${c.r}) translateY(30px)`,
              transition:`opacity 0.9s ${c.d}s,transform 0.9s ${c.d}s`,
              animation:on?`fc${i} ${5+i}s ${parseFloat(c.d)+1}s ease-in-out infinite`:"none",
            }}>
              <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.57rem",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:T.v,marginBottom:"0.5rem"}}>{c.label}</div>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"0.96rem",fontWeight:700,color:T.tx,marginBottom:"0.9rem",lineHeight:1.4}}>{c.sub}</div>
              <div style={{display:"flex",alignItems:"center",gap:"0.45rem"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:T.teal,display:"inline-block",boxShadow:`0 0 8px ${T.teal}`}}/>
                <span style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.84rem",fontWeight:700,color:T.teal}}>From {c.price}/1000w</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile card strip (single scrollable row) */}
      {isTablet && (
        <div style={{display:"flex",gap:"1rem",overflowX:"auto",paddingBottom:"0.5rem",WebkitOverflowScrolling:"touch"}}>
          {cards.map((c,i)=>(
            <div key={i} style={{minWidth:220,flexShrink:0,background:T.card,border:`1px solid ${T.bdr}`,padding:"1.3rem",borderRadius:"10px"}}>
              <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.57rem",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:T.v,marginBottom:"0.4rem"}}>{c.label}</div>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"0.9rem",fontWeight:700,color:T.tx,marginBottom:"0.7rem"}}>{c.sub}</div>
              <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.8rem",fontWeight:700,color:T.teal}}>From {c.price}/1000w</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════
//  SERVICES
// ════════════════════════════════════════════════
const SVCS = [
  {icon:"📚",name:"Literature Review",    price:"₹999",  desc:"In-depth synthesis of academic sources into a coherent narrative for any subject.",feats:["Systematic source search & screening","Thematic synthesis & gap analysis","APA / MLA / Chicago / Harvard","Min. 20 cited sources"]},
  {icon:"📝",name:"Thesis Paper",         price:"₹1299", desc:"End-to-end thesis writing with strong arguments, proper structure, and rigour.",feats:["Full chapter structuring","Research methodology design","Results & discussion writing","Supervisor-ready formatting"]},
  {icon:"🔬",name:"Research Paper",       price:"₹1499", desc:"Publication-quality papers with abstract, methodology, and scholarly language.",feats:["Abstract & keyword optimisation","Literature & methodology","Data analysis & findings","Journal-style referencing"]},
  {icon:"🛡️",name:"AI & Plagiarism Removal",price:"₹499",desc:"Transform flagged content into 100% original, human-sounding academic writing.",feats:["Turnitin & iThenticate safe","GPTZero & Originality.ai safe","Meaning fully preserved","Detection report included"]},
];

function Services({ rl }) {
  const { isMobile } = useBreakpoint();
  const [ref,inV] = useInView();
  return (
    <section id="services" style={{padding: isMobile?"5rem 5vw":"8rem 5vw",background:T.mid,position:"relative",zIndex:2,overflow:"hidden"}}>
      <GlowBar/>
      <div ref={ref} style={{marginBottom:isMobile?"2.5rem":"4rem",paddingTop:"3rem"}}>
        <Pill vis={inV}>What we offer</Pill>
        <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"1.9rem":"clamp(2rem,4vw,3.3rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.025em",color:T.tx,opacity:inV?1:0,transform:inV?"none":"translateY(18px)",transition:"all 0.7s 0.15s"}}>
          Academic services<br/><span style={GT}>crafted for you</span>
        </h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns: isMobile?"1fr":"repeat(auto-fit,minmax(255px,1fr))",gap:"1px",background:T.bdr}}>
        {SVCS.map((s,i)=><SvcCard key={i} s={s} i={i} rl={rl} inV={inV}/>)}
      </div>
    </section>
  );
}

function SvcCard({s,i,rl,inV}) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      background:hov?T.surf:T.mid,
      padding:"2.2rem 1.8rem",position:"relative",overflow:"hidden",
      transition:"background 0.3s",
      opacity:inV?1:0,transform:inV?"none":"translateY(38px)",
      transitionDuration:"0.8s",transitionDelay:`${0.1*i+0.3}s`,
    }}>
      <div style={{position:"absolute",top:0,left:0,right:hov?"0":"100%",height:2,background:GR,transition:"right 0.4s ease"}}/>
      <span style={{fontSize:"2rem",display:"block",marginBottom:"1.3rem",transform:hov?"scale(1.15) rotate(-4deg)":"none",transition:"transform 0.3s"}}>{s.icon}</span>
      <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"1.2rem",fontWeight:700,color:T.tx,marginBottom:"0.7rem"}}>{s.name}</h3>
      <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.85rem",lineHeight:1.78,color:T.txM,marginBottom:"1.3rem"}}>{s.desc}</p>
      <ul style={{listStyle:"none",padding:0,margin:"0 0 1.6rem"}}>
        {s.feats.map((f,j)=>(
          <li key={j} style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.68rem",fontWeight:500,color:T.txL,padding:"0.33rem 0",borderBottom:`1px solid rgba(124,85,255,0.07)`,display:"flex",alignItems:"center",gap:"0.5rem"}}>
            <span style={{color:T.v,fontSize:"0.44rem"}}>◆</span>{f}
          </li>
        ))}
      </ul>
      <div style={{display:"flex",alignItems:"baseline",gap:"0.4rem",marginBottom:"1.5rem"}}>
        <span style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.58rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.txL}}>From</span>
        <span style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"1.65rem",fontWeight:800,...GT}}>{s.price}</span>
        <span style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.58rem",color:T.txL}}>/1000w</span>
      </div>
      <Btn service={s.name} label="Enquire Now" icon="💬" rl={rl} variant="wa"/>
    </div>
  );
}

// ════════════════════════════════════════════════
//  PRICING
// ════════════════════════════════════════════════
const PLANS = [
  {svc:"AI & Plagiarism Removal",name:"Express Clean",price:"499",items:["AI detection removal","Plagiarism deep-clean","Meaning preserved","24–48h delivery","Report on request"],hot:false},
  {svc:"Literature Review",name:"Lit Review",price:"999",items:["Systematic source search","Min. 20 academic sources","Any citation format","3-day delivery","1 free revision"],hot:false},
  {svc:"Thesis Paper",name:"Full Thesis",price:"1299",items:["All chapters covered","Research methodology","Results & discussion","5–7 day delivery","Unlimited revisions"],hot:true},
  {svc:"Research Paper",name:"Research Pro",price:"1499",items:["Abstract + full paper","Data analysis section","Journal-style formatting","5-day delivery","2 free revisions"],hot:false},
];

function Pricing({ rl }) {
  const {isMobile} = useBreakpoint();
  const [ref,inV]=useInView();
  return (
    <section id="pricing" style={{padding:isMobile?"5rem 5vw":"8rem 5vw",background:T.bg,position:"relative",zIndex:2,overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"28vw",fontWeight:800,color:"rgba(124,85,255,0.025)",pointerEvents:"none",userSelect:"none"}}>₹</div>
      <div ref={ref} style={{marginBottom:isMobile?"2.5rem":"4rem"}}>
        <Pill vis={inV}>Transparent pricing</Pill>
        <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"1.9rem":"clamp(2rem,4vw,3.3rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.025em",color:T.tx,opacity:inV?1:0,transform:inV?"none":"translateY(18px)",transition:"all 0.7s 0.15s"}}>
          No hidden costs,<br/><span style={GT}>no surprises</span>
        </h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fit,minmax(230px,1fr))",gap:"1.3rem",position:"relative",zIndex:2}}>
        {PLANS.map((p,i)=><PCard key={i} p={p} i={i} rl={rl} inV={inV}/>)}
      </div>
    </section>
  );
}

function PCard({p,i,rl,inV}) {
  const [hov,setHov]=useState(false);
  const act=hov||p.hot;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      background:p.hot?T.surf:T.card,
      border:`1px solid ${act?T.v:T.bdr}`,
      padding:"2.2rem 1.7rem",position:"relative",overflow:"hidden",
      borderRadius:"10px",
      transform:inV?(p.hot?"scale(1.03)":(hov?"translateY(-6px)":"none")):"translateY(38px)",
      boxShadow:act?`0 18px 48px rgba(0,0,0,0.5),0 0 36px ${T.glowS}`:"none",
      opacity:inV?1:0,
      transition:"all 0.35s",
      transitionDelay:`${0.08*i+0.2}s`,
    }}>
      {p.hot&&(
        <>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,rgba(124,85,255,0.07),rgba(217,70,239,0.04))`,pointerEvents:"none",borderRadius:"10px"}}/>
          <div style={{position:"absolute",top:0,right:"1.4rem",background:GR,color:"#fff",fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.57rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.28rem 0.75rem",borderRadius:"0 0 5px 5px"}}>Most Popular</div>
        </>
      )}
      <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.59rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:T.v,marginBottom:"0.5rem",position:"relative"}}>{p.svc}</div>
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"1.3rem",fontWeight:700,color:T.tx,marginBottom:"1rem",position:"relative"}}>{p.name}</div>
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"2.8rem",fontWeight:800,lineHeight:1,position:"relative",...GT}}>
        <sup style={{fontSize:"1.2rem",verticalAlign:"top",marginTop:"0.5rem",display:"inline-block"}}>₹</sup>{p.price}
      </div>
      <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.59rem",fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase",color:T.txL,margin:"0.3rem 0 1.3rem",position:"relative"}}>per 1000 words</div>
      <div style={{height:1,background:"rgba(124,85,255,0.1)",margin:"0.9rem 0",position:"relative"}}/>
      <ul style={{listStyle:"none",padding:0,margin:"0 0 1.7rem",position:"relative"}}>
        {p.items.map((item,j)=>(
          <li key={j} style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.82rem",padding:"0.38rem 0",color:T.txM,display:"flex",alignItems:"flex-start",gap:"0.55rem",lineHeight:1.5}}>
            <span style={{color:T.teal,fontWeight:700,fontSize:"0.72rem",flexShrink:0,marginTop:"0.1rem"}}>✓</span>{item}
          </li>
        ))}
      </ul>
      <div style={{display:"flex",flexDirection:"column",gap:"0.55rem",position:"relative"}}>
        <Btn service={p.name} label="Chat on WhatsApp" icon="💬" rl={rl} variant="wa" primary={p.hot} full/>
        <Btn service={p.name} label="Send Email"       icon="✉️" rl={rl} variant="email" full/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  PROCESS
// ════════════════════════════════════════════════
const STEPS=[
  ["01","Share Requirements","Send your topic, word count, citation style, and any guidelines from your institution."],
  ["02","Get a Quote","Receive a clear, no-obligation price within 30 minutes. No hidden fees, ever."],
  ["03","We Write","Our academic experts craft your paper with proper research, citations, and formatting."],
  ["04","Deliver & Revise","Work delivered before your deadline. Request free revisions until 100% satisfied."],
];

function Process() {
  const {isMobile,isTablet}=useBreakpoint();
  const [ref,inV]=useInView();
  return (
    <section id="process" style={{padding:isMobile?"5rem 5vw":"8rem 5vw",background:T.mid,position:"relative",zIndex:2,overflow:"hidden"}}>
      <GlowBar/>
      <div ref={ref} style={{textAlign:"center",marginBottom:isMobile?"2.5rem":"5rem",paddingTop:"3rem"}}>
        <Pill vis={inV}>Simple process</Pill>
        <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"1.9rem":"clamp(2rem,4vw,3.2rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.025em",color:T.tx,opacity:inV?1:0,transform:inV?"none":"translateY(18px)",transition:"all 0.7s 0.15s"}}>
          How it <span style={GT}>works</span>
        </h2>
      </div>
      <div style={{
        display:"grid",
        gridTemplateColumns:isMobile?"1fr":isTablet?"1fr 1fr":"repeat(4,1fr)",
        gap: isMobile?"2rem":isTablet?"2rem":"3rem",
        position:"relative",
      }}>
        {!isMobile&&!isTablet&&<div style={{position:"absolute",top:34,left:"10%",right:"10%",height:1,background:`linear-gradient(90deg,transparent,${T.bdr},transparent)`}}/>}
        {STEPS.map(([n,t,d],i)=><StepCard key={i} n={n} title={t} desc={d} i={i} inV={inV} isMobile={isMobile}/>)}
      </div>
    </section>
  );
}

function StepCard({n,title,desc,i,inV,isMobile}) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        textAlign:isMobile?"left":"center",
        padding: isMobile?"1.2rem 1.4rem":"0 0.5rem",
        background: isMobile ? T.card : "transparent",
        borderRadius: isMobile ? "10px" : 0,
        border: isMobile ? `1px solid ${T.bdr}` : "none",
        display: isMobile ? "flex" : "block",
        gap:"1.2rem", alignItems:"flex-start",
        opacity:inV?1:0,transform:inV?"none":"translateY(38px)",
        transition:`all 0.8s ${0.15*i+0.2}s`,
      }}>
      <div style={{display:"flex",justifyContent:isMobile?"flex-start":"center",marginBottom:isMobile?0:"1.4rem",flexShrink:0}}>
        <div style={{
          width:60,height:60,borderRadius:"8px",
          border:`1px solid ${hov?T.v:T.bdr}`,
          background:hov?GR:"transparent",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"1.2rem",fontWeight:800,
          color:hov?"#fff":T.v,
          boxShadow:hov?`0 0 24px ${T.glow}`:"none",
          transform:hov?"scale(1.08)":"none",
          transition:"all 0.3s",
        }}>{n}</div>
      </div>
      <div>
        <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"1.05rem",fontWeight:700,color:T.tx,marginBottom:"0.5rem"}}>{title}</h3>
        <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.83rem",lineHeight:1.78,color:T.txM}}>{desc}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  PROMISE
// ════════════════════════════════════════════════
function Promise() {
  const {isMobile}=useBreakpoint();
  const [ref,inV]=useInView();
  const badges=[["🔒","Confidential"],["⚡","On-time"],["✅","Plagiarism-Free"],["🔄","Free Revisions"]];
  return (
    <section style={{padding:isMobile?"4rem 5vw":"5rem 5vw",background:T.surf,position:"relative",overflow:"hidden",zIndex:2}}>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,rgba(124,85,255,0.07),rgba(217,70,239,0.04))`,pointerEvents:"none"}}/>
      <GlowBar/>
      <div ref={ref} style={{display:"flex",alignItems:isMobile?"flex-start":"center",justifyContent:"space-between",gap:"2.5rem",flexWrap:"wrap",position:"relative",flexDirection:isMobile?"column":"row"}}>
        <div style={{flex:"1 1 300px"}}>
          <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"1.8rem":"clamp(1.8rem,3.5vw,2.8rem)",fontWeight:800,color:T.tx,lineHeight:1.12,marginBottom:"0.9rem",opacity:inV?1:0,transform:inV?"none":"translateY(14px)",transition:"all 0.7s"}}>
            Our Promise<br/><span style={GT}>to Every Student</span>
          </h2>
          <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.93rem",color:T.txM,lineHeight:1.78,opacity:inV?1:0,transition:"all 0.7s 0.15s"}}>
            We stand behind every piece of writing we deliver. If it doesn't meet your requirements, we'll fix it free — no questions asked.
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isMobile?"1rem":"2rem"}}>
          {badges.map(([ic,lb],i)=>(
            <div key={i} style={{textAlign:"center",background:T.card,border:`1px solid ${T.bdr}`,borderRadius:"10px",padding:"1.2rem 1rem",opacity:inV?1:0,transform:inV?"none":"translateY(14px)",transition:`all 0.7s ${0.1*i+0.3}s`}}>
              <div style={{fontSize:"1.6rem",marginBottom:"0.4rem"}}>{ic}</div>
              <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:T.txL}}>{lb}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════
//  TESTIMONIALS
// ════════════════════════════════════════════════
const TESTI=[
  {s:5,q:"Got my 4000-word literature review in 2 days. Sources were perfect and my professor was genuinely impressed.",a:"Priya S.",r:"MBA Student, Pune"},
  {s:5,q:"My thesis was flagged at 28% on Turnitin. They brought it to 3% without changing my content. Lifesavers.",a:"Rohan M.",r:"B.Tech Final Year, Bangalore"},
  {s:5,q:"Research paper well-structured, properly cited, delivered 12 hours before my deadline. Highly recommend!",a:"Aisha K.",r:"MSc Student, Hyderabad"},
  {s:4,q:"Needed AI content removed from my assignment. Rewritten version sounded natural. Passed GPTZero easily.",a:"Dev R.",r:"BBA Student, Delhi"},
  {s:5,q:"Communication was fast and professional. They understood exactly what my university guidelines required.",a:"Sneha T.",r:"PhD Scholar, Mumbai"},
  {s:5,q:"Used them 3 times now. Never disappointed. Best prices I've found for this quality of work.",a:"Arjun P.",r:"M.Com Student, Chennai"},
];

function Testimonials() {
  const {isMobile}=useBreakpoint();
  const [ref,inV]=useInView();
  const [paused,setPaused]=useState(false);
  const all=[...TESTI,...TESTI];
  return (
    <section id="reviews" style={{padding:isMobile?"5rem 5vw":"8rem 5vw",background:T.bg,overflow:"hidden",position:"relative",zIndex:2}}>
      <div ref={ref} style={{marginBottom:"3rem"}}>
        <Pill vis={inV}>What students say</Pill>
        <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"1.9rem":"clamp(2rem,4vw,3.2rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.025em",color:T.tx,opacity:inV?1:0,transform:inV?"none":"translateY(18px)",transition:"all 0.7s 0.15s"}}>
          Real words, <span style={GT}>real results</span>
        </h2>
      </div>
      <div style={{position:"relative"}}>
        {[["left"],["right"]].map(([s],ii)=>(
          <div key={ii} style={{position:"absolute",top:0,bottom:0,[s]:0,width:isMobile?40:100,zIndex:2,pointerEvents:"none",background:`linear-gradient(${ii?"-":""}90deg,${T.bg},transparent)`}}/>
        ))}
        <div
          onMouseEnter={()=>setPaused(true)}
          onMouseLeave={()=>setPaused(false)}
          style={{display:"flex",gap:"1.3rem",animation:"marquee 36s linear infinite",animationPlayState:paused?"paused":"running",width:"max-content"}}
        >
          {all.map((t,i)=>(
            <div key={i}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.bdrA}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.bdr}
              style={{background:T.card,border:`1px solid ${T.bdr}`,padding:"1.7rem",width:isMobile?260:290,flexShrink:0,borderRadius:"10px",transition:"border-color 0.3s"}}>
              <div style={{display:"flex",gap:"2px",marginBottom:"1rem"}}>
                {[...Array(5)].map((_,j)=><span key={j} style={{color:j<t.s?T.v:T.txL,fontSize:"0.78rem"}}>★</span>)}
              </div>
              <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.84rem",lineHeight:1.8,color:T.txM,fontStyle:"italic",marginBottom:"1.4rem"}}>&ldquo;{t.q}&rdquo;</p>
              <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.v}}>{t.a}</div>
              <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.57rem",letterSpacing:"0.08em",textTransform:"uppercase",color:T.txL,marginTop:"0.2rem"}}>{t.r}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════
//  CONTACT
// ════════════════════════════════════════════════
function Contact({ rl }) {
  const {isMobile}=useBreakpoint();
  const [ref,inV]=useInView();
  return (
    <section id="contact" style={{padding:isMobile?"5rem 5vw":"8rem 5vw",background:T.mid,textAlign:"center",position:"relative",overflow:"hidden",zIndex:2}}>
      <GlowBar/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:isMobile?300:700,height:isMobile?300:700,background:`radial-gradient(circle,rgba(124,85,255,0.08) 0%,transparent 70%)`,pointerEvents:"none"}}/>
      <div ref={ref} style={{position:"relative",zIndex:2,paddingTop:"2rem"}}>
        <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:isMobile?"2.2rem":"clamp(2.5rem,6vw,4.8rem)",fontWeight:800,lineHeight:1.07,letterSpacing:"-0.03em",color:T.tx,marginBottom:"1.2rem",opacity:inV?1:0,transform:inV?"none":"translateY(26px)",transition:"all 0.8s"}}>
          Ready to ace<br/><span style={GT}>your academics?</span>
        </h2>
        <p style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:isMobile?"0.93rem":"1rem",color:T.txM,maxWidth:460,margin:"0 auto 1.2rem",lineHeight:1.8,opacity:inV?1:0,transition:"all 0.8s 0.15s"}}>
          Join over 1,200 students who trust Your College Buddie. Get a free quote within 30 minutes.
        </p>
        <div style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.08em",color:T.teal,background:"rgba(45,212,191,0.07)",border:`1px solid rgba(45,212,191,0.2)`,padding:"0.46rem 1rem",marginBottom:"2.5rem",borderRadius:"40px",opacity:inV?1:0,transition:"all 0.8s 0.25s"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:T.teal,display:"inline-block",boxShadow:`0 0 8px ${T.teal}`}}/>
          🔒 Secure &amp; Confidential — All chats are private
        </div>

        {rl.blocked&&(
          <div style={{maxWidth:420,margin:"0 auto 1.5rem",fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.71rem",color:T.rose,background:"rgba(244,63,94,0.08)",border:`1px solid rgba(244,63,94,0.22)`,padding:"0.8rem 1.2rem",borderRadius:"8px"}}>
            ⚠ Contact limit reached (3/min). Please wait {rl.cd}s.
          </div>
        )}

        <div style={{display:"flex",flexDirection:isMobile?"column":"row",gap:"0.85rem",justifyContent:"center",alignItems:"center",opacity:inV?1:0,transition:"all 0.8s 0.35s",width:isMobile?"100%":"auto",maxWidth:isMobile?"360px":"none",margin:"0 auto"}}>
          <Btn service="academic writing" label="Chat on WhatsApp" icon="💬" rl={rl} variant="wa" primary full={isMobile}/>
          <Btn service="academic writing" label="Send an Email"    icon="✉️" rl={rl} variant="email" full={isMobile}/>
        </div>

        <div style={{marginTop:"2.5rem",display:"flex",justifyContent:"center",gap:isMobile?"1.5rem":"3rem",flexWrap:"wrap",opacity:inV?1:0,transition:"all 0.8s 0.45s"}}>
          {[["⚡","30 min reply"],["📅","7 days/week"],["🔐","100% private"]].map(([ic,lb])=>(
            <div key={lb} style={{display:"flex",alignItems:"center",gap:"0.4rem",fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.63rem",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:T.txL}}>
              <span>{ic}</span><span>{lb}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════
//  FOOTER
// ════════════════════════════════════════════════
function Footer() {
  const {isMobile}=useBreakpoint();
  const go=id=>document.querySelector(id)?.scrollIntoView({behavior:"smooth"});
  return (
    <footer style={{background:T.bg,padding:isMobile?"2rem 5vw":"2.5rem 5vw",display:"flex",alignItems:isMobile?"flex-start":"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1.2rem",borderTop:`1px solid ${T.bdr}`,position:"relative",zIndex:2,flexDirection:isMobile?"column":"row"}}>
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"1.05rem",fontWeight:800,color:T.tx}}>
        Your College <span style={GT}>Buddie</span>
      </div>
      <div style={{display:"flex",gap:isMobile?"1.2rem":"2rem",flexWrap:"wrap"}}>
        {[["Services","#services"],["Pricing","#pricing"],["Process","#process"],["Reviews","#reviews"]].map(([l,h])=>(
          <button key={l} onClick={()=>go(h)} style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",color:T.txL,transition:"color 0.2s"}}
            onMouseEnter={e=>e.target.style.color=T.v}
            onMouseLeave={e=>e.target.style.color=T.txL}
          >{l}</button>
        ))}
      </div>
      <div style={{fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.57rem",letterSpacing:"0.08em",color:T.txL,opacity:0.5}}>© 2025 Your College Buddie. All rights reserved.</div>
    </footer>
  );
}

// ════════════════════════════════════════════════
//  WHATSAPP FAB
// ════════════════════════════════════════════════
function WAFab({ rl }) {
  const [hov,setHov]=useState(false);
  const [toast,setToast]=useState(null);
  const click=()=>{
    const ok=rl.attempt(()=>openSafe(`${C.wa()}?text=${C.msg("academic writing")}`));
    if(!ok){setToast(`Wait ${rl.cd}s`);setTimeout(()=>setToast(null),3000);}
  };
  return (
    <div style={{position:"fixed",bottom:"1.5rem",right:"1.5rem",zIndex:800,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.5rem"}}>
      {toast&&<div style={{background:T.rose,color:"#fff",fontFamily:"'Instrument Sans',sans-serif",fontSize:"0.63rem",fontWeight:600,padding:"0.38rem 0.85rem",borderRadius:"5px",animation:"pop 0.18s ease",whiteSpace:"nowrap",boxShadow:"0 4px 14px rgba(0,0,0,0.4)"}}>⚠ {toast}</div>}
      <button onClick={click} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{width:52,height:52,background:"#25D366",border:"none",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.35rem",cursor:"pointer",boxShadow:hov?"0 8px 28px rgba(37,211,102,0.65)":"0 6px 20px rgba(37,211,102,0.35)",transform:hov?"scale(1.1)":"none",animation:"fabPulse 2.8s ease-in-out infinite",transition:"transform 0.2s,box-shadow 0.2s",opacity:rl.blocked?0.45:1}}
        aria-label="Chat on WhatsApp"
      >💬</button>
    </div>
  );
}

// ════════════════════════════════════════════════
//  APP
// ════════════════════════════════════════════════
export default function App() {
  const [scrolled,setScrolled]=useState(false);
  const rl=useRateLimit(3,60000);

  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent=GLOBAL_CSS;
    document.head.appendChild(s);
    const fn=()=>setScrolled(window.scrollY>50);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  return (
    <div style={{fontFamily:"'Instrument Sans',sans-serif",color:T.tx,background:T.bg,minHeight:"100vh",position:"relative"}}>
      <Bg/>
      <Nav scrolled={scrolled}/>
      <Hero rl={rl}/>
      <Services rl={rl}/>
      <Pricing rl={rl}/>
      <Process/>
      <Promise/>
      <Testimonials/>
      <Contact rl={rl}/>
      <Footer/>
      <WAFab rl={rl}/>
    </div>
  );
}