import React, { useState, useEffect, useRef } from 'react';
import TerminalHistory from './components/Terminal/TerminalHistory';
import TerminalInput from './components/Terminal/TerminalInput';
import NodeTree from './components/Visualizer/NodeTree';
import GithubStats from './components/Visualizer/GithubStats';
import ThemeSelector from './components/ThemeSelector';
import TerminalGame from './components/Terminal/TerminalGame';
import { useTerminal } from './hooks/useTerminal';
import LofiPlayer from './components/Visualizer/LofiPlayer';
import TerminalSysmon from './components/Terminal/TerminalSysmon';
import SystemMonitor from './components/Visualizer/SystemMonitor';
import CyberBreach from './components/Visualizer/CyberBreach';
import WeatherDaemon from './components/Visualizer/WeatherDaemon';


function App() {
  const [activeTheme, setActiveTheme] = useState('dracula');
  const [triggerGlow, setTriggerGlow] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('git');
  const [isToxicUnlocked, setIsToxicUnlocked] = useState(() => {
    const savedNodes = localStorage.getItem('devpulse_breach_nodes');
    if (savedNodes) {
      try {
        const parsed = JSON.parse(savedNodes);
        const mainframe = parsed.find(n => n.id === 'mainframe');
        return !!(mainframe && mainframe.hacked);
      } catch (e) {}
    }
    return false;
  });
  const matrixCanvasRef = useRef(null);

  // Set active theme dynamically in DOM dataset
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Command node visual highlights synchronization callback
  const handleNodeTrigger = (commandType) => {
    setTriggerGlow(commandType);
    // Reset trigger glow after short delay
    setTimeout(() => setTriggerGlow(null), 1000);
  };

  const { 
    history, 
    contactFormMode, 
    contactStep, 
    aiMode,
    aiTyping,
    handleCommand, 
    playTypeSound,
    gameActive,
    setGameActive,
    sysmonActive,
    setSysmonActive,
    soundEnabled,
    addLine,
    
    // Audio Player states & methods
    audioElement,
    isPlaying,
    currentTrack,
    audioVolume,
    togglePlay,
    nextTrack,
    prevTrack,
    changeVolume,
    playlist,
    weatherCity,
    setWeatherCity
  } = useTerminal(activeTheme, setActiveTheme, handleNodeTrigger, setDashboardTab);


  const handleGameExit = (finalScore) => {
    setGameActive(false);
    addLine(`🕹️ Exited DevPulse Arcade. Final score: ${finalScore} points.`, "system");
  };

  // Sync terminal command to active GUI dashboard tab
  useEffect(() => {
    if (sysmonActive) {
      setDashboardTab('sysmon');
    }
  }, [sysmonActive]);


  // Matrix falling rain characters background loop for matrix theme
  useEffect(() => {
    if (activeTheme !== 'matrix') return;

    const canvas = matrixCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシシチヂニヒミリウゥクスツヌフムユュルヲエヶゲゼデベペオォコソトノホモヨョロヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabet = katakana.split('');

    const fontSize = 14;
    const columns = width / fontSize;

    const rainDrops = Array.from({ length: columns }, () => 1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const interval = setInterval(draw, 30);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTheme]);

  const handleSelectCommandFromNode = (command) => {
    handleCommand(command);
  };

  return (
    <div className="relative min-h-screen flex flex-col font-outfit select-none overflow-hidden crt-overlay p-4 md:p-6 transition-all duration-300">
      {/* Matrix background stream */}
      {activeTheme === 'matrix' && (
        <canvas ref={matrixCanvasRef} className="matrix-canvas absolute inset-0 w-full h-full opacity-10 pointer-events-none" />
      )}

      {/* Cyberpunk grid backdrop overlay */}
      {activeTheme === 'cyberpunk' && (
        <div className="cyber-grid absolute inset-0 w-full h-full pointer-events-none" />
      )}

      {/* Retro background filters */}
      {activeTheme === 'retro' && (
        <div className="absolute inset-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,176,0,0.02),transparent)]" />
      )}

      {/* Global Header */}
      <header className="relative w-full z-10 flex flex-col md:flex-row gap-4 justify-between items-center pb-4 mb-4 border-b border-[var(--border-color)]">
        {/* Title branding logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)] animate-pulse" />
            <span className="absolute w-3.5 h-3.5 rounded-full bg-[var(--primary-color)] opacity-60 animate-ping" />
          </div>
          <div>
            <h1 className="font-outfit text-xl font-bold tracking-widest text-[var(--text-primary)] select-none uppercase">
              DEVPULSE <span className="text-[var(--primary-color)]">OS</span>
            </h1>
            <p className="font-fira text-[9px] text-[var(--text-secondary)] tracking-widest">
              STATUS: SYSTEM_READY // CORE:OK
            </p>
          </div>
        </div>

        {/* Theme select controls */}
        <ThemeSelector activeTheme={activeTheme} onSelectTheme={setActiveTheme} isToxicUnlocked={isToxicUnlocked} />
      </header>

      {/* Main Workspace grid splitting */}
      <main className="relative flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 z-10 max-w-7xl mx-auto w-full">
        {/* Left pane: CLI Virtual Console (3 columns in large screen) */}
        <section className="lg:col-span-3 flex flex-col glass-panel glow-border overflow-hidden min-h-[500px] bg-[rgba(10,10,12,0.6)]">
          {/* Header tabs visual rows */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-fira text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                bash - tinku@workstation
                {isPlaying && (
                  <span className="flex items-end gap-[2px] h-2.5 ml-1" title="Lofi music playing">
                    <span className="w-[2px] bg-[var(--primary-color)] animate-[audioWave_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }} />
                    <span className="w-[2px] bg-[var(--primary-color)] animate-[audioWave_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
                    <span className="w-[2px] bg-[var(--primary-color)] animate-[audioWave_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
                  </span>
                )}
              </span>
            </div>
            <span className="font-fira text-[10px] text-[var(--text-secondary)]">
              UTF-8
            </span>
          </div>

          {/* Core terminal histories and inputs */}
          {sysmonActive ? (
            <TerminalSysmon 
              onExit={() => setSysmonActive(false)} 
              soundEnabled={soundEnabled} 
            />
          ) : gameActive ? (
            <TerminalGame 
              onExit={handleGameExit} 
              soundEnabled={soundEnabled} 
              defaultGame={gameActive}
            />
          ) : (
            <>
              <TerminalHistory history={history} />
              <TerminalInput 
                onCommandSubmit={handleCommand} 
                contactFormMode={contactFormMode} 
                contactStep={contactStep}
                aiMode={aiMode}
                aiTyping={aiTyping}
                playTypeSound={playTypeSound}
              />
            </>
          )}

        </section>

        {/* Right pane: Visual Dashboard GUI (2 columns in large screen) */}
        <section className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          {/* 1. Skill dynamic bubble node tree */}
          <NodeTree 
            onSelectCommand={handleSelectCommandFromNode} 
            triggerGlowCommand={triggerGlow}
          />

          {/* 2. Lofi Music Station */}
          <LofiPlayer 
            audioElement={audioElement}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            volume={audioVolume}
            playTrack={null}
            pauseTrack={null}
            togglePlay={togglePlay}
            nextTrack={nextTrack}
            prevTrack={prevTrack}
            setVolume={changeVolume}
            playlist={playlist}
          />

          {/* 3. Visual Git Metrics, System Diagnostics OR Cyber Breach */}
          <div className="flex flex-col gap-4">
            <div className="flex bg-[rgba(0,0,0,0.35)] p-1 rounded-lg border border-[var(--border-color)]">
              <button 
                onClick={() => setDashboardTab('git')}
                className={`flex-1 py-1.5 text-center text-[10px] sm:text-xs font-semibold tracking-wider font-outfit rounded-md cursor-pointer transition-all duration-200 ${
                  dashboardTab === 'git' 
                    ? 'bg-[var(--primary-color)] text-black shadow-[0_0_8px_var(--primary-color)] font-bold' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                GITHUB
              </button>
              <button 
                onClick={() => setDashboardTab('sysmon')}
                className={`flex-1 py-1.5 text-center text-[10px] sm:text-xs font-semibold tracking-wider font-outfit rounded-md cursor-pointer transition-all duration-200 ${
                  dashboardTab === 'sysmon' 
                    ? 'bg-[var(--primary-color)] text-black shadow-[0_0_8px_var(--primary-color)] font-bold' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                SYSTEM
              </button>
              <button 
                onClick={() => setDashboardTab('breach')}
                className={`flex-1 py-1.5 text-center text-[10px] sm:text-xs font-semibold tracking-wider font-outfit rounded-md cursor-pointer transition-all duration-200 ${
                  dashboardTab === 'breach' 
                    ? 'bg-[var(--primary-color)] text-black shadow-[0_0_8px_var(--primary-color)] font-bold' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                BREACH
              </button>
              <button 
                onClick={() => setDashboardTab('weather')}
                className={`flex-1 py-1.5 text-center text-[10px] sm:text-xs font-semibold tracking-wider font-outfit rounded-md cursor-pointer transition-all duration-200 ${
                  dashboardTab === 'weather' 
                    ? 'bg-[var(--primary-color)] text-black shadow-[0_0_8px_var(--primary-color)] font-bold' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                }`}
              >
                WEATHER
              </button>
            </div>
            {dashboardTab === 'git' ? (
              <GithubStats />
            ) : dashboardTab === 'sysmon' ? (
              <SystemMonitor />
            ) : dashboardTab === 'breach' ? (
              <CyberBreach 
                onUnlockToxicTheme={() => setIsToxicUnlocked(true)} 
                soundEnabled={soundEnabled} 
              />
            ) : (
              <WeatherDaemon 
                weatherCity={weatherCity} 
                onCitySearch={setWeatherCity} 
              />
            )}
          </div>
        </section>
      </main>

      {/* Footer credits row */}
      <footer className="w-full text-center py-4 mt-6 border-t border-[var(--border-color)] z-10 select-none">
        <p className="font-fira text-[10px] text-[var(--text-secondary)]">
          &copy; {new Date().getFullYear()} Tinku | Designed with React 19 & Tailwind CSS v4.
        </p>
      </footer>
    </div>
  );
}

export default App;
