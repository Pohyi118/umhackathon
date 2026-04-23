'use client';

/**
 * PeopleGraph — Statutory Compliance Shell
 * =========================================
 * Redesigned to mirror the statutory dashboard layout from the attached screenshots.
 */

import { useState } from 'react';

const statutoryRates = {
  epf_employee: 0.11,
  epf_employer_lte5k: 0.13,
  epf_employer_gt5k: 0.12,
  socso_employer: 0.0175,
  socso_employee: 0.005,
  socso_cap: 6000,
  eis_rate: 0.002,
  eis_cap: 6000,
  min_wage: 1700,
};

export default function StatutoryView() {
  const [salary, setSalary] = useState(3000);
  const [overtimeHours, setOvertimeHours] = useState(0);

  const epfEmployee = salary * statutoryRates.epf_employee;
  const epfEmployer = salary * (salary <= 5000 ? statutoryRates.epf_employer_lte5k : statutoryRates.epf_employer_gt5k);
  const socsoCap = Math.min(salary, statutoryRates.socso_cap);
  const socsoEmployer = socsoCap * statutoryRates.socso_employer;
  const socsoEmployee = socsoCap * statutoryRates.socso_employee;
  const eisCap = Math.min(salary, statutoryRates.eis_cap);
  const eisEmployer = eisCap * statutoryRates.eis_rate;
  const eisEmployee = eisCap * statutoryRates.eis_rate;

  const dailyWage = salary / 26;
  const hourlyWage = dailyWage / 8;
  const overtimePay = overtimeHours * hourlyWage * 1.5;
  const grossSalary = salary + overtimePay;
  const totalCashOutflow = grossSalary + epfEmployer + socsoEmployer + eisEmployer;

  const currentCashReserves = 85000;
  const currentMonthlyPayroll = Math.round(totalCashOutflow * 12.33);
  const currentRunway = (currentCashReserves / currentMonthlyPayroll).toFixed(1);
  const maxSafeHires = 4;
  const payrollChangePercent = ((currentMonthlyPayroll - 42500) / 42500 * 100).toFixed(1);
  const projectedRunway = (currentCashReserves / currentMonthlyPayroll).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card p-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)] mb-3">Current Cash Reserves</p>
          <p className="text-3xl font-bold text-white">RM {currentCashReserves.toLocaleString()}</p>
        </div>
        <div className="card p-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)] mb-3">Current Monthly Payroll</p>
          <p className="text-3xl font-bold text-white">RM {currentMonthlyPayroll.toLocaleString()}</p>
        </div>
        <div className="card p-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)] mb-3">Current Runway</p>
          <p className="text-3xl font-bold text-emerald-400">{currentRunway} Months</p>
        </div>
        <div className="card p-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)] mb-3">Max Safe Hires (This Profile)</p>
          <p className="text-3xl font-bold text-cyan-400">{maxSafeHires} Headcount</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">To maintain 1.5mo buffer</p>
        </div>
      </div>

      {/* Main grid: simulator + breakdown */}
      <div className="grid gap-5 lg:grid-cols-[1.75fr_1fr]">
        <div className="card p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Compensation Simulator</h2>
              <p className="text-sm text-[var(--text-muted)]">Adjust the package to see the true cost and cashflow impact.</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Gross Salary</p>
              <p className="text-2xl font-bold text-emerald-400">RM {grossSalary.toFixed(0)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Base Salary</p>
                  <p className="text-lg font-semibold text-white">RM {salary.toLocaleString()}</p>
                </div>
                <span className="text-sm font-bold text-[var(--primary-light)]">RM {salary.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1700"
                max="15000"
                step="100"
                value={salary}
                onChange={(e) => setSalary(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((salary - 1700) / 13300) * 100}%, var(--bg-elevated) ${((salary - 1700) / 13300) * 100}%, var(--bg-elevated) 100%)`,
                }}
              />
              <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
                <span>Min Wage: RM 1,700</span>
                <span>RM 15,000</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Monthly Overtime</p>
                  <p className="text-lg font-semibold text-white">{overtimeHours} Hours</p>
                </div>
                <span className="text-sm font-bold text-[var(--primary-light)]">{overtimeHours} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="104"
                step="1"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(overtimeHours / 104) * 100}%, var(--bg-elevated) ${(overtimeHours / 104) * 100}%, var(--bg-elevated) 100%)`,
                }}
              />
              <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
                <span>0 hrs</span>
                <span>104 hrs</span>
              </div>
              <p className="text-[10px] text-red-400">EA1955 Limit: 104 hrs</p>
            </div>
          </div>
        </div>

        <div className="card p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">True Employer Cost Breakdown</p>
            <p className="text-sm text-[var(--text-muted)]">Gross salary plus employer statutory contributions.</p>
          </div>

          <div className="space-y-4 bg-[var(--bg-elevated)] p-4 rounded-3xl border border-[var(--border)]">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[var(--text-muted)] uppercase">Gross Salary (Base + OT)</span>
              <span className="text-base font-semibold text-white">RM {grossSalary.toFixed(2)}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                <span>Employer EPF (13%)</span>
                <span className="text-amber-400">+ RM {epfEmployer.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                <span>Employer SOCSO (1.75% capped)</span>
                <span className="text-amber-400">+ RM {socsoEmployer.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[var(--text-muted)]">
                <span>Employer EIS (0.2% capped)</span>
                <span className="text-amber-400">+ RM {eisEmployer.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)]">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)] mb-2">Total Cash Outflow / MO</p>
            <p className="text-3xl font-bold text-white">RM {totalCashOutflow.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Cashflow impact row */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] mb-3">Cashflow Impact Simulation</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Projected salary impact on monthly payroll.</p>
          <div className="rounded-3xl bg-slate-950/80 p-5 border border-[var(--border)]">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)]">New Monthly Payroll</p>
            <p className="text-3xl font-bold text-white">RM {currentMonthlyPayroll.toLocaleString()}</p>
            <p className="text-sm text-emerald-400 mt-2">+{payrollChangePercent}%</p>
          </div>
        </div>

        <div className="card p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)] mb-3">Projected Runway</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Remaining runway after this compensation package.</p>
          <div className="rounded-3xl bg-slate-950/80 p-5 border border-[var(--border)]">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)]">Projected Runway</p>
            <p className="text-3xl font-bold text-emerald-400">{projectedRunway} Months</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">from {currentRunway}m</p>
          </div>
        </div>
      </div>

      {/* Upcoming Regulatory Trends */}
      <div className="card p-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center justify-between mb-5 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Upcoming Regulatory Trends</h2>
            <p className="text-sm text-[var(--text-muted)]">Monitor external statutory changes that will affect your future cashflow.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { date: 'Jul 2026', title: 'LHDN e-Invoicing Phase 4', desc: 'Mandatory compliance for businesses earning < RM1M', badge: 'UPCOMING', tone: 'amber' },
            { date: '2025', title: 'Multi-tier Foreign Worker Levy', desc: 'New levy mechanism increasing costs for foreign hires', badge: 'ACTIVE', tone: 'blue' },
            { date: '2024', title: 'SOCSO Cap to RM6,000', desc: 'Wage ceiling increased from RM4,000. Higher monthly deduction.', badge: 'ENFORCED', tone: 'emerald' },
            { date: '2023', title: 'Minimum Wage RM1,700', desc: 'Mandatory adjustment for all employers nationwide.', badge: 'ENFORCED', tone: 'emerald' },
          ].map((item, i) => (
            <div key={i} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center justify-between mb-3 gap-3">
                <span className="text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{item.date}</span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                  item.tone === 'amber' ? 'bg-amber-500/10 text-amber-300' :
                  item.tone === 'blue' ? 'bg-blue-500/10 text-blue-300' :
                  'bg-emerald-500/10 text-emerald-300'
                }`}>{item.badge}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
