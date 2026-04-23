"use client";

/**
 * PeopleGraph — Business Risk Widget
 * Replaces raw anomaly detector on the main dashboard.
 * Translates Isolation Forest scores into executive-friendly
 * risk warnings with actionable prompts.
 */

import { useState } from "react";

export default function BusinessRiskCard({ data }) {
  const [dismissed, setDismissed] = useState([]);

  const risks = data || [
    {
      id: 1,
      severity: "critical",
      title: "Critical Understaffing",
      description: "3 Warehouse staff on sudden leave. High risk of missing tomorrow's fulfillment deadlines.",
      department: "Operations",
      action: "Reallocate temp staff via Escrow",
      actionType: "reallocate",
    },
    {
      id: 2,
      severity: "warning",
      title: "Missing Data: Q3 Sales Report",
      description: "Q3 Sales Report overdue from the Sales Manager. Compliance deadline: 5 days.",
      department: "Sales",
      action: "Ping Manager on WhatsApp",
      actionType: "ping",
    },
    {
      id: 3,
      severity: "info",
      title: "OT Cap Breach",
      description: "2 employees in Warehouse exceeded 104h EA1955 monthly OT limit. Legal exposure risk.",
      department: "Operations",
      action: "Review OT logs",
      actionType: "review",
    },
  ];

  const severityConfig = {
    critical: { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", icon: "text-red-400", badge: "bg-red-500/10 text-red-400" },
    warning: { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)", icon: "text-amber-400", badge: "bg-amber-500/10 text-amber-400" },
    info: { bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.15)", icon: "text-blue-400", badge: "bg-blue-500/10 text-blue-400" },
  };

  const visibleRisks = risks.filter(r => !dismissed.includes(r.id));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #EF4444, #F87171)" }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Business Risk
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">{visibleRisks.length} active alert{visibleRisks.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {visibleRisks.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400">
            {risks.filter(r => r.severity === "critical" && !dismissed.includes(r.id)).length} critical
          </span>
        )}
      </div>

      {visibleRisks.length === 0 ? (
        <div className="py-6 text-center">
          <svg className="w-8 h-8 text-emerald-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-xs text-emerald-400 font-semibold">All Clear</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">No active business risks</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleRisks.map((risk) => {
            const cfg = severityConfig[risk.severity];
            return (
              <div
                key={risk.id}
                className="p-3 rounded-lg transition-all duration-200"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <svg className={`w-3.5 h-3.5 ${cfg.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                    </svg>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{risk.title}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${cfg.badge}`}>
                    {risk.department}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2">
                  {risk.description}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded-lg text-[9px] font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                  >
                    {risk.action}
                  </button>
                  <button
                    onClick={() => setDismissed(prev => [...prev, risk.id])}
                    className="px-3 py-1 rounded-lg text-[9px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
