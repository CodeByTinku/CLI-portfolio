import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldAlert, Cpu, HardDrive, Wifi, RefreshCw } from 'lucide-react';

const INITIAL_PROCESSES = [
  { pid: 1042, name: 'lofi_player.os', cpu: 2.4, mem: 42.1, status: 'RUNNING' },
  { pid: 2195, name: 'node_connector.js', cpu: 1.1, mem: 28.5, status: 'IDLE' },
  { pid: 3881, name: 'pulse_ai_copilot', cpu: 0.5, mem: 120.4, status: 'WAITING' },
  { pid: 4920, name: 'crt_scanline_render', cpu: 4.8, mem: 64.0, status: 'RUNNING' },
  { pid: 9021, name: 'terminal_shell.sh', cpu: 0.2, mem: 12.8, status: 'RUNNING' }
];

function SystemMonitor() {
  const [cpuHistory, setCpuHistory] = useState(Array(20).fill(15));
  const [memUsage, setMemUsage] = useState(38); // percentage
  const [downloadSpeed, setDownloadSpeed] = useState(2.4); // MB/s
  const [uploadSpeed, setUploadSpeed] = useState(0.8); // MB/s
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  const [spikeActive, setSpikeActive] = useState(false);
  const [firewallThreats, setFirewallThreats] = useState(0);
  const [threatLog, setThreatLog] = useState('FIREWALL STATE: SECURE // NO RECENT INTRUSIONS');
  const [isMuted, setIsMuted] = useState(false);
  
  const simulationIntervalRef = useRef(null);

  // Play retro warning synth beep when spiked or high threshold crossed
  const playWarningBeep = (freq = 600, duration = 0.1, type = 'sine') => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext blocker fallback
    }
  };

  // Run the diagnostic parameters simulation
  useEffect(() => {
    simulationIntervalRef.current = setInterval(() => {
      // 1. Generate next CPU usage based on spike state
      let nextCpu;
      if (spikeActive) {
        // High spike load (85% to 99%)
        nextCpu = Math.floor(85 + Math.random() * 14);
        if (Math.random() > 0.7) {
          playWarningBeep(880, 0.15, 'sawtooth');
        }
      } else {
        // Normal idling load (8% to 25%)
        nextCpu = Math.floor(10 + Math.random() * 18);
      }

      setCpuHistory(prev => {
        const next = [...prev.slice(1), nextCpu];
        return next;
      });

      // 2. Adjust memory usage slightly
      setMemUsage(prev => {
        const delta = (Math.random() - 0.5) * 2;
        const target = spikeActive ? 78 : 38;
        const next = prev + (target - prev) * 0.15 + delta;
        return Math.max(10, Math.min(95, Math.round(next)));
      });

      // 3. Network speeds fluctuate
      setDownloadSpeed(prev => {
        const target = spikeActive ? 18.5 : 2.5;
        const next = prev + (target - prev) * 0.2 + (Math.random() - 0.5) * 0.5;
        return Math.max(0.1, parseFloat(next.toFixed(1)));
      });

      setUploadSpeed(prev => {
        const target = spikeActive ? 5.2 : 0.8;
        const next = prev + (target - prev) * 0.2 + (Math.random() - 0.5) * 0.1;
        return Math.max(0.1, parseFloat(next.toFixed(1)));
      });

      // 4. Update processes list dynamically with varying CPU spikes
      setProcesses(prev => {
        return prev.map(p => {
          let cpuDelta;
          if (spikeActive) {
            if (p.name.includes('lofi_player')) cpuDelta = Math.random() * 5 + 4;
            else if (p.name.includes('terminal_shell')) cpuDelta = Math.random() * 15 + 40;
            else cpuDelta = Math.random() * 10 + 15;
          } else {
            cpuDelta = Math.random() * 2;
          }
          const nextCpuVal = parseFloat((p.cpu + (cpuDelta - p.cpu) * 0.25).toFixed(1));
          return {
            ...p,
            cpu: Math.max(0.1, nextCpuVal),
            status: spikeActive ? 'BUSY' : (Math.random() > 0.8 ? 'IDLE' : 'RUNNING')
          };
        });
      });

      // 5. Random security port scan firewall notifications
      if (Math.random() > 0.90) {
        setFirewallThreats(prev => prev + 1);
        const ips = ['192.168.1.104', '45.89.231.12', '185.220.101.4', '10.0.0.15'];
        const randomIp = ips[Math.floor(Math.random() * ips.length)];
        setThreatLog(`PORT_SCAN BLOCKED: SOURCE ${randomIp} // SECTOR:PORT_80`);
        playWarningBeep(1100, 0.08, 'sine');
      }
    }, 1000);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [spikeActive, isMuted]);

  // Handler to spike CPU allocation
  const handleSpikeToggle = () => {
    if (!spikeActive) {
      playWarningBeep(220, 0.3, 'sine'); // low sweep start
      setTimeout(() => playWarningBeep(440, 0.2, 'sine'), 100);
      setSpikeActive(true);
      setThreatLog('ALERT: SIMULATING MAXIMUM SYSTEM STRESS TEST // CPU EXHAUSTION ON');
    } else {
      playWarningBeep(440, 0.1, 'sine');
      setTimeout(() => playWarningBeep(220, 0.2, 'sine'), 100);
      setSpikeActive(false);
      setThreatLog('SYSTEM COOL DOWN INITIATED. CORE STATUS NORMAL.');
    }
  };

  // Convert CPU history history array to SVG path
  const generateSvgPath = () => {
    const width = 280;
    const height = 75;
    const pointsCount = cpuHistory.length;
    const stepX = width / (pointsCount - 1);
    
    return cpuHistory.map((val, idx) => {
      const x = idx * stepX;
      // map val (0 to 100) to height coordinate (75 to 0)
      const y = height - (val / 100) * height * 0.9;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  // Calculate coordinates for circular gauge
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (memUsage / 100) * circumference;

  return (
    <div className="glass-panel p-5 glow-border bg-[rgba(0,0,0,0.25)] flex flex-col space-y-4 relative overflow-hidden transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 select-none">
        <h3 className="font-outfit text-sm font-semibold tracking-wider text-[var(--primary-color)] flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" />
          SYSTEM DIAGNOSTICS & RESOURCES
        </h3>
        <span className="font-fira text-[10px] text-[var(--text-secondary)]">
          visitor@pulse:~# monitor --realtime
        </span>
      </div>

      {/* Grid split: CPU history vs Memory/Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left: CPU Area (3 Columns) */}
        <div className="md:col-span-3 flex flex-col space-y-2 select-none">
          <div className="flex justify-between items-center text-xs font-fira">
            <span className="flex items-center gap-1.5 font-bold">
              <Cpu className="w-3.5 h-3.5 text-[var(--primary-color)]" />
              CPU CORE TEMP
            </span>
            <span className={`font-mono font-bold ${spikeActive ? 'text-[var(--accent-color)] animate-pulse' : 'text-[var(--success-color)]'}`}>
              {cpuHistory[cpuHistory.length - 1]}%
            </span>
          </div>

          {/* SVG oscilloscope line graph container */}
          <div className="relative w-full h-[85px] bg-black/40 border border-[var(--border-color)] rounded-lg overflow-hidden flex items-end p-1">
            {/* Grid line background overlay */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-10 pointer-events-none">
              <div className="border-r border-b border-[var(--primary-color)]"></div>
              <div className="border-r border-b border-[var(--primary-color)]"></div>
              <div className="border-r border-b border-[var(--primary-color)]"></div>
              <div className="border-b border-[var(--primary-color)]"></div>
              <div className="border-r border-b border-[var(--primary-color)]"></div>
              <div className="border-r border-b border-[var(--primary-color)]"></div>
              <div className="border-r border-b border-[var(--primary-color)]"></div>
              <div className="border-b border-[var(--primary-color)]"></div>
            </div>

            <svg viewBox="0 0 280 75" preserveAspectRatio="none" className="w-full h-full">
              {/* Glow filter */}
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path 
                d={generateSvgPath()} 
                fill="none" 
                stroke={spikeActive ? 'var(--accent-color)' : 'var(--primary-color)'} 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#neon-glow)"
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>

        {/* Right: RAM Circular Dial & Net stats (2 Columns) */}
        <div className="md:col-span-2 flex items-center justify-around border-l border-[var(--border-color)] pl-0 md:pl-4 select-none">
          {/* Ram Circular Gauges */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle 
                  cx="32" 
                  cy="32" 
                  r={radius} 
                  className="stroke-[var(--border-color)] fill-none opacity-20"
                  strokeWidth="4" 
                />
                {/* Foreground Neon Progress */}
                <circle 
                  cx="32" 
                  cy="32" 
                  r={radius} 
                  className={`stroke-[var(--primary-color)] fill-none transition-all duration-500`}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-fira text-xs font-bold text-[var(--text-primary)]">
                  {memUsage}%
                </span>
                <span className="text-[7px] text-[var(--text-secondary)] tracking-tighter">
                  MEM
                </span>
              </div>
            </div>
            <span className="text-[9px] font-fira text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <HardDrive className="w-2.5 h-2.5" />
              12.8 / 16 GB
            </span>
          </div>

          {/* Network speeds list */}
          <div className="flex flex-col space-y-1 text-[10px] font-fira">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-[var(--secondary-color)]" />
              <span className="text-[var(--text-secondary)] uppercase">Network</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--text-primary)]">
                DN: <span className="font-bold text-[var(--primary-color)]">{downloadSpeed} MB/s</span>
              </span>
              <span className="text-[var(--text-primary)]">
                UP: <span className="font-bold text-[var(--secondary-color)]">{uploadSpeed} MB/s</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* active threads process checklist */}
      <div className="flex flex-col space-y-1.5 select-none">
        <div className="flex justify-between items-center text-[10px] font-fira text-[var(--text-secondary)]">
          <span>RUNNING DAEMON TASKS (PID/CPU/MEM)</span>
          <span>THREADS: {processes.length}</span>
        </div>
        <div className="bg-black/35 rounded border border-[var(--border-color)] overflow-hidden font-fira text-[10px]">
          <div className="grid grid-cols-12 gap-1.5 p-1 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] font-bold">
            <div className="col-span-2">PID</div>
            <div className="col-span-5">PROCESS</div>
            <div className="col-span-2 text-right">CPU</div>
            <div className="col-span-3 text-right">MEM</div>
          </div>
          <div className="flex flex-col divide-y divide-[var(--border-color)]">
            {processes.map((p, idx) => (
              <div 
                key={p.pid} 
                className={`grid grid-cols-12 gap-1.5 p-1 transition-colors hover:bg-white/5 cursor-pointer ${
                  spikeActive && p.cpu > 25 ? 'bg-red-500/10 text-[var(--accent-color)]' : ''
                }`}
              >
                <div className="col-span-2 text-[var(--text-secondary)]">{p.pid}</div>
                <div className="col-span-5 truncate text-[var(--text-primary)] font-medium flex items-center gap-1">
                  <span className={`w-1 h-1 rounded-full ${p.status === 'BUSY' ? 'bg-[var(--accent-color)] animate-ping' : 'bg-[var(--success-color)]'}`} />
                  {p.name}
                </div>
                <div className="col-span-2 text-right text-[var(--primary-color)] font-semibold">{p.cpu}%</div>
                <div className="col-span-3 text-right text-[var(--text-secondary)]">{p.mem} MB</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cyber Intrusion Threat Notifications Grid */}
      <div className="border border-dashed border-[var(--border-color)] rounded p-2 bg-black/10 flex items-center gap-2 select-none">
        <ShieldAlert className={`w-4 h-4 flex-shrink-0 ${firewallThreats > 0 ? 'text-[var(--accent-color)] animate-bounce' : 'text-[var(--text-secondary)]'}`} />
        <div className="flex-1 min-w-0">
          <p className="font-fira text-[8px] tracking-wide truncate text-[var(--text-primary)]">
            {threatLog}
          </p>
        </div>
        <div className="text-[8px] font-fira px-1 py-0.5 rounded bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] text-[var(--text-secondary)] uppercase">
          BLOCKED: {firewallThreats}
        </div>
      </div>

      {/* Diagnostics controls bottom bar */}
      <div className="flex items-center justify-between pt-1 select-none">
        <button 
          onClick={() => setIsMuted(prev => !prev)}
          className="text-[9px] font-fira text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline bg-transparent border-0 cursor-pointer"
        >
          {isMuted ? '🔇 MUTED' : '🔊 DIAGNOSTIC AUDIO: ON'}
        </button>

        <button 
          onClick={handleSpikeToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-outfit text-xs font-bold border transition-all duration-300 cursor-pointer ${
            spikeActive 
              ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-black hover:scale-103 shadow-[0_0_12px_var(--accent-color)]' 
              : 'bg-[rgba(255,255,255,0.03)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--primary-color)] hover:bg-[rgba(203,166,247,0.08)]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${spikeActive ? 'animate-spin' : ''}`} />
          {spikeActive ? 'SYSTEM SHUT SPIKE' : 'SPIKE PROCESSOR WORKLOAD'}
        </button>
      </div>
    </div>
  );
}

export default SystemMonitor;
