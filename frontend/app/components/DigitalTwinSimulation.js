'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const DEPT_DATA = [
  {
    id: 'sales', name: 'Sales & Marketing', color: '#7C3AED', headcount: 4,
    employees: [
      { id: 'e1', name: 'Aiman', role: 'Sales Executive', salary: 3200, performance: 92, anomaly: null },
      { id: 'e2', name: 'Nurul', role: 'Sales Lead', salary: 4500, performance: 88, anomaly: null },
      { id: 'e3', name: 'Hafiz', role: 'Marketing Exec', salary: 3000, performance: 75, anomaly: 'Low output vs salary ratio' },
      { id: 'e4', name: 'Mei Ling', role: 'Digital Marketing', salary: 3800, performance: 95, anomaly: null },
    ],
  },
  {
    id: 'warehouse', name: 'Warehouse & Logistics', color: '#10B981', headcount: 5,
    employees: [
      { id: 'e5', name: 'Ahmad', role: 'Warehouse Lead', salary: 3500, performance: 85, anomaly: 'OT exceeds EA1955 104h cap' },
      { id: 'e6', name: 'Raju', role: 'Dispatch Driver', salary: 2800, performance: 90, anomaly: null },
      { id: 'e7', name: 'Siti', role: 'Inventory Clerk', salary: 2500, performance: 70, anomaly: 'Clock-in pattern anomaly' },
      { id: 'e8', name: 'Wei Ming', role: 'Packer', salary: 2200, performance: 82, anomaly: null },
      { id: 'e9', name: 'Kumar', role: 'Forklift Operator', salary: 2600, performance: 88, anomaly: null },
    ],
  },
  {
    id: 'admin', name: 'Admin & Finance', color: '#F59E0B', headcount: 3,
    employees: [
      { id: 'e10', name: 'Kak Yah', role: 'Admin Clerk', salary: 2800, performance: 65, anomaly: '30h/week on manual tracking — automate?' },
      { id: 'e11', name: 'Farah', role: 'Accounts Exec', salary: 3200, performance: 91, anomaly: null },
      { id: 'e12', name: 'Daniel', role: 'Finance Manager', salary: 5500, performance: 93, anomaly: null },
    ],
  },
  {
    id: 'support', name: 'Client Success', color: '#3B82F6', headcount: 2,
    employees: [
      { id: 'e13', name: 'Priya', role: 'CS Lead', salary: 3800, performance: 89, anomaly: null },
      { id: 'e14', name: 'Jason', role: 'Support Exec', salary: 2900, performance: 78, anomaly: 'High complaint escalation rate' },
    ],
  },
];

