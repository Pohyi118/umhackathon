'use client';

/**
 * PeopleGraph — Cost-Productivity Matrix (Scatter Plot)
 * ======================================================
 * X-axis: Labor Cost (RM)  |  Y-axis: Output Value (RM)
 * Node color: Automation potential (amber = high, purple = low)
 * Dark-theme compliant.
 */

import { useEffect, useState } from 'react';
import { useI18n } from '../i18nContext';

export default function CostProductivityMatrix() {
  const { t } = useI18n();
  const [data, setData] = useState([]);
  const [hoveredDept, setHoveredDept] = useState(null);

  useEffect(() => {
    // In production, this calls /api/v1/ai/cost-productivity-matrix
    setData([
      { id: 'dept-1', name: 'Technology', cost_rm: 150000, output_value_rm: 450000, automation_potential: 0.3, headcount: 8 },
      { id: 'dept-2', name: 'Sales', cost_rm: 80000, output_value_rm: 320000, automation_potential: 0.2, headcount: 5 },
      { id: 'dept-3', name: 'Operations', cost_rm: 120000, output_value_rm: 180000, automation_potential: 0.6, headcount: 6 },
      { id: 'dept-4', name: 'Finance', cost_rm: 40000, output_value_rm: 90000, automation_potential: 0.7, headcount: 3 },
      { id: 'dept-5', name: 'HR', cost_rm: 30000, output_value_rm: 60000, automation_potential: 0.4, headcount: 2 },
    ]);
  }, []);

  const maxCost = Math.max(...data.map(d => d.cost_rm), 200000);
  const maxOutput = Math.max(...data.map(d => d.output_value_rm), 500000);

  // Determine node color based on automation potential
  const getNodeColor = (potential) => {
    if (potential > 0.5) return { fill: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)' };
    return { fill: '#7C3AED', glow: 'rgba(124, 58, 237, 0.3)' };
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              {t('costProductivity')}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">Department ROI Analysis</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
            <span className="text-[10px] text-[var(--text-muted)]">Low Automation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[10px] text-[var(--text-muted)]">High Automation</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: '260px' }}>
        {/* Y-axis label */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
            Output Value (RM)
          </span>
        </div>

        {/* Chart grid */}
        <div className="ml-6 h-full relative rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(pct => (
            <div key={pct} className="absolute w-full border-t" style={{ top: `${pct * 100}%`, borderColor: 'rgba(124,58,237,0.06)' }} />
          ))}
          {[0.25, 0.5, 0.75].map(pct => (
            <div key={pct} className="absolute h-full border-l" style={{ left: `${pct * 100}%`, borderColor: 'rgba(124,58,237,0.06)' }} />
          ))}

          {/* Ideal ROI = 1 diagonal line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line x1="0" y1="100%" x2="100%" y2="0" stroke="rgba(124,58,237,0.12)" strokeWidth="1.5" strokeDasharray="6,4" />
          </svg>

          {/* Data points */}
          {data.map((dept) => {
            const xPercent = (dept.cost_rm / maxCost) * 100;
            const yPercent = (dept.output_value_rm / maxOutput) * 100;
            const colors = getNodeColor(dept.automation_potential);
            const isHovered = hoveredDept === dept.id;

            return (
              <div
                key={dept.id}
                className="absolute transition-all duration-300 cursor-pointer z-10"
                style={{
                  left: `${xPercent}%`,
                  bottom: `${yPercent}%`,
                  transform: `translate(-50%, 50%) scale(${isHovered ? 1.4 : 1})`,
                }}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
              >
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-full blur-sm transition-opacity duration-300"
                  style={{
                    background: colors.glow,
                    opacity: isHovered ? 1 : 0.4,
                    width: '20px', height: '20px',
                    margin: '-2px',
                  }}
                />
                {/* Node */}
                <div
                  className="w-4 h-4 rounded-full relative"
                  style={{
                    background: colors.fill,
                    boxShadow: `0 0 12px ${colors.glow}`,
                  }}
                />
                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-50"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                  >
                    <p className="font-bold text-[var(--text-primary)]">{dept.name}</p>
                    <p className="text-[var(--text-secondary)]">Cost: RM {(dept.cost_rm / 1000).toFixed(0)}k | Output: RM {(dept.output_value_rm / 1000).toFixed(0)}k</p>
                    <p className="text-[var(--text-muted)]">Automation Potential: {(dept.automation_potential * 100).toFixed(0)}%</p>
                    <p className="text-[var(--text-muted)]">Headcount: {dept.headcount}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* X-axis label */}
        <div className="ml-6 mt-2 text-center">
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Labor Cost (RM)</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[var(--border)]">
        <div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Highest ROI</p>
          <p className="text-xs font-bold text-emerald-400 mt-0.5">Sales (4.0x)</p>
        </div>
        <div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">At Risk</p>
          <p className="text-xs font-bold text-amber-400 mt-0.5">Operations</p>
        </div>
        <div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Automate First</p>
          <p className="text-xs font-bold text-[var(--primary-light)] mt-0.5">Finance (70%)</p>
        </div>
      </div>
    </div>
  );
}
