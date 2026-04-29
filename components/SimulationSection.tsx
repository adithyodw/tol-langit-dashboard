'use client';
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = { navy:'#001233',navyMid:'#001d4a',gold:'#b89a3e',goldBright:'#d4b254',white:'#ffffff',offWhite:'#f7f6f2',rule:'#ddd8cc',ruleDark:'#2a3f6a' };
const SERIF = "'Playfair Display', Georgia, serif";
const MONO  = "'IBM Plex Mono', 'Courier New', monospace";
const SANS  = "'IBM Plex Sans', system-ui, sans-serif";

/* ─── Month index helpers (0 = Jan 2021, 63 = Apr 2026) ─────────────────── */
const TOTAL_MONTHS = 64; // Jan 2021 – Apr 2026
function monthIndex(year: number, month: number): number { // month: 0-based
  return (year - 2021) * 12 + month;
}
function monthLabel(idx: number): string {
  const y = 2021 + Math.floor(idx / 12);
  const m = idx % 12;
  return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
const ALL_MONTHS = Array.from({ length: TOTAL_MONTHS }, (_, i) => monthLabel(i));

/* ─── Series builder ─────────────────────────────────────────────────────── */
// Build array of 64 nullable values. null = before inception.
// values[i] = portfolio value ($10,000 base) at month i.
function buildSeries(startIdx: number, monthlyRates: number[]): (number | null)[] {
  const out: (number | null)[] = new Array(TOTAL_MONTHS).fill(null);
  let v = 10000;
  for (let i = 0; i < monthlyRates.length && startIdx + i < TOTAL_MONTHS; i++) {
    out[startIdx + i] = Math.round(v);
    v *= monthlyRates[i];
  }
  return out;
}

// Annual factor -> monthly rate helper
function mRate(annualFactor: number): number { return Math.pow(annualFactor, 1 / 12); }

/* ─── Pre-computed monthly series ($10,000 base at each asset's inception) ─ */
const SERIES: Record<string, (number | null)[]> = (() => {
  // V10: Jan 2021 – Apr 2026 (64 months)
  // Exact annual returns: 2021=+110.41%, 2022=+63.02%, 2023=+39.16%, 2024=+57.74%
  // 2025-Apr2026 (16m): derived from total +1,447.47% → value 154,747 at Apr 2026
  const v10Rates: number[] = [
    ...Array(12).fill(mRate(2.1041)),  // 2021
    ...Array(12).fill(mRate(1.6302)),  // 2022
    ...Array(12).fill(mRate(1.3916)),  // 2023
    ...Array(12).fill(mRate(1.5774)),  // 2024
    ...Array(16).fill(mRate(Math.pow(154747 / 75297, 12 / 16))), // 2025-Apr26
  ];
  const tlv10 = buildSeries(0, v10Rates);

  // V10HR: Mar 2025 – Apr 2026 (14 data points, 13 intervals)
  // Verified total return: +957.48% → growth factor 10.5748
  const v10hrRate = mRate(Math.pow(10.5748, 12 / 13));
  const v10hr = buildSeries(monthIndex(2025, 2), Array(14).fill(v10hrRate));

  // ETF: Jan 2026 – Apr 2026 (4 data points, 3 intervals)
  // Abs gain: +39.66% → growth factor 1.3966
  const etfRate = mRate(Math.pow(1.3966, 12 / 3));
  const etf = buildSeries(monthIndex(2026, 0), Array(4).fill(etfRate));

  // ETF Gold MR: Feb 2026 – Apr 2026 (3 data points, 2 intervals)
  // Total return: +100.77% → growth factor 2.0077
  const etfgRate = mRate(Math.pow(2.0077, 12 / 2));
  const etfgold = buildSeries(monthIndex(2026, 1), Array(3).fill(etfgRate));

  // Benchmarks: Jan 2021 – Apr 2026 (annual factors per year, then derived 16-month tail)
  function bench(af: Record<number, number>, tail: number): (number | null)[] {
    const rates: number[] = [
      ...Array(12).fill(mRate(af[2021])),
      ...Array(12).fill(mRate(af[2022])),
      ...Array(12).fill(mRate(af[2023])),
      ...Array(12).fill(mRate(af[2024])),
      ...Array(16).fill(mRate(Math.pow(tail, 12 / 16))),
    ];
    return buildSeries(0, rates);
  }
  // Sources: spot prices Jan 2021 / Dec each year / Apr 2026 (approximate)
  const btc   = bench({ 2021:1.608, 2022:0.352, 2023:2.548, 2024:2.298 }, 0.864);
  const gold  = bench({ 2021:0.964, 2022:0.998, 2023:1.130, 2024:1.272 }, 1.219);
  const silver= bench({ 2021:0.859, 2022:1.051, 2023:0.993, 2024:1.216 }, 1.121);
  const nvda  = bench({ 2021:2.246, 2022:0.497, 2023:3.390, 2024:2.712 }, 0.799);
  const tsla  = bench({ 2021:1.437, 2022:0.349, 2023:2.016, 2024:1.625 }, 0.670);
  const ndx   = bench({ 2021:1.212, 2022:0.684, 2023:1.538, 2024:1.284 }, 0.889);
  const spx   = bench({ 2021:1.271, 2022:0.806, 2023:1.242, 2024:1.233 }, 0.918);

  return { tlv10, v10hr, etf, etfgold, btc, gold, silver, nvda, tsla, ndx, spx };
})();

/* ─── Asset metadata ────────────────────────────────────────────────────── */
const TL_ASSETS = [
  { key:'tlv10',   label:'TLV10 · Low Risk',    short:'TLV10',    color:'#d4b254', group:'tl', startIdx: 0,  note:'Inception Jan 2021 · +1,447% verified' },
  { key:'v10hr',   label:'V10 HR · High Risk',  short:'V10 HR',   color:'#f87171', group:'tl', startIdx: 50, note:'Inception Mar 2025 · +958% verified' },
  { key:'etf',     label:'ETF · High Risk',      short:'TLETF',    color:'#60a5fa', group:'tl', startIdx: 60, note:'Inception Jan 2026 · +39.66% abs gain' },
  { key:'etfgold', label:'ETF Gold MR · Med',   short:'ETF Gold', color:'#34d399', group:'tl', startIdx: 61, note:'Inception Feb 2026 · +100.77% verified' },
];
const BENCH_ASSETS = [
  { key:'btc',    label:'Bitcoin (BTC)',  short:'BTC',   color:'#f7931a', group:'bench', startIdx:0, note:'Spot BTC/USD price return' },
  { key:'gold',   label:'Gold (XAU)',     short:'Gold',  color:'#FFD700', group:'bench', startIdx:0, note:'Spot XAU/USD price return' },
  { key:'silver', label:'Silver (XAG)',   short:'Silver',color:'#b0c4d8', group:'bench', startIdx:0, note:'Spot XAG/USD price return' },
  { key:'nvda',   label:'NVIDIA (NVDA)', short:'NVDA',  color:'#76b900', group:'bench', startIdx:0, note:'NVDA split-adjusted price return' },
  { key:'tsla',   label:'Tesla (TSLA)',  short:'Tesla', color:'#e31937', group:'bench', startIdx:0, note:'TSLA split-adjusted price return' },
  { key:'ndx',    label:'Nasdaq 100',    short:'NDX',   color:'#818cf8', group:'bench', startIdx:0, note:'NDX price return (no dividends)' },
  { key:'spx',    label:'S&P 500',       short:'SPX',   color:'#a78bfa', group:'bench', startIdx:0, note:'SPX price return (no dividends)' },
];
const ALL_ASSETS = [...TL_ASSETS, ...BENCH_ASSETS];

const AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

/* ─── Presets ────────────────────────────────────────────────────────────── */
const PRESETS: { label: string; start: number; end: number }[] = [
  { label: '2M',  start: 61, end: 63 }, // Feb–Apr 2026 (ETF Gold MR full track)
  { label: '4M',  start: 60, end: 63 }, // Jan–Apr 2026 (ETF full track)
  { label: '13M', start: 50, end: 63 }, // Mar 2025–Apr 2026 (V10HR full track)
  { label: '1Y',  start: 51, end: 63 }, // Apr 2025–Apr 2026
  { label: '2Y',  start: 39, end: 63 }, // Apr 2024–Apr 2026
  { label: 'MAX', start: 0,  end: 63 }, // Jan 2021–Apr 2026
];
const DEFAULT_PRESET = 5; // MAX

/* ─── Formatting helpers ────────────────────────────────────────────────── */
function fmtUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtPct(from: number, to: number): string {
  const p = ((to - from) / from) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
}

/* ─── Custom tooltip ─────────────────────────────────────────────────────── */
interface TTP { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string; }
function SimTooltip({ active, payload, label }: TTP) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div style={{ background: C.navy, border: `1px solid ${C.gold}`, padding: '10px 14px', fontFamily: MONO, minWidth: 175, maxWidth: 220, boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
      <div style={{ fontSize: 9.5, color: C.gold, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
      {sorted.map(p => {
        const asset = ALL_ASSETS.find(a => a.key === p.dataKey);
        return (
          <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,.5)', flex: 1, letterSpacing: .2, textTransform: 'uppercase' }}>{asset?.short}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: C.white }}>{fmtUSD(p.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function SimulationSection() {
  const [amount,       setAmount]      = useState(10000);
  const [active,       setActive]      = useState<Set<string>>(new Set(['tlv10', 'btc', 'gold', 'spx']));
  const [presetIdx,    setPresetIdx]   = useState(DEFAULT_PRESET);
  const [customStart,  setCustomStart] = useState<number | null>(null);
  const [customEnd,    setCustomEnd]   = useState<number | null>(null);

  const preset   = PRESETS[presetIdx];
  const startIdx = customStart ?? preset.start;
  const endIdx   = customEnd   ?? preset.end;

  /* Build chart data for selected range */
  const chartData = useMemo(() => {
    const rows = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const row: Record<string, number | string> = { date: ALL_MONTHS[i] };
      let hasValue = false;
      for (const key of active) {
        const raw = SERIES[key]?.[i];
        if (raw !== null && raw !== undefined) {
          // Normalize: value relative to what it was at user's start date
          const baseRaw = SERIES[key]?.slice(startIdx, endIdx + 1).find(v => v !== null);
          if (baseRaw) {
            row[key] = Math.round((raw / baseRaw) * amount);
            hasValue = true;
          }
        }
      }
      if (hasValue || rows.length === 0) rows.push(row);
    }
    return rows;
  }, [startIdx, endIdx, active, amount]);

  /* Result summary per asset */
  const results = useMemo(() => {
    return ALL_ASSETS.filter(a => active.has(a.key)).map(a => {
      const series = SERIES[a.key];
      // Find first non-null value in range
      let baseVal: number | null = null, baseIdx = -1;
      for (let i = startIdx; i <= endIdx; i++) {
        if (series[i] !== null) { baseVal = series[i]; baseIdx = i; break; }
      }
      // Find last non-null value in range
      let endVal: number | null = null, lastIdx = -1;
      for (let i = endIdx; i >= startIdx; i--) {
        if (series[i] !== null) { endVal = series[i]; lastIdx = i; break; }
      }
      if (!baseVal || !endVal) return null;
      const finalAmt = Math.round((endVal / baseVal) * amount);
      const profit   = finalAmt - amount;
      return { ...a, finalAmt, profit, pct: fmtPct(amount, finalAmt), isPos: finalAmt >= amount, actualStart: ALL_MONTHS[baseIdx], actualEnd: ALL_MONTHS[lastIdx] };
    }).filter(Boolean) as ({ key:string;label:string;short:string;color:string;note:string;group:string;finalAmt:number;profit:number;pct:string;isPos:boolean;actualStart:string;actualEnd:string })[];
  }, [startIdx, endIdx, active, amount]);

  const toggle = (key: string) => setActive(prev => {
    const next = new Set(prev);
    if (next.has(key) && next.size > 1) next.delete(key);
    else next.add(key);
    return next;
  });
  const clearCustom = () => { setCustomStart(null); setCustomEnd(null); };

  return (
    <section className="sp" id="simulation" style={{ padding: '72px 40px', background: C.navy, fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div className="sh-flex" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 20, borderBottom: `1px solid ${C.ruleDark}` }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: C.gold, marginBottom: 8, fontWeight: 500, fontFamily: MONO }}>Investment Simulation</div>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 500, color: C.white, lineHeight: 1.15, margin: 0 }}>What If You Had Invested?</h2>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.35)', marginTop: 6, lineHeight: 1.5 }}>Select any TOL LANGIT strategy or global benchmark — choose your amount and date range — and see verified returns.</p>
          </div>
          <div className="sh-note" style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', textAlign: 'right', maxWidth: 260, lineHeight: 1.65 }}>
            TLV10 returns are from verified MQL5 live account data. Benchmarks are approximate spot-price comparisons. Not investment advice.
          </div>
        </div>

        {/* ── Controls row ── */}
        <div className="sim-controls">

          {/* Amount */}
          <div className="sim-control-block">
            <div className="sim-label">Initial Investment</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(a)} style={{
                  padding: '8px 12px', background: amount === a ? C.gold : 'transparent',
                  color: amount === a ? C.navy : 'rgba(255,255,255,.45)',
                  border: `1px solid ${amount === a ? C.gold : 'rgba(255,255,255,.15)'}`,
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, cursor: 'pointer', borderRadius: 0, minHeight: 38, transition: 'all .15s',
                }}>${a.toLocaleString()}</button>
              ))}
            </div>
          </div>

          {/* Date range presets */}
          <div className="sim-control-block">
            <div className="sim-label">Period</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PRESETS.map((p, i) => (
                <button key={p.label} onClick={() => { setPresetIdx(i); clearCustom(); }} style={{
                  padding: '8px 12px', fontFamily: MONO, fontSize: 11, cursor: 'pointer', borderRadius: 0, minHeight: 38,
                  background: presetIdx === i && !customStart ? C.gold : 'transparent',
                  color: presetIdx === i && !customStart ? C.navy : 'rgba(255,255,255,.45)',
                  border: `1px solid ${presetIdx === i && !customStart ? C.gold : 'rgba(255,255,255,.15)'}`,
                  transition: 'all .15s',
                }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Custom date range */}
          <div className="sim-control-block">
            <div className="sim-label">Custom Range</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={customStart ?? startIdx} onChange={e => { setCustomStart(+e.target.value); setPresetIdx(-1 as never); }} style={selectStyle}>
                {ALL_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: MONO }}>→</span>
              <select value={customEnd ?? endIdx} onChange={e => { setCustomEnd(+e.target.value); setPresetIdx(-1 as never); }} style={selectStyle}>
                {ALL_MONTHS.map((m, i) => <option key={i} value={i} disabled={i < (customStart ?? startIdx)}>{m}</option>)}
              </select>
              {(customStart !== null || customEnd !== null) && (
                <button onClick={clearCustom} style={{ padding: '6px 10px', background: 'transparent', border: `1px solid rgba(255,255,255,.15)`, color: 'rgba(255,255,255,.4)', fontFamily: MONO, fontSize: 10, cursor: 'pointer', borderRadius: 0 }}>✕ RESET</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Asset groups ── */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>

          {/* TOL LANGIT strategies */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: C.gold, marginBottom: 8, fontFamily: MONO }}>TOL LANGIT Strategies</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {TL_ASSETS.map(a => {
                const on = active.has(a.key);
                return (
                  <button key={a.key} onClick={() => toggle(a.key)} title={a.note} style={{
                    padding: '6px 11px', background: on ? a.color + '22' : 'transparent',
                    color: on ? a.color : 'rgba(255,255,255,.3)',
                    border: `1px solid ${on ? a.color : 'rgba(255,255,255,.1)'}`,
                    fontFamily: MONO, fontSize: 10, cursor: 'pointer', borderRadius: 0, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 5, minHeight: 34,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: on ? a.color : 'rgba(255,255,255,.15)', flexShrink: 0 }} />
                    {a.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Benchmarks */}
          <div style={{ flex: 2, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 8, fontFamily: MONO }}>Global Benchmarks</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {BENCH_ASSETS.map(a => {
                const on = active.has(a.key);
                return (
                  <button key={a.key} onClick={() => toggle(a.key)} title={a.note} style={{
                    padding: '6px 11px', background: on ? a.color + '22' : 'transparent',
                    color: on ? a.color : 'rgba(255,255,255,.3)',
                    border: `1px solid ${on ? a.color : 'rgba(255,255,255,.1)'}`,
                    fontFamily: MONO, fontSize: 10, cursor: 'pointer', borderRadius: 0, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 5, minHeight: 34,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: on ? a.color : 'rgba(255,255,255,.15)', flexShrink: 0 }} />
                    {a.short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Chart ── */}
        <div style={{ background: 'rgba(0,0,0,.3)', border: `1px solid ${C.ruleDark}`, padding: '20px 4px 8px', marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="date"
                tick={{ fill: 'rgba(255,255,255,.28)', fontSize: 9.5, fontFamily: MONO }}
                axisLine={{ stroke: 'rgba(255,255,255,.08)' }} tickLine={false}
                interval="preserveStartEnd" />
              <YAxis tickFormatter={fmtUSD}
                tick={{ fill: 'rgba(255,255,255,.28)', fontSize: 9.5, fontFamily: MONO }}
                axisLine={false} tickLine={false} width={64} />
              <Tooltip content={<SimTooltip />} cursor={{ stroke: 'rgba(255,255,255,.08)', strokeWidth: 1 }} />
              <ReferenceLine y={amount} stroke="rgba(255,255,255,.07)" strokeDasharray="4 4" />
              {ALL_ASSETS.filter(a => active.has(a.key)).map(a => (
                <Line key={a.key} type="monotone" dataKey={a.key}
                  stroke={a.color}
                  strokeWidth={a.group === 'tl' ? 2.5 : 1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: a.color, strokeWidth: 0 }}
                  connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', fontFamily: MONO, marginBottom: 20, paddingLeft: 4 }}>
          {ALL_MONTHS[startIdx]} → {ALL_MONTHS[endIdx]} · Hypothetical ${amount.toLocaleString()} invested at period start, normalized per asset
        </div>

        {/* ── Result cards ── */}
        <div className="sim-grid">
          {results.map(r => (
            <div key={r.key} style={{
              background: r.group === 'tl' ? 'rgba(212,178,84,.06)' : 'rgba(255,255,255,.03)',
              padding: '14px 14px', border: `1px solid ${r.group === 'tl' ? C.ruleDark : 'rgba(255,255,255,.07)'}`,
              borderTop: `2px solid ${r.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: .3, textTransform: 'uppercase' }}>{r.label}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 700, color: r.group === 'tl' ? C.goldBright : C.white, lineHeight: 1, marginBottom: 4 }}>
                {fmtUSD(r.finalAmt)}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: r.isPos ? '#34d399' : '#f87171', marginBottom: 3 }}>
                {r.pct}
                <span style={{ fontWeight: 400, fontSize: 10, color: 'rgba(255,255,255,.3)', marginLeft: 5 }}>
                  {r.isPos ? '+' : ''}{fmtUSD(Math.abs(r.profit))}
                </span>
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: MONO, lineHeight: 1.4 }}>
                {r.actualStart} → {r.actualEnd}
              </div>
            </div>
          ))}
        </div>

        {/* ── Disclaimer ── */}
        <div style={{ marginTop: 16, padding: '12px 16px', border: `1px solid rgba(184,154,62,.12)`, background: 'rgba(184,154,62,.03)' }}>
          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.25)', lineHeight: 1.75, fontFamily: SANS, margin: 0 }}>
            <strong style={{ color: 'rgba(255,255,255,.4)' }}>DATA SOURCES & DISCLAIMER —</strong>{' '}
            TLV10 uses verified MQL5 annual returns (+110.41% / +63.02% / +39.16% / +57.74% for 2021–2024) compounded monthly; 2025–2026 derived from verified total return +1,447.47%.
            V10 HR: verified total return +957.48% over 13 months (Mar 2025–Apr 2026).
            ETF: verified absolute gain +39.66% over 4 months (Jan–Apr 2026).
            ETF Gold MR: verified total return +100.77% over ~10 weeks (Feb–Apr 2026).
            All TL data sourced from live MQL5 & MyFXBook verified accounts.
            Benchmark figures are approximate spot-price returns and exclude dividends, fees, and taxes.
            This simulation is hypothetical and illustrative only. Past performance does not guarantee future results. Not investment advice.
          </p>
        </div>

      </div>
    </section>
  );
}

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)',
  border: '1px solid rgba(255,255,255,.15)', padding: '8px 10px',
  fontFamily: MONO, fontSize: 11, borderRadius: 0, cursor: 'pointer',
  minHeight: 38, minWidth: 120,
};
