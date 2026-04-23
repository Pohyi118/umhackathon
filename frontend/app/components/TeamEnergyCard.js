"use client";

/**
 * PeopleGraph — Team Energy Card
 * Sentiment analysis visualization: Energetic / Balanced / Muted
 * Derived from NLP analysis of pulse surveys.
 */

export default function TeamEnergyCard({ data }) {
  const energy = data || {
    energetic_percent: 45,
    balanced_percent: 38,
    muted_percent: 17,
    total_responses: 186,
    trend: "up",
  };

  const segments = [
    { label: "Energetic", percent: energy.energetic_percent, color: "#10B981", emoji: "⚡" },
    { label: "Balanced", percent: energy.balanced_percent, color: "#F59E0B", emoji: "🔄" },
    { label: "Muted", percent: energy.muted_percent, color: "#6366F1", emoji: "💤" },
  ];

  const trendIcon = energy.trend === "up" ? "↑" : energy.trend === "down" ? "↓" : "→";
  const trendColor = energy.trend === "up" ? "text-emerald-400" : energy.trend === "down" ? "text-red-400" : "text-[var(--text-muted)]";

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">
            Team Energy
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Weekly Pulse</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold ${trendColor}`}>{trendIcon}</span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {energy.total_responses} responses
          </span>
        </div>
      </div>

      {/* Segmented progress bars */}
      <div className="space-y-3">
        {segments.map((seg) => (
          <div key={seg.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{seg.emoji}</span>
                <span className="text-xs text-[var(--text-secondary)]">{seg.label}</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{seg.percent}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${seg.percent}%`,
                  background: seg.color,
                  boxShadow: `0 0 8px ${seg.color}33`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Combined energy bar */}
      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Overall Distribution</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {segments.map((seg) => (
            <div key={seg.label} className="rounded-full transition-all duration-500"
              style={{ width: `${seg.percent}%`, background: seg.color }} />
          ))}
        </div>
      </div>
    </div>
  );
}
