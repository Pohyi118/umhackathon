"use client";

/**
 * PeopleGraph — Finance Card Component
 * =====================================
 * Deep purple gradient backdrop showing:
 * - Next Payout date with countdown
 * - Payroll cycle progress bar
 * - Total payroll & employer cost
 * - Primary "Run Payroll" CTA
 *
 * This is the most prominent card on the Overview Dashboard,
 * designed to draw the SME owner's eye to the most critical
 * financial action item.
 */

import { useState, useEffect } from "react";

// ── Helpers ─────────────────────────────────────────────────────────
function formatRM(amount) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Component ───────────────────────────────────────────────────────
export default function FinanceCard({ data }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Default demo data if no API data provided
  const finance = data || {
    next_payout_date: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setDate(25);
      return d.toISOString().split("T")[0];
    })(),
    cycle_progress_percent: 68.5,
    total_payroll_rm: 186400,
    total_employer_cost_rm: 215820,
    employee_count: 248,
    last_run_status: "completed",
  };

  // Animate the progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(finance.cycle_progress_percent);
    }, 300);
    return () => clearTimeout(timer);
  }, [finance.cycle_progress_percent]);

  const daysLeft = daysUntil(finance.next_payout_date);
  const statusColor =
    finance.last_run_status === "completed"
      ? "text-emerald-400"
      : finance.last_run_status === "processing"
      ? "text-amber-400"
      : "text-gray-400";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-500 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background:
          "linear-gradient(135deg, #5B21B6 0%, #7C3AED 40%, #6D28D9 70%, #4C1D95 100%)",
        boxShadow: isHovered
          ? "0 8px 40px rgba(124, 58, 237, 0.4), 0 0 0 1px rgba(167, 139, 250, 0.2)"
          : "0 4px 24px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(167, 139, 250, 0.1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="150" cy="50" r="120" stroke="white" strokeWidth="0.5" />
          <circle cx="150" cy="50" r="80" stroke="white" strokeWidth="0.5" />
          <circle cx="150" cy="50" r="40" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Shimmer effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: isHovered ? "shimmer 2s linear infinite" : "none",
        }}
      />

      {/* ── Header Row ─────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Finance icon */}
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">
              Payroll Cycle
            </h3>
            <p className="text-white text-lg font-semibold">Finance</p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            finance.last_run_status === "completed"
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-amber-500/20 text-amber-300"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              finance.last_run_status === "completed"
                ? "bg-emerald-400"
                : "bg-amber-400 animate-pulse"
            }`}
          />
          {finance.last_run_status === "completed" ? "Up to date" : "Processing"}
        </div>
      </div>

      {/* ── Next Payout Section ────────────────────────────────── */}
      <div className="relative z-10 mb-5">
        <p className="text-white/50 text-xs mb-1">Next Payout</p>
        <div className="flex items-baseline gap-3">
          <span className="text-white text-2xl font-bold tracking-tight">
            {formatDate(finance.next_payout_date)}
          </span>
          <span className="text-violet-200/70 text-sm font-medium">
            {daysLeft} days left
          </span>
        </div>
      </div>

      {/* ── Progress Bar ───────────────────────────────────────── */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/50 text-xs">Cycle Progress</span>
          <span className="text-white text-sm font-semibold">
            {finance.cycle_progress_percent}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${animatedProgress}%`,
              background:
                "linear-gradient(90deg, #C4B5FD 0%, #F9FAFB 50%, #A78BFA 100%)",
              boxShadow: "0 0 12px rgba(196, 181, 253, 0.4)",
            }}
          />
        </div>
      </div>

      {/* ── Financial Summary ──────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
            Total Payroll
          </p>
          <p className="text-white text-base font-bold">
            {formatRM(finance.total_payroll_rm)}
          </p>
        </div>
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
            Employer Cost
          </p>
          <p className="text-white text-base font-bold">
            {formatRM(finance.total_employer_cost_rm)}
          </p>
        </div>
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
            Employees
          </p>
          <p className="text-white text-base font-bold">
            {finance.employee_count}
          </p>
        </div>
      </div>

      {/* ── Statutory Breakdown Mini-bar ───────────────────────── */}
      <div className="relative z-10 mb-6">
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">
          Statutory Split (Employer)
        </p>
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
          <div
            className="rounded-full"
            style={{ width: "55%", background: "#A78BFA" }}
            title="EPF (55%)"
          />
          <div
            className="rounded-full"
            style={{ width: "30%", background: "#C4B5FD" }}
            title="SOCSO (30%)"
          />
          <div
            className="rounded-full"
            style={{ width: "15%", background: "#DDD6FE" }}
            title="EIS (15%)"
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-white/30 text-[9px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
            EPF
          </span>
          <span className="text-white/30 text-[9px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD]" />
            SOCSO
          </span>
          <span className="text-white/30 text-[9px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DDD6FE]" />
            EIS
          </span>
        </div>
      </div>

      {/* ── Run Payroll CTA ────────────────────────────────────── */}
      <button
        className="relative z-10 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 
                   bg-white text-violet-900 hover:bg-violet-50 hover:shadow-lg hover:shadow-white/10
                   active:scale-[0.98] flex items-center justify-center gap-2"
        id="run-payroll-cta"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Run Payroll
      </button>
    </div>
  );
}
