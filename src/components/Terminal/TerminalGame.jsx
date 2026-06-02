import React, { useState, useEffect, useCallback } from 'react';
import SnakeGame from './SnakeGame';
import DevInvaders from './DevInvaders';

function TerminalGame({ onExit, soundEnabled, defaultGame }) {
  const [selectedGameIdx, setSelectedGameIdx] = useState(() => {
    if (defaultGame === 'invaders') return 1;
    return 0;
  }); // 0 = Snake, 1 = DevInvaders
  const [activeGame, setActiveGame] = useState(() => {
    if (defaultGame === 'snake') return 'snake';
    if (defaultGame === 'invaders') return 'invaders';
    return null; // null = menu, 'snake' = SnakeGame, 'invaders' = DevInvaders
  });

  // Sound sweep on navigation
  const playSelectSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio context failure fallback
    }
  }, [soundEnabled]);

  // Handle key triggers for selection menu
  useEffect(() => {
    if (activeGame !== null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExit(0);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedGameIdx(prev => {
          const next = prev === 0 ? 1 : 0;
          playSelectSound('hover');
          return next;
        });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedGameIdx(prev => {
          const next = prev === 1 ? 0 : 1;
          playSelectSound('hover');
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playSelectSound('select');
        if (selectedGameIdx === 0) {
          setActiveGame('snake');
        } else {
          setActiveGame('invaders');
        }
      } else if (e.key === '1') {
        setSelectedGameIdx(0);
        playSelectSound('select');
        setActiveGame('snake');
      } else if (e.key === '2') {
        setSelectedGameIdx(1);
        playSelectSound('select');
        setActiveGame('invaders');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, selectedGameIdx, onExit, playSelectSound]);

  // Exit back to menu
  const handleExitGame = (finalScore) => {
    setActiveGame(null);
    onExit(finalScore);
  };

  // Render individual active games
  if (activeGame === 'snake') {
    return (
      <div className="flex-1 flex flex-col justify-between p-5 font-fira select-none text-[var(--text-primary)]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
            <h2 className="font-bold text-sm tracking-widest uppercase text-[var(--primary-color)]">
              🕹️ DEVPULSE ARCADE: SNAKE.OS
            </h2>
          </div>
          <button 
            onClick={() => handleExitGame(0)}
            className="text-xs text-[var(--accent-color)] hover:underline border border-[var(--border-color)] px-2 py-0.5 rounded transition-all bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,0,0,0.1)] cursor-pointer"
          >
            [ESC] RETURN
          </button>
        </div>
        <SnakeGame onExit={handleExitGame} soundEnabled={soundEnabled} />
      </div>
    );
  }

  if (activeGame === 'invaders') {
    return (
      <div className="flex-1 flex flex-col justify-between p-5 font-fira select-none text-[var(--text-primary)]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
            <h2 className="font-bold text-sm tracking-widest uppercase text-[var(--accent-color)]">
              🕹️ DEVPULSE ARCADE: DEV_INVADERS
            </h2>
          </div>
          <button 
            onClick={() => handleExitGame(0)}
            className="text-xs text-[var(--accent-color)] hover:underline border border-[var(--border-color)] px-2 py-0.5 rounded transition-all bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,0,0,0.1)] cursor-pointer"
          >
            [ESC] RETURN
          </button>
        </div>
        <DevInvaders onExit={handleExitGame} soundEnabled={soundEnabled} />
      </div>
    );
  }

  // Render Arcade selection screen
  return (
    <div className="flex-1 flex flex-col justify-between p-5 font-fira select-none text-[var(--text-primary)] bg-[rgba(10,10,12,0.4)]">
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse" />
          <h2 className="font-bold text-sm tracking-widest uppercase text-[var(--primary-color)]">
            🕹️ DEVPULSE ARCADE CABINET v1.1.0
          </h2>
        </div>
        <button 
          onClick={() => onExit(0)}
          className="text-xs text-[var(--accent-color)] hover:underline border border-[var(--border-color)] px-2 py-0.5 rounded transition-all bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,0,0,0.1)] cursor-pointer"
        >
          [ESC] SHUT DOWN
        </button>
      </div>

      {/* Arcade Selection Frame */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.45)] rounded-lg border border-[var(--border-color)] overflow-hidden min-h-[300px] p-6 text-center">
        {/* Retro scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5))] z-10" />

        {/* Arcade Cabinet Screen Logo */}
        <pre className="text-[7px] sm:text-[9px] font-fira font-bold text-[var(--primary-color)] mb-6 select-none leading-none tracking-tighter opacity-90 animate-pulse">
{`   ___   ___    ____ ___   ___   ____ 
  / _ \\ / _ \\  / __// _ \\ / _ \\ / __/ 
 / ___// , _/ / _/ / ___// ___// _/   
/_/   /_/|_| /___//_/   /_/   /___/   
   --  A R C A D E   S E C T O R  --`}
        </pre>

        <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm">
          Welcome, Operator. Select a secure system virtualization thread to initiate interactive testing.
        </p>

        {/* Menu selections list */}
        <div className="flex flex-col gap-3 w-full max-w-[320px] mx-auto z-20">
          {/* Game Option 1: Snake */}
          <div 
            onClick={() => {
              setSelectedGameIdx(0);
              playSelectSound('select');
              setActiveGame('snake');
            }}
            className={`flex items-center justify-between p-3 rounded border text-left cursor-pointer transition-all duration-200 ${
              selectedGameIdx === 0 
                ? 'border-[var(--primary-color)] bg-[rgba(203,166,247,0.08)] shadow-[0_0_10px_rgba(203,166,247,0.15)] scale-102 translate-x-1' 
                : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <div>
              <span className="text-[var(--primary-color)] font-bold text-xs">
                {selectedGameIdx === 0 ? '▶ 01. ' : '  02. '}
              </span>
              <span className="font-bold text-xs uppercase tracking-wide">
                SNAKE.OS
              </span>
              <p className="text-[9px] text-[var(--text-secondary)] mt-1">
                Eat RAM packets to buffer memory logs.
              </p>
            </div>
            {selectedGameIdx === 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--primary-color)] text-[var(--bg-color)] font-bold animate-pulse">
                SELECT
              </span>
            )}
          </div>

          {/* Game Option 2: DevInvaders */}
          <div 
            onClick={() => {
              setSelectedGameIdx(1);
              playSelectSound('select');
              setActiveGame('invaders');
            }}
            className={`flex items-center justify-between p-3 rounded border text-left cursor-pointer transition-all duration-200 ${
              selectedGameIdx === 1 
                ? 'border-[var(--accent-color)] bg-[rgba(243,88,168,0.08)] shadow-[0_0_10px_rgba(243,88,168,0.15)] scale-102 translate-x-1' 
                : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            <div>
              <span className="text-[var(--accent-color)] font-bold text-xs">
                {selectedGameIdx === 1 ? '▶ 02. ' : '  02. '}
              </span>
              <span className="font-bold text-xs uppercase tracking-wide">
                DEV_INVADERS
              </span>
              <p className="text-[9px] text-[var(--text-secondary)] mt-1">
                Shoot hostile core packages from firewall.
              </p>
            </div>
            {selectedGameIdx === 1 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-color)] text-[var(--bg-color)] font-bold animate-pulse">
                SELECT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Controls footer */}
      <div className="text-[10px] text-[var(--text-secondary)] text-center mt-4 select-none flex justify-center gap-6">
        <span>⌨ Arrow Keys / W-S = Move</span>
        <span>Enter / Space = Launch</span>
        <span>1 or 2 = Hotkeys</span>
      </div>
    </div>
  );
}

export default TerminalGame;
