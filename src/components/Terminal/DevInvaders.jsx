import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE_X = 22;
const GRID_SIZE_Y = 14;
const TICK_RATE = 100; // 100ms per tick

function DevInvaders({ onExit, soundEnabled }) {
  const [playerX, setPlayerX] = useState(10);
  const [bullets, setBullets] = useState([]); // Player bullets: [{x, y}]
  const [enemyBullets, setEnemyBullets] = useState([]); // Enemy bullets: [{x, y}]
  const [enemies, setEnemies] = useState([]); // [{id, x, y, active}]
  const [enemyDir, setEnemyDir] = useState(1); // 1 = right, -1 = left
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('devpulse_invaders_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);

  const gameLoopRef = useRef(null);
  const ticksRef = useRef(0);

  // Retro Web Audio sound synth
  const playRetroSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'shoot') {
        // High rising sweep laser
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'alien_shoot') {
        // Falling low pitch laser
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'explode') {
        // Low retro scratchy explosion
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'player_explode') {
        // Low dramatic engine crash explosion
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'victory') {
        // Arpeggiated computer chime
        const now = audioCtx.currentTime;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.04, now);
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start();
        osc.stop(now + 0.4);
      } else if (type === 'tick') {
        // Micro movement click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.008, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.02);
      }
    } catch (e) {
      // Audio context failure fallback
    }
  }, [soundEnabled]);

  // Spawn enemies initially based on current level
  const spawnEnemies = useCallback((lvl) => {
    const list = [];
    let id = 0;
    // Spawn 2 rows of 6 enemies (total 12)
    // Centered horizontally
    for (let row = 0; row < 2; row++) {
      const y = row + 2; // Rows at y=2, y=3
      for (let col = 0; col < 7; col++) {
        list.push({
          id: id++,
          x: 4 + col * 2, // Spaced out horizontally: 4, 6, 8, 10, 12, 14, 16
          y: y,
          active: true
        });
      }
    }
    setEnemies(list);
  }, []);

  // Initialize Game
  const initGame = useCallback(() => {
    setPlayerX(10);
    setBullets([]);
    setEnemyBullets([]);
    spawnEnemies(1);
    setEnemyDir(1);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setVictory(false);
    setIsPaused(false);
    setGameStarted(true);
    ticksRef.current = 0;
  }, [spawnEnemies]);

  // Restart / Advance level
  const nextLevel = useCallback(() => {
    setBullets([]);
    setEnemyBullets([]);
    const nextLvl = level + 1;
    setLevel(nextLvl);
    spawnEnemies(nextLvl);
    setEnemyDir(1);
    setVictory(false);
    setGameOver(false);
    setIsPaused(false);
    ticksRef.current = 0;
    playRetroSound('victory');
  }, [level, spawnEnemies, playRetroSound]);

  // Spacebar/Enter/Arrows key binds
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExit(score);
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (gameOver || victory) {
          initGame();
        } else if (!gameStarted) {
          setGameStarted(true);
        } else {
          // Shoot a laser
          if (bullets.length < 3) { // Max 3 lasers on screen at once
            setBullets(prev => [...prev, { x: playerX, y: 11 }]); // Fire from cannon tip
            playRetroSound('shoot');
          }
        }
        return;
      }

      if (!gameStarted || gameOver || victory || isPaused) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerX(prev => Math.max(1, prev - 1)); // boundary checks
        playRetroSound('tick');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerX(prev => Math.min(GRID_SIZE_X - 2, prev + 1));
        playRetroSound('tick');
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, victory, isPaused, playerX, bullets, score, onExit, initGame, playRetroSound]);

  // Main game tick engine
  useEffect(() => {
    if (!gameStarted || gameOver || victory || isPaused) return;

    const gameTick = () => {
      ticksRef.current += 1;

      // 1. Move Player Bullets Up
      setBullets(prevBullets => {
        return prevBullets
          .map(b => ({ ...b, y: b.y - 1 }))
          .filter(b => b.y >= 0);
      });

      // 2. Move Enemy Bullets Down
      setEnemyBullets(prevEnemyBullets => {
        return prevEnemyBullets
          .map(b => ({ ...b, y: b.y + 1 }))
          .filter(b => b.y < GRID_SIZE_Y);
      });

      // 3. Move Enemies Horizontally and Vertically
      // Determine enemy speed in terms of ticks.
      // Starts slow (8 ticks per step), speeds up as fewer enemies remain.
      const activeEnemiesCount = enemies.filter(e => e.active).length;
      if (activeEnemiesCount === 0) {
        setVictory(true);
        playRetroSound('victory');
        return;
      }

      // Base speed scale: 8 ticks for all, 1 tick for the last remaining alien!
      const enemyTicksThreshold = Math.max(1, Math.min(8, Math.floor(activeEnemiesCount / 2)));

      if (ticksRef.current % enemyTicksThreshold === 0) {
        setEnemies(prevEnemies => {
          let shouldShiftDown = false;
          let currentDir = enemyDir;

          // Check if any active enemy will hit left/right wall
          const activeEnemies = prevEnemies.filter(e => e.active);
          for (let e of activeEnemies) {
            const nextX = e.x + currentDir;
            if (nextX <= 0 || nextX >= GRID_SIZE_X - 1) {
              shouldShiftDown = true;
              break;
            }
          }

          if (shouldShiftDown) {
            currentDir = -currentDir;
            setEnemyDir(currentDir);

            // Shift down all enemies
            const updated = prevEnemies.map(e => {
              if (!e.active) return e;
              const nextY = e.y + 1;
              if (nextY >= 12) { // Hit ship rows -> Game Over!
                setGameOver(true);
                playRetroSound('player_explode');
              }
              return { ...e, y: nextY };
            });
            return updated;
          } else {
            // Simply move sideways
            return prevEnemies.map(e => {
              if (!e.active) return e;
              return { ...e, x: e.x + currentDir };
            });
          }
        });
      }

      // 4. Enemy bullets firing AI
      // Every 12 ticks, a random bottom-most active enemy has a chance to shoot
      if (ticksRef.current % 12 === 0 && Math.random() < 0.6) {
        const activeEnemies = enemies.filter(e => e.active);
        if (activeEnemies.length > 0) {
          // pick a random active enemy to shoot
          const shooter = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
          setEnemyBullets(prev => [...prev, { x: shooter.x, y: shooter.y + 1 }]);
          playRetroSound('alien_shoot');
        }
      }
    };

    gameLoopRef.current = setInterval(gameTick, TICK_RATE);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, victory, isPaused, enemies, enemyDir, playRetroSound]);

  // Bullet and projectile collision checks
  useEffect(() => {
    if (!gameStarted || gameOver || victory || isPaused) return;

    // Check Player Bullets hitting Enemies
    if (bullets.length > 0 && enemies.some(e => e.active)) {
      setBullets(prevBullets => {
        let hitSomething = false;
        const newBullets = [];

        for (let b of prevBullets) {
          let hit = false;
          // check collision with enemies
          setEnemies(prevEnemies => {
            const index = prevEnemies.findIndex(e => e.active && e.x === b.x && e.y === b.y);
            if (index !== -1) {
              const updated = [...prevEnemies];
              updated[index] = { ...updated[index], active: false };
              hit = true;
              hitSomething = true;
              playRetroSound('explode');

              // Scoring increments
              setScore(prevScore => {
                const nextScore = prevScore + 20;
                if (nextScore > highScore) {
                  setHighScore(nextScore);
                  localStorage.setItem('devpulse_invaders_highscore', nextScore.toString());
                }
                return nextScore;
              });

              return updated;
            }
            return prevEnemies;
          });

          if (!hit) {
            newBullets.push(b);
          }
        }
        return newBullets;
      });
    }

    // Check Enemy Bullets hitting Player Ship
    if (enemyBullets.length > 0) {
      setEnemyBullets(prevEnemyBullets => {
        let playerHit = false;
        const newEnemyBullets = [];

        for (let eb of prevEnemyBullets) {
          // Check player ship cells:
          // Center: (playerX, 13)
          // Cannon: (playerX, 12)
          // Left Wing: (playerX - 1, 13)
          // Right Wing: (playerX + 1, 13)
          const hitCenter = eb.x === playerX && eb.y === 13;
          const hitCannon = eb.x === playerX && eb.y === 12;
          const hitLeftWing = eb.x === playerX - 1 && eb.y === 13;
          const hitRightWing = eb.x === playerX + 1 && eb.y === 13;

          if (hitCenter || hitCannon || hitLeftWing || hitRightWing) {
            playerHit = true;
            setGameOver(true);
            playRetroSound('player_explode');
            break;
          } else {
            newEnemyBullets.push(eb);
          }
        }
        return playerHit ? [] : newEnemyBullets;
      });
    }

  }, [bullets, enemyBullets, enemies, playerX, gameOver, victory, gameStarted, isPaused, highScore, playRetroSound]);

  // Render game cells
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE_Y; y++) {
      for (let x = 0; x < GRID_SIZE_X; x++) {
        // Player ship cells
        const isPlayerCenter = playerX === x && y === 13;
        const isPlayerCannon = playerX === x && y === 12;
        const isPlayerLeft = playerX - 1 === x && y === 13;
        const isPlayerRight = playerX + 1 === x && y === 13;
        const isPlayerShip = isPlayerCenter || isPlayerCannon || isPlayerLeft || isPlayerRight;

        // Player bullet cells
        const isPlayerBullet = bullets.some(b => b.x === x && b.y === y);

        // Enemy bullet cells
        const isEnemyBullet = enemyBullets.some(b => b.x === x && b.y === y);

        // Enemy alien cells
        const enemyObj = enemies.find(e => e.active && e.x === x && e.y === y);
        const isEnemy = !!enemyObj;

        let cellClass = "w-full h-full rounded-[2px] transition-all duration-100 ";
        if (isPlayerShip) {
          // Render Player Spaceship: bright terminal color
          cellClass += "bg-[var(--primary-color)] shadow-[0_0_12px_var(--primary-color)] scale-105 z-10";
        } else if (isEnemy) {
          // Render Invading Aliens: bright warnings
          cellClass += "bg-[var(--accent-color)] shadow-[0_0_14px_var(--accent-color)] scale-95";
        } else if (isPlayerBullet) {
          // Render laser fire going up
          cellClass += "bg-[var(--success-color)] shadow-[0_0_16px_var(--success-color)] scale-y-125 scale-x-50 z-20";
        } else if (isEnemyBullet) {
          // Render heavy enemy plasma going down
          cellClass += "bg-amber-500 shadow-[0_0_12px_#ffb000] scale-y-125 scale-x-75 animate-bounce z-20";
        } else {
          cellClass += "bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.01)]";
        }

        cells.push(
          <div key={`${x}-${y}`} className="aspect-square p-[1px]">
            <div className={cellClass} />
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex-grow flex flex-col justify-between select-none">
      {/* Scoreboard and Status Row */}
      <div className="flex justify-between items-center text-xs px-2 py-1.5 border border-[var(--border-color)] bg-[rgba(0,0,0,0.15)] rounded mb-4">
        <div>
          SCORE: <span className="text-[var(--success-color)] font-bold">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="text-[var(--text-secondary)]">
          STAGE: <span className="font-semibold text-[var(--primary-color)]">{level}</span>
        </div>
        <div>
          HIGH SCORE: <span className="text-[var(--primary-color)] font-bold">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Main Screen Panel with overlays */}
      <div className="relative flex-grow flex items-center justify-center bg-[rgba(0,0,0,0.35)] rounded-lg border border-[var(--border-color)] overflow-hidden min-h-[260px] p-2">
        {/* The Grid itself */}
        <div 
          className="grid w-full max-w-[480px] gap-0 mx-auto"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE_X}, minmax(0, 1fr))` }}
        >
          {renderGrid()}
        </div>

        {/* Start Game Overlay */}
        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,10,12,0.92)] backdrop-blur-[2px] p-4 text-center z-20">
            <pre className="text-[7px] sm:text-[9px] leading-tight text-[var(--accent-color)] mb-4 select-none opacity-90">
{`   _____  ______      __   ____ _  __
  / __ \\ / __/\\ \\    / /  /  _// |/ /
 / /_/ // _/   \\ \\  / /  _/ / /    / 
