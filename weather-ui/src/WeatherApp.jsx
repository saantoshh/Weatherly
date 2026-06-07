import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

const injectFonts = () => {
  if (document.getElementById("wly-fonts")) return;
  const link = document.createElement("link");
  link.id = "wly-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,400;0,9..144,700;1,9..144,200;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
};

const injectStyles = () => {
  if (document.getElementById("wly-styles")) return;
  const style = document.createElement("style");
  style.id = "wly-styles";
  style.textContent = `
    @keyframes wly-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
    @keyframes wly-rise { from{opacity:0;transform:translateY(18px) scale(0.98)} to{opacity:1;transform:none} }
    @keyframes wly-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes wly-locblink { 0%,100%{opacity:1} 50%{opacity:0.2} }
    @keyframes wly-pulse-logo { 0%,100%{box-shadow:0 4px 18px rgba(240,200,74,0.3)} 50%{box-shadow:0 4px 28px rgba(240,200,74,0.55)} }
    @keyframes wly-spin { to{transform:rotate(360deg)} }
    @keyframes wly-cloud { from{left:calc(-320px)} to{left:calc(100vw + 120px)} }
    @keyframes wly-cond { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-4px) rotate(6deg)} }
    @keyframes wly-blobmove { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-18px) scale(1.04)} 66%{transform:translate(-18px,26px) scale(0.96)} 100%{transform:translate(14px,8px) scale(1.02)} }
    @keyframes wly-dropdown-in { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:none} }
    .wly-skel { border-radius:10px; background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%); background-size:200% 100%; animation:wly-shimmer 2s linear infinite; }
    .wly-rise { animation:wly-rise 0.55s cubic-bezier(0.16,1,0.3,1) both }
    .wly-rise2 { animation:wly-rise 0.55s 0.12s cubic-bezier(0.16,1,0.3,1) both }
    .wly-day-card:hover .wly-day-emoji { transform:scale(1.2) rotate(8deg) }
    .wly-day-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.16) !important }
    .wly-stat-pill:hover { transform:translateY(-2px); background:rgba(255,255,255,0.08) !important }
    .wly-search-box:focus-within { border-color:rgba(240,200,74,0.5) !important; box-shadow:0 8px 40px rgba(0,0,0,0.3),0 0 0 3px rgba(240,200,74,0.1),inset 0 1px 0 rgba(255,255,255,0.1) !important; }
    .wly-dd-option { padding:10px 16px; cursor:pointer; font-size:13px; font-weight:500; font-family:'DM Sans',sans-serif; color:rgba(240,246,255,0.7); border-radius:10px; transition:all 0.15s; display:flex; align-items:center; justify-content:space-between; }
    .wly-dd-option:hover { background:rgba(255,255,255,0.1); color:#f0f6ff; }
    .wly-dd-option.selected { color:#f0c84a; background:rgba(240,200,74,0.1); }
  `;
  document.head.appendChild(style);
};

const condEmoji = (cond) => {
  if (!cond) return "🌤";
  const c = cond.toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return "⛈";
  if (c.includes("snow") || c.includes("blizzard")) return "❄️";
  if (c.includes("sleet") || c.includes("ice")) return "🌨";
  if (c.includes("heavy rain") || c.includes("torrential")) return "🌧";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return "🌦";
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) return "🌫";
  if (c.includes("overcast")) return "☁️";
  if (c.includes("cloud")) return "🌥";
  if (c.includes("partly")) return "⛅";
  if (c.includes("sunny") || c.includes("clear")) return "☀️";
  if (c.includes("wind")) return "💨";
  return "🌤";
};

const tempColor = (c) => {
  if (c > 38) return "#ff5533";
  if (c > 30) return "#ff8c40";
  if (c > 22) return "#f0c84a";
  if (c > 14) return "#80e080";
  if (c > 5)  return "#60c8ff";
  if (c > -5) return "#90d0ff";
  return "#c8e8ff";
};

const getSkyTheme = (cond, temp) => {
  if (!cond) return "clear";
  const c = cond.toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return "thunder";
  if (c.includes("snow") || c.includes("blizzard") || c.includes("sleet")) return "snow";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return "rain";
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) return "fog";
  if (c.includes("overcast")) return "overcast";
  if (c.includes("cloud")) return "cloudy";
  if (c.includes("sunny") || c.includes("clear")) return temp > 20 ? "sunny_warm" : "sunny_cool";
  return "clear";
};

