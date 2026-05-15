'use client';

import { COLORS, FONTS } from '@/lib/utils/constants';
import React, { useMemo } from 'react';

interface MonthlyData {
  month: string;
  growth: string;
  balance: number;
}

interface MonthlyPerformanceProps {
  strategy: string;
  data: MonthlyData[];
}

export default function MonthlyPerformance({ strategy, data }: MonthlyPerformanceProps) {
  const metrics = useMemo(() => {
    const growthValues = data.map((d) => parseFloat(d.growth));
    const balanceValues = data.map((d) => d.balance);

    const avgGrowth = growthValues.reduce((a, b) => a + b, 0) / growthValues.length;
    const maxBalance = Math.max(...balanceValues);
    const minBalance = Math.min(...balanceValues);
    const balanceRange = maxBalance - minBalance;

    return { avgGrowth, maxBalance, minBalance, balanceRange };
  }, [data]);

  if (!data || data.length === 0) return null;

  const SVGChart = () => {
    const chartWidth = 320;
    const chartHeight = 160;
    const padding = { top: 16, right: 12, bottom: 32, left: 40 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const balanceRange = metrics.maxBalance - metrics.minBalance;
    const balanceScale = balanceRange > 0 ? plotHeight / balanceRange : plotHeight;

    const points = data
      .map((d, i) => {
        const x = padding.left + (i / (data.length - 1 || 1)) * plotWidth;
        const y = padding.top + plotHeight - (d.balance - metrics.minBalance) * balanceScale;
        return [x, y];
      })
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');

    return (
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="tl-monthly-svg"
      >
        <defs>
          <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.3} />
            <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={`grid-${fraction}`}
            x1={padding.left}
            y1={padding.top + fraction * plotHeight}
            x2={chartWidth - padding.right}
            y2={padding.top + fraction * plotHeight}
            stroke={COLORS.rule}
            strokeWidth="0.5"
            opacity={fraction === 0 ? 0 : 0.3}
          />
        ))}

        {/* Area under curve */}
        <polyline
          points={`${padding.left},${padding.top + plotHeight} ${points} ${chartWidth - padding.right},${padding.top + plotHeight}`}
          fill="url(#balanceGradient)"
          stroke="none"
        />

        {/* Balance line */}
        <polyline
          points={points}
          fill="none"
          stroke={COLORS.blue}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1 || 1)) * plotWidth;
          const y = padding.top + plotHeight - (d.balance - metrics.minBalance) * balanceScale;
          const growthValue = parseFloat(d.growth);
          const color = growthValue >= 0 ? COLORS.positive : COLORS.negative;

          return (
            <circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              opacity="0.8"
              className="tl-chart-point"
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1 || 1)) * plotWidth;
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              fontSize="11"
              fill={COLORS.muted}
              fontFamily={FONTS.mono}
            >
              {d.month.split(' ')[0]}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="tl-monthly-perf">
      <div className="tl-monthly-header">
        <h3>Monthly Performance — {strategy}</h3>
        <p className="tl-monthly-subtitle">Balance trajectory & monthly returns</p>
      </div>

      <div className="tl-monthly-container">
        <div className="tl-monthly-chart">
          <SVGChart />
        </div>

        <div className="tl-monthly-grid">
          {data.map((month, idx) => {
            const growthValue = parseFloat(month.growth);
            const isPositive = growthValue >= 0;

            return (
              <div key={idx} className="tl-monthly-cell">
                <div className="tl-monthly-header-mini">
                  <span className="tl-monthly-month">{month.month}</span>
                  <div
                    className="tl-monthly-growth-badge"
                    style={{
                      backgroundColor: isPositive ? COLORS.positiveBg : COLORS.negativeBg,
                      color: isPositive ? COLORS.positive : COLORS.negative,
                    }}
                  >
                    {month.growth}
                  </div>
                </div>

                <div className="tl-monthly-balance-value">
                  ${month.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>

                {/* Mini bar */}
                <div className="tl-monthly-mini-bar">
                  <div
                    className="tl-monthly-mini-bar-fill"
                    style={{
                      width: `${Math.abs(growthValue) * 2}%`,
                      backgroundColor: isPositive ? COLORS.positive : COLORS.negative,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .tl-monthly-perf {
          margin: 3rem 0;
          padding: 2.5rem;
          background: linear-gradient(
            135deg,
            rgba(0, 12, 51, 0.02) 0%,
            rgba(184, 154, 62, 0.02) 100%
          );
          border: 1px solid ${COLORS.rule};
          border-radius: 14px;
          font-family: ${FONTS.sans};
        }

        .tl-monthly-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid ${COLORS.rule};
        }

        .tl-monthly-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.35rem;
          font-weight: 700;
          color: ${COLORS.body};
          letter-spacing: -0.015em;
          font-family: ${FONTS.serif};
        }

        .tl-monthly-subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: ${COLORS.muted};
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .tl-monthly-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .tl-monthly-chart {
          display: flex;
          justify-content: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid ${COLORS.rule};
          border-radius: 10px;
        }

        .tl-monthly-svg {
          width: 100%;
          height: auto;
        }

        .tl-chart-point {
          transition:
            r 0.2s ease,
            opacity 0.2s ease;
        }

        .tl-chart-point:hover {
          r: 5;
          opacity: 1;
        }

        .tl-monthly-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .tl-monthly-cell {
          padding: 1.25rem;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.rule};
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.25s ease;
        }

        .tl-monthly-cell:hover {
          border-color: ${COLORS.gold};
          box-shadow: 0 4px 12px rgba(184, 154, 62, 0.12);
        }

        .tl-monthly-header-mini {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }

        .tl-monthly-month {
          font-size: 0.75rem;
          font-weight: 700;
          color: ${COLORS.label};
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .tl-monthly-growth-badge {
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .tl-monthly-balance-value {
          font-size: 1rem;
          font-weight: 700;
          color: ${COLORS.body};
          font-family: ${FONTS.mono};
          letter-spacing: -0.01em;
        }

        .tl-monthly-mini-bar {
          width: 100%;
          height: 6px;
          background: ${COLORS.offWhite};
          border-radius: 3px;
          overflow: hidden;
        }

        .tl-monthly-mini-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        @media (max-width: 1024px) {
          .tl-monthly-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .tl-monthly-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .tl-monthly-perf {
            padding: 1.75rem;
            margin: 2rem 0;
          }

          .tl-monthly-header h3 {
            font-size: 1.15rem;
          }

          .tl-monthly-container {
            gap: 1.5rem;
          }

          .tl-monthly-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .tl-monthly-cell {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .tl-monthly-perf {
            padding: 1.25rem;
            margin: 1.5rem 0;
          }

          .tl-monthly-header h3 {
            font-size: 1rem;
          }

          .tl-monthly-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .tl-monthly-cell {
            padding: 0.875rem;
          }

          .tl-monthly-header-mini {
            gap: 0.5rem;
          }

          .tl-monthly-balance-value {
            font-size: 0.9rem;
          }

          .tl-monthly-growth-badge {
            font-size: 0.7rem;
            padding: 0.3rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
