'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BASE, MANAGER, IC_MARKETS } from '@/lib/utils/constants';
import SimulationSection from './SimulationSection';

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  navy: '#001233',
  navyMid: '#001d4a',
  navyLight: '#0a2a5e',
  gold: '#b89a3e',
  goldBright: '#d4b254',
  goldPale: '#f0e0a8',
  white: '#ffffff',
  offWhite: '#f7f6f2',
  rule: '#ddd8cc',
  ruleDark: '#2a3f6a',
  body: '#2c2c2c',
  muted: '#6b7280',
  label: '#8a8a8a',
  positive: '#0a5c42',
  posBg: '#ecf7f2',
  negative: '#991b1b',
  negBg: '#fef2f2',
  amber: '#92400e',
  ambBg: '#fffbeb',
  blue: '#1e3a8a',
  blueBg: '#eff6ff',
};
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', 'Courier New', monospace";

/* ─── SVG icons ─────────────────────────────────────────────────────────── */
const PATHS: Record<string, React.ReactNode> = {
  trending_up: (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),
  trending_down: (
    <>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </>
  ),
  bar_chart: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>
  ),
  alert_tri: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  activity: (
    <>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </>
  ),
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  dollar: (
    <>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  map_pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  ext_link: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
  check_circle: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </>
  ),
  github: (
    <>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
  check: (
    <>
      <polyline points="20 6 9 17 4 12" />
    </>
  ),
  pie_chart: (
    <>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </>
  ),
  zap: (
    <>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  building: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
};

interface IcProps {
  n: string;
  size?: number;
  color?: string;
  sx?: React.CSSProperties;
}
const Ic = ({ n, size = 14, color = 'currentColor', sx = {} }: IcProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...sx }}
  >
    {PATHS[n] ?? <circle cx="12" cy="12" r="10" />}
  </svg>
);

/* ─── Tooltip definitions ────────────────────────────────────────────────── */
const TIPS: Record<string, string> = {
  totalRet:
    'Total Return — Cumulative percentage gain on the live account since inception, independently verified on MQL5 and/or MyFXBook. All figures are drawn from real-money trading on IC Markets live accounts. No simulated, backtested, or demo results are included.',
  mo: 'Average Monthly Return — Geometric mean monthly return derived from the full verified live track record. The geometric mean accounts for compounding and is the industry-standard measure for multi-period return averaging. Past performance does not guarantee future results.',
  ann: 'Annual CAGR — Compound Annual Growth Rate calculated from the verified live track record. This is a historical measure, not a forward return projection.',
  pf: 'Profit Factor — Gross profit divided by gross loss across all closed trades since inception. Values above 2.0 are considered strong by institutional benchmarks.',
  winRate:
    'Win Rate — Percentage of closed trades resulting in a net profit. Always evaluate win rate in conjunction with profit factor and average win/loss ratio.',
  balDD:
    'Max Balance Drawdown — The largest peak-to-trough percentage decline in realised account balance, measured from closed trades only. Floating losses are excluded.',
  eqDD: 'Max Equity Drawdown — The largest peak-to-trough percentage decline in total account equity, including all open floating positions. Critical for assessing grid-strategy risk.',
  trades:
    'Total Trades — Number of completed trade executions since inception. Higher trade count provides greater statistical confidence.',
  hold: 'Average Hold Time — Mean elapsed duration from trade entry to close. Affects overnight swap, weekend gap risk, and news event sensitivity.',
  grid: 'Grid / Martingale — Indicates whether the strategy employs grid mechanics or martingale principles. Strategies marked None operate with a single-position model per signal.',
  lot: 'Lot Sizing (per $1,000 balance) — Determines capital risk per pip movement. 0.03/1K = conservative; 0.10/1K = moderate; 0.11-0.20/1K = aggressive.',
  rorLvl:
    'Risk of Ruin Assessment — Institutional-grade evaluation of near-total capital loss probability. Factors: max drawdown, lot sizing, grid mechanics, track record length, and trade count.',
  days: 'Trading Days — Total calendar days since inception on which at least one trade was active.',
  actRate:
    'Activity Rate — Percentage of total calendar days on which at least one trade was opened or active.',
};

/* ─── Comparison table row definitions ──────────────────────────────────── */
type Strategy = (typeof BASE)[0];

const ROWS = [
  {
    g: 'Strategy Identity',
    rows: [
      {
        l: 'Ticker',
        ic: 'briefcase',
        f: (s: Strategy) => (
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.navy }}>
            {s.ticker}
          </span>
        ),
      },
      { l: 'Risk Classification', ic: 'shield', f: (s: Strategy) => <RBadge s={s} /> },
      {
        l: 'Strategy Type',
        ic: 'sliders',
        f: (s: Strategy) => <VC main={s.stype} sub={s.snote} />,
      },
      {
        l: 'Markets Traded',
        ic: 'globe',
        f: (s: Strategy) => <VC main={s.instr} sub={s.instrS} />,
      },
      { l: 'Inception', ic: 'calendar', f: (s: Strategy) => <VC main={s.dur} sub={s.durS} /> },
    ],
  },
  {
    g: 'Performance',
    rows: [
      {
        l: 'Total Return',
        ic: 'trending_up',
        tip: TIPS.totalRet,
        f: (s: Strategy) => <VC main={s.gain} color="pos" />,
      },
      {
        l: 'Monthly Return',
        ic: 'bar_chart',
        tip: TIPS.mo,
        f: (s: Strategy) => <VC main={s.mo} sub={s.ann} color="pos" />,
      },
      {
        l: 'Win Rate',
        ic: 'target',
        tip: TIPS.winRate,
        f: (s: Strategy) => (
          <VC main={s.win} sub={`${s.wins}W / ${s.losses}L of ${s.trades}`} color="pos" />
        ),
      },
      {
        l: 'Profit Factor',
        ic: 'activity',
        tip: TIPS.pf,
        f: (s: Strategy) => <VC main={s.pf} sub="Gross profit ÷ gross loss" color="pos" />,
      },
      {
        l: 'Trading Days',
        ic: 'calendar',
        tip: TIPS.days,
        f: (s: Strategy) => <VC main={s.days} sub={`${s.act} activity rate`} />,
      },
      {
        l: 'Trades / Week',
        ic: 'zap',
        f: (s: Strategy) => <VC main={s.tpw} sub={`Last trade: ${s.lastT}`} />,
      },
    ],
  },
  {
    g: 'Risk & Drawdown',
    rows: [
      {
        l: 'Balance Drawdown',
        ic: 'trending_down',
        tip: TIPS.balDD,
        f: (s: Strategy) => <VC main={s.ddBal} sub="Realised balance reduction" color={s.ddBalC} />,
      },
      {
        l: 'Equity Drawdown',
        ic: 'trending_down',
        tip: TIPS.eqDD,
        f: (s: Strategy) => <VC main={s.ddEq} sub="Floating unrealised exposure" color={s.ddEqC} />,
      },
      {
        l: 'Lot / $1,000',
        ic: 'sliders',
        tip: TIPS.lot,
        f: (s: Strategy) => <VC main={s.lot} sub={s.lotN} />,
      },
      {
        l: 'Grid / Martingale',
        ic: 'alert_tri',
        tip: TIPS.grid,
        f: (s: Strategy) => (
          <div>
            <Tag t={s.gridT === 'green' ? 'green' : 'amber'}>{s.grid}</Tag>
            <div style={{ fontSize: 10, color: C.label, marginTop: 5 }}>{s.gridN}</div>
          </div>
        ),
      },
      { l: 'Volatility Profile', ic: 'activity', f: (s: Strategy) => <VC main={s.volP} /> },
    ],
  },
  {
    g: 'Execution',
    rows: [
      {
        l: 'Avg Hold Time',
        ic: 'clock',
        tip: TIPS.hold,
        f: (s: Strategy) => <VC main={s.hold} sub={s.holdS} />,
      },
      {
        l: 'Platform',
        ic: 'building',
        f: (s: Strategy) => (
          <VC
            main={`MetaTrader ${s.platform === 'MT4' ? '4 (MT4)' : '5 (MT5)'}`}
            sub="IC Markets · ASIC Regulated"
          />
        ),
      },
    ],
  },
  {
    g: 'Portfolio Fit',
    rows: [
      {
        l: 'Allocation Category',
        ic: 'briefcase',
        f: (s: Strategy) => (
          <div style={{ background: C.navy, padding: '8px 12px', display: 'inline-block' }}>
            <div
              style={{
                fontSize: 9,
                color: C.gold,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              Allocation
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.white }}>{s.useCase}</div>
          </div>
        ),
      },
      { l: 'Investor Profile', ic: 'users', f: (s: Strategy) => <VC main={s.inv} sub={s.invN} /> },
      {
        l: 'Risk of Ruin',
        ic: 'shield',
        tip: TIPS.rorLvl,
        f: (s: Strategy) => (
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                color: s.rorC,
                marginBottom: 6,
              }}
            >
              ■ {s.rorLvl}
            </div>
            <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.55 }}>
              {s.rorD.substring(0, 120)}…
            </div>
          </div>
        ),
      },
    ],
  },
];

