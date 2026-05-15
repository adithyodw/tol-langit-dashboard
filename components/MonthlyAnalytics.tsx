'use client';

import { COLORS, FONTS } from '@/lib/utils/constants';
import React, { useMemo } from 'react';

interface MonthlyDataPoint {
  month: string;
  growth: string;
  balance: number;
}

interface MonthlyAnalyticsProps {
  strategy: string;
  data: MonthlyDataPoint[];
  year?: string;
}

export default function MonthlyAnalytics({ strategy, data, year }: MonthlyAnalyticsProps) {
  const metrics = useMemo(() => {
    const growthValues = data.map((d) => parseFloat(d.growth));
    const maxGrowth = Math.max(...growthValues);
    const minGrowth = Math.min(...growthValues);
    const avgGrowth = growthValues.reduce((a, b) => a + b, 0) / growthValues.length;
    const positiveCount = growthValues.filter((g) => g > 0).length;
    const negativeCount = growthValues.filter((g) => g < 0).length;
    const winRate = (positiveCount / growthValues.length) * 100;

    return { maxGrowth, minGrowth, avgGrowth, positiveCount, negativeCount, winRate };
  }, [data]);

  if (!data || data.length === 0) return null;

  const BarChart = () => {
    const chartWidth = 480;
    const chartHeight = 240;
    const padding = { top: 24, right: 16, bottom: 48, left: 48 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const growthValues = data.map((d) => parseFloat(d.growth));
    const maxGrowth = Math.max(...growthValues, 0);
    const minGrowth = Math.min(...growthValues, 0);
    const range = maxGrowth - minGrowth || 1;
    const scale = plotHeight / range;
    const zeroLine = padding.top + plotHeight - (0 - minGrowth) * scale;

    const barWidth = plotWidth / (data.length * 1.5);
    const barGap = barWidth * 0.5;

    return (
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="tl-analytics-svg"
      >
        <defs>
          <linearGradient id="positiveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.positive} stopOpacity="0.8" />
            <stop offset="100%" stopColor={COLORS.positive} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="negativeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={COLORS.negative} stopOpacity="0.8" />
            <stop offset="100%" stopColor={COLORS.negative} stopOpacity="0.4" />
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
            opacity={fraction === 0 ? 0 : 0.2}
          />
        ))}

        {/* Zero line */}
        <line
          x1={padding.left}
          y1={zeroLine}
          x2={chartWidth - padding.right}
          y2={zeroLine}
          stroke={COLORS.body}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const growth = parseFloat(d.growth);
          const barHeight = Math.abs(growth - minGrowth) * scale;
          const isPositive = growth >= 0;
          const x = padding.left + i * (barWidth + barGap) + barGap / 2;
          const y = isPositive ? zeroLine - (growth - minGrowth) * scale : zeroLine;

          return (
            <rect
              key={`bar-${i}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={`url(#${isPositive ? 'positiveGradient' : 'negativeGradient'})`}
              rx="3"
              className="tl-bar"
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding.left + i * (barWidth + barGap) + barGap / 2 + barWidth / 2;
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={chartHeight - 12}
              textAnchor="middle"
              fontSize="11"
              fill={COLORS.muted}
              fontFamily={FONTS.mono}
            >
              {d.month.split(' ')[0]}
            </text>
          );
        })}

        {/* Y-axis label */}
        <text
          x={14}
          y={padding.top + plotHeight / 2}
          textAnchor="middle"
          fontSize="11"
          fill={COLORS.muted}
          fontFamily={FONTS.mono}
          transform={`rotate(-90 14 ${padding.top + plotHeight / 2})`}
        >
          Growth %
        </text>
      </svg>
    );
  };

  const PieChart = () => {
    const size = 160;
    const radius = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;

    const positivePercent = (metrics.positiveCount / data.length) * 100;
    const negativePercent = (metrics.negativeCount / data.length) * 100;

    const positiveAngle = (positivePercent / 100) * 360;
    const startAngle = -90;
    const endAngle = startAngle + positiveAngle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(toRad(startAngle));
    const y1 = cy + radius * Math.sin(toRad(startAngle));
    const x2 = cx + radius * Math.cos(toRad(endAngle));
    const y2 = cy + radius * Math.sin(toRad(endAngle));

    const largeArc = positiveAngle > 180 ? 1 : 0;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="tl-pie-svg">
        <defs>
          <linearGradient id="piePositive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.positive} stopOpacity="1" />
            <stop offset="100%" stopColor={COLORS.positive} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="pieNegative" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.negative} stopOpacity="1" />
            <stop offset="100%" stopColor={COLORS.negative} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Positive segment */}
        {positivePercent > 0 && (
          <path
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill="url(#piePositive)"
          />
        )}

        {/* Negative segment */}
        {negativePercent > 0 && (
          <path
            d={`M ${cx} ${cy} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x1} ${y1} Z`}
            fill="url(#pieNegative)"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="tl-analytics">
      <div className="tl-analytics-header">
        <h3>Monthly Analytics — {strategy}</h3>
        {year && <span className="tl-analytics-year">{year}</span>}
        <p className="tl-analytics-subtitle">Performance distribution & composition</p>
      </div>

      <div className="tl-analytics-grid">
        {/* Monthly Gain Chart */}
        <div className="tl-analytics-section">
          <h4>Monthly Gain (Change)</h4>
          <div className="tl-analytics-chart-container">
            <BarChart />
          </div>
          <div className="tl-analytics-stats">
            <div className="tl-stat-item">
              <span className="tl-stat-label">Max</span>
              <span className="tl-stat-value" style={{ color: COLORS.positive }}>
                +{metrics.maxGrowth.toFixed(2)}%
              </span>
            </div>
            <div className="tl-stat-item">
              <span className="tl-stat-label">Avg</span>
              <span className="tl-stat-value">{metrics.avgGrowth.toFixed(2)}%</span>
            </div>
            <div className="tl-stat-item">
              <span className="tl-stat-label">Min</span>
              <span className="tl-stat-value" style={{ color: COLORS.negative }}>
                {metrics.minGrowth.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Win Rate & Distribution */}
        <div className="tl-analytics-section">
          <h4>Win Rate & Distribution</h4>
          <div className="tl-analytics-pie-container">
            <PieChart />
            <div className="tl-pie-legend">
              <div className="tl-legend-item">
                <div className="tl-legend-dot" style={{ backgroundColor: COLORS.positive }} />
                <span>
                  Positive: {metrics.positiveCount} ({metrics.winRate.toFixed(1)}%)
                </span>
              </div>
              <div className="tl-legend-item">
                <div className="tl-legend-dot" style={{ backgroundColor: COLORS.negative }} />
                <span>Negative: {metrics.negativeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tl-analytics {
          margin: 3rem 0;
          padding: 2.5rem;
          background: linear-gradient(135deg, rgba(0, 12, 51, 0.02) 0%, rgba(184, 154, 62, 0.02) 100%);
          border: 1px solid ${COLORS.rule};
          border-radius: 14px;
          font-family: ${FONTS.sans};
        }

        .tl-analytics-header {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid ${COLORS.rule};
          position: relative;
        }

        .tl-analytics-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.35rem;
          font-weight: 700;
          color: ${COLORS.body};
          letter-spacing: -0.015em;
          font-family: ${FONTS.serif};
        }

        .tl-analytics-year {
          position: absolute;
          top: 0;
          right: 0;
          font-size: 0.875rem;
          color: ${COLORS.muted};
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .tl-analytics-subtitle {
          margin: 0.5rem 0 0 0;
          font-size: 0.875rem;
          color: ${COLORS.muted};
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .tl-analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        .tl-analytics-section {
          padding: 2rem;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.rule};
          border-radius: 12px;
        }

        .tl-analytics-section h4 {
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: ${COLORS.body};
          letter-spacing: -0.01em;
          text-transform: uppercase;
          font-family: ${FONTS.sans};
        }

        .tl-analytics-chart-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .tl-analytics-svg {
          width: 100%;
          height: auto;
          max-width: 480px;
        }

        .tl-bar {
          transition: opacity 0.2s ease;
          cursor: pointer;
        }

        .tl-bar:hover {
          opacity: 1 !important;
        }

        .tl-analytics-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid ${COLORS.rule};
        }

        .tl-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .tl-stat-label {
          font-size: 0.75rem;
          color: ${COLORS.label};
          text-transform: uppercase;
          letter-spacing: 0.03em;
          font-weight: 600;
        }

        .tl-stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: ${COLORS.body};
          font-family: ${FONTS.mono};
          letter-spacing: -0.01em;
        }

        .tl-analytics-pie-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .tl-pie-svg {
          max-width: 180px;
        }

        .tl-pie-legend {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .tl-legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: ${COLORS.body};
        }

        .tl-legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .tl-analytics-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .tl-analytics {
            padding: 1.75rem;
            margin: 2rem 0;
          }

          .tl-analytics-header h3 {
            font-size: 1.15rem;
          }

          .tl-analytics-section {
            padding: 1.5rem;
          }

          .tl-analytics-stats {
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .tl-analytics {
            padding: 1.25rem;
            margin: 1.5rem 0;
          }

          .tl-analytics-header h3 {
            font-size: 1rem;
          }

          .tl-analytics-year {
            position: static;
            display: block;
            margin-top: 0.5rem;
          }

          .tl-analytics-section {
            padding: 1rem;
          }

          .tl-chart-container svg {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
