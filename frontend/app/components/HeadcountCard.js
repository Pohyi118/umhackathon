"use client";

/**
 * PeopleGraph — Headcount & Location Card
 * Shows total active employees, growth %, and office/remote/hybrid split.
 */

export default function HeadcountCard({ data }) {
  const metrics = data || {
    total_active: 248,
    growth_percent: 4.2,
    office_count: 156,
    remote_count: 52,
    hybrid_count: 40,
    new_hires_this_month: 6,
  };

  const locationData = [
    { label: "Office", count: metrics.office_count, color: "#7C3AED", percent: Math.round((metrics.office_count / metrics.total_active) * 100) },
    { label: "Remote", count: metrics.remote_count, color: "#A78BFA", percent: Math.round((metrics.remote_count / metrics.total_active) * 100) },
    { label: "Hybrid", count: metrics.hybrid_count, color: "#C4B5FD", percent: Math.round((metrics.hybrid_count / metrics.total_active) * 100) },
  ];

  return (
    <div className="card p-5">
      <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">
        Headcount & Location
      </h3>

      {/* Total with growth badge */}
      <div className="flex items-baseline gap-3 mt-2 mb-4">
        <span className="text-3xl font-bold text-[var(--text-primary)]">{metrics.total_active}</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
          +{metrics.growth_percent}%
        </span>
      </div>

      {/* Location breakdown bar */}
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mb-3">
        {locationData.map((loc) => (
          <div key={loc.label} className="h-full rounded-full transition-all duration-500"
            style={{ width: `${loc.percent}%`, background: loc.color }} />
        ))}
      </div>

      {/* Location details */}
      <div className="space-y-2">
        {locationData.map((loc) => (
          <div key={loc.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: loc.color }} />
              <span className="text-xs text-[var(--text-secondary)]">{loc.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">{loc.count}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{loc.percent}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* New hires */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">New This Month</span>
        <span className="text-sm font-bold text-[var(--primary-light)]">+{metrics.new_hires_this_month}</span>
      </div>
    </div>
  );
}
