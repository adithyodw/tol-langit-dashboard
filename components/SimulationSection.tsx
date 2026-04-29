'use client';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const C = {
  navy:'#001233', navyMid:'#001d4a', gold:'#b89a3e', goldBright:'#d4b254',
  white:'#ffffff', offWhite:'#f7f6f2', rule:'#ddd8cc', ruleDark:'#2a3f6a',
  body:'#2c2c2c', muted:'#6b7280', label:'#8a8a8a',
  positive:'#0a5c42', negative:'#991b1b',
};
const SERIF = "'Playfair Display', Georgia, serif";
const MONO  = "'IBM Plex Mono', 'Courier New', monospace";
const SANS  = "'IBM Plex Sans', system-ui, sans-serif";

/* ─── Simulation data (Jan 2021 = $10,000 base) ─────────────────────────── */
// TLV10: actual verified annual returns (MQL5 live account)
// Benchmarks: approximate spot-price returns from Jan 2021 base
const BASE_DATA = [
  { date: 'Jan 2021', tlv10:10000, btc:10000, gold:10000, silver:10000, nvda:10000, tsla:10000, ndx:10000, spx:10000 },
  { date: 'Dec 2021', tlv10:21041, btc:16081, gold:9642,  silver:8590,  nvda:22460, tsla:14367, ndx:12121, spx:12713 },
  { date: 'Dec 2022', tlv10:34300, btc:5665,  gold:9621,  silver:9023,  nvda:11165, tsla:5020,  ndx:8286,  spx:10240 },
  { date: 'Dec 2023', tlv10:47731, btc:14437, gold:10869, silver:8962,  nvda:37848, tsla:10122, ndx:12750, spx:12720 },
  { date: 'Dec 2024', tlv10:75297, btc:33177, gold:13833, silver:10902, nvda:102636,tsla:16449, ndx:16364, spx:15683 },
  { date: 'Apr 2026', tlv10:154747,btc:28673, gold:16865, silver:12218, nvda:82013, tsla:11020, ndx:14545, spx:14400 },
];

const ASSETS = [
  { key:'tlv10', label:'TLV10 (Low Risk)', short:'TLV10', color:'#d4b254', width:3 },
  { key:'btc',   label:'Bitcoin (BTC)',    short:'BTC',   color:'#f7931a', width:1.5 },
  { key:'gold',  label:'Gold (XAU)',       short:'Gold',  color:'#FFD700', width:1.5 },
  { key:'silver',label:'Silver (XAG)',     short:'Silver',color:'#b0c4d8', width:1.5 },
  { key:'nvda',  label:'NVIDIA (NVDA)',    short:'NVDA',  color:'#76b900', width:1.5 },
  { key:'tsla',  label:'Tesla (TSLA)',     short:'Tesla', color:'#e31937', width:1.5 },
  { key:'ndx',   label:'Nasdaq 100',       short:'NDX',   color:'#60a5fa', width:1.5 },
  { key:'spx',   label:'S&P 500',          short:'SPX',   color:'#a78bfa', width:1.5 },
];

const AMOUNTS = [1000,5000,10000,25000,50000,100000];
const DEFAULT_ACTIVE = new Set(['tlv10','btc','gold','spx']);