const THEMES = {
  sunny_warm: { bg:"linear-gradient(180deg,#1a3a6e 0%,#0f2251 35%,#0a1a3e 100%)", starsOp:0.6,  clouds:2,  cloudOp:0.07, particles:"clear", lightning:false, auroraOp:0.3  },
  sunny_cool: { bg:"linear-gradient(180deg,#0d2a5e 0%,#0a1d45 40%,#060e27 100%)", starsOp:0.9,  clouds:1,  cloudOp:0.05, particles:"clear", lightning:false, auroraOp:0.5  },
  cloudy:     { bg:"linear-gradient(180deg,#111825 0%,#0d1420 50%,#090f1a 100%)", starsOp:0.15, clouds:8,  cloudOp:0.11, particles:"clear", lightning:false, auroraOp:0.1  },
  overcast:   { bg:"linear-gradient(180deg,#0c1018 0%,#090d15 100%)",             starsOp:0.04, clouds:12, cloudOp:0.17, particles:"clear", lightning:false, auroraOp:0.04 },
  rain:       { bg:"linear-gradient(180deg,#08101e 0%,#060d18 100%)",             starsOp:0,    clouds:10, cloudOp:0.14, particles:"rain",  lightning:false, auroraOp:0    },
  thunder:    { bg:"linear-gradient(180deg,#06080f 0%,#050710 100%)",             starsOp:0,    clouds:14, cloudOp:0.24, particles:"rain",  lightning:true,  auroraOp:0    },
  snow:       { bg:"linear-gradient(180deg,#0d1a2e 0%,#081220 100%)",             starsOp:0.3,  clouds:6,  cloudOp:0.19, particles:"snow",  lightning:false, auroraOp:0.14 },
  fog:        { bg:"linear-gradient(180deg,#0e1520 0%,#0b1018 100%)",             starsOp:0,    clouds:20, cloudOp:0.24, particles:"clear", lightning:false, auroraOp:0    },
  clear:      { bg:"linear-gradient(180deg,#0a1830 0%,#060e1e 100%)",             starsOp:0.9,  clouds:1,  cloudOp:0.04, particles:"clear", lightning:false, auroraOp:0.6  },
};

const formatDay = (ds) => {
  const d = new Date(ds + "T00:00:00");
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  const name = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday:"short" });
  const sub  = d.toLocaleDateString("en-GB", { day:"numeric", month:"short" });
  return { name, sub };
};

const toF = (c) => c * 9/5 + 32;

// ─── Custom Dropdown (portal-based so it always floats above everything) ─────
const DAY_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
  { value: 7, label: "7 days" },
];

function CustomSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const selected = DAY_OPTIONS.find(o => o.value === value) || DAY_OPTIONS[1];

  // Reposition whenever opened
  const openMenu = () => {
    if (btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    setOpen(true);
  };

  const toggle = () => (open ? setOpen(false) : openMenu());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll / resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [open]);

  const menuStyle = rect ? {
    position: "fixed",
    top: rect.bottom + 8,
    right: window.innerWidth - rect.right,
    zIndex: 99999,
    background: "rgba(10,16,30,0.98)",
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    border: "0.5px solid rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 6,
    minWidth: 140,
    boxShadow: "0 24px 80px rgba(0,0,0,0.75), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    animation: "wly-dropdown-in 0.18s cubic-bezier(0.16,1,0.3,1) both",
  } : {};

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        ref={btnRef}
        onClick={toggle}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
          border: "0.5px solid rgba(255,255,255,0.16)",
          borderRadius: 12, color: "#f0f6ff",
          fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
          padding: "10px 14px", outline: "none", cursor: "pointer",
          whiteSpace: "nowrap", transition: "all 0.2s",
        }}
      >
        {selected.label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ opacity: 0.5, transition: "transform 0.22s", transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && rect && createPortal(
        <div ref={menuRef} style={menuStyle}>
          {DAY_OPTIONS.map(opt => (
            <div
              key={opt.value}
              className={`wly-dd-option${opt.value === value ? " selected" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
              {opt.value === value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#f0c84a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Animated Sky Scene ───────────────────────────────────────────────────────
function AnimatedScene({ theme }) {
  const starsRef    = useRef(null);
  const particleRef = useRef(null);
  const lightRef    = useRef(null);
  const starsArr    = useRef([]);
  const particles   = useRef([]);
  const rafRef      = useRef(null);
  const lastLight   = useRef(0);
  const doLight     = useRef(false);
  const pMode       = useRef("clear");
  const t           = THEMES[theme] || THEMES.clear;

  const initStars = useCallback(() => {
    const c = starsRef.current; if (!c) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    starsArr.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height * 0.7,
      r: Math.random() * 1.2 + 0.3, a: Math.random(),
      speed: Math.random() * 0.012 + 0.003, phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  const initParticles = useCallback((mode) => {
    const c = particleRef.current; if (!c) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    pMode.current = mode;
    const count = mode === "rain" ? 220 : mode === "snow" ? 140 : 60;
    particles.current = Array.from({ length: count }, () => {
      if (mode === "rain") return { x:Math.random()*c.width, y:Math.random()*c.height*-0.5, len:Math.random()*18+8, speed:Math.random()*8+10, drift:Math.random()*1.5, alpha:Math.random()*0.4+0.2 };
      if (mode === "snow") return { x:Math.random()*c.width, y:Math.random()*c.height*-0.3, r:Math.random()*3+1, speed:Math.random()*1.2+0.4, drift:Math.random()*0.8-0.4, swing:Math.random()*Math.PI*2, swingSpeed:Math.random()*0.02+0.005, alpha:Math.random()*0.6+0.3 };
      return { x:Math.random()*c.width, y:Math.random()*c.height, vx:(Math.random()-0.5)*0.4, vy:-Math.random()*0.6-0.1, r:Math.random()*1.2+0.3, alpha:Math.random()*0.3+0.05, phase:Math.random()*Math.PI*2, speed:Math.random()*0.015+0.005 };
    });
  }, []);

  const initLight = useCallback(() => {
    const c = lightRef.current; if (!c) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
  }, []);

  useEffect(() => {
    injectFonts(); injectStyles(); initStars(); initLight();
    const onResize = () => { initStars(); initLight(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [initStars, initLight]);

  useEffect(() => {
    initParticles(t.particles);
    doLight.current = t.lightning;
  }, [theme, t.particles, t.lightning, initParticles]);

  const drawBolt = useCallback(function drawBolt(ctx, x, y, dx, dy, branches, alpha) {
    if (branches <= 0 || alpha < 0.05) return;
    const nx = x + dx + (Math.random() - 0.5) * 50;
    const ny = y + dy;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = `rgba(200,220,255,${alpha})`;
    ctx.lineWidth = branches * 0.8;
    ctx.stroke();
    drawBolt(ctx, nx, ny, dx * (0.6 + Math.random() * 0.4), dy * (0.6 + Math.random() * 0.4), branches - 1, alpha * 0.7);
    if (Math.random() < 0.4) {
      drawBolt(ctx, nx, ny, (dx + Math.random() * 60 - 30) * 0.6, dy * 0.5, branches - 2, alpha * 0.4);
    }
  }, []);

  useEffect(() => {
    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop);
      const sc = starsRef.current;
      if (sc) {
        const stx = sc.getContext("2d"); stx.clearRect(0,0,sc.width,sc.height);
        starsArr.current.forEach(s => {
          s.phase += s.speed;
          const a = s.a*(0.5+0.5*Math.sin(s.phase));
          stx.beginPath(); stx.arc(s.x,s.y,s.r,0,Math.PI*2);
          stx.fillStyle = `rgba(220,235,255,${a})`; stx.fill();
        });
      }
      const pc = particleRef.current;
      if (pc) {
        const pctx = pc.getContext("2d"); pctx.clearRect(0,0,pc.width,pc.height);
        const mode = pMode.current;
        if (mode === "rain") {
          pctx.strokeStyle = "rgba(180,210,255,0.28)";
          particles.current.forEach(p => {
            p.y += p.speed; p.x += p.drift;
            if (p.y > pc.height+20) { p.y = -p.len*2; p.x = Math.random()*pc.width; }
            pctx.beginPath(); pctx.moveTo(p.x,p.y); pctx.lineTo(p.x-p.drift*2,p.y-p.len);
            pctx.lineWidth=0.8; pctx.globalAlpha=p.alpha; pctx.stroke();
          });
          pctx.globalAlpha=1;
        } else if (mode === "snow") {
          particles.current.forEach(p => {
            p.y+=p.speed; p.swing+=p.swingSpeed; p.x+=p.drift+Math.sin(p.swing)*0.5;
            if (p.y>pc.height+10){p.y=-10;p.x=Math.random()*pc.width;}
            if (p.x<0) p.x=pc.width; if (p.x>pc.width) p.x=0;
            pctx.beginPath(); pctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            pctx.fillStyle=`rgba(230,240,255,${p.alpha})`; pctx.fill();
          });
        } else {
          particles.current.forEach(p => {
            p.phase+=p.speed; p.x+=p.vx; p.y+=p.vy;
            if (p.y<-4) p.y=pc.height+4;
            if (p.x<-4) p.x=pc.width+4; if (p.x>pc.width+4) p.x=-4;
            const a=p.alpha*(0.5+0.5*Math.sin(p.phase));
            pctx.beginPath(); pctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            pctx.fillStyle=`rgba(200,220,255,${a})`; pctx.fill();
          });
        }
      }
      const lc = lightRef.current;
      if (lc && doLight.current) {
        if (ts - lastLight.current > 2500+Math.random()*4000) {
          lastLight.current = ts;
          const lctx = lc.getContext("2d"); lctx.clearRect(0,0,lc.width,lc.height);
          const sx = lc.width*0.2+Math.random()*lc.width*0.6;
          drawBolt(lctx, sx, 0, Math.random()*40-20, lc.height*0.08, 6, 0.9);
          setTimeout(() => { if (lightRef.current) lightRef.current.getContext("2d").clearRect(0,0,lc.width,lc.height); }, 200);
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawBolt]);

  const clouds = useMemo(() => {
    const base = (t.clouds + Math.round(t.cloudOp * 100)) * 17;
    return Array.from({ length: t.clouds }, (_, index) => {
      const seed = (base + index * 13) % 1000;
      const rand = (n) => {
        const value = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
        return value - Math.floor(value);
      };
      return {
        w: 120 + rand(1) * 200,
        h: 40 + rand(2) * 60,
        top: 5 + rand(3) * 30,
        dur: 28 + rand(4) * 40,
        delay: -rand(5) * 40,
        op: t.cloudOp * (0.4 + rand(6) * 0.6),
      };
    });
  }, [t.clouds, t.cloudOp]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", background:t.bg, transition:"background 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ position:"absolute", inset:0, opacity:t.auroraOp, transition:"opacity 1s", pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:600, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(60,160,255,0.18),transparent 70%)", filter:"blur(80px)", top:-100, left:-100, animation:"wly-blobmove 9s ease-in-out infinite alternate" }} />
        <div style={{ position:"absolute", width:500, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(96,255,200,0.1),transparent 70%)", filter:"blur(80px)", top:"20%", right:-80, animation:"wly-blobmove 11s -3s ease-in-out infinite alternate" }} />
        <div style={{ position:"absolute", width:700, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(240,200,74,0.07),transparent 70%)", filter:"blur(80px)", bottom:"10%", left:"10%", animation:"wly-blobmove 13s -5s ease-in-out infinite alternate" }} />
      </div>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {clouds.map((cl, i) => (
          <div key={i} style={{ position:"absolute", borderRadius:50, width:cl.w, height:cl.h, top:`${cl.top}%`, left:-cl.w-20, background:`rgba(255,255,255,${cl.op})`, filter:"blur(12px)", animation:`wly-cloud ${cl.dur}s ${cl.delay}s linear infinite` }} />
        ))}
      </div>
      <canvas ref={starsRef}    style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:t.starsOp, transition:"opacity 1.2s" }} />
      <canvas ref={particleRef} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
      <canvas ref={lightRef}    style={{ position:"absolute", inset:0, pointerEvents:"none" }} />
    </div>
  );
}

function HumBar({ pct }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 300); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginTop:8, height:3, background:"rgba(255,255,255,0.1)", borderRadius:100, overflow:"hidden" }}>
      <div style={{ height:"100%", borderRadius:100, background:"linear-gradient(90deg,#60c8ff,#f0c84a)", width:`${width}%`, transition:"width 1s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  );
}

function Skeleton() {
  const card = { background:"rgba(255,255,255,0.05)", backdropFilter:"blur(28px)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:28, padding:"2rem", marginBottom:12 };
  const sk = (w, h, r=10) => <div className="wly-skel" style={{ width:w, height:h, borderRadius:r, marginBottom:10 }} />;
  return (
    <div>
      <div style={card}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2rem" }}>
          <div>{sk(220,50,10)}{sk(150,14,8)}</div>
          {sk(130,42,100)}
        </div>
        {sk(200,110,14)}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:"2rem" }}>
          {[0,1,2,3].map(i => <div key={i} className="wly-skel" style={{ height:88, borderRadius:18 }} />)}
        </div>
      </div>
      <div style={card}>
        {sk(110,13,6)}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:8 }}>
          {[0,1,2].map(i => <div key={i} className="wly-skel" style={{ height:140, borderRadius:20 }} />)}
        </div>
      </div>
    </div>
  );
}

function HeroCard({ w, days, unit }) {
  const convert = (c) => unit === "C" ? Math.round(c) : Math.round(toF(c));
  const uSym = unit === "C" ? "°C" : "°F";
  const tc = tempColor(w.temperature);
  const em = condEmoji(w.condition);
  const hum = w.humidity != null ? Math.round(w.humidity) : 0;
  const fl  = w.feelslike_c != null ? convert(w.feelslike_c) : null;
  let todayMin = "—", todayMax = "—";
  if (days.length > 0) { todayMin = convert(days[0].minTemp); todayMax = convert(days[0].maxTemp); }

  return (
    <div className="wly-rise" style={{ position:"relative", overflow:"hidden", background:"rgba(255,255,255,0.055)", backdropFilter:"blur(32px)", border:"0.5px solid rgba(255,255,255,0.12)", borderRadius:32, padding:"2.5rem", marginBottom:12, boxShadow:"0 20px 80px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.1)" }}>
      <div style={{ position:"absolute", inset:0, borderRadius:32, background:"radial-gradient(ellipse 80% 60% at 20% -10%,rgba(240,200,74,0.07) 0%,transparent 60%)", pointerEvents:"none" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, marginBottom:"2rem", flexWrap:"wrap" }}>
        <div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:700, letterSpacing:"-0.04em", lineHeight:1, marginBottom:8 }}>{w.city || "—"}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"rgba(240,246,255,0.55)" }}>
            <div style={{ width:6, height:6, background:"#f0c84a", borderRadius:"50%", animation:"wly-locblink 2s ease-in-out infinite" }} />
            <span>{[w.region, w.country].filter(Boolean).join(", ") || "Unknown location"}</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.14)", borderRadius:100, padding:"10px 20px", fontSize:14, color:"rgba(240,246,255,0.6)", flexShrink:0, marginTop:6 }}>
          <span style={{ fontSize:22, animation:"wly-cond 2s ease-in-out infinite" }}>{em}</span>
          <span>{w.condition || "—"}</span>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:24, marginBottom:"2rem", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"flex-start", lineHeight:1 }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontWeight:200, fontSize:"clamp(5rem,12vw,10rem)", letterSpacing:"-0.06em", lineHeight:0.85, color:tc, transition:"color 0.8s" }}>{convert(w.temperature)}</div>
          <div style={{ fontSize:"2.2rem", fontWeight:300, color:"rgba(240,246,255,0.5)", marginTop:14, marginLeft:4 }}>{uSym}</div>
        </div>
        <div style={{ paddingBottom:"1rem" }}>
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(240,246,255,0.3)", marginBottom:4 }}>Feels like</div>
          <div style={{ fontSize:"1.35rem", fontWeight:500, color:"rgba(240,246,255,0.55)" }}>{fl != null ? `${fl}${uSym}` : "—"}</div>
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.12em", color:"rgba(240,246,255,0.3)", marginBottom:5 }}>Today's range</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:600 }}>
              <span style={{ color:"#ff9060" }}>↑ {todayMax}°</span>
              <span style={{ color:"rgba(240,246,255,0.3)" }}>/</span>
              <span style={{ color:"#60c8ff" }}>↓ {todayMin}°</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
        {[
          { icon:"💧", label:"Humidity",   val:hum,                                                    unit:"%",     bar:hum },
          { icon:"🌡",  label:"Pressure",  val:w.pressure   != null ? Math.round(w.pressure)   : "—", unit:" mb"          },
          { icon:"💨", label:"Wind",       val:w.windSpeed  != null ? Math.round(w.windSpeed)  : "—", unit:" km/h"        },
          { icon:"👁",  label:"Visibility",val:w.visibility != null ? Math.round(w.visibility) : "—", unit:" km"          },
        ].map(({ icon, label, val, unit: su, bar }) => (
          <div key={label} className="wly-stat-pill" style={{ background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.09)", borderRadius:18, padding:"18px 16px", textAlign:"center", transition:"all 0.25s" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
            <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(240,246,255,0.3)", marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:"1.3rem", fontWeight:600, lineHeight:1 }}>
              {val}<span style={{ fontSize:11, fontWeight:400, color:"rgba(240,246,255,0.5)", marginLeft:2 }}>{su}</span>
            </div>
            {bar != null && <HumBar pct={bar} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ForecastCard({ days, unit }) {
  const convert = (c) => unit === "C" ? Math.round(c) : Math.round(toF(c));
  return (
    <div className="wly-rise2" style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(32px)", border:"0.5px solid rgba(255,255,255,0.09)", borderRadius:28, padding:"1.75rem", marginBottom:12, boxShadow:"0 12px 50px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.07)" }}>
      <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.15em", color:"rgba(240,246,255,0.3)", marginBottom:"1.2rem" }}>{days.length}-day forecast</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(108px,1fr))", gap:8 }}>
        {days.map((d, i) => {
          const { name, sub } = formatDay(d.date);
          const dc = tempColor(d.avgTemp);
          const dem = condEmoji(d.condition || "");
          return (
            <div key={d.date} className="wly-day-card" style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"18px 12px 16px", textAlign:"center", cursor:"default", transition:"all 0.25s", animation:`wly-rise 0.5s ${0.08+i*0.06}s cubic-bezier(0.16,1,0.3,1) both` }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(240,246,255,0.55)", fontWeight:600, marginBottom:2 }}>{name}</div>
              <div style={{ fontSize:11, color:"rgba(240,246,255,0.3)", marginBottom:14 }}>{sub}</div>
              <div className="wly-day-emoji" style={{ fontSize:26, display:"block", marginBottom:10, transition:"transform 0.3s" }}>{dem}</div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.85rem", fontWeight:700, letterSpacing:"-0.04em", lineHeight:1, marginBottom:8, color:dc, transition:"color 0.8s" }}>
                {convert(d.avgTemp)}<span style={{ fontSize:"0.95rem", fontWeight:300, color:"rgba(240,246,255,0.5)" }}>°</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, fontSize:12, fontWeight:500 }}>
                <span style={{ color:"#ff9060" }}>{convert(d.maxTemp)}°</span>
                <span style={{ color:"rgba(240,246,255,0.3)" }}>/</span>
                <span style={{ color:"#60c8ff" }}>{convert(d.minTemp)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Placeholder() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"6rem 2rem", textAlign:"center" }}>
      <div style={{ width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,rgba(240,200,74,0.25),rgba(240,200,74,0.04) 60%,transparent)", border:"0.5px solid rgba(240,200,74,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, marginBottom:"1.8rem", animation:"wly-float 4s ease-in-out infinite", boxShadow:"0 0 60px rgba(240,200,74,0.12)" }}>
        🌍
      </div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.9rem", fontStyle:"italic", fontWeight:300, marginBottom:10 }}>Search the world's weather</div>
      <p style={{ fontSize:14, color:"rgba(240,246,255,0.5)", lineHeight:1.7, maxWidth:340 }}>Enter any city name to get beautiful real-time weather with animated sky scenes</p>
    </div>
  );
}

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/weather`
  : "http://localhost:8080/weather";
  
export default function WeatherApp() {
  const [city, setCity]     = useState("");
  const [days, setDays]     = useState(3);
  const [unit, setUnit]     = useState("C");
  const [status, setStatus] = useState("idle");
  const [data, setData]     = useState(null);
  const [error, setError]   = useState("");
  const [theme, setTheme]   = useState("clear");

  const selectedDays = Math.min(7, Math.max(1, Number(days) || 3));

  const normalizeForecast = (items) => {
    if (!Array.isArray(items)) return [];
    return items.slice(0, selectedDays);
  };

  const w    = data?.weatherResponse || data;
  const fcst = normalizeForecast(data?.dayTemp);

  const doSearch = async () => {
    if (!city.trim()) { setError("Please enter a city name."); return; }
    setError(""); setStatus("loading"); setData(null);
    try {
      const res = await fetch(`${BASE}/forecast/${encodeURIComponent(city.trim())}?days=${selectedDays}`);
      if (!res.ok) {
        let msg = `Server returned ${res.status}`;
        const j = await res.json().catch(() => null);
        msg = j?.message || msg;
        throw new Error(msg);
      }
      const json = await res.json();
      const wr = json.weatherResponse || json;
      setTheme(getSkyTheme(wr.condition, wr.temperature));
      setData(json); setStatus("success");
    } catch (err) {
      const isNet = err.message.includes("fetch") || err.message.includes("network") || err.message.includes("Failed");
      setError(isNet
        ? "Cannot reach localhost:8080. Make sure your Spring Boot app is running."
        : err.message
      );
      setStatus("error");
    }
  };

  const onKey = (e) => { if (e.key === "Enter") doSearch(); };

  return (
    <>
      <AnimatedScene theme={theme} />
      <div style={{ position:"relative", zIndex:10, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", padding:"0 1.5rem 5rem", fontFamily:"'DM Sans',sans-serif", color:"#f0f6ff" }}>

        {/* Header */}
        <div style={{ width:"100%", maxWidth:900, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"2rem 0 1.8rem", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#f0c84a,#e87c3e)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, animation:"wly-pulse-logo 3s ease-in-out infinite" }}>☀️</div>
            <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.65rem", fontStyle:"italic", fontWeight:300, letterSpacing:"-0.02em" }}>
              Wea<span style={{ color:"#f0c84a" }}>ther</span>ly
            </div>
          </div>
          {/* Unit Toggle */}
          <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.16)", borderRadius:100, padding:4 }}>
            {["C","F"].map(u => (
              <button key={u} onClick={() => setUnit(u)} style={{ padding:"6px 16px", borderRadius:100, border:"none", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.25s", color:unit===u?"#f0f6ff":"rgba(240,246,255,0.5)", background:unit===u?"rgba(255,255,255,0.15)":"transparent", boxShadow:unit===u?"0 2px 8px rgba(0,0,0,0.2)":"none" }}>°{u}</button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ width:"100%", maxWidth:700, marginBottom:"2rem" }}>
          <div className="wly-search-box" style={{ display:"flex", gap:10, alignItems:"center", background:"rgba(255,255,255,0.07)", backdropFilter:"blur(24px)", border:"0.5px solid rgba(255,255,255,0.16)", borderRadius:20, padding:"8px 8px 8px 24px", boxShadow:"0 8px 40px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize:18, opacity:0.4, flexShrink:0 }}>🔍</span>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={onKey}
              placeholder="Search for a city — London, Mumbai, Tokyo…"
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#f0f6ff", fontFamily:"'DM Sans',sans-serif", fontSize:16, minWidth:0 }}
            />
            {/* Custom dropdown replaces native <select> */}
            <CustomSelect value={days} onChange={setDays} />
            <button
              onClick={doSearch}
              style={{ height:46, padding:"0 24px", background:"linear-gradient(135deg,#f0c84a,#e87c3e)", border:"none", borderRadius:14, color:"#0a0c1a", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, boxShadow:"0 4px 16px rgba(240,200,74,0.3)" }}
            >
              Search →
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ width:"100%", maxWidth:700, marginBottom:16, display:"flex", alignItems:"center", gap:10, background:"rgba(255,107,107,0.1)", border:"0.5px solid rgba(255,107,107,0.35)", borderRadius:14, padding:"13px 18px", fontSize:14, color:"#ff9f9f" }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Content */}
        <div style={{ width:"100%", maxWidth:900 }}>
          {status === "idle"    && <Placeholder />}
          {status === "loading" && <Skeleton />}
          {status === "success" && w && (
            <>
              <HeroCard w={w} days={fcst} unit={unit} />
              {fcst.length > 0 && <ForecastCard days={fcst} unit={unit} />}
            </>
          )}
        </div>

      </div>
    </>
  );
}