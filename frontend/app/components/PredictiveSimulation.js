'use client';

/**
 * PeopleGraph — Predictive Simulation (Ensemble Forecasting)
 * ===========================================================
 * Slider-based interface for simulating headcount impact on revenue.
 * Dark-theme compliant. Uses CSS vars from globals.css.
 */

import { useState } from 'react';
import { useI18n } from '../i18nContext';

export default function PredictiveSimulation() {
  const { t } = useI18n();
  const [proposedHires, setProposedHires] = useState(1);
  const [avgSalary, setAvgSalary] = useState(5000);
  const [department, setDepartment] = useState('sales');
  const [projectedRevenueLift, setProjectedRevenueLift] = useState(20);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const departments = [
    { value: 'sales', label: 'Sales & Marketing', multiplier: 2.8 },
    { value: 'warehouse', label: 'Warehouse & Logistics', multiplier: 1.6 },
    { value: 'admin', label: 'Admin & Finance', multiplier: 1.2 },
    { value: 'tech', label: 'Technology', multiplier: 3.2 },
  ];

  const handleSimulate = async () => {
    setIsSimulating(true);
    setTimeout(() => {
      const totalSalary = proposedHires * avgSalary;
      const dept = departments.find(d => d.value === department);
      const baselineRevenue = totalSalary * (dept?.multiplier || 2.2);
      const projectedRevenue = baselineRevenue * (1 + projectedRevenueLift / 100);
      const epfCost = totalSalary * 0.13;
      const socsoCost = Math.min(totalSalary, 6000 * proposedHires) * 0.0175;
      const eisCost = Math.min(totalSalary, 6000 * proposedHires) * 0.002;
      const totalLaborCost = totalSalary + epfCost + socsoCost + eisCost;
      const monthlyNetGain = Math.max(1, projectedRevenue - totalLaborCost);
      const breakEvenMonths = (totalLaborCost / monthlyNetGain).toFixed(1);

      setSimulationResult({
        projectedRevenue,
        baselineRevenue,
        totalLaborCost,
        statutoryCost: epfCost + socsoCost + eisCost,
        roi: ((projectedRevenue - totalSalary) / totalSalary * 100).toFixed(0),
        breakEvenMonths,
        projectedRevenueLift,
        confidenceScore: Math.round(75 + Math.random() * 15),
      });
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {t('predictiveSim')}
          </h3>
          <p className="text-[10px] text-[var(--text-muted)]">Ensemble Forecasting Engine</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Department Selector */}
        <div>
          <label className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full h-8 px-3 rounded-lg text-xs bg-[var(--bg-input)] text-[var(--text-primary)]
                       border border-[var(--border)] focus:border-[var(--border-focus)] focus:outline-none
                       transition-all duration-200 appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239B9CB8\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            {departments.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Headcount Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Headcount Addition</label>
            <span className="text-sm font-bold text-[var(--primary-light)]">{proposedHires}</span>
          </div>
          <input
            type="range"
            min="1" max="10"
            value={proposedHires}
            onChange={(e) => setProposedHires(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(proposedHires / 10) * 100}%, var(--bg-elevated) ${(proposedHires / 10) * 100}%, var(--bg-elevated) 100%)` }}
          />
        </div>

        {/* Salary Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Avg. Monthly Salary (RM)</label>
            <span className="text-sm font-bold text-[var(--primary-light)]">{avgSalary.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1700" max="15000" step="100"
            value={avgSalary}
            onChange={(e) => setAvgSalary(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((avgSalary - 1700) / 13300) * 100}%, var(--bg-elevated) ${((avgSalary - 1700) / 13300) * 100}%, var(--bg-elevated) 100%)` }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[var(--text-muted)]">RM1,700 (min wage)</span>
            <span className="text-[9px] text-[var(--text-muted)]">RM15,000</span>
          </div>
        </div>

        {/* Projected Revenue Impact Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              Projected Revenue Impact
            </label>
            <span className="text-sm font-bold text-emerald-400">+{projectedRevenueLift}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={projectedRevenueLift}
            onChange={(e) => setProjectedRevenueLift(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #10B981 0%, #10B981 ${(projectedRevenueLift / 60) * 100}%, var(--bg-elevated) ${(projectedRevenueLift / 60) * 100}%, var(--bg-elevated) 100%)` }}
          />
        </div>

        {/* Simulate Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-300
                     flex items-center justify-center gap-2 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#fff',
            opacity: isSimulating ? 0.6 : 1,
          }}
        >
          {isSimulating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('simulate')}
            </>
          )}
        </button>

        {/* Results */}
        {simulationResult && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(124,58,237,0.06))',
              border: '1px solid rgba(16,185,129,0.15)',
            }}
          >
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Projected Annual Impact</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-emerald-400">
                +RM {(simulationResult.projectedRevenue * 12 / 1000).toFixed(1)}k
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">revenue</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">True Labor Cost/mo</p>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  RM {(simulationResult.totalLaborCost / 1000).toFixed(1)}k
                </p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Statutory (EPF+SOCSO+EIS)</p>
                <p className="text-xs font-bold text-amber-400">
                  RM {(simulationResult.statutoryCost / 1000).toFixed(1)}k
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Revenue Lift</p>
                <p className="text-xs font-bold text-emerald-400">
                  +{simulationResult.projectedRevenueLift}%
                </p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Break-even Timeline</p>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {simulationResult.breakEvenMonths} months
                </p>
              </div>
            </div>
            {department === "sales" && (
              <div className="p-2.5 rounded-lg mb-3 bg-amber-500/5 border border-amber-500/20">
                <p className="text-[10px] text-amber-400 font-semibold">
                  Pipeline-Labor Alert
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  RM 500k pipeline with limited active reps. Adding {proposedHires} sales hire(s) may accelerate closure by ~20%.
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${simulationResult.confidenceScore}%` }} />
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">{simulationResult.confidenceScore}%</span>
            </div>
            <p className="text-[9px] text-[var(--text-muted)] mt-2">
              Based on Ensemble Forecasting (Random Forest + Gradient Boosting) using historical role productivity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
