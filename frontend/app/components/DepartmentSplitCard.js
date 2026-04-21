"use client";

/**
 * PeopleGraph — Department Split Card
 * Concentric circle chart displaying workforce distribution.
 */

export default function DepartmentSplitCard({ data }) {
  const departments = data?.items || [
    { department_name: "Technology", employee_count: 112, percentage: 45, color: "#7C3AED" },
    { department_name: "Sales", employee_count: 74, percentage: 30, color: "#A78BFA" },
    { department_name: "Operations", employee_count: 32, percentage: 13, color: "#C4B5FD" },
    { department_name: "Finance", employee_count: 18, percentage: 7, color: "#DDD6FE" },
    { department_name: "HR", employee_count: 12, percentage: 5, color: "#8B5CF6" },
  ];

  const total = data?.total || departments.reduce((s, d) => s + d.employee_count, 0);

  // Build SVG donut segments
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="card p-5">
      <h3 className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-wider mb-4">
        Department Split
      </h3>

      <div className="flex items-center gap-6">
        {/* Donut chart */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {departments.map((dept, i) => {
              const dashLength = (dept.percentage / 100) * circumference;
              const dashOffset = -(cumulativePercent / 100) * circumference;
              cumulativePercent += dept.percentage;

              return (
                <circle key={i} cx="70" cy="70" r={radius} fill="none"
                  stroke={dept.color} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-1000"
                  style={{ opacity: 0.9 }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[var(--text-primary)]">{total}</span>
            <span className="text-[10px] text-[var(--text-muted)]">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 min-w-0">
          {departments.map((dept) => (
            <div key={dept.department_name} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: dept.color }} />
                <span className="text-xs text-[var(--text-secondary)] truncate group-hover:text-[var(--text-primary)] transition-colors">
                  {dept.department_name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-[var(--text-primary)]">{dept.percentage}%</span>
                <span className="text-[10px] text-[var(--text-muted)]">{dept.employee_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
