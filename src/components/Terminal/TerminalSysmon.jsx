import React, { useState, useEffect, useCallback } from 'react';

const INITIAL_PROCESSES = [
  { pid: 1042, name: 'lofi_player.os', cpu: 2.1, mem: 42.1, user: 'visitor' },
  { pid: 2195, name: 'node_connector.js', cpu: 1.2, mem: 28.5, user: 'tinku' },
  { pid: 3881, name: 'pulse_ai_copilot', cpu: 0.5, mem: 120.4, user: 'system' },
  { pid: 4920, name: 'crt_scanline_render', cpu: 3.5, mem: 64.0, user: 'visitor' },
  { pid: 9021, name: 'terminal_shell.sh', cpu: 0.1, mem: 12.8, user: 'tinku' },
  { pid: 1099, name: 'physics_forces.canvas', cpu: 6.8, mem: 92.1, user: 'visitor' },
  { pid: 1403, name: 'git_heatmap_fetcher', cpu: 0.0, mem: 18.0, user: 'system' },
  { pid: 8521, name: 'audio_synthesizer.wasm', cpu: 0.4, mem: 34.5, user: 'tinku' }
];

function TerminalSysmon({ onExit, soundEnabled }) {
  const [cpuVal, setCpuVal] = useState(14);
  const [memVal, setMemVal] = useState(38);
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [systemLogs, setSystemLogs] = useState([
    'INIT: Diagnostic daemon spawned successfully.',
    'MONITOR: Realtime core sockets mapped on Port 80.',
    'SECURE: Firewall threat detection activated.'
  ]);
  const [uptime, setUptime] = useState(0); // in seconds
  const [spikeActive, setSpikeActive] = useState(false);

  // Chiptune / retro audio generation utilities
  const playSoundEffect = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.06);
      } else if (type === 'kill') {
        // Laser/glitch descending sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'spike') {
        // High alert chiptune chime
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.20);
      }
    } catch (e) {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Keep a clock uptime counting
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Diagnostics parameters simulation loops
  useEffect(() => {
    const sim = setInterval(() => {
      // CPU fluctuations
      setCpuVal(prev => {
        let base = spikeActive ? 82 : 12;
        let jitter = Math.floor(Math.random() * 15);
        return base + jitter;
      });

      // Memory fluctuations
      setMemVal(prev => {
        let target = spikeActive ? 75 : 38;
        let jitter = (Math.random() - 0.5) * 1.5;
        let next = prev + (target - prev) * 0.1 + jitter;
        return Math.max(10, Math.min(95, Math.round(next)));
      });

      // Fluctuate CPU usages for other processes
      setProcesses(prev => {
        return prev.map(p => {
          let multiplier = spikeActive ? 5 : 1;
          let randomFactor = Math.random() * multiplier;
          let newCpu = parseFloat((p.cpu + (randomFactor - p.cpu) * 0.15).toFixed(1));
          return {
            ...p,
            cpu: Math.max(0.0, newCpu)
          };
        });
      });

      // Random logs spawning
      if (Math.random() > 0.8) {
        const events = [
          'SYS_MON: Heap allocation cleaned.',
          'NETWORK: Syn-Flood packets dropped on subnet.',
          'SECURITY: Firewall block rule applied to suspicious subnet.',
          'SYS_MON: Garbage collector loop exited code 0.',
          'LOFI: Stream buffer verified (100% caching).'
        ];
        const log = events[Math.floor(Math.random() * events.length)];
        setSystemLogs(prev => {
          const next = [...prev, `[${new Date().toLocaleTimeString()}] ${log}`];
          if (next.length > 5) return next.slice(next.length - 5);
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(sim);
  }, [spikeActive]);

  // Key handlers for interactive htop selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSelectedIdx(prev => {
          const next = prev > 0 ? prev - 1 : processes.length - 1;
          playSoundEffect('hover');
          return next;
        });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSelectedIdx(prev => {
          const next = prev < processes.length - 1 ? prev + 1 : 0;
          playSoundEffect('hover');
          return next;
        });
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (processes.length === 0) return;
        const target = processes[selectedIdx];
        if (target.name === 'terminal_shell.sh') {
          // Prevent killing primary shell
          setSystemLogs(prev => [...prev.slice(-4), `⚠️ SYS_MON: CANNOT KILL PRIMARY CONSOLE PROCESS [PID: ${target.pid}]`]);
          playSoundEffect('hover');
          return;
        }

        // Kill process sound + logs
        playSoundEffect('kill');
        setSystemLogs(prev => [...prev.slice(-4), `💀 PROCESS TERMINATED: ${target.name} [PID: ${target.pid}] successfully killed.`]);
        
        // Remove killed process from list
        setProcesses(prev => {
          const next = prev.filter((_, idx) => idx !== selectedIdx);
          // adjust selection pointer
          setSelectedIdx(prevIdx => Math.min(prevIdx, next.length - 1));
          return next;
        });

        // Spawn a replacement process in 4 seconds
        setTimeout(() => {
          setProcesses(prev => {
            const pids = [1210, 3192, 5991, 7401, 8820];
            const names = ['background_indexing.node', 'cache_optimizer.bin', 'git_diff_parser', 'audio_oscillator.wasm'];
            const randomPid = pids[Math.floor(Math.random() * pids.length)] + Math.floor(Math.random() * 100);
            const randomName = names[Math.floor(Math.random() * names.length)];
            
            // Avoid duplicates
            if (prev.some(p => p.name === randomName)) return prev;

            setSystemLogs(prevLogs => [...prevLogs.slice(-4), `⚡ SPAWNED: Re-initialized background thread [${randomName}] with PID ${randomPid}.`]);
            return [...prev, {
              pid: randomPid,
              name: randomName,
              cpu: 0.1,
              mem: parseFloat((Math.random() * 50 + 10).toFixed(1)),
              user: 'visitor'
            }];
          });
        }, 4000);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        playSoundEffect('spike');
        setSpikeActive(prev => !prev);
        setSystemLogs(prev => [
          ...prev.slice(-4), 
          !spikeActive 
            ? '🔥 ALERT: INITIATED MULTI-CORE WORKLOAD STRESS SPIKE ON ALL THREADS.' 
            : '❄️ SYSTEM: RESTORED INTEL CORE THREADS TO IDLING CONFIGURATION.'
        ]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processes, selectedIdx, onExit, playSoundEffect, spikeActive]);

  // Uptime formatting
  const formatUptime = () => {
    const m = Math.floor(uptime / 60);
    const s = uptime % 60;
    return `${m}m ${s}s`;
  };

  // ASCII visual loading bars
  const renderAsciiBar = (val) => {
    const barsCount = 20;
    const filledCount = Math.min(barsCount, Math.round((val / 100) * barsCount));
    const emptyCount = barsCount - filledCount;
    return `[${'|'.repeat(filledCount)}${'.'.repeat(emptyCount)}] ${val}%`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 font-fira select-none text-[var(--text-primary)] bg-[rgba(10,10,12,0.5)]">
      {/* Header telemetry details */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${spikeActive ? 'bg-[var(--accent-color)] animate-ping' : 'bg-[var(--success-color)] animate-pulse'}`} />
          <h2 className="font-bold text-sm tracking-widest uppercase text-[var(--primary-color)]">
            🖥️ SYSTEM PERFORMANCE DIAGNOSTIC CONSOLE
          </h2>
        </div>
        <button 
          onClick={onExit}
          className="text-xs text-[var(--accent-color)] hover:underline border border-[var(--border-color)] px-2 py-0.5 rounded transition-all bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,0,0,0.1)] cursor-pointer"
        >
          [ESC] TERMINATE
        </button>
      </div>

      {/* Resource meters rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[var(--border-color)] bg-[rgba(0,0,0,0.3)] rounded-lg p-3.5 mb-3 text-xs leading-relaxed">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between max-w-[280px]">
            <span>CPU Core Load:</span>
            <span className={spikeActive ? 'text-[var(--accent-color)] font-bold animate-pulse' : 'text-[var(--primary-color)]'}>
              {cpuVal}%
            </span>
          </div>
          <div className="font-bold text-[var(--primary-color)]">
            {renderAsciiBar(cpuVal)}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1">
            Core Temperature: <span className={spikeActive ? 'text-[var(--accent-color)] font-bold' : ''}>{spikeActive ? '84°C [WARN]' : '42°C [OK]'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-3 md:pt-0 pl-0 md:pl-4">
          <div className="flex justify-between max-w-[280px]">
            <span>RAM Allocation:</span>
            <span className="text-[var(--success-color)]">{memVal}%</span>
          </div>
          <div className="font-bold text-[var(--success-color)]">
            {renderAsciiBar(memVal)}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] mt-1">
            Uptime: <span>{formatUptime()}</span> // Tasks: <span>{processes.length} Active</span>
          </div>
        </div>
      </div>

      {/* Main Processes Console Frame (Htop Table) */}
      <div className="flex-1 flex flex-col border border-[var(--border-color)] bg-[rgba(0,0,0,0.45)] rounded-lg overflow-hidden min-h-[180px]">
        {/* Table column header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-1.5 bg-[rgba(255,255,255,0.03)] border-b border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] font-bold uppercase select-none">
          <div className="col-span-2">PID</div>
          <div className="col-span-3">USER</div>
          <div className="col-span-3">PROCESS</div>
          <div className="col-span-2 text-right">CPU%</div>
          <div className="col-span-2 text-right">MEM%</div>
        </div>

        {/* Scrolling processes rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)] text-[10px] md:text-xs">
          {processes.length === 0 ? (
            <div className="p-4 text-center text-[var(--text-secondary)] font-fira">
              No tasks active. Allocating clean thread system.
            </div>
          ) : (
            processes.map((p, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <div 
                  key={p.pid}
                  onClick={() => setSelectedIdx(idx)}
                  className={`grid grid-cols-12 gap-2 px-3 py-1.5 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-[var(--primary-color)] text-black font-semibold' 
                      : 'text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  <div className="col-span-2">{p.pid}</div>
                  <div className={`col-span-3 ${isSelected ? 'text-black' : 'text-[var(--text-secondary)]'}`}>{p.user}</div>
                  <div className="col-span-3 font-medium truncate">{p.name}</div>
                  <div className={`col-span-2 text-right font-bold ${
                    isSelected ? 'text-black' : p.cpu > 25 ? 'text-[var(--accent-color)] animate-pulse' : 'text-[var(--primary-color)]'
                  }`}>
                    {p.cpu}%
                  </div>
                  <div className="col-span-2 text-right">
                    {((p.mem / 1024) * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Diagnostics Logs Feed */}
      <div className="border border-dashed border-[var(--border-color)] bg-black/35 rounded-lg p-2.5 my-2.5 select-none">
        <div className="text-[9px] text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1 mb-1 font-bold">
          LIVE FIREWALL SHIELD LOG STREAM
        </div>
        <div className="flex flex-col gap-0.5 text-[9px] text-[var(--text-secondary)] leading-relaxed h-[55px] overflow-hidden">
          {systemLogs.map((log, idx) => (
            <div key={idx} className="truncate select-none">
              {log.startsWith('⚠️') || log.startsWith('🔥') || log.startsWith('💀') ? (
                <span className="text-[var(--accent-color)] font-bold">{log}</span>
              ) : log.startsWith('⚡') ? (
                <span className="text-[var(--success-color)] font-bold">{log}</span>
              ) : (
                <span>{log}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard guide footer row */}
      <div className="text-[9px] md:text-[10px] text-[var(--text-secondary)] text-center flex flex-wrap justify-center gap-x-6 gap-y-1 select-none border-t border-[var(--border-color)] pt-2 mt-1">
        <span>⌨️ <span className="text-[var(--text-primary)] font-bold">Arrow Keys / W-S</span>: Select Thread</span>
        <span>💥 <span className="text-[var(--text-primary)] font-bold">K</span>: Kill Selected Daemon</span>
        <span>⚡ <span className="text-[var(--text-primary)] font-bold">S</span>: Toggle Workload Spike</span>
        <span>🚪 <span className="text-[var(--text-primary)] font-bold">ESC</span>: Exit Monitor</span>
      </div>
    </div>
  );
}

export default TerminalSysmon;
