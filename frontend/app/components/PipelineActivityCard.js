"use client";

/**
 * PeopleGraph — Pipeline Activity Card
 * Mini Kanban-style board tracking average hire time
 * and highlighting high-priority roles waiting for review.
 */

export default function PipelineActivityCard({ data }) {
  const pipeline = data || {
    avg_hire_time_days: 23.5,
    open_positions: 7,
    roles: [
      { role_title: "Senior Frontend Engineer", department: "Tech", days_open: 12, priority: "high", candidates_count: 8 },
      { role_title: "Operations Manager", department: "Operations", days_open: 25, priority: "high", candidates_count: 3 },
      { role_title: "Sales Executive", department: "Sales", days_open: 8, priority: "medium", candidates_count: 15 },
    ],
  };

  const priorityStyles = {
    high: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    low: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider">
          Pipeline Activity
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-light)] font-medium">
          {pipeline.open_positions} open
        </span>
      </div>

      {/* Avg hire time metric */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {pipeline.avg_hire_time_days}
        </span>
        <span className="text-xs text-[var(--text-muted)]">avg days to hire</span>
      </div>

      {/* Role cards */}
      <div className="space-y-2">
        {pipeline.roles.map((role, i) => {
          const styles = priorityStyles[role.priority] || priorityStyles.medium;
          return (
            <div
              key={i}
              className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] 
                         hover:border-[var(--border-focus)] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary-light)] transition-colors">
                    {role.role_title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{role.department}</p>
                </div>
                <span className={`flex-shrink-0 ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${styles.bg} ${styles.text}`}>
                  {role.priority}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[10px] text-[var(--text-muted)]">
                  <span className="text-[var(--text-secondary)] font-medium">{role.days_open}</span> days open
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  <span className="text-[var(--text-secondary)] font-medium">{role.candidates_count}</span> candidates
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
