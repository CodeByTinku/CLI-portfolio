import React from 'react';

const THEMES = [
  { id: 'dracula', name: 'Dracula', color: 'bg-[#cba6f7] border-[#cba6f7]' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-[#66fcf1] border-[#66fcf1]' },
  { id: 'matrix', name: 'Matrix', color: 'bg-[#00ff41] border-[#00ff41]' },
  { id: 'retro', name: 'Retro IBM', color: 'bg-[#ffb000] border-[#ffb000]' }
];

function ThemeSelector({ activeTheme, onSelectTheme, isToxicUnlocked }) {
  const availableThemes = [
    ...THEMES,
    ...(isToxicUnlocked ? [{ id: 'toxic', name: 'Toxic Neon', color: 'bg-[#39ff14] border-[#39ff14]' }] : [])
  ];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[rgba(0,0,0,0.3)] shadow-inner">
      <span className="text-[10px] font-fira tracking-widest text-[var(--text-secondary)] select-none">
        ACTIVE_ENV:
      </span>
      <div className="flex items-center gap-1.5">
        {availableThemes.map(theme => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-fira font-semibold uppercase transition-all duration-300 border hover:scale-105 active:scale-95 ${
                isActive 
                  ? `${theme.color} text-black font-bold shadow-md`
                  : 'bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.06)] hover:border-[var(--border-color)]'
              }`}
            >
              {theme.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeSelector;