/* ─── Reusable atoms ─────────────────────────────────────────────────────── */
const Tag = ({ children, t = 'green' }: { children: React.ReactNode; t?: string }) => {
  const m: { [k: string]: { bg: string; c: string } } = {
    green: { bg: C.posBg, c: C.positive },
    red: { bg: C.negBg, c: C.negative },
    amber: { bg: C.ambBg, c: C.amber },
    blue: { bg: C.blueBg, c: C.blue },
    gray: { bg: C.offWhite, c: C.muted },
  };
  const s = m[t] ?? m.green;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 9px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '.5px',
        fontFamily: MONO,
        background: s.bg,
        color: s.c,
      }}
    >
      {children}
    </span>
  );
};

const SL = ({ c }: { c: string }) => (
  <div
    style={{
      fontSize: 10,
      letterSpacing: 2.5,
      textTransform: 'uppercase',
      color: C.gold,
      marginBottom: 8,
      fontWeight: 500,
    }}
  >
    {c}
  </div>
);
const ST = ({ c, light }: { c: string; light?: boolean }) => (
  <div
    style={{
      fontFamily: SERIF,
      fontSize: 'clamp(22px,3vw,28px)',
      fontWeight: 500,
      color: light ? C.white : C.navy,
      lineHeight: 1.2,
    }}
  >
    {c}
  </div>
);
const SN = ({ c, light }: { c: string; light?: boolean }) => (
  <div
    style={{
      fontSize: 12,
      color: light ? 'rgba(255,255,255,.4)' : C.label,
      textAlign: 'right',
      maxWidth: 280,
      lineHeight: 1.55,
    }}
    className="sh-note"
  >
    {c}
  </div>
);

const VC = ({ main, sub, color = 'default' }: { main: string; sub?: string; color?: string }) => {
  const cm: { [k: string]: string } = {
    pos: C.positive,
    neg: C.negative,
    amber: C.amber,
    blue: C.blue,
    default: C.navy,
    gray: C.muted,
  };
  return (
    <div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 700,
          color: cm[color] ?? cm.default,
          lineHeight: 1.3,
        }}
      >
        {main}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: C.label, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
      )}
    </div>
  );
};

const RBadge = ({ s }: { s: Strategy }) => (
  <span
    className={s.bClass}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 10px',
      fontSize: 9.5,
      letterSpacing: 1,
      fontWeight: 700,
      fontFamily: MONO,
      border: '1px solid',
      alignSelf: 'flex-start',
    }}
  >
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
    {s.badge}
  </span>
);

const Chips = ({ s }: { s: Strategy }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    <a href={s.mql5} target="_blank" rel="noreferrer" className="tl-chip">
      <Ic n="ext_link" size={10} />
      MQL5
    </a>
    {s.myfx && (
      <a href={s.myfx} target="_blank" rel="noreferrer" className="tl-chip">
        <Ic n="check_circle" size={10} />
        MyFXBook
      </a>
    )}
    {s.ss && (
      <a href={s.ss} target="_blank" rel="noreferrer" className="tl-chip">
        <Ic n="zap" size={10} />
        SignalStart
      </a>
    )}
    {s.zulu && (
      <a href={s.zulu} target="_blank" rel="noreferrer" className="tl-chip">
        <Ic n="users" size={10} />
        ZuluTrade
      </a>
    )}
  </div>
);

const IRH = ({
  icon,
  label,
  iconC = C.gold,
  children,
}: {
  icon: string;
  label: React.ReactNode;
  iconC?: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '11px 0',
      borderBottom: `1px solid ${C.offWhite}`,
    }}
  >
    <div
      style={{
        width: 26,
        height: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.offWhite,
        border: `1px solid ${C.rule}`,
        flexShrink: 0,
        marginTop: 1,
      }}
    >
      <Ic n={icon} size={12} color={iconC} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 9.5,
          color: C.label,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: C.body, fontWeight: 500, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  </div>
);

const Tooltip = ({ tip }: { tip: string }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!vis) return;
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setVis(false);
    };
    document.addEventListener('touchstart', close);
    document.addEventListener('click', close);
    return () => {
      document.removeEventListener('touchstart', close);
      document.removeEventListener('click', close);
    };
  }, [vis]);
  return (
    <span
      ref={ref}
      className={`tl-tip${vis ? ' vis' : ''}`}
      onMouseEnter={() => setVis(true)}
      onMouseLeave={() => setVis(false)}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setVis((v) => !v);
      }}
    >
      <Ic n="info" size={11} color={vis ? C.gold : C.label} />
      <span className="tl-tip-box">{tip}</span>
    </span>
  );
};