function getImpactAnalysis(employee, fromDept, toDept) {
  const analyses = {
    'e10-support': {
      title: 'Restructure: Kak Yah → Client Success',
      impact: '+RM15,000/month revenue unblocked',
      risk: 'medium',
      details: 'Kak Yah spends 30h/week on manual J&T tracking numbers. Automating this node and moving her to Client Success will unblock RM20k in delayed cash flow. Requires 2 weeks upskilling.',
      metrics: [
        { label: 'Admin backlog reduction', value: '-60%', positive: true },
        { label: 'CS response time', value: '-45%', positive: true },
        { label: 'Transition cost', value: 'RM2,400', positive: false },
      ],
    },
    'e3-warehouse': {
      title: 'Move: Hafiz → Warehouse Support',
      impact: '-RM1,200/month cost saving',
      risk: 'low',
      details: 'Hafiz has low marketing output (75 score). Moving him to warehouse support during peak season would better utilize his capacity. His marketing tasks can be absorbed by Mei Ling (95 score).',
      metrics: [
        { label: 'Marketing coverage', value: 'Maintained', positive: true },
        { label: 'Warehouse throughput', value: '+18%', positive: true },
        { label: 'Hafiz satisfaction risk', value: 'Monitor', positive: false },
      ],
    },
    'e7-admin': {
      title: 'Move: Siti → Admin Data Entry',
      impact: 'Neutral — addresses anomaly',
      risk: 'high',
      details: 'Siti has a clock-in pattern anomaly (08:59 daily for 30 days). Moving her to Admin where supervision is tighter may resolve the issue, but creates a warehouse gap.',
      metrics: [
        { label: 'Anomaly resolution', value: 'Likely', positive: true },
        { label: 'Warehouse gap', value: '-1 clerk', positive: false },
        { label: 'Hiring needed', value: 'Yes', positive: false },
      ],
    },
  };
  const key = `${employee.id}-${toDept.id}`;
  return analyses[key] || {
    title: `Move: ${employee.name} → ${toDept.name}`,
    impact: 'Analysis pending',
    risk: 'medium',
    details: `Moving ${employee.name} (${employee.role}, RM${employee.salary}/mo) from ${fromDept.name} to ${toDept.name}. This would reduce ${fromDept.name} headcount to ${fromDept.headcount - 1} and increase ${toDept.name} to ${toDept.headcount + 1}.`,
    metrics: [
      { label: `${fromDept.name} capacity`, value: `-${Math.round(100/fromDept.headcount)}%`, positive: false },
      { label: `${toDept.name} capacity`, value: `+${Math.round(100/(toDept.headcount+1))}%`, positive: true },
      { label: 'Statutory cost change', value: 'None', positive: true },
    ],
  };
}

function getTerminationAnalysis(employee, dept) {
  const dailyWage = employee.salary / 26;
  const severance = 15 * 3 * dailyWage; // assume 3 years, 15 days/year
  return {
    title: `Terminate: ${employee.name}`,
    impact: `-RM${employee.salary}/month saved`,
    risk: 'high',
    details: `Removing ${employee.name} from ${dept.name} saves RM${employee.salary}/month in salary + ~RM${Math.round(employee.salary * 0.16)} in statutory costs. EA1955 severance liability: RM${Math.round(severance)}.`,
    metrics: [
      { label: 'Monthly savings', value: `RM${employee.salary + Math.round(employee.salary * 0.16)}`, positive: true },
      { label: 'Severance payout', value: `RM${Math.round(severance)}`, positive: false },
      { label: `${dept.name} capacity`, value: `-${Math.round(100/dept.headcount)}%`, positive: false },
    ],
  };
}

