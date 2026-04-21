"use client";

/**
 * PeopleGraph — Attendance Heatmap Component
 * ============================================
 * A grid visualizing daily attendance rates across the organization.
 * - Darker purple = full/high attendance
 * - Lighter shades = lower attendance / absentee patterns
 * - Red accent = anomaly detected (Isolation Forest flagged)
 *
 * Grid layout: 7 columns (Mon-Sun) × N weeks
 * Each cell shows the day number and is color-coded by attendance %.
 */

import { useState, useMemo } from "react";

// ── Color scale: maps attendance % to purple intensity ──────────────
function getHeatmapColor(rate, hasAnomaly) {
  if (hasAnomaly) return { bg: "rgba(239, 68, 68, 0.3)", border: "#EF4444" };
  if (rate >= 98) return { bg: "rgba(124, 58, 237, 0.8)", border: "transparent" };
  if (rate >= 95) return { bg: "rgba(124, 58, 237, 0.6)", border: "transparent" };
  if (rate >= 90) return { bg: "rgba(124, 58, 237, 0.4)", border: "transparent" };
  if (rate >= 85) return { bg: "rgba(167, 139, 250, 0.3)", border: "transparent" };
  if (rate >= 80) return { bg: "rgba(196, 181, 253, 0.2)", border: "transparent" };
  if (rate > 0)  return { bg: "rgba(221, 214, 254, 0.15)", border: "transparent" };
  return { bg: "rgba(30, 32, 53, 0.5)", border: "transparent" }; // weekend/no data
}

// ── Generate demo heatmap data for 5 weeks ──────────────────────────
function generateDemoData() {
  const cells = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 34); // ~5 weeks back

  // Seed-based pseudo-random for consistent demo
  let seed = 42;
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isFuture = d > today;

    if (isWeekend || isFuture) {
      cells.push({
        date: d.toISOString().split("T")[0],
        day: d.getDate(),
        dayOfWeek: d.getDay(),
        attendance_rate: 0,
        total_present: 0,
        total_employees: 248,
        anomaly_count: 0,
        isWeekend,
        isFuture,
      });
    } else {
      const baseRate = 92 + seededRandom() * 8;
      const hasAnomaly = seededRandom() > 0.92;
      const rate = hasAnomaly ? 75 + seededRandom() * 10 : baseRate;
      const totalPresent = Math.round((rate / 100) * 248);

      cells.push({
        date: d.toISOString().split("T")[0],
        day: d.getDate(),
        dayOfWeek: d.getDay(),
        attendance_rate: Math.round(rate * 10) / 10,
        total_present: totalPresent,
        total_employees: 248,
        anomaly_count: hasAnomaly ? Math.ceil(seededRandom() * 3) : 0,
        isWeekend: false,
        isFuture: false,
      });
    }
  }
  return cells;
}

// ── Component ───────────────────────────────────────────────────────
export default function AttendanceHeatmap({ data }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const cells = useMemo(() => {
    if (data?.cells?.length) return data.cells;
    return generateDemoData();
  }, [data]);

  const overallRate = useMemo(() => {
    const workdays = cells.filter((c) => !c.isWeekend && !c.isFuture && c.attendance_rate > 0);
    if (!workdays.length) return 0;
    return Math.round((workdays.reduce((s, c) => s + c.attendance_rate, 0) / workdays.length) * 10) / 10;
  }, [cells]);

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Organize into weeks (rows)
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  function handleMouseEnter(cell, e) {
    if (cell.isWeekend || cell.isFuture) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCell(cell);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  }

  return (
    <div className="card p-5">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">
            Attendance
          </h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[var(--text-primary)] text-xl font-bold">
              {overallRate}%
            </span>
            <span className="text-emerald-400 text-xs font-medium">
              30-day avg
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[var(--text-muted)] text-[10px]">Low</span>
            <div className="flex gap-0.5">
              {[0.15, 0.25, 0.4, 0.6, 0.8].map((opacity, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: `rgba(124, 58, 237, ${opacity})` }}
                />
              ))}
            </div>
            <span className="text-[var(--text-muted)] text-[10px]">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: "rgba(239, 68, 68, 0.3)", border: "1px solid #EF4444" }}
            />
            <span className="text-[var(--text-muted)] text-[10px]">Alert</span>
          </div>
        </div>
      </div>

      {/* ── Day Labels ───────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {dayLabels.map((label, i) => (
          <div
            key={i}
            className="text-center text-[10px] text-[var(--text-muted)] font-medium"
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Heatmap Grid ─────────────────────────────────────── */}
      <div className="space-y-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((cell, ci) => {
              const colors = getHeatmapColor(
                cell.attendance_rate,
                cell.anomaly_count > 0
              );
              const isActive = !cell.isWeekend && !cell.isFuture;

              return (
                <div
                  key={ci}
                  className={`relative aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium transition-all duration-200 ${
                    isActive
                      ? "cursor-pointer hover:scale-110 hover:z-10"
                      : "opacity-30 cursor-default"
                  }`}
                  style={{
                    background: colors.bg,
                    border:
                      colors.border !== "transparent"
                        ? `1px solid ${colors.border}`
                        : "1px solid transparent",
                    color:
                      cell.attendance_rate >= 95
                        ? "rgba(255,255,255,0.9)"
                        : cell.attendance_rate >= 85
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.4)",
                  }}
                  onMouseEnter={(e) => handleMouseEnter(cell, e)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {cell.day}
                  {/* Anomaly dot indicator */}
                  {cell.anomaly_count > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Tooltip ──────────────────────────────────────────── */}
      {hoveredCell && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg text-xs pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <p className="text-[var(--text-primary)] font-semibold">
            {new Date(hoveredCell.date).toLocaleDateString("en-MY", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-[var(--text-secondary)] mt-0.5">
            {hoveredCell.attendance_rate}% attendance
          </p>
          <p className="text-[var(--text-muted)]">
            {hoveredCell.total_present}/{hoveredCell.total_employees} present
          </p>
          {hoveredCell.anomaly_count > 0 && (
            <p className="text-red-400 mt-0.5 font-medium">
              ⚠ {hoveredCell.anomaly_count} anomal{hoveredCell.anomaly_count > 1 ? "ies" : "y"} flagged
            </p>
          )}
        </div>
      )}

      {/* ── Summary Stats Row ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
        <div>
          <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
            Perfect Days
          </p>
          <p className="text-[var(--text-primary)] text-sm font-bold mt-0.5">
            {cells.filter((c) => c.attendance_rate >= 98 && !c.isWeekend).length}
          </p>
        </div>
        <div>
          <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
            Below 90%
          </p>
          <p className="text-amber-400 text-sm font-bold mt-0.5">
            {cells.filter((c) => c.attendance_rate > 0 && c.attendance_rate < 90).length}
          </p>
        </div>
        <div>
          <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">
            Anomalies
          </p>
          <p className="text-red-400 text-sm font-bold mt-0.5">
            {cells.reduce((s, c) => s + c.anomaly_count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