/_____//___/    \\_\\/_/  /___//_/|_/  `}
            </pre>
            <p className="text-xs text-[var(--text-primary)] font-bold tracking-wider mb-2 animate-pulse">
              PRESS [SPACEBAR] TO SHIELD DEPUTY
            </p>
            <p className="text-[9px] text-[var(--text-secondary)] max-w-xs">
              Controls: A/D or Left/Right Arrow to pilot ship. Spacebar to fire lasers. Prevent core payloads from bypassing standard walls!
            </p>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(15,10,10,0.92)] backdrop-blur-[2px] p-4 text-center z-20">
            <h3 className="text-lg font-bold text-[var(--accent-color)] tracking-wider mb-1 animate-pulse">
              ⚠️ FIREWALL COLLAPSE: DEFEAT
            </h3>
            <p className="text-xs text-[var(--text-primary)] mb-4">
              Invaders hijacked core threads. Final Score: <span className="font-bold text-[var(--success-color)]">{score} pts</span>
            </p>
            <button 
              onClick={initGame}
              className="px-4 py-1.5 border border-[var(--accent-color)] text-xs text-[var(--accent-color)] rounded bg-[rgba(255,0,0,0.05)] hover:bg-[rgba(255,0,0,0.15)] font-bold transition-all mb-2 cursor-pointer"
            >
              PRESS [SPACEBAR] TO REBOOT
            </button>
            <p className="text-[9px] text-[var(--text-secondary)]">
              Or press [ESC] to exit arcade cabinet menu.
            </p>
          </div>
        )}

        {/* Stage Victory Overlay */}
        {victory && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,15,10,0.92)] backdrop-blur-[2px] p-4 text-center z-20">
            <h3 className="text-lg font-bold text-[var(--success-color)] tracking-wider mb-1 animate-bounce">
              🎉 THREAD IMMUNIZED!
            </h3>
            <p className="text-xs text-[var(--text-primary)] mb-4">
              Grid sector has been successfully sanitized!
            </p>
            <button 
              onClick={nextLevel}
              className="px-4 py-1.5 border border-[var(--success-color)] text-xs text-[var(--success-color)] rounded bg-[rgba(0,255,0,0.05)] hover:bg-[rgba(0,255,0,0.15)] font-bold transition-all mb-2 cursor-pointer animate-pulse"
            >
              LAUNCH SECTOR {level + 1} [SPACEBAR]
            </button>
            <p className="text-[9px] text-[var(--text-secondary)]">
              Or press [ESC] to exit.
            </p>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && !gameOver && !victory && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,10,12,0.85)] p-4 text-center z-20">
            <h3 className="text-md font-bold text-[var(--primary-color)] tracking-widest mb-2">
              ⏸️ COLD BOOT: PAUSED
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Press [P] to resume system process thread.
            </p>
          </div>
        )}
      </div>

      {/* Control Help bar */}
      <div className="text-[10px] text-[var(--text-secondary)] text-center mt-3 select-none flex justify-center gap-4">
        <span>🎮 A-D / Arrows = Pilot</span>
        <span>Space = Fire Laser</span>
        <span>P = Pause/Resume</span>
      </div>
    </div>
  );
}

export default DevInvaders;