const MetaLabel = ({ label, tip }: { label: string; tip?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
    <span style={{ fontSize: 9, color: C.label, textTransform: 'uppercase', letterSpacing: 0.7 }}>
      {label}
    </span>
    {tip && <Tooltip tip={tip} />}
  </div>
);

/* ─── Sections ───────────────────────────────────────────────────────────── */

const Ann = () => (
  <div
    className="tl-ann"
    style={{
      background: C.gold,
      color: C.navy,
      textAlign: 'center',
      padding: '8px 24px',
      fontSize: 11.5,
      fontWeight: 500,
      letterSpacing: 0.5,
    }}
  >
    <strong>LIVE ACCOUNTS ONLY</strong>
    <span className="tl-ann-text">
      {' '}
      — All performance data independently verified on MQL5 &amp; MyFXBook &nbsp;·&nbsp; IC Markets
      (ASIC Regulated) &nbsp;·&nbsp; Leverage 1:500
    </span>
  </div>
);

const Nav = () => {
  const [open, setOpen] = useState(false);
  const links: [string, string][] = [
    ['#about', 'Manager'],
    ['#strategies', 'Strategies'],
    ['#factsheets', 'Factsheets'],
    ['#copy-trading', 'Copy Trading'],
    ['#comparison', 'Analysis'],
    ['#simulation', 'Simulator'],
    ['#broker', 'Broker'],
    ['#disclosures', 'Disclosures'],
  ];
  return (
    <nav
      style={{
        background: C.navy,
        borderBottom: `1px solid ${C.ruleDark}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="tl-nav-in"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 40px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: C.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: SERIF,
              fontSize: 15,
              fontWeight: 700,
              color: C.navy,
              flexShrink: 0,
            }}
          >
            TL
          </div>
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                fontWeight: 600,
                color: C.white,
                letterSpacing: 0.5,
                lineHeight: 1.1,
              }}
            >
              TOL LANGIT
            </div>
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: C.gold,
                fontWeight: 400,
                marginTop: 1,
              }}
            >
              Algorithmic Capital
            </div>
          </div>
        </div>
        <div className="d-768" style={{ alignItems: 'center', gap: 24 }}>
          {links.map(([h, l]) => (
            <a key={h} href={h} className="tl-navlink">
              {l}
            </a>
          ))}
          <a
            href={MANAGER.github}
            target="_blank"
            rel="noreferrer"
            className="tl-navlink tl-navcta"
          >
            <Ic n="github" size={12} />
            GitHub
          </a>
        </div>
        <button
          className={`tl-mob-btn${open ? ' open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`tl-mob-nav${open ? ' open' : ''}`}>
        {links.map(([h, l]) => (
          <a key={h} href={h} onClick={() => setOpen(false)}>
            {l}
          </a>
        ))}
        <a
          href={MANAGER.github}
          target="_blank"
          rel="noreferrer"
          className="mob-cta"
          onClick={() => setOpen(false)}
        >
          <Ic n="github" size={13} color={C.gold} />
          GitHub — adithyodw
        </a>
      </div>
    </nav>
  );
};

const Hero = ({ loading, S }: { loading: boolean; S: Strategy[] }) => {
  const f = S[0];
  return (
    <div
      className="tl-hero"
      style={{
        background: C.navy,
        backgroundImage: `linear-gradient(to bottom right,#001a4a 0%,${C.navy} 60%,#000c20 100%)`,
        padding: '90px 40px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="tl-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 60,
          background: `linear-gradient(transparent,${C.navy})`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ width: 32, height: 1, background: C.gold, flexShrink: 0 }} />
          <span
            style={{
              fontSize: 'clamp(9px,2vw,10.5px)',
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: C.gold,
              fontWeight: 500,
            }}
          >
            Independently Verified Algorithmic Trading Signals · Singapore
          </span>
        </div>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(30px,5.5vw,68px)',
            fontWeight: 500,
            color: C.white,
            lineHeight: 1.08,
            marginBottom: 10,
            letterSpacing: -0.5,
          }}
        >
          Systematic. <em style={{ fontStyle: 'italic', color: C.goldBright }}>Quantitative.</em>
          <br />
          Algorithmically Driven.
        </h1>
        <p
          style={{
            fontSize: 'clamp(13px,2vw,15px)',
            color: 'rgba(255,255,255,.5)',
            fontWeight: 300,
            maxWidth: 580,
            lineHeight: 1.65,
            marginBottom: 48,
            letterSpacing: 0.2,
          }}
        >
          Four live, independently verified algorithmic strategies spanning forex majors, cross
          pairs, and gold — engineered for consistent risk-adjusted returns since January 2021.
        </p>
        <div
          className="tl-hero-stats"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            borderTop: `1px solid rgba(184,154,62,.2)`,
            paddingTop: 40,
            gap: 0,
          }}
        >
          {(
            [
              {
                l: 'Flagship Track Record',
                v: f.gain,
                s: 'TOL LANGIT V10 · Since Jan 2021',
                g: true,
              },
              { l: 'Total Live Strategies', v: '4', s: 'Across All Risk Profiles' },
              { l: 'Verification Platforms', v: '2', s: 'MQL5 & MyFXBook' },
              { l: 'Flagship Balance DD', v: f.ddBal, s: 'Maximum Drawdown by Balance', g: true },
              {
                l: 'Execution Broker',
                v: 'IC Markets',
                s: 'ASIC Regulated · 1:500 Leverage',
                sm: true,
              },
            ] as { l: string; v: string; s: string; g?: boolean; sm?: boolean }[]
          ).map((st, i, arr) => (
            <div
              key={i}
              className="tl-hero-stat"
              style={{
                flex: 1,
                minWidth: 0,
                paddingRight: 40,
                borderRight: i < arr.length - 1 ? `1px solid rgba(255,255,255,.08)` : 'none',
                marginRight: i < arr.length - 1 ? 40 : 0,
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.35)',
                  marginBottom: 8,
                  fontWeight: 500,
                }}
              >
                {st.l}
              </div>
              <div
                className="tl-hero-stat-val"
                style={{
                  fontFamily: MONO,
                  fontSize: st.sm ? 16 : 26,
                  fontWeight: 600,
                  color: st.g ? C.goldBright : C.white,
                  lineHeight: 1,
                  marginBottom: 4,
                  paddingTop: st.sm ? 5 : 0,
                }}
              >
                {loading && !st.sm && i !== 1 && i !== 2 ? (
                  <span style={{ opacity: 0.3 }}>—</span>
                ) : (
                  st.v
                )}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{st.s}</div>
            </div>
          ))}
        </div>
        {loading && (
          <div
            style={{
              marginTop: 16,
              fontSize: 11,
              color: 'rgba(255,255,255,.3)',
              letterSpacing: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span className="tl-spin">
              <Ic n="refresh" size={12} color="rgba(255,255,255,.3)" />
            </span>
            Retrieving live performance data from MQL5…
          </div>
        )}
      </div>
    </div>
  );
};

const VStrip = ({ lastUpd, loading }: { lastUpd: string; loading: boolean }) => (
  <div className="tl-vstrip" style={{ background: '#000e28' }}>
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div
        className="tl-vbadges"
        style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
      >
        {[
          'Independently Verified · MQL5',
          'Independently Verified · MyFXBook',
          'ASIC Regulated · IC Markets Tier 1',
          'Open Access · No Lock-In',
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 18,
                height: 18,
                background: C.positive,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Ic n="check" size={10} color="white" />
            </div>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.55)' }}>{t}</span>
            {i < 3 && (
              <div
                className="tl-vsep"
                style={{ width: 1, height: 18, background: C.ruleDark, marginLeft: 8 }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {loading && (
          <span className="tl-spin">
            <Ic n="refresh" size={12} color="rgba(255,255,255,.3)" />
          </span>
        )}
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,.25)',
            fontFamily: MONO,
            letterSpacing: 0.5,
          }}
        >
          DATA AS OF {lastUpd.toUpperCase()}
        </div>
      </div>
    </div>
  </div>
);

const About = () => (
  <div className="sp" style={{ padding: '72px 40px', background: C.white }} id="about">
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        className="sh-flex"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 40,
          paddingBottom: 20,
          borderBottom: `1px solid ${C.rule}`,
        }}
      >
        <div>
          <SL c="Strategy Manager" />
          <ST c="Investment Manager Profile" />
        </div>
        <SN c="All trading accounts are publicly accessible 24/5. Complete data transparency — no proprietary black boxes, no simulated results." />
      </div>
      <div className="tl-2col">
        <div>
          <div style={{ border: `1px solid ${C.rule}`, padding: 28, textAlign: 'center' }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: C.navy,
                margin: '0 auto 16px',
                border: `2px solid ${C.rule}`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MANAGER.avatar}
                alt={MANAGER.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                fontWeight: 600,
                color: C.navy,
                marginBottom: 4,
              }}
            >
              {MANAGER.name}
            </div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, marginBottom: 20 }}>
              {MANAGER.title}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderTop: `1px solid ${C.rule}`,
                paddingTop: 16,
                textAlign: 'left',
              }}
            >
              {(
                [
                  ['map_pin', MANAGER.location],
                  ['briefcase', MANAGER.employer],
                  ['clock', `Active Since ${MANAGER.activeSince}`],
                ] as [string, string][]
              ).map(([ic, t], i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: C.muted,
                  }}
                >
                  <Ic n={ic} size={12} color={C.gold} />
                  {t}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {[
                { h: MANAGER.github, n: 'github', l: 'github.com/adithyodw' },
                { h: MANAGER.linkedin, n: 'linkedin', l: 'LinkedIn Profile' },
                { h: MANAGER.mql5p, n: 'activity', l: 'MQL5 Signal Provider' },
                { h: MANAGER.myfxbook, n: 'check_circle', l: 'MyFXBook Account' },
                { h: MANAGER.telegram, n: 'send', l: 'Telegram @tol_langit' },
              ].map((lk, i) => (
                <a key={i} href={lk.h} target="_blank" rel="noreferrer" className="tl-alink">
                  <Ic n={lk.n} size={14} color={C.gold} />
                  {lk.l}
                </a>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['TOL-LANGIT-Neural-Quant-Advisor', 'CS50HarvardX'].map((r) => (
              <div
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: `1px solid ${C.rule}`,
                  background: C.offWhite,
                  fontSize: 11,
                }}
              >
                <Ic n="building" size={11} color={C.muted} />
                {r}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(17px,2.5vw,21px)',
              fontWeight: 500,
              color: C.navy,
              marginBottom: 16,
            }}
          >
            Systematic Quantitative Strategies Built on Verified Live Performance
          </h3>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>
            Adithyo Dewangga Wijaya is a Singapore-based algorithmic trading strategy developer
            specialising in automated Expert Advisor (EA) systems for the MetaTrader platform. With
            a continuous live track record extending to January 2021, the flagship strategy —{' '}
            <strong style={{ color: C.navy }}>TOL LANGIT V10</strong> — has been publicly verifiable
            on both MQL5 and MyFXBook without interruption across multiple market cycles.
          </p>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>
            The strategy suite spans conservative low-drawdown multi-pair forex systems to
            AI-verified institutional-grade gold scalping strategies. All accounts operate
            exclusively on IC Markets, an ASIC-regulated Tier 1 broker, maintaining full public data
            transparency with no obfuscation or synthetic results.
          </p>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
            The <strong style={{ color: C.navy }}>TOL-LANGIT-Neural-Quant-Advisor</strong> GitHub
            repository documents the quantitative methodology underpinning the ETF series,
            incorporating multi-timeframe signal analysis, Bayesian probability modelling, and
            AI-layer verification protocols consistent with institutional quantitative finance
            practices.
          </p>
          <div
            className="tl-facts"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 1,
              background: C.rule,
              border: `1px solid ${C.rule}`,
              marginTop: 28,
            }}
          >
            {[
              { n: '5+', l: 'Years Live Track Record', g: true },
              { n: '4,519', l: 'Total Trades (V10 Flagship)' },
              { n: '77–94%', l: 'Win Rates Across Signals', g: true },
            ].map((f, i) => (
              <div key={i} style={{ background: C.white, padding: '18px 20px' }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 22,
                    fontWeight: 600,
                    color: f.g ? C.gold : C.navy,
                    marginBottom: 4,
                  }}
                >
                  {f.n}
                </div>
                <div style={{ fontSize: 11, color: C.label }}>{f.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StrategyCard = ({ s }: { s: Strategy }) => (
  <div
    style={{
      background: C.white,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}
  >
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 700,
            color: C.muted,
            letterSpacing: 1,
          }}
        >
          {s.ticker}
        </span>
        <RBadge s={s} />
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 14,
          fontWeight: 600,
          color: C.navy,
          lineHeight: 1.3,
          marginBottom: 6,
        }}
      >
        {s.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.goldBright }}>
          {s.gain}
        </div>
        <Tooltip tip={TIPS.totalRet} />
      </div>
      <div style={{ fontSize: 10, color: C.label, marginTop: 3 }}>{s.durS}</div>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 14,
        borderTop: `1px solid ${C.rule}`,
        paddingTop: 14,
      }}
    >
      {[
        { l: 'Win Rate', v: s.win, c: C.positive, tip: TIPS.winRate },
        { l: 'Profit Factor', v: s.pf, c: C.navy, tip: TIPS.pf },
        {
          l: 'Balance DD',
          v: s.ddBal,
          c: s.ddBalC === 'neg' ? C.negative : s.ddBalC === 'pos' ? C.positive : C.amber,
          tip: TIPS.balDD,
        },
        { l: 'Monthly', v: s.mo, c: C.positive, tip: TIPS.mo },
      ].map((m, i) => (
        <div key={i} style={{ background: C.offWhite, padding: '9px 10px' }}>
          <MetaLabel label={m.l} tip={m.tip} />
          <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: m.c }}>{m.v}</div>
        </div>
      ))}
    </div>
    <div style={{ background: C.navy, padding: '10px 12px', marginBottom: 12, flex: 1 }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: C.gold,
          marginBottom: 3,
        }}
      >
        Use Case
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.white }}>{s.useCase}</div>
    </div>
    <Chips s={s} />
  </div>
);

