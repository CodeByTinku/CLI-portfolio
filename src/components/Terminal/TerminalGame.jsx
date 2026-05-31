import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE_X = 22;
const GRID_SIZE_Y = 14;
const INITIAL_SPEED = 140;

function TerminalGame({ onExit, soundEnabled }) {
  const [snake, setSnake] = useState([
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 8, y: 7 }
  ]);
  const [direction, setDirection] = useState('RIGHT');
  const [food, setFood] = useState({ x: 15, y: 7 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('devpulse_snake_highscore') || '0', 10);
  });

  const gameLoopRef = useRef(null);
  const nextDirectionRef = useRef('RIGHT');

  // Web Audio Synth for retro sounds
  const playRetroSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'eat') {
        // High ascending chip-tune beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'die') {
        // Lower descending warning buzz/noise
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'tick') {
        // Very quick subtle step click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      }
    } catch (e) {
      // Audio context error fallback
    }
  }, [soundEnabled]);

  // Generate random coordinates for food, avoiding the snake's body
  const generateFood = useCallback((currentSnake) => {
    let newFood;
    let isOnSnake = true;
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE_X),
        y: Math.floor(Math.random() * GRID_SIZE_Y)
      };
      isOnSnake = currentSnake.some(cell => cell.x === newFood.x && cell.y === newFood.y);
    }
    return newFood;
  }, []);

  // Reset all game states
  const resetGame = useCallback(() => {
    const initialSnake = [
      { x: 10, y: 7 },
      { x: 9, y: 7 },
      { x: 8, y: 7 }
    ];
    setSnake(initialSnake);
    setDirection('RIGHT');
    nextDirectionRef.current = 'RIGHT';
    setFood(generateFood(initialSnake));
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setGameStarted(true);
  }, [generateFood]);

  // Keyboard navigation controller
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExit(score);
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else if (!gameStarted) {
          setGameStarted(true);
        } else {
          setIsPaused(prev => !prev);
        }
        return;
      }

      if (!gameStarted || gameOver || isPaused) return;

      const currentDir = direction;
      switch (e.key) {
        // Arrow Keys & WASD controls
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir !== 'DOWN') {
            nextDirectionRef.current = 'UP';
            playRetroSound('tick');
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir !== 'UP') {
            nextDirectionRef.current = 'DOWN';
            playRetroSound('tick');
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir !== 'RIGHT') {
            nextDirectionRef.current = 'LEFT';
            playRetroSound('tick');
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir !== 'LEFT') {
            nextDirectionRef.current = 'RIGHT';
            playRetroSound('tick');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, isPaused, direction, score, onExit, resetGame, playRetroSound]);

  // Main game tick engine
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameTick = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = nextDirectionRef.current;
        setDirection(currentDir);

        switch (currentDir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
          default: break;
        }

        // Collision Check: Boundaries wall bounce or self-bite
        const hitWall = head.x < 0 || head.x >= GRID_SIZE_X || head.y < 0 || head.y >= GRID_SIZE_Y;
        const hitSelf = prevSnake.some(cell => cell.x === head.x && cell.y === head.y);

        if (hitWall || hitSelf) {
          setGameOver(true);
          playRetroSound('die');
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food eating check
        if (head.x === food.x && head.y === food.y) {
          playRetroSound('eat');
          setScore(prevScore => {
            const nextScore = prevScore + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('devpulse_snake_highscore', nextScore.toString());
            }
            return nextScore;
          });
          setFood(generateFood(newSnake));
        } else {
          // Remove tail if didn't eat
          newSnake.pop();
        }

        return newSnake;
      });
    };

    // Calculate slightly progressive speed based on current score
    const currentSpeed = Math.max(70, INITIAL_SPEED - Math.floor(score / 50) * 10);
    gameLoopRef.current = setInterval(gameTick, currentSpeed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, isPaused, food, generateFood, score, highScore, playRetroSound]);

  // Render the grid cells dynamically
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE_Y; y++) {
      for (let x = 0; x < GRID_SIZE_X; x++) {
        const isHead = snake[0].x === x && snake[0].y === y;
        const isBody = snake.slice(1).some(cell => cell.x === x && cell.y === y);
        const isFood = food.x === x && food.y === y;

        let cellClass = "w-full h-full rounded-[2px] transition-all duration-100 ";
        if (isHead) {
          cellClass += "bg-[var(--primary-color)] shadow-[0_0_12px_var(--primary-color)] scale-105 z-10";
        } else if (isBody) {
          cellClass += "bg-[var(--primary-color)] opacity-60";
        } else if (isFood) {
          cellClass += "bg-[var(--accent-color)] shadow-[0_0_16px_var(--accent-color)] animate-pulse scale-90";
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
    <div className="flex-1 flex flex-col justify-between p-5 font-fira select-none text-[var(--text-primary)]">
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
          <h2 className="font-bold text-sm tracking-widest uppercase text-[var(--primary-color)]">
            🕹️ DEVPULSE ARCADE: v1.0.0
          </h2>
        </div>
        <button 
          onClick={() => onExit(score)}
          className="text-xs text-[var(--accent-color)] hover:underline border border-[var(--border-color)] px-2 py-0.5 rounded transition-all bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,0,0,0.1)] cursor-pointer"
        >
          [ESC] EXIT
        </button>
      </div>

      {/* Scoreboard and Status Row */}
      <div className="flex justify-between items-center text-xs px-2 py-1.5 border border-[var(--border-color)] bg-[rgba(0,0,0,0.15)] rounded mb-4">
        <div>
          SCORE: <span className="text-[var(--success-color)] font-bold">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="text-[var(--text-secondary)]">
          SPEED: <span className="font-semibold">{Math.min(10, Math.floor(score / 50) + 1)}x</span>
        </div>
        <div>
          HIGH SCORE: <span className="text-[var(--primary-color)] font-bold">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Main Screen Panel with overlays */}
      <div className="relative flex-1 flex items-center justify-center bg-[rgba(0,0,0,0.35)] rounded-lg border border-[var(--border-color)] overflow-hidden min-h-[260px] p-2">
        
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
            <pre className="text-[8px] sm:text-[10px] leading-tight text-[var(--primary-color)] mb-4 select-none opacity-90">
{`   ____  _   _   _    _  _______ 
  / ___|| \ | | / \  | |/ / ____|
  \___ \|  \| |/ _ \ | ' /|  _|  
   ___) | |\  / ___ \| . \| |___ 
  |____/|_| \/_/   \_\_|\_\_____|`}
            </pre>
            <p className="text-xs text-[var(--text-primary)] font-bold tracking-wider mb-2 animate-pulse">
              PRESS [SPACEBAR] TO BOOT SYSTEM
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] max-w-xs">
              Controls: Use Arrow Keys or W-A-S-D to navigate. Eat glowing crimson nodes to upgrade memory buffer size.
            </p>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(15,10,10,0.92)] backdrop-blur-[2px] p-4 text-center z-20">
            <h3 className="text-lg font-bold text-[var(--accent-color)] tracking-wider mb-1 animate-pulse">
              ⚠️ SYSTEM CRASH: GAME OVER
            </h3>
            <p className="text-xs text-[var(--text-primary)] mb-4">
              Buffer Overflow. Final Payload Size: <span className="font-bold text-[var(--success-color)]">{score} pts</span>
            </p>
            <button 
              onClick={resetGame}
              className="px-4 py-1.5 border border-[var(--accent-color)] text-xs text-[var(--accent-color)] rounded bg-[rgba(255,0,0,0.05)] hover:bg-[rgba(255,0,0,0.15)] font-bold transition-all mb-2 cursor-pointer"
            >
              PRESS [SPACEBAR] TO REBOOT
            </button>
            <p className="text-[9px] text-[var(--text-secondary)]">
              Or press [ESC] to return to bash terminal shell.
            </p>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,10,12,0.85)] p-4 text-center z-20">
            <h3 className="text-md font-bold text-[var(--primary-color)] tracking-widest mb-2">
              ⏸️ SYSTEM PAUSED
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Press [SPACEBAR] to resume system process thread.
            </p>
          </div>
        )}
      </div>

      {/* Control Help bar */}
      <div className="text-[10px] text-[var(--text-secondary)] text-center mt-3 select-none flex justify-center gap-4">
        <span>🎮 W-A-S-D / Arrows = Move</span>
        <span>Space = Pause/Play</span>
        <span>Esc = Return to CLI</span>
      </div>
    </div>
  );
}

export default TerminalGame;