function fmtUSD(n:number):string {
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n/1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtPct(start:number, end:number):string {
  const p = ((end - start) / start) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
}
function scale(v:number, mult:number):number { return Math.round(v * mult); }

interface TooltipProps { active?:boolean; payload?:{dataKey:string;value:number;color:string}[]; label?:string; }

export default function SimulationSection() {
  const [amount, setAmount]   = useState(10000);
  const [active, setActive]   = useState<Set<string>>(DEFAULT_ACTIVE);
  const [showAll, setShowAll] = useState(false);

  const mult = amount / 10000;
  const data = BASE_DATA.map(row => {
    const out: Record<string, number|string> = { date: row.date };
    ASSETS.forEach(a => {
      if (active.has(a.key)) out[a.key] = scale(row[a.key as keyof typeof row] as number, mult);
    });
    return out;
  });

  const last = BASE_DATA[BASE_DATA.length - 1];

  const toggle = (key:string) => setActive(prev => {
    const next = new Set(prev);
    if (next.has(key) && next.size > 1) next.delete(key);
    else next.add(key);
    return next;
  });

  const CustomTooltip = ({ active: on, payload, label }:TooltipProps) => {
    if (!on || !payload?.length) return null;
    const sorted = [...payload].sort((a,b) => b.value - a.value);
    return (
      <div style={{background:C.navy,border:`1px solid ${C.gold}`,padding:'12px 16px',fontFamily:MONO,minWidth:190,maxWidth:220,zIndex:9999}}>
        <div style={{fontSize:10,color:C.gold,letterSpacing:1,marginBottom:10,textTransform:'uppercase'}}>{label}</div>
        {sorted.map(p => (
          <div key={p.dataKey} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:p.color,flexShrink:0}}/>
            <span style={{fontSize:10,color:'rgba(255,255,255,.55)',flex:1,textTransform:'uppercase',letterSpacing:.3}}>
              {ASSETS.find(a=>a.key===p.dataKey)?.short}
            </span>
            <span style={{fontSize:12,fontWeight:700,color:C.white}}>
              {fmtUSD(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const visibleAssets = showAll ? ASSETS : ASSETS.slice(0, 5);

  return (
    <section className="sp sim-section" id="simulation" style={{padding:'72px 40px',background:C.navyMid}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>

        {/* ── Header ── */}
        <div className="sh-flex" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:32,paddingBottom:20,borderBottom:`1px solid ${C.ruleDark}`}}>
          <div>
            <div style={{fontSize:10,letterSpacing:3,textTransform:'uppercase',color:C.gold,marginBottom:8,fontWeight:500,fontFamily:MONO}}>Investment Simulation</div>
            <div style={{fontFamily:SERIF,fontSize:'clamp(22px,3vw,30px)',fontWeight:500,color:C.white,lineHeight:1.15}}>What If You Had Invested?</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.35)',marginTop:6,lineHeight:1.5}}>Hypothetical $10,000 invested at V10 inception (Jan 2021) — compared across major global assets.</div>
          </div>
          <div className="sh-note" style={{fontSize:11.5,color:'rgba(255,255,255,.3)',textAlign:'right',maxWidth:280,lineHeight:1.6}}>
            TLV10 returns from verified MQL5 live account. Benchmark returns are approximate spot-price comparisons.
          </div>
        </div>

        {/* ── Amount selector ── */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:9.5,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,.35)',marginBottom:10,fontFamily:MONO}}>Initial Investment</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {AMOUNTS.map(a => (
              <button key={a} onClick={()=>setAmount(a)} style={{
                padding:'8px 14px',background:amount===a?C.gold:'transparent',
                color:amount===a?C.navy:'rgba(255,255,255,.5)',
                border:`1px solid ${amount===a?C.gold:'rgba(255,255,255,.18)'}`,
                fontFamily:MONO,fontSize:11,fontWeight:700,cursor:'pointer',
                letterSpacing:.5,transition:'all .15s',borderRadius:0,minHeight:40,
              }}>${a.toLocaleString()}</button>
            ))}
          </div>
        </div>

        {/* ── Asset toggles ── */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10,flexWrap:'wrap'}}>
            <div style={{fontSize:9.5,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,.35)',fontFamily:MONO}}>Compare With</div>
            <button onClick={()=>setShowAll(v=>!v)} style={{fontSize:10,color:C.gold,background:'transparent',border:'none',cursor:'pointer',fontFamily:MONO,letterSpacing:.5,padding:'2px 6px'}}>
              {showAll?'SHOW LESS ↑':'+ MORE ASSETS ↓'}
            </button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {visibleAssets.map(a => {
              const on = active.has(a.key);
              return (
                <button key={a.key} onClick={()=>toggle(a.key)} style={{
                  padding:'7px 12px',background:on?a.color+'22':'transparent',
                  color:on?a.color:'rgba(255,255,255,.3)',
                  border:`1px solid ${on?a.color:'rgba(255,255,255,.1)'}`,
                  fontFamily:MONO,fontSize:10,cursor:'pointer',
                  transition:'all .15s',borderRadius:0,
                  display:'flex',alignItems:'center',gap:6,minHeight:36,
                }}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:on?a.color:'rgba(255,255,255,.2)',display:'inline-block',flexShrink:0}}/>
                  {a.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chart ── */}
        <div style={{background:'rgba(0,0,0,.25)',border:`1px solid ${C.ruleDark}`,padding:'20px 4px 12px',marginBottom:20}}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{top:4,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
              <XAxis dataKey="date"
                tick={{fill:'rgba(255,255,255,.3)',fontSize:10,fontFamily:MONO}}
                axisLine={{stroke:'rgba(255,255,255,.08)'}}
                tickLine={false}/>
              <YAxis
                tickFormatter={fmtUSD}
                tick={{fill:'rgba(255,255,255,.3)',fontSize:10,fontFamily:MONO}}
                axisLine={false} tickLine={false} width={68}/>
              <Tooltip content={<CustomTooltip/>} cursor={{stroke:'rgba(255,255,255,.1)',strokeWidth:1}}/>
              <ReferenceLine y={amount} stroke="rgba(255,255,255,.08)" strokeDasharray="4 4"/>
              {ASSETS.filter(a=>active.has(a.key)).map(a=>(
                <Line key={a.key} type="monotone" dataKey={a.key} stroke={a.color}
                  strokeWidth={a.width}
                  dot={{r:3,fill:a.color,strokeWidth:0,fillOpacity:.9}}
                  activeDot={{r:5,fill:a.color,strokeWidth:0}}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Result cards ── */}
        <div className="sim-grid">
          {ASSETS.filter(a=>active.has(a.key)).map(a => {
            const endVal  = scale(last[a.key as keyof typeof last] as number, mult);
            const isPos   = endVal >= amount;
            const isTl    = a.key === 'tlv10';
            const pct     = fmtPct(amount, endVal);
            return (
              <div key={a.key} style={{
                background:isTl?'rgba(212,178,84,.08)':C.navy,
                padding:'14px 16px',
                borderTop:`2px solid ${a.color}`,
                border:`1px solid ${isTl?C.gold:C.ruleDark}`,
                borderTopWidth:2,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:a.color,flexShrink:0}}/>
                  <span style={{fontFamily:MONO,fontSize:9,color:'rgba(255,255,255,.4)',letterSpacing:.5,textTransform:'uppercase',lineHeight:1.2}}>{a.label}</span>
                </div>
                <div style={{fontFamily:MONO,fontSize:'clamp(16px,2.5vw,22px)',fontWeight:700,color:isTl?C.goldBright:C.white,lineHeight:1,marginBottom:5}}>
                  {fmtUSD(endVal)}
                </div>
                <div style={{fontFamily:MONO,fontSize:13,fontWeight:700,color:isPos?'#34d399':'#f87171',marginBottom:3}}>{pct}</div>
                <div style={{fontSize:9.5,color:'rgba(255,255,255,.2)',fontFamily:MONO}}>Jan 2021 → Apr 2026</div>
              </div>
            );
          })}
        </div>

        {/* ── Source notes ── */}
        <div style={{marginTop:16,padding:'12px 16px',border:`1px solid rgba(184,154,62,.14)`,background:'rgba(184,154,62,.03)',display:'flex',alignItems:'flex-start',gap:10}}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p style={{fontSize:10.5,color:'rgba(255,255,255,.28)',lineHeight:1.75,fontFamily:SANS}}>
            <strong style={{color:'rgba(255,255,255,.45)'}}>SIMULATION DISCLAIMER —</strong> TLV10 figures are derived from verified MQL5 live account annual returns (+110.41% 2021, +63.02% 2022, +39.16% 2023, +57.74% 2024) and current total return (+1,447.47%). Benchmark values are approximate spot-price comparisons sourced from public market data (BTC/USD, XAU/USD, XAG/USD, NVDA, TSLA, NDX, SPX) and do not account for dividends, fees, slippage, or taxes. This simulation is hypothetical and illustrative only — it does not constitute investment advice or a guarantee of future performance.
          </p>
        </div>

      </div>
    </section>
  );
}
