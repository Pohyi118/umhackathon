"use client";

/**
 * PeopleGraph — Financial Impact Top Row
 * Three executive-level metric cards showing the boss
 * the immediate financial picture of the workforce.
 */

import { useState, useEffect } from "react";

function formatRM(amount) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FinancialImpactRow() {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  const metrics = {
    revenue: 783400,
    laborCost: 186400,
    employerBurden: 215820,
    pipeline: 500000,
    upcomingDeductions: 42300,
  };

  const ler = (metrics.revenue / metrics.laborCost).toFixed(2);
  const netCashFlow = metrics.pipeline - metrics.upcomingDeductions - metrics.employerBurden;

  const cards = [
    {
      title: "Revenue vs. Labor Cost",
      subtitle: "Current Month",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      primary: formatRM(metrics.revenue),
      secondary: formatRM(metrics.laborCost),
      primaryLabel: "Revenue",
      secondaryLabel: "Labor Cost",
      accent: "emerald",
      ratio: ((metrics.laborCost / metrics.revenue) * 100).toFixed(1),
      ratioLabel: "labor ratio",
    },
    {
      title: "Labor Efficiency Ratio",
      subtitle: "RM earned per RM1 spent",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      primary: `RM ${ler}`,
      secondary: "4.20",
      primaryLabel: "Current LER",
      secondaryLabel: "Industry Avg",
      accent: "primary",
      badge: `${((ler / 4.2 - 1) * 100).toFixed(0)}% above avg`,
      badgePositive: true,
    },
    {
      title: "Cash Flow Impact",
      subtitle: "Upcoming 30 days",
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      primary: formatRM(netCashFlow),
      secondary: formatRM(metrics.upcomingDeductions),
      primaryLabel: "Net Position",
      secondaryLabel: "Upcoming Deductions",
      accent: netCashFlow > 0 ? "emerald" : "danger",
      items: [
        { label: "Sales Pipeline", value: formatRM(metrics.pipeline), color: "text-emerald-400" },
        { label: "Payroll Escrow", value: formatRM(metrics.employerBurden), color: "text-amber-400" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="card p-5 relative overflow-hidden transition-all duration-500"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(12px)",
            transitionDelay: `${i * 80}ms`,
          }}
        >
          {/* Glow accent */}
          <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl pointer-events-none"
            style={{
              background: card.accent === "emerald"
                ? "rgba(16, 185, 129, 0.1)"
                : card.accent === "danger"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(124, 58, 237, 0.1)",
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: card.accent === "emerald"
                    ? "linear-gradient(135deg, #10B981, #34D399)"
                    : card.accent === "danger"
                    ? "linear-gradient(135deg, #EF4444, #F87171)"
                    : "linear-gradient(135deg, #7C3AED, #A78BFA)",
                }}
              >
                {card.icon}
              </div>
              <div>
                <h3 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  {card.title}
                </h3>
                <p className="text-[9px] text-[var(--text-muted)]">{card.subtitle}</p>
              </div>
            </div>
            {card.badge && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                card.badgePositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {card.badge}
              </span>
            )}
          </div>

          {/* Primary metric */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className={`text-2xl font-bold ${
              card.accent === "emerald"
                ? "text-emerald-400"
                : card.accent === "danger"
                ? "text-red-400"
                : "text-[var(--text-primary)]"
            }`}>
              {card.primary}
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mb-3">{card.primaryLabel}</p>

          {/* Secondary / comparison */}
          <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)]">{card.secondary}</p>
              <p className="text-[9px] text-[var(--text-muted)]">{card.secondaryLabel}</p>
            </div>
            {card.ratio && (
              <div className="text-right">
                <p className="text-sm font-bold text-amber-400">{card.ratio}%</p>
                <p className="text-[9px] text-[var(--text-muted)]">{card.ratioLabel}</p>
              </div>
            )}
          </div>

          {/* Extra items (for Cash Flow card) */}
          {card.items && (
            <div className="flex gap-4 mt-2 pt-2 border-t border-[var(--border)]">
              {card.items.map((item, j) => (
                <div key={j}>
                  <p className="text-[9px] text-[var(--text-muted)]">{item.label}</p>
                  <p className={`text-xs font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
