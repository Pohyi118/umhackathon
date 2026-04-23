"use client";

/**
 * PeopleGraph — Dashboard Header
 * Global navigation bar with search, notifications, new entry CTA,
 * and profile management.
 */

import { useState } from "react";

export default function DashboardHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, text: "3 pending EPF approvals require your attention", type: "warning", time: "2h ago" },
    { id: 2, text: "Payroll cycle for April 2025 is 68% complete", type: "info", time: "5h ago" },
    { id: 3, text: "Anomaly detected: Warehouse OT exceeds EA1955 limit", type: "danger", time: "1d ago" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full" style={{
      background: "rgba(11, 13, 20, 0.8)",
      backdropFilter: "blur(20px) saturate(180%)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* ── Logo ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            People<span className="text-[var(--primary)]">Graph</span>
          </span>
        </div>

        {/* ── Search Bar ───────────────────────────────────────── */}
        <div className={`relative w-80 transition-all duration-300 ${searchFocused ? "w-96" : ""}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Ask the Data: Why is labor cost high this month?"
            className="w-full h-9 pl-9 pr-4 rounded-lg text-sm bg-[var(--bg-input)] text-[var(--text-primary)] 
                       placeholder:text-[var(--text-muted)] border border-[var(--border)] 
                       focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30
                       transition-all duration-200"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            id="global-search"
          />
        </div>

        {/* ── Right Actions ────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* New Entry CTA */}
          <button
            className="h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-2 
                       bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] 
                       transition-all duration-200 active:scale-[0.97]"
            id="new-entry-cta"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative w-9 h-9 rounded-lg flex items-center justify-center 
                         bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--border-focus)]
                         transition-all duration-200"
              onClick={() => setNotifOpen(!notifOpen)}
              id="notifications-btn"
            >
              <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white font-bold flex items-center justify-center">
                {notifications.length}
              </span>
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                }}>
                <div className="p-3 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Notifications</p>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        n.type === "warning" ? "bg-amber-400" : n.type === "danger" ? "bg-red-400" : "bg-blue-400"
                      }`} />
                      <div>
                        <p className="text-xs text-[var(--text-primary)]">{n.text}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
              DD
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-[var(--text-primary)] leading-tight">Danial Diro</p>
              <p className="text-[10px] text-[var(--text-muted)]">Owner</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
