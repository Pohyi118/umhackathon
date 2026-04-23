"use client";

/**
 * PeopleGraph — Operational Health Card
 * Replaces granular Attendance Heatmap with a high-level
 * executive summary of workforce operational status.
 */

import { useState } from "react";

export default function OperationalHealthCard({ data }) {
  const [expanded, setExpanded] = useState(false);

  const health = data || {
    overall_score: 87,
    attendance_rate: 94.2,
    active_risks: 2,
    coverage_gaps: 1,
    departments: [
      { name: "Technology", status: "healthy", attendance: 96, staff_present: 108, staff_total: 112, risk: null },
      { name: "Sales", status: "healthy", attendance: 93, staff_present: 69, staff_total: 74, risk: null },
      { name: "Operations", status: "warning", attendance: 82, staff_present: 26, staff_total: 32, risk: "3 warehouse staff on sudden leave" },
      { name: "Finance", status: "healthy", attendance: 95, staff_present: 17, staff_total: 18, risk: null },
      { name: "HR", status: "healthy", attendance: 100, staff_present: 12, staff_total: 12, risk: null },
    ],
  };

  const statusConfig = {
    healthy: { color: "#10B981", bg: "rgba(16,185,129,0.08)", label: "Healthy" },
    warning: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "At Risk" },
    critical: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Critical" },
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">
            Operational Health
          </h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[var(--text-primary)] text-xl font-bold">
              {health.overall_score}%
            </span>
            <span className={`text-xs font-medium ${
              health.active_risks > 0 ? "text-amber-400" : "text-emerald-400"
            }`}>
              {health.active_risks > 0 ? `${health.active_risks} risk${health.active_risks > 1 ? "s" : ""}` : "All clear"}
            </span>
          </div>
        </div>

        {/* Health indicator ring */}
        <div className="relative w-12 h-12">
          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
            <circle cx="18" cy="18" r="14" fill="none"
              stroke={health.overall_score >= 85 ? "#10B981" : health.overall_score >= 70 ? "#F59E0B" : "#EF4444"}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(health.overall_score / 100) * 88} 88`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-[var(--text-primary)]">
              {health.attendance_rate}%
            </span>
          </div>
        </div>
      </div>

      {/* Department health bars */}
      <div className="space-y-2.5">
        {health.departments.map((dept) => {
          const cfg = statusConfig[dept.status];
          return (
            <div key={dept.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-xs text-[var(--text-secondary)]">{dept.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {dept.staff_present}/{dept.staff_total}
                  </span>
                  <span className="text-xs font-bold" style={{ color: cfg.color }}>
                    {dept.attendance}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${dept.attendance}%`,
                    background: cfg.color,
                    boxShadow: dept.status === "warning" ? `0 0 8px ${cfg.color}33` : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk alert */}
      {health.active_risks > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border)]">
          <div
            className="p-3 rounded-lg"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}
          >
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-400">Coverage Gap Detected</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  {health.departments.find(d => d.risk)?.risk || "Understaffing risk in key departments"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
