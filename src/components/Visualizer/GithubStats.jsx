import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const LANGUAGE_DATA = [
  { name: 'JavaScript', value: 45, color: '#f7df1e' },
  { name: 'React / JSX', value: 35, color: '#61dafb' },
  { name: 'CSS / Tailwind', value: 12, color: '#38b2ac' },
  { name: 'Node / Express', value: 8, color: '#44883e' }
];

// Generate simple mock GitHub contribution commits blocks for terminal grid
const CONTRIBUTION_GRID = Array.from({ length: 90 }, () => {
  const levels = [0, 0, 1, 1, 2, 2, 3, 4]; // weights for color levels
  return levels[Math.floor(Math.random() * levels.length)];
});

function GithubStats() {
  const getContributionColor = (level) => {
    switch (level) {
      case 1: return 'bg-[rgba(102,252,241,0.25)]';
      case 2: return 'bg-[rgba(102,252,241,0.5)]';
      case 3: return 'bg-[rgba(102,252,241,0.75)]';
      case 4: return 'bg-[var(--primary-color)] glow-border';
      default: return 'bg-[rgba(255,255,255,0.04)]';
    }
  };

  return (
    <div className="glass-panel p-5 glow-border bg-[rgba(0,0,0,0.25)] flex flex-col space-y-4">
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
        <h3 className="font-outfit text-sm font-semibold tracking-wider text-[var(--primary-color)] flex items-center gap-2 select-none">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GITHUB CODESYNC REPORT
        </h3>
        <span className="font-fira text-[10px] text-[var(--text-secondary)] select-none">
          visitor@pulse:~# fetch git
        </span>
      </div>

      {/* Code language distribution analytics charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Recharts Pie Chart panel */}
        <div className="h-[140px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={LANGUAGE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {LANGUAGE_DATA.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--panel-bg)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-fira)',
                  fontSize: '11px',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend table indicators */}
        <div className="flex flex-col space-y-1.5 justify-center">
          {LANGUAGE_DATA.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-fira select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[var(--text-primary)]">{entry.name}</span>
              </span>
              <span className="text-[var(--text-secondary)] font-semibold">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contributions grid metrics display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-fira text-[var(--text-secondary)] select-none">
          <span>90-DAY ACTIVITY STREAM</span>
          <span>432 Commits</span>
        </div>
        <div className="grid grid-flow-col grid-rows-6 gap-[3px] p-2 bg-[rgba(0,0,0,0.2)] rounded border border-[var(--border-color)] overflow-x-hidden">
          {CONTRIBUTION_GRID.map((level, idx) => (
            <div 
              key={idx}
              className={`w-[6px] h-[6px] rounded-[1px] transition-all duration-300 hover:scale-125 ${getContributionColor(level)}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 text-[9px] font-fira text-[var(--text-secondary)] select-none">
          <span>Less</span>
          <span className="w-2 h-2 rounded-[1px] bg-[rgba(255,255,255,0.04)]" />
          <span className="w-2 h-2 rounded-[1px] bg-[rgba(102,252,241,0.25)]" />
          <span className="w-2 h-2 rounded-[1px] bg-[rgba(102,252,241,0.5)]" />
          <span className="w-2 h-2 rounded-[1px] bg-[rgba(102,252,241,0.75)]" />
          <span className="w-2 h-2 rounded-[1px] bg-[var(--primary-color)]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default GithubStats;