const Cards = ({ S }: { S: Strategy[] }) => {
  const [mobIdx, setMobIdx] = useState(0);
  return (
    <div className="sp" style={{ padding: '72px 40px', background: C.offWhite }} id="strategies">
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          className="sh-flex"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 40,
            paddingBottom: 20,
            borderBottom: `1px solid ${C.rule}`,
          }}
        >
          <div>
            <SL c="Live Signal Suite" />
            <ST c="Four Verified Algorithmic Strategies" />
          </div>
          <SN c="All figures reflect verified real-money results from live MQL5 and MyFXBook accounts." />
        </div>

        {/* Desktop: 4-column grid */}
        <div
          className="tl-4col"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 1,
            background: C.rule,
            border: `1px solid ${C.rule}`,
          }}
        >
          {S.map((s) => (
            <StrategyCard key={s.id} s={s} />
          ))}
        </div>

        {/* Mobile: tab switcher */}
        <div className="tl-cards-mob">
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
            {S.map((st, i) => (
              <button
                key={st.id}
                className={`tl-tab${mobIdx === i ? ' on' : ''}`}
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 'calc(50% - 4px)',
                  textAlign: 'center',
                }}
                onClick={() => setMobIdx(i)}
              >
                <span
                  style={{
                    fontSize: 9,
                    display: 'block',
                    opacity: 0.7,
                    marginBottom: 2,
                    letterSpacing: '0.04em',
                  }}
                >
                  {st.ticker}
                </span>
                {st.short}
              </button>
            ))}
          </div>
          {/* Dots indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
            {S.map((_, i) => (
              <button
                key={i}
                onClick={() => setMobIdx(i)}
                style={{
                  width: i === mobIdx ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === mobIdx ? C.gold : 'rgba(0,18,51,.2)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all .25s',
                }}
              />
            ))}
          </div>
          <div style={{ border: `1px solid ${C.rule}` }}>
            <StrategyCard s={S[mobIdx]} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => setMobIdx((i) => Math.max(0, i - 1))}
              disabled={mobIdx === 0}
              style={{
                flex: 1,
                height: 44,
                background: C.white,
                border: `1px solid ${C.rule}`,
                color: C.navy,
                fontFamily: MONO,
                fontSize: 11,
                cursor: 'pointer',
                opacity: mobIdx === 0 ? 0.35 : 1,
                transition: 'opacity .2s',
              }}
            >
              ← PREV
            </button>
            <button
              onClick={() => setMobIdx((i) => Math.min(S.length - 1, i + 1))}
              disabled={mobIdx === S.length - 1}
              style={{
                flex: 1,
                height: 44,
                background: C.navy,
                border: `1px solid ${C.navy}`,
                color: C.goldBright,
                fontFamily: MONO,
                fontSize: 11,
                cursor: 'pointer',
                opacity: mobIdx === S.length - 1 ? 0.35 : 1,
                transition: 'opacity .2s',
              }}
            >
              NEXT →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Factsheets = ({ S }: { S: Strategy[] }) => {
  const [act, setAct] = useState(0);
  const s = S[act];
  return (
    <div className="sp" style={{ padding: '72px 40px', background: C.white }} id="factsheets">
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          className="sh-flex"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: `1px solid ${C.rule}`,
          }}
        >
          <div>
            <SL c="Strategy Factsheets" />
            <ST c="ETF-Style Product Profiles" />
          </div>
          <SN c="Structured strategy documentation consistent with institutional asset management product disclosure standards." />
        </div>
        <div
          className="tl-tab-wrap"
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}
        >
          {S.map((st, i) => (
            <button
              key={st.id}
              className={`tl-tab${act === i ? ' on' : ''}`}
              onClick={() => setAct(i)}
            >
              {st.short}
            </button>
          ))}
        </div>
        <div key={s.id} className="tl-fu">
          <div
            className="tl-fs-header"
            style={{
              background: C.navy,
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9.5,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: C.gold,
                  marginBottom: 6,
                }}
              >
                Strategy Factsheet · {s.ticker}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(16px,2.5vw,22px)',
                  fontWeight: 600,
                  color: C.white,
                  marginBottom: 8,
                }}
              >
                {s.name}
              </div>
              <RBadge s={s} />
            </div>
            <div className="tl-fs-gain" style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 'clamp(24px,4vw,36px)',
                    fontWeight: 700,
                    color: C.goldBright,
                  }}
                >
                  {s.gain}
                </div>
                <Tooltip tip={TIPS.totalRet} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>
                Total Return · {s.durS}
              </div>
              <div style={{ marginTop: 10 }}>
                <Chips s={s} />
              </div>
            </div>
          </div>
          <div
            className="tl-2col"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: C.rule }}
          >
            <div style={{ background: C.white, padding: '24px 28px' }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: C.navy,
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.rule}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ic n="bar_chart" size={13} color={C.gold} />
                Performance Metrics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { l: 'Total Return', v: s.gain, c: 'pos', tip: TIPS.totalRet },
                  { l: 'Monthly Return', v: s.mo, c: 'pos', tip: TIPS.mo },
                  { l: 'Annual CAGR', v: s.ann, c: 'default', tip: TIPS.ann },
                  { l: 'Profit Factor', v: s.pf, c: 'pos', tip: TIPS.pf },
                  { l: 'Win Rate', v: s.win, c: 'pos', tip: TIPS.winRate },
                  { l: 'Total Trades', v: s.trades, c: 'default', tip: TIPS.trades },
                  { l: 'Trading Days', v: s.days, c: 'default', tip: TIPS.days },
                  { l: 'Avg Hold Time', v: s.hold, c: 'default', tip: TIPS.hold },
                ].map((m, i) => (
                  <div
                    key={i}
                    style={{ borderBottom: `1px solid ${C.offWhite}`, paddingBottom: 10 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        color: C.label,
                        textTransform: 'uppercase',
                        letterSpacing: 0.7,
                        marginBottom: 4,
                      }}
                    >
                      {m.l}
                      {m.tip && <Tooltip tip={m.tip} />}
                    </div>
                    <VC main={m.v} color={m.c} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.white, padding: '24px 28px' }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: C.navy,
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.rule}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ic n="info" size={13} color={C.gold} />
                Key Facts
              </div>
              <IRH icon="sliders" label="Strategy Type">
                {s.stype}
              </IRH>
              <IRH icon="globe" label="Markets Traded">
                {s.instr} — {s.instrS}
              </IRH>
              <IRH
                icon="sliders"
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Risk Allocation
                    <Tooltip tip={TIPS.lot} />
                  </span>
                }
              >
                {s.lot} lots per $1,000 — {s.lotN}
              </IRH>
              <IRH icon="zap" label="Execution Model">
                {s.snote}
              </IRH>
              <IRH
                icon="shield"
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Grid / Martingale
                    <Tooltip tip={TIPS.grid} />
                  </span>
                }
              >
                <Tag t={s.gridT === 'green' ? 'green' : 'amber'}>{s.grid}</Tag>
                <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>{s.gridN}</span>
              </IRH>
              <IRH icon="lock" label="Platform">
                MetaTrader {s.platform === 'MT4' ? '4 (MT4)' : '5 (MT5)'} · IC Markets
              </IRH>
              <IRH icon="check_circle" label="Verification Sources">
                MQL5 Signal Registry{s.myfx ? ' · MyFXBook' : ''}
              </IRH>
            </div>
            <div style={{ background: C.offWhite, padding: '24px 28px' }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: C.navy,
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.rule}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ic n="pie_chart" size={13} color={C.gold} />
                Portfolio Characteristics
              </div>
              <IRH icon="activity" label="Volatility Profile">
                {s.volP}
              </IRH>
              <IRH
                icon="trending_down"
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Max Balance Drawdown
                    <Tooltip tip={TIPS.balDD} />
                  </span>
                }
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    color:
                      s.ddBalC === 'neg' ? C.negative : s.ddBalC === 'pos' ? C.positive : C.amber,
                  }}
                >
                  {s.ddBal}
                </span>
              </IRH>
              <IRH
                icon="trending_down"
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Max Equity Drawdown
                    <Tooltip tip={TIPS.eqDD} />
                  </span>
                }
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    color: s.ddEqC === 'neg' ? C.negative : C.amber,
                  }}
                >
                  {s.ddEq}
                </span>
              </IRH>
              <IRH icon="clock" label="Average Trade Duration">
                {s.hold} · {s.holdS}
              </IRH>
              <IRH icon="layers" label="Drawdown Behaviour">
                <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{s.ddB}</span>
              </IRH>
              <IRH icon="users" label="Correlation Characteristics">
                <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{s.corrN}</span>
              </IRH>
            </div>
            <div style={{ background: C.offWhite, padding: '24px 28px' }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: C.navy,
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: `1px solid ${C.rule}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ic n="briefcase" size={13} color={C.gold} />
                Use Case &amp; Allocation Guidance
              </div>
              <div style={{ background: C.navy, padding: '14px 16px', marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: C.gold,
                    marginBottom: 5,
                  }}
                >
                  ETF-Style Allocation Category
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>
                  {s.useCase}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
                  {s.useCaseD}
                </div>
              </div>
              <IRH icon="users" label="Target Investor Profile">
                {s.inv}
              </IRH>
              <IRH icon="dollar" label="Allocation Guidance">
                <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{s.alloc}</span>
              </IRH>
              <div style={{ marginTop: 16, borderTop: `1px solid ${C.rule}`, paddingTop: 16 }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: C.label,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Ic n="alert_tri" size={11} color={C.label} />
                  Risk of Ruin Assessment
                  <Tooltip tip={TIPS.rorLvl} />
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.rorC,
                    marginBottom: 8,
                  }}
                >
                  ■ {s.rorLvl}
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{s.rorD}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CT_PLATFORMS: {
  [k: string]: { name: string; shortName: string; icon: string; desc: string };
} = {
  mql5: {
    name: 'MQL5 Signals',
    shortName: 'MQL5',
    icon: 'activity',
    desc: "Subscribe directly via MetaTrader's built-in signal service. Trades are replicated automatically into your MT4/MT5 account in real time. Industry-standard copy mechanism trusted by over one million traders worldwide. No third-party software required.",
  },
  ss: {
    name: 'SignalStart',
    shortName: 'SignalStart',
    icon: 'zap',
    desc: 'Independent signal monitoring and copy-trading platform. Provides advanced risk controls including equity stop-loss and maximum drawdown thresholds. IC Markets certified provider. Detailed performance analytics with live account verification.',
  },
  zulu: {
    name: 'ZuluTrade',
    shortName: 'ZuluTrade',
    icon: 'users',
    desc: 'Global social and copy trading platform with millions of registered users. Regulated across multiple jurisdictions. Supports advanced performance filtering, risk scoring per signal provider, and customisable lot-size scaling relative to your account balance.',
  },
};

const CopyTrading = ({ S }: { S: Strategy[] }) => {
  const [act, setAct] = useState(0);
  const s = S[act];
  const platforms = (
    [
      s.mql5 && { key: 'mql5', url: s.mql5, ...CT_PLATFORMS.mql5 },
      s.ss && { key: 'ss', url: s.ss, ...CT_PLATFORMS.ss },
      s.zulu && { key: 'zulu', url: s.zulu, ...CT_PLATFORMS.zulu },
    ] as (
      | { key: string; url: string; name: string; shortName: string; icon: string; desc: string }
      | false
    )[]
  ).filter(Boolean) as {
    key: string;
    url: string;
    name: string;
    shortName: string;
    icon: string;
    desc: string;
  }[];

  return (
    <div className="sp" style={{ padding: '72px 40px', background: C.navy }} id="copy-trading">
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          className="sh-flex"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: `1px solid ${C.ruleDark}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: C.gold,
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Copy Trading
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(22px,3vw,28px)',
                fontWeight: 500,
                color: C.white,
                lineHeight: 1.2,
              }}
            >
              Start Allocating in Minutes
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,.35)',
              textAlign: 'right',
              maxWidth: 320,
              lineHeight: 1.6,
            }}
            className="sh-note"
          >
            Select a strategy and subscribe via your preferred platform. All accounts are live,
            independently verified, and open for subscription at any time.
          </div>
        </div>
        <div
          className="tl-tab-wrap"
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}
        >
          {S.map((st, i) => (
            <button
              key={st.id}
              className={`tl-tab${act === i ? ' on' : ''}`}
              style={
                act !== i
                  ? { borderColor: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.4)' }
                  : {}
              }
              onClick={() => setAct(i)}
            >
              {st.short}
            </button>
          ))}
        </div>
        <div key={s.id} className="tl-fu">
          <div
            style={{
              background: 'rgba(255,255,255,.04)',
              border: `1px solid ${C.ruleDark}`,
              padding: '20px 24px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: C.gold,
                  letterSpacing: 1,
                  marginBottom: 5,
                }}
              >
                {s.ticker} &nbsp;·&nbsp; {s.platform} &nbsp;·&nbsp; IC Markets
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(15px,2vw,19px)',
                  fontWeight: 600,
                  color: C.white,
                  marginBottom: 8,
                }}
              >
                {s.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <RBadge s={s} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{s.durS}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 9.5,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.3)',
                  marginBottom: 6,
                }}
              >
                Verified Total Return
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 'clamp(24px,3.5vw,34px)',
                  fontWeight: 700,
                  color: C.goldBright,
                  lineHeight: 1,
                }}
              >
                {s.gain}
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.25)', marginTop: 6 }}>
                Since inception · MQL5 verified
              </div>
            </div>
          </div>
          {platforms.length > 0 ? (
            <div
              className="tl-ct-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(platforms.length, 3)},1fr)`,
                gap: 1,
                background: C.ruleDark,
              }}
            >
              {platforms.map((pl) => (
                <div key={pl.key} className="tl-ct-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: 'rgba(184,154,62,.12)',
                        border: `1px solid rgba(184,154,62,.2)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Ic n={pl.icon} size={16} color={C.gold} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          letterSpacing: 1,
                          color: C.gold,
                          fontWeight: 700,
                        }}
                      >
                        {pl.shortName}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>
                        {pl.name}
                      </div>
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'rgba(255,255,255,.4)',
                      lineHeight: 1.75,
                      marginBottom: 24,
                      flex: 1,
                    }}
                  >
                    {pl.desc}
                  </p>
                  <a href={pl.url} target="_blank" rel="noreferrer" className="tl-ct-btn">
                    <span>SUBSCRIBE / COPY NOW</span>
                    <Ic n="ext_link" size={12} color={C.navy} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '40px 32px',
                textAlign: 'center',
                border: `1px solid ${C.ruleDark}`,
                background: 'rgba(255,255,255,.02)',
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: 'rgba(255,255,255,.3)',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                COPY TRADING — PENDING TRACK RECORD MILESTONE
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.2)', lineHeight: 1.65 }}>
                Copy trading subscription links will be published upon completion of the 3-month
                verified track record milestone. This strategy is currently in the observation
                phase.
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '14px 18px',
              border: `1px solid rgba(184,154,62,.18)`,
              background: 'rgba(184,154,62,.04)',
            }}
          >
            <Ic n="alert_tri" size={13} color={C.gold} sx={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.35)', lineHeight: 1.7 }}>
              Copy trading involves substantial risk of loss. Replicated performance may differ
              materially from the provider account due to execution timing, slippage, account equity
              differences, and broker-specific conditions. Past performance does not guarantee
              future results. Review all risk disclosures before allocating capital. This is not
              investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Comparison = ({ S }: { S: Strategy[] }) => (
  <div className="sp" style={{ padding: '72px 40px', background: C.offWhite }} id="comparison">
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        className="sh-flex"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 32,
          paddingBottom: 20,
          borderBottom: `1px solid ${C.rule}`,
        }}
      >
        <div>
          <SL c="Comprehensive Analysis" />
          <ST c="Signal Performance Comparison Matrix" />
        </div>
        <SN c="All metrics sourced from verified live accounts. Data refreshed from MQL5 at session load and every 15 minutes." />
      </div>
      <div className="tl-scroll" style={{ border: `1px solid ${C.rule}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr>
              <th
                style={{
                  background: C.navy,
                  width: 175,
                  verticalAlign: 'bottom',
                  borderRight: `1px solid ${C.ruleDark}`,
                }}
              >
                <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'flex-end' }}>
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,.2)',
                      fontFamily: MONO,
                    }}
                  >
                    METRIC
                  </span>
                </div>
              </th>
              {S.map((s) => (
                <th
                  key={s.id}
                  style={{
                    background: C.navy,
                    borderLeft: `1px solid ${C.ruleDark}`,
                    verticalAlign: 'top',
                    padding: 0,
                  }}
                >
                  <div style={{ padding: '20px 16px' }}>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.muted,
                        letterSpacing: 1,
                        marginBottom: 5,
                      }}
                    >
                      {s.ticker}
                    </div>
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.white,
                        marginBottom: 4,
                        lineHeight: 1.3,
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 20,
                        fontWeight: 700,
                        color: C.goldBright,
                        marginBottom: 8,
                      }}
                    >
                      {s.gain}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                      <a
                        href={s.mql5}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 9.5,
                          padding: '4px 8px',
                          minHeight: 32,
                          border: '1px solid rgba(255,255,255,.15)',
                          color: 'rgba(255,255,255,.55)',
                          fontFamily: MONO,
                        }}
                      >
                        <Ic n="ext_link" size={9} />
                        MQL5
                      </a>
                      {s.myfx && (
                        <a
                          href={s.myfx}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 9.5,
                            padding: '4px 8px',
                            minHeight: 32,
                            border: '1px solid rgba(255,255,255,.15)',
                            color: 'rgba(255,255,255,.55)',
                            fontFamily: MONO,
                          }}
                        >
                          <Ic n="check_circle" size={9} />
                          MYFXBK
                        </a>
                      )}
                    </div>
                    <RBadge s={s} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((grp) => (
              <>
                <tr key={`g-${grp.g}`}>
                  <td
                    colSpan={5}
                    style={{
                      background: C.offWhite,
                      padding: '8px 16px',
                      fontSize: 9.5,
                      letterSpacing: 2.5,
                      textTransform: 'uppercase',
                      color: C.label,
                      fontWeight: 600,
                      borderTop: `1px solid ${C.rule}`,
                      borderBottom: `1px solid ${C.rule}`,
                    }}
                  >
                    {grp.g}
                  </td>
                </tr>
                {grp.rows.map((row, ri) => (
                  <tr
                    key={`${grp.g}-${ri}`}
                    className="tl-tr"
                    style={{ borderBottom: `1px solid ${C.rule}` }}
                  >
                    <td
                      className="tl-td"
                      style={{
                        padding: '13px 16px',
                        background: C.offWhite,
                        borderRight: `1px solid ${C.rule}`,
                        verticalAlign: 'middle',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: C.white,
                            border: `1px solid ${C.rule}`,
                            flexShrink: 0,
                          }}
                        >
                          <Ic n={row.ic} size={12} color={C.navy} />
                        </div>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: C.body,
                            fontWeight: 500,
                            lineHeight: 1.3,
                          }}
                        >
                          {row.l}
                        </span>
                        {'tip' in row && row.tip && <Tooltip tip={row.tip as string} />}
                      </div>
                    </td>
                    {S.map((s) => (
                      <td
                        key={s.id}
                        className="tl-td"
                        style={{
                          padding: '13px 16px',
                          borderLeft: `1px solid ${C.rule}`,
                          verticalAlign: 'top',
                          background: C.white,
                        }}
                      >
                        {row.f(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: C.label,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Ic n="info" size={11} color={C.label} />
        Equity drawdown figures represent peak-to-trough floating exposure and are structurally
        distinct from realised balance drawdown. Investors should reference both metrics when
        assessing strategy risk.
      </div>
    </div>
  </div>
);

const AnnPerf = () => (
  <div style={{ background: C.navy, padding: '48px 40px' }} id="performance">
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        className="sh-flex"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <SL c="Annual Verified Returns" />
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(16px,2.5vw,22px)',
              fontWeight: 500,
              color: C.white,
            }}
          >
            TOL LANGIT V10 — Low Risk Flagship
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
            Since inception January 2021 · IC Markets live account · MQL5 &amp; MyFXBook verified
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: C.muted,
              marginBottom: 4,
            }}
          >
            Composite CAGR 2021–2024
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 'clamp(20px,3vw,28px)',
              fontWeight: 700,
              color: C.goldBright,
            }}
          >
            ~67.1% p.a.
          </div>
        </div>
      </div>
      <div
        className="tl-perf-years"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 1,
          background: 'rgba(255,255,255,.06)',
        }}
      >
        {BASE[0].annRet!.map((y) => (
          <div
            key={y.y}
            className="tl-perf-yr"
            style={{
              background: 'rgba(0,18,51,.7)',
              padding: '28px 24px',
              textAlign: 'center',
              border: `1px solid rgba(255,255,255,.06)`,
              transition: 'background .2s',
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                color: 'rgba(255,255,255,.3)',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              {y.y}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(22px,3vw,32px)',
                fontWeight: 700,
                color: C.goldBright,
              }}
            >
              {y.v}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 8 }}>{y.n}</div>
          </div>
        ))}
      </div>
      <div
        style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
      >
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
          Cumulative Return Since Inception:{' '}
          <span style={{ fontFamily: MONO, color: C.goldBright, fontWeight: 600 }}>+1,447.47%</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
          Maximum Balance Drawdown:{' '}
          <span style={{ fontFamily: MONO, color: '#fbbf24', fontWeight: 600 }}>10.18%</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
          Past performance does not guarantee future results.
        </div>
      </div>
    </div>
  </div>
);

const Broker = () => (
  <div className="sp" style={{ padding: '72px 40px', background: C.white }} id="broker">
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        className="sh-flex"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 40,
          paddingBottom: 20,
          borderBottom: `1px solid ${C.rule}`,
        }}
      >
        <div>
          <SL c="Execution Venue" />
          <ST c="IC Markets — ASIC Regulated Tier 1 Broker" />
        </div>
        <SN c="All TOL LANGIT strategies execute exclusively on IC Markets live accounts." />
      </div>
      <div
        className="tl-2col"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          background: C.rule,
          border: `1px solid ${C.rule}`,
        }}
      >
        <div style={{ background: C.white, padding: '32px 32px' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: C.navy,
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: `1px solid ${C.rule}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ic n="award" size={13} color={C.gold} />
            Why IC Markets?
          </div>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>
            IC Markets is regulated by the{' '}
            <strong style={{ color: C.navy }}>
              Australian Securities and Investments Commission (ASIC)
            </strong>{' '}
            under AFS Licence No. 335692 — one of the world&apos;s most rigorous financial
            regulatory frameworks. ASIC licensees must maintain segregated client funds, adhere to
            strict capital adequacy requirements, and submit to ongoing regulatory audits.
          </p>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.8, marginBottom: 24 }}>
            As a True ECN broker, IC Markets provides institutional-grade execution with spreads
            from 0.0 pips on major currency pairs, direct access to Tier 1 bank liquidity, and no
            dealing desk intervention — the standard execution environment for professional
            algorithmic EA trading strategies.
          </p>
          <a href={IC_MARKETS} target="_blank" rel="noreferrer" className="tl-gold-btn">
            <Ic n="ext_link" size={14} />
            Open an Account with IC Markets
          </a>
          <div
            style={{
              marginTop: 10,
              fontSize: 10.5,
              color: C.label,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Ic n="info" size={10} color={C.label} />
            Referral link. Capital allocation decisions remain solely the investor&apos;s
            responsibility.
          </div>
        </div>
        <div style={{ background: C.offWhite, padding: '32px 32px' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              fontWeight: 600,
              color: C.navy,
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: `1px solid ${C.rule}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ic n="check_circle" size={13} color={C.gold} />
            Regulatory &amp; Execution Credentials
          </div>
          {[
            {
              ic: 'shield',
              l: 'Primary Regulator',
              v: 'ASIC — Australian Securities & Investments Commission',
              c: C.positive,
            },
            {
              ic: 'lock',
              l: 'Regulatory Licence',
              v: 'AFS Licence No. 335692 — Full Compliance',
              c: C.positive,
            },
            {
              ic: 'check_circle',
              l: 'Client Fund Protection',
              v: 'Segregated Client Accounts — Not Co-mingled',
              c: C.positive,
            },
            {
              ic: 'activity',
              l: 'Execution Model',
              v: 'True ECN / Raw Spread — No Dealing Desk',
              c: C.navy,
            },
            {
              ic: 'zap',
              l: 'Spreads (EUR/USD)',
              v: 'From 0.0 pips — Raw Spread Accounts',
              c: C.navy,
            },
            {
              ic: 'trending_up',
              l: 'Max Leverage',
              v: 'Up to 1:500 — Professional Clients',
              c: C.navy,
            },
            {
              ic: 'sliders',
              l: 'Algorithmic Trading',
              v: 'Fully Supported — 24/5 MT5 EA Execution',
              c: C.navy,
            },
            {
              ic: 'bar_chart',
              l: 'Strategy Compatibility',
              v: 'All TOL LANGIT signals verified on IC Markets live accounts',
              c: C.positive,
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '9px 0',
                borderBottom: i < 7 ? `1px solid ${C.rule}` : 'none',
              }}
            >
              <Ic n={item.ic} size={13} color={item.c} sx={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: C.label,
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                    marginBottom: 2,
                  }}
                >
                  {item.l}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: item.c }}>{item.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Disclosures = () => (
  <div
    className="sp"
    style={{ padding: '56px 40px', background: C.offWhite, borderTop: `3px solid ${C.negative}` }}
    id="disclosures"
  >
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: C.negBg,
            border: `1px solid rgba(153,27,27,.2)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Ic n="alert_tri" size={20} color={C.negative} />
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(18px,3vw,22px)',
            color: C.negative,
            fontWeight: 600,
          }}
        >
          Important Risk Disclosures
        </div>
      </div>
      <div
        className="tl-2col"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          background: C.rule,
          border: `1px solid ${C.rule}`,
          marginBottom: 1,
        }}
      >
        {(
          [
            {
              ic: 'alert_tri',
              t: 'Trading Risk Warning',
              b: 'Trading foreign exchange, commodities, contracts for difference (CFDs), and other leveraged financial instruments involves substantial risk of loss and may not be suitable for all investors. Financial leverage amplifies both gains and losses and can result in losses exceeding your initial deposit. You should not invest money you cannot afford to lose. Carefully consider your investment objectives, level of experience, and risk tolerance before making any trading decision.',
              w: 'Do not commit capital to leveraged instruments without a thorough understanding of the associated risks.',
            },
            {
              ic: 'bar_chart',
              t: 'Performance Disclaimer',
              b: 'All performance figures represent independently verified historical data from live, real-money trading accounts. Past performance is not indicative of, and does not guarantee, future results. Forward-looking returns may differ materially from historical results due to changing market conditions, liquidity dynamics, volatility regimes, execution slippage, and other factors. No representation is made that any account will achieve results similar to those historically displayed.',
              w: null,
            },
            {
              ic: 'info',
              t: 'Strategy Risk Characteristics',
              b: 'Automated trading strategies using grid or position recovery mechanics may sustain periods of extreme floating drawdown before positions are closed. Investors should review equity drawdown figures — not solely balance drawdown — when assessing full risk profiles. A high historical win rate does not preclude the occurrence of significant losing periods or complete capital loss.',
              w: null,
            },
            {
              ic: 'check_circle',
              t: 'Independent Due Diligence',
              b: 'The strategy developer provides signal data for informational purposes only. Nothing on this website constitutes investment advice, a solicitation to invest, or a recommendation to subscribe to any signal. All data is publicly verifiable via MQL5 and MyFXBook. Prospective investors are strongly advised to conduct independent due diligence, consult a qualified financial advisor, and review all publicly available account data prior to allocating capital.',
              w: null,
            },
          ] as { ic: string; t: string; b: string; w: string | null }[]
        ).map((b, i) => (
          <div key={i} style={{ background: C.white, padding: '24px 28px' }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                fontWeight: 600,
                color: C.navy,
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: `1px solid ${C.rule}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ic n={b.ic} size={12} color={C.gold} />
              {b.t}
            </div>
            <p
              style={{ fontSize: 13, color: C.muted, lineHeight: 1.78, marginBottom: b.w ? 12 : 0 }}
            >
              {b.b}
            </p>
            {b.w && (
              <p style={{ fontSize: 12.5, color: C.negative, fontWeight: 500, lineHeight: 1.55 }}>
                {b.w}
              </p>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          background: C.negBg,
          border: `1px solid rgba(153,27,27,.15)`,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <Ic n="alert_tri" size={18} color={C.negative} sx={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13.5, color: C.negative, lineHeight: 1.65 }}>
          <strong style={{ fontSize: 14 }}>Limitation of Liability:</strong> The strategy developer,
          TOL LANGIT, and associated parties expressly disclaim all responsibility for financial
          losses incurred by any individual copying, subscribing to, or otherwise replicating any
          signal or strategy listed on this website. All investment and trading decisions are made
          solely at the discretion and financial risk of the individual investor. Conduct
          independent due diligence and obtain qualified financial advice before committing capital
          to any trading strategy.
        </p>
      </div>
    </div>
  </div>
);

const Footer = ({ lastUpd }: { lastUpd: string }) => (
  <footer
    className="footer-in"
    style={{ background: C.navy, borderTop: `1px solid ${C.ruleDark}`, padding: '48px 40px 32px' }}
  >
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        className="tl-3col"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 48,
          marginBottom: 48,
          paddingBottom: 40,
          borderBottom: `1px solid ${C.ruleDark}`,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              color: C.white,
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            TOL LANGIT Capital
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: C.gold,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Algorithmic Trading · Singapore
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.65 }}>
            Four independently verified algorithmic trading strategies. Live accounts, publicly
            accessible, ASIC-regulated brokerage. Complete transparency — no black boxes, no
            obfuscated results.
          </p>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: C.gold,
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Verified Signals
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BASE.map((s) => (
              <a key={s.id} href={s.mql5} target="_blank" rel="noreferrer" className="tl-footlink">
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: C.ruleDark,
                    flexShrink: 0,
                  }}
                />
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: C.gold,
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Connect &amp; Verify
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { h: MANAGER.github, n: 'github', l: 'GitHub — adithyodw' },
              { h: MANAGER.linkedin, n: 'linkedin', l: 'LinkedIn — Adithyo Dewangga Wijaya' },
              { h: MANAGER.myfxbook, n: 'check_circle', l: 'MyFXBook — Full Account History' },
              { h: MANAGER.mql5p, n: 'activity', l: 'MQL5 — Signal Provider Profile' },
              { h: MANAGER.telegram, n: 'send', l: 'Telegram — @tol_langit' },
              { h: IC_MARKETS, n: 'ext_link', l: 'Open Account — IC Markets (ASIC)' },
            ].map((lk, i) => (
              <a key={i} href={lk.h} target="_blank" rel="noreferrer" className="tl-footlink">
                <Ic n={lk.n} size={12} />
                {lk.l}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', fontFamily: MONO }}>
          © 2026 Adithyo Dewangga Wijaya · TOL LANGIT · All rights reserved
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,.15)',
            fontFamily: MONO,
            letterSpacing: 0.5,
          }}
        >
          DATA AS OF {lastUpd.toUpperCase()} · IC MARKETS ASIC · 1:500 · NOT FINANCIAL ADVICE
        </div>
      </div>
    </div>
  </footer>
);

/* ─── Root dashboard component ───────────────────────────────────────────── */
const INTERVAL = 6 * 60 * 60 * 1000;

const getDeviceDate = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function TolLangitDashboard() {
  const [S, setS] = useState<Strategy[]>(BASE);
  const [loading, setLoading] = useState(false);
  const [apiDate, setApiDate] = useState<string | null>(null);
  const [deviceDate, setDeviceDate] = useState(getDeviceDate);
  const [msg, setMsg] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lastUpd = apiDate ?? `${deviceDate} (Cached)`;

  useEffect(() => {
    dateTimerRef.current = setInterval(() => {
      const next = getDeviceDate();
      setDeviceDate((prev) => (prev !== next ? next : prev));
    }, 60000);
    return () => {
      if (dateTimerRef.current) clearInterval(dateTimerRef.current);
    };
  }, []);

  const fetchLive = useCallback(async () => {
    setLoading(true);
    setMsg('Retrieving live data from MyFXBook…');
    try {
      const res = await fetch('/api/myfxbook/sync', { method: 'GET' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      if (data.strategies) {
        const KEY_ORDER = ['v10', 'v10hr', 'etf', 'etfgold'];
        setS(
          BASE.map((s, idx) => {
            const lv = data.strategies[KEY_ORDER[idx]];
            return lv ? { ...s, ...lv } : s;
          })
        );
      }
      const ts: string = data.updatedAt ?? getDeviceDate();
      setApiDate(ts);
      setMsg(`Live data updated — ${ts}`);
    } catch {
      // silent — do not surface API errors to the UI
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 6000);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    timerRef.current = setInterval(fetchLive, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchLive]);

  return (
    <div style={{ fontFamily: SANS, fontSize: 14, color: C.body, background: C.white }}>
      <Ann />
      <Nav />
      <Hero loading={loading} S={S} />
      <VStrip lastUpd={lastUpd} loading={loading} />
      <About />
      <Cards S={S} />
      <Factsheets S={S} />
      <CopyTrading S={S} />
      <Comparison S={S} />
      <AnnPerf />
      <SimulationSection />
      <Broker />
      <Disclosures />
      <Footer lastUpd={lastUpd} />
      <div className="tl-float">
        {msg && (
          <div
            style={{
              background: C.navy,
              color: C.goldBright,
              padding: '6px 14px',
              fontSize: 10,
              fontFamily: MONO,
              letterSpacing: 0.5,
              border: `1px solid ${C.gold}`,
              opacity: 0.92,
              maxWidth: 'calc(100vw - 48px)',
              wordBreak: 'break-word',
            }}
          >
            {msg}
          </div>
        )}
        <button onClick={fetchLive} disabled={loading} className="tl-rfrsh">
          <span className={loading ? 'tl-spin' : ''}>
            <Ic n="refresh" size={12} color={C.goldBright} />
          </span>
          {loading ? 'UPDATING…' : 'REFRESH DATA'}
        </button>
      </div>
    </div>
  );
}
