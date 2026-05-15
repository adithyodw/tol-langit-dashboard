'use client';

import { COLORS, FONTS } from '@/lib/utils/constants';
import React from 'react';

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
  if (!data || data.length === 0) return null;

  const maxBalance = Math.max(...data.map(d => d.balance));
  const getGrowthColor = (growth: string) => {
    const value = parseFloat(growth);
    return value >= 0 ? COLORS.positive : COLORS.negative;
  };

  return (
    <div className="tl-monthly-perf">
      <div className="tl-monthly-header">
        <h3>Monthly Performance — {strategy}</h3>
        <p className="tl-monthly-subtitle">Growth % & Balance Trajectory</p>
      </div>

      <div className="tl-monthly-grid">
        {data.map((month, idx) => {
          const balanceHeight = (month.balance / maxBalance) * 100;
          const growthValue = parseFloat(month.growth);

          return (
            <div key={idx} className="tl-monthly-cell">
              <div className="tl-monthly-month">{month.month}</div>

              <div className="tl-monthly-metrics">
                <div className="tl-monthly-bar-wrapper">
                  <div
                    className="tl-monthly-bar"
                    style={{
                      height: `${balanceHeight}%`,
                      backgroundColor: growthValue >= 0 ? COLORS.blueBg : '#fef2f2',
                      borderLeft: `3px solid ${growthValue >= 0 ? COLORS.blue : COLORS.negative}`,
                    }}
                  />
                </div>

                <div className="tl-monthly-values">
                  <div className="tl-monthly-growth" style={{ color: getGrowthColor(month.growth) }}>
                    {month.growth}
                  </div>
                  <div className="tl-monthly-balance">${month.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .tl-monthly-perf {
          margin: 3rem 0;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(0, 12, 51, 0.02) 0%, rgba(184, 154, 62, 0.02) 100%);
          border: 1px solid ${COLORS.rule};
          border-radius: 12px;
          font-family: ${FONTS.sans};
        }

        .tl-monthly-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid ${COLORS.rule};
        }

        .tl-monthly-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: ${COLORS.body};
          letter-spacing: -0.01em;
        }

        .tl-monthly-subtitle {
          margin: 0.5rem 0 0 0;
          font-size: 0.875rem;
          color: ${COLORS.muted};
          font-weight: 500;
        }

        .tl-monthly-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .tl-monthly-cell {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tl-monthly-month {
          font-size: 0.8rem;
          font-weight: 600;
          color: ${COLORS.label};
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .tl-monthly-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tl-monthly-bar-wrapper {
          width: 100%;
          height: 120px;
          background: ${COLORS.offWhite};
          border-radius: 6px;
          padding: 0.5rem;
          display: flex;
          align-items: flex-end;
          border: 1px solid ${COLORS.rule};
        }

        .tl-monthly-bar {
          width: 100%;
          min-height: 4px;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .tl-monthly-bar:hover {
          opacity: 0.8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tl-monthly-values {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .tl-monthly-growth {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .tl-monthly-balance {
          font-size: 0.75rem;
          color: ${COLORS.muted};
          font-weight: 500;
          font-family: ${FONTS.mono};
        }

        @media (max-width: 768px) {
          .tl-monthly-perf {
            padding: 1.5rem;
            margin: 2rem 0;
          }

          .tl-monthly-header h3 {
            font-size: 1.1rem;
          }

          .tl-monthly-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 1rem;
          }

          .tl-monthly-bar-wrapper {
            height: 100px;
          }
        }

        @media (max-width: 480px) {
          .tl-monthly-perf {
            padding: 1rem;
            margin: 1.5rem 0;
          }

          .tl-monthly-header h3 {
            font-size: 1rem;
          }

          .tl-monthly-grid {
            grid-template-columns: repeat(auto-fit, minmax(85px, 1fr));
            gap: 0.75rem;
          }

          .tl-monthly-bar-wrapper {
            height: 80px;
            padding: 0.375rem;
          }

          .tl-monthly-month {
            font-size: 0.7rem;
          }

          .tl-monthly-growth {
            font-size: 0.85rem;
          }

          .tl-monthly-balance {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}