export default function DigitalTwinSimulation() {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const [expandedDept, setExpandedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [departments, setDepartments] = useState(DEPT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  const initSimulation = useCallback(async () => {
    if (!canvasRef.current) return;
    const d3 = await import('d3');
    d3.select(canvasRef.current).selectAll('svg').remove();

    const rect = canvasRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = 420;

    const nodes = departments.map(d => ({
      ...d, radius: 28 + d.headcount * 4, type: 'dept',
    }));
    const links = [
      { source: 'sales', target: 'warehouse', value: 5 },
      { source: 'sales', target: 'support', value: 3 },
      { source: 'warehouse', target: 'admin', value: 2 },
      { source: 'admin', target: 'support', value: 2 },
    ];

    const svg = d3.select(canvasRef.current)
      .append('svg').attr('width', width).attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(160))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => d.radius + 15));

    simRef.current = simulation;

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', 'rgba(124,58,237,0.2)').attr('stroke-width', 2).attr('stroke-dasharray', '6,4');

    const node = svg.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e) => { if (!e.active) simulation.alphaTarget(0.3).restart(); e.subject.fx = e.subject.x; e.subject.fy = e.subject.y; })
        .on('drag', (e) => { e.subject.fx = e.x; e.subject.fy = e.y; })
        .on('end', (e) => { if (!e.active) simulation.alphaTarget(0); e.subject.fx = null; e.subject.fy = null; })
      );

    // Outer pulse ring
    node.append('circle').attr('r', d => d.radius + 8)
      .attr('fill', 'none').attr('stroke', d => d.color).attr('stroke-width', 1).attr('stroke-opacity', 0.15);

    // Main circle
    node.append('circle').attr('r', d => d.radius)
      .attr('fill', d => d.color).attr('fill-opacity', 0.12)
      .attr('stroke', d => d.color).attr('stroke-width', 2);

    // Inner dot
    node.append('circle').attr('r', d => d.radius * 0.35)
      .attr('fill', d => d.color).attr('fill-opacity', 0.5);

    // Headcount text
    node.append('text').text(d => d.headcount).attr('y', 4).attr('text-anchor', 'middle')
      .style('fill', '#fff').style('font-size', '13px').style('font-weight', '700').style('pointer-events', 'none');

    // Label
    node.append('text').text(d => d.name).attr('y', d => d.radius + 18).attr('text-anchor', 'middle')
      .style('fill', '#9B9CB8').style('font-size', '10px').style('font-weight', '600').style('pointer-events', 'none');

    // Anomaly badge
    node.each(function(d) {
      const anomalyCount = d.employees.filter(e => e.anomaly).length;
      if (anomalyCount > 0) {
        d3.select(this).append('circle').attr('cx', d.radius * 0.7).attr('cy', -d.radius * 0.7).attr('r', 8)
          .attr('fill', '#EF4444').attr('stroke', '#0B0D14').attr('stroke-width', 2);
        d3.select(this).append('text').attr('x', d.radius * 0.7).attr('y', -d.radius * 0.7 + 3.5)
          .attr('text-anchor', 'middle').text(anomalyCount)
          .style('fill', '#fff').style('font-size', '8px').style('font-weight', '800').style('pointer-events', 'none');
      }
    });

    // Click to expand
    node.on('click', (e, d) => {
      e.stopPropagation();
      setExpandedDept(prev => prev?.id === d.id ? null : d);
      setSelectedEmployee(null);
      setAnalysis(null);
    });

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    setIsLoaded(true);
    return () => simulation.stop();
  }, [departments]);

  useEffect(() => { initSimulation(); }, [initSimulation]);

  const handleMoveEmployee = (emp, toDept) => {
    const fromDept = departments.find(d => d.employees.some(e => e.id === emp.id));
    if (!fromDept || fromDept.id === toDept.id) return;
    setAnalysis(getImpactAnalysis(emp, fromDept, toDept));
    setActionType('move');
    setSelectedDept(toDept);
  };

  const handleTerminate = (emp) => {
    const dept = departments.find(d => d.employees.some(e => e.id === emp.id));
    if (!dept) return;
    setAnalysis(getTerminationAnalysis(emp, dept));
    setActionType('terminate');
  };

  const executeAction = () => {
    if (!selectedEmployee) return;
    if (actionType === 'move' && selectedDept) {
      setDepartments(prev => prev.map(d => {
        if (d.employees.some(e => e.id === selectedEmployee.id)) {
          return { ...d, headcount: d.headcount - 1, employees: d.employees.filter(e => e.id !== selectedEmployee.id) };
        }
        if (d.id === selectedDept.id) {
          return { ...d, headcount: d.headcount + 1, employees: [...d.employees, selectedEmployee] };
        }
        return d;
      }));
    } else if (actionType === 'terminate') {
      setDepartments(prev => prev.map(d => {
        if (d.employees.some(e => e.id === selectedEmployee.id)) {
          return { ...d, headcount: d.headcount - 1, employees: d.employees.filter(e => e.id !== selectedEmployee.id) };
        }
        return d;
      }));
    }
    setAnalysis(null);
    setSelectedEmployee(null);
    setExpandedDept(null);
    setActionType(null);
    setTimeout(() => initSimulation(), 100);
  };

  const riskColors = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' };

  return (
    <div className="card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Digital Twin Simulation
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">Click a department to expand employees • Drag nodes to reposition</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {departments.map(d => (
            <div key={d.id} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-[10px] text-[var(--text-muted)]">{d.name.split(' ')[0]} ({d.headcount})</span>
            </div>
          ))}
        </div>
      </div>

      {/* D3 Canvas */}
      <div ref={canvasRef} className="w-full rounded-xl relative overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)', minHeight: '420px' }}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Expanded Department Panel */}
      {expandedDept && (
        <div className="mt-4 p-4 rounded-xl animate-fadeInUp" style={{ background: 'var(--bg-card)', border: `1px solid ${expandedDept.color}33`, opacity: 1 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: expandedDept.color }} />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{expandedDept.name}</h4>
              <span className="text-[10px] text-[var(--text-muted)]">{expandedDept.employees.length} employees</span>
            </div>
            <button onClick={() => { setExpandedDept(null); setSelectedEmployee(null); setAnalysis(null); }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {expandedDept.employees.map(emp => {
              const isSelected = selectedEmployee?.id === emp.id;
              return (
                <button key={emp.id} onClick={() => { setSelectedEmployee(emp); setAnalysis(null); }}
                  className={`p-3 rounded-lg text-left transition-all duration-200 border ${
                    isSelected ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-focus)]'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{emp.name}</span>
                    {emp.anomaly && (
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title={emp.anomaly} />
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">{emp.role}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--text-secondary)]">RM{emp.salary.toLocaleString()}/mo</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1 bg-[var(--bg-card)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${emp.performance}%`,
                          background: emp.performance >= 85 ? '#10B981' : emp.performance >= 70 ? '#F59E0B' : '#EF4444',
                        }} />
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)]">{emp.performance}</span>
                    </div>
                  </div>
                  {emp.anomaly && (
                    <div className="mt-2 px-2 py-1 rounded text-[9px] text-red-400 bg-red-500/5 border border-red-500/10">
                      ⚠ {emp.anomaly}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee Action Panel */}
      {selectedEmployee && expandedDept && (
        <div className="mt-3 p-4 rounded-xl animate-fadeInUp" style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)', opacity: 1 }}>
          <p className="text-xs text-[var(--text-muted)] mb-2">
            What would you like to simulate for <span className="text-[var(--text-primary)] font-semibold">{selectedEmployee.name}</span>?
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Move to other departments */}
            {departments.filter(d => d.id !== expandedDept.id).map(d => (
              <button key={d.id} onClick={() => handleMoveEmployee(selectedEmployee, d)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 border border-[var(--border)] hover:border-[var(--border-focus)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                Move → {d.name.split('&')[0].trim()}
              </button>
            ))}
            <button onClick={() => handleTerminate(selectedEmployee)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all bg-red-500/5 border border-red-500/15 text-red-400 hover:bg-red-500/10">
              Simulate Termination
            </button>
          </div>
        </div>
      )}

      {/* Impact Analysis Panel */}
      {analysis && (
        <div className="mt-3 p-4 rounded-xl relative overflow-hidden animate-fadeInUp" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(16,185,129,0.04))',
          border: '1px solid rgba(124,58,237,0.15)', opacity: 1,
        }}>
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(124,58,237,0.08)' }} />
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{analysis.title}</h4>
            <span className={`text-[10px] font-bold uppercase ${riskColors[analysis.risk]}`}>
              {analysis.risk} risk
            </span>
          </div>
          <p className="text-sm font-bold text-emerald-400 mb-2">{analysis.impact}</p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">{analysis.details}</p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {analysis.metrics.map((m, i) => (
              <div key={i} className="p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                <p className="text-[9px] text-[var(--text-muted)] uppercase">{m.label}</p>
                <p className={`text-xs font-bold mt-0.5 ${m.positive ? 'text-emerald-400' : 'text-red-400'}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={executeAction}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
              Execute Restructuring
            </button>
            <button onClick={() => { setAnalysis(null); setActionType(null); }}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-elevated)]">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
