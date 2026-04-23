'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../../lib/api';

const BASE_DEPTS = [
  { id: 'sales', name: 'Sales & Marketing', color: '#8B5CF6', headcount: 4 },
  { id: 'warehouse', name: 'Warehouse & Logistics', color: '#10B981', headcount: 5 },
  { id: 'admin', name: 'Admin & Finance', color: '#F59E0B', headcount: 3 },
  { id: 'support', name: 'Client Success', color: '#3B82F6', headcount: 2 },
];

const MULTIPLIER = {
  sales: 0.12,
  warehouse: 0.18,
  admin: 0.05,
  support: 0.08,
};

export default function DigitalTwinSimulation() {
  const canvasRef = useRef(null);
  const [selectedDept, setSelectedDept] = useState('sales');
  const [headcountAddition, setHeadcountAddition] = useState(1);
  const [avgSalary, setAvgSalary] = useState(5000);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // API integration states
  const [dashboardData, setDashboardData] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getDashboardOverview();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Using mock data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const isDominoWarning = selectedDept === 'sales' && headcountAddition >= 1 && !isOptimized;

  const projectedCostIncrease = useMemo(() => {
    const base = headcountAddition * avgSalary;
    return Math.round(base * 1.16);
  }, [headcountAddition, avgSalary]);

  const projectedRevenueImpact = useMemo(() => {
    if (isOptimized && simulationResult) {
      // Use real API result
      const increase = simulationResult.projected_revenue_increase_rm;
      return {
        label: `+RM ${increase.toLocaleString()} (${Math.round(simulationResult.confidence_score * 100)}% confidence)`,
        tone: 'green'
      };
    }
    if (isOptimized) {
      return { label: '+30% (Raya Peak Secured)', tone: 'green' };
    }
    if (isDominoWarning) {
      return { label: '+5% (Capped)', tone: 'red' };
    }
    const pct = Math.max(2, Math.round(headcountAddition * (MULTIPLIER[selectedDept] || 0.08) * 100));
    return { label: `+${pct}%`, tone: 'green' };
  }, [headcountAddition, isDominoWarning, isOptimized, selectedDept, simulationResult]);

  const banner = isOptimized
    ? {
        text: 'BOTTLENECK CLEARED: Logistics capacity matched to historical Raya peak sales volume.',
        tone: 'success',
        icon: '✅',
      }
    : isDominoWarning
    ? {
        text: 'WARNING: Added sales capacity exceeds current warehouse limits. Projected 4-day fulfillment lag and increased refund rate.',
        tone: 'danger',
        icon: '🚨',
      }
    : null;

  const nodeTone = useMemo(() => {
    if (isOptimized) {
      return {
        sales: 'normal',
        warehouse: 'healthyPulse',
        admin: 'normal',
        support: 'normal',
      };
    }
    if (isDominoWarning) {
      return {
        sales: 'salesBoost',
        warehouse: 'bottleneckPulse',
        admin: 'normal',
        support: 'normal',
      };
    }
    return { sales: 'normal', warehouse: 'normal', admin: 'normal', support: 'normal' };
  }, [isDominoWarning, isOptimized]);

  const inspectorData = useMemo(() => {
    if (!selectedNode || !dashboardData) return null;

    // Use real department data from dashboard API
    const deptData = dashboardData.department_split?.items?.find(dept =>
      dept.department_name.toLowerCase().includes(selectedNode.toLowerCase())
    );

    const deptMap = {
      sales: {
        title: 'Sales & Marketing',
        headcount: deptData?.employee_count || 4,
        productivity: 88,
        revenue: deptData?.revenue_rm || 245000,
        status: 'PERFORMING',
        insight: 'Strong revenue driver. Limited by warehouse capacity during peak seasons.',
      },
      warehouse: {
        title: 'Warehouse & Logistics',
        headcount: deptData?.employee_count || 5,
        productivity: 74,
        revenue: 0,
        status: 'CRITICAL BOTTLENECK',
        insight: 'Fulfillment capped at 82%. Short 3 heads for Raya peak volume.',
      },
      admin: {
        title: 'Admin & Finance',
        headcount: deptData?.employee_count || 3,
        productivity: 92,
        revenue: 0,
        status: 'OPTIMAL',
        insight: 'Highest productivity. Supports operational efficiency.',
      },
      support: {
        title: 'Client Success',
        headcount: deptData?.employee_count || 2,
        productivity: 85,
        revenue: deptData?.revenue_rm || 42000,
        status: 'HEALTHY',
        insight: 'Strong retention driver. Generating upsell revenue.',
      },
    };

    const data = deptMap[selectedNode];
    if (!data) return null;

    return {
      title: data.title,
      headcount: data.headcount,
      productivity: data.productivity,
      revenue: data.revenue,
      status: data.status,
      insight: data.insight,
    };
  }, [selectedNode, dashboardData]);

  const renderSimulation = useCallback(async () => {
    if (!canvasRef.current) return;

    const d3 = await import('d3');
    d3.select(canvasRef.current).selectAll('svg').remove();

    const rect = canvasRef.current.getBoundingClientRect();
    const width = rect.width || 700;
    const height = 500;

    const nodes = BASE_DEPTS.map((d) => ({
      ...d,
      radius: 30 + (d.headcount + (d.id === selectedDept ? headcountAddition : 0)) * 3.2,
    }));

    const links = [
      { source: 'sales', target: 'warehouse' },
      { source: 'sales', target: 'support' },
      { source: 'warehouse', target: 'admin' },
      { source: 'admin', target: 'support' },
    ];

    const svg = d3.select(canvasRef.current).append('svg').attr('width', width).attr('height', height);

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(165))
      .force('charge', d3.forceManyBody().strength(-550))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d) => d.radius + 20));

    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(139,92,246,0.26)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '7 5');

    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d.id);
      })
      .call(
        d3
          .drag()
          .on('start', (e) => {
            if (!e.active) simulation.alphaTarget(0.25).restart();
            e.subject.fx = e.subject.x;
            e.subject.fy = e.subject.y;
          })
          .on('drag', (e) => {
            e.subject.fx = e.x;
            e.subject.fy = e.y;
          })
          .on('end', (e) => {
            if (!e.active) simulation.alphaTarget(0);
            e.subject.fx = null;
            e.subject.fy = null;
          })
      );

    node
      .append('circle')
      .attr('class', 'ring')
      .attr('r', (d) => d.radius + 10)
      .attr('fill', 'none')
      .attr('stroke-width', 2.8)
      .attr('stroke-opacity', 0.85)
      .attr('stroke', (d) => {
        const mode = nodeTone[d.id];
        if (mode === 'bottleneckPulse') return '#ef4444';
        if (mode === 'healthyPulse') return '#10b981';
        if (mode === 'salesBoost') return '#10b981';
        return d.color;
      });

    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.14)
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2.2);

    node
      .append('circle')
      .attr('r', (d) => d.radius * 0.36)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.62);

    node
      .append('text')
      .text((d) => d.id === selectedDept ? d.headcount + headcountAddition : d.headcount)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .style('font-size', '13px')
      .style('font-weight', '700')
      .style('pointer-events', 'none');

    node
      .append('text')
      .text((d) => d.name)
      .attr('y', (d) => d.radius + 18)
      .attr('text-anchor', 'middle')
      .style('fill', '#a8acc4')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    let frame = 0;
    const pulse = () => {
      frame += 1;
      const factor = 0.78 + (Math.sin(frame / 8) + 1) * 0.12;
      node.selectAll('circle.ring').attr('stroke-opacity', (d) => {
        const mode = nodeTone[d.id];
        if (mode === 'bottleneckPulse' || mode === 'healthyPulse') return factor;
        return 0.45;
      });
      if (canvasRef.current) requestAnimationFrame(pulse);
    };
    requestAnimationFrame(pulse);

    setIsLoaded(true);
    return () => simulation.stop();
  }, [headcountAddition, nodeTone, selectedDept]);

  useEffect(() => {
    renderSimulation();
  }, [renderSimulation]);

  const handleOptimize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare proposed hires data for simulation
      const proposedHires = [{
        role_title: 'Warehouse Associate',
        salary: avgSalary,
        automation_potential: 0.3,
        department: 'warehouse'
      }];

      const result = await apiClient.simulateRevenueImpact(proposedHires);
      setSimulationResult(result);

      setIsOptimized(true);
      setSelectedDept('warehouse');
      setHeadcountAddition(2);
    } catch (err) {
      console.error('Simulation failed:', err);
      setError('AI optimization simulation failed. Using fallback logic.');
      // Fallback to original behavior
      setIsOptimized(true);
      setSelectedDept('warehouse');
      setHeadcountAddition(2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualChange = (setter) => (value) => {
    setIsOptimized(false);
    setter(value);
  };

  return (
    <div className="w-full space-y-6">
      {/* Page Title */}
      <div className="px-6">
        <h1 className="text-3xl font-bold text-white">Digital Twin Command Center</h1>
        <p className="text-slate-400 mt-1">Real-time organizational bottleneck analysis & impact simulation</p>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-400 text-sm">Running AI simulation...</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Graph Section - Full Width */}
      <div className="bg-slate-900 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_65%)]" />
        {banner && (
          <div
            className={`absolute z-10 top-4 left-4 right-4 rounded-xl px-4 py-3 border text-sm font-medium transition-all duration-400 ${
              banner.tone === 'danger'
                ? 'bg-red-500/15 border-red-400/35 text-red-200'
                : 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
            }`}
          >
            <span className="font-semibold mr-2">{banner.icon}</span>
            {banner.text}
          </div>
        )}
        <div
          ref={canvasRef}
          className="w-full rounded-xl border border-dashed border-white/10 h-[550px] relative transition-all duration-500"
          style={{ background: 'rgba(15, 23, 42, 0.45)' }}
        >
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {/* Inspector Tooltip Card */}
        {inspectorData && (
          <div className="absolute top-20 right-6 bg-slate-800/95 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-lg z-20 max-w-sm space-y-4">
            <div>
              <h4 className="text-white font-bold text-lg">{inspectorData.title}</h4>
              <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${
                inspectorData.status === 'CRITICAL BOTTLENECK' ? 'text-red-400' : 
                inspectorData.status === 'OPTIMAL' ? 'text-emerald-400' :
                inspectorData.status === 'HEALTHY' ? 'text-emerald-400' :
                'text-purple-400'
              }`}>
                {inspectorData.status}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Headcount</p>
                <p className="text-2xl font-bold text-white">{inspectorData.headcount}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Productivity</p>
                <p className="text-2xl font-bold text-blue-400">{inspectorData.productivity}%</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Revenue</p>
                <p className="text-lg font-bold text-emerald-400">
                  {inspectorData.revenue > 0 ? `RM ${(inspectorData.revenue / 1000).toFixed(0)}K` : '—'}
                </p>
              </div>
            </div>

            {/* Insight */}
            <p className="text-sm text-slate-300 border-t border-white/10 pt-3">{inspectorData.insight}</p>
          </div>
        )}
      </div>

      {/* Bottom Command Console */}
      <div className="bg-white/5 border border-white/10 rounded-xl backdrop-blur-md p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Section: Controls */}
          <div className="col-span-3 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => handleManualChange(setSelectedDept)(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-white/10 text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                {BASE_DEPTS.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Headcount: <span className="text-white">{headcountAddition}</span>
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={headcountAddition}
                onChange={(e) => handleManualChange(setHeadcountAddition)(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Avg Salary: <span className="text-white">RM {avgSalary.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="2000"
                max="12000"
                step="500"
                value={avgSalary}
                onChange={(e) => handleManualChange(setAvgSalary)(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Middle Section: Projected Revenue Impact Metric */}
          <div className="col-span-5 flex flex-col justify-center items-center p-6 bg-slate-800/40 rounded-lg border border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Projected Revenue Impact</p>
            <p className={`text-5xl font-bold ${projectedRevenueImpact.tone === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>
              {projectedRevenueImpact.label}
            </p>
            <p className="text-xs text-slate-400 mt-2">Monthly increase from headcount optimization</p>
          </div>

          {/* Right Section: Action Buttons */}
          <div className="col-span-4 flex flex-col justify-center gap-3">
            <button
              onClick={handleOptimize}
              disabled={isLoading}
              className="px-4 py-3 rounded-lg text-sm font-semibold border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  ✨ AI Optimize Allocation
                </>
              )}
            </button>
            <button
              onClick={() => setIsOptimized(false)}
              className="px-4 py-3 rounded-lg text-sm font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-colors"
            >
              Simulate Impact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
