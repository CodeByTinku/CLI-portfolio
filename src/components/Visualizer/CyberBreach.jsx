import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Terminal, Server, Key, Eye, EyeOff, Lock, Unlock, AlertTriangle } from 'lucide-react';

const NODES_DATA = [
  {
    id: 'firewall',
    name: 'Firewall Gate',
    ip: '192.168.42.1',
    desc: 'Outer subnet filter guarding diagnostic telemetry logs.',
    words: ['ROUTER', 'SECURE', 'SHIELD', 'BYPASS', 'SIGNAL', 'BUFFER'],
    secret: 'SHIELD',
    reward: 'ACCESS GRANTED. Telemetry log parsed: "System is running on Gemini Flash Core and Tailwind 4. Heat levels normal."',
    hacked: false,
    locked: false,
  },
  {
    id: 'database',
    name: 'Database Core',
    ip: '192.168.42.5',
    desc: 'Encrypted storage containing developer diaries and easter egg files.',
    words: ['VORTEX', 'KERNEL', 'SERVER', 'WIDGET', 'ARCHIVE', 'MATRIX'],
    secret: 'KERNEL',
    reward: 'ACCESS GRANTED. Decrypted Diary: "Tinku\'s Log #42: Spent all night coding this hacker mini-game. Hope it feels like Fallout! Also, DevInvaders Cheat Code: press [G] during gameplay for God Mode (Invincibility)."',
    hacked: false,
    locked: true,
  },
  {
    id: 'mainframe',
    name: 'Mainframe Admin',
    ip: '192.168.42.9',
    desc: 'Root authorization node containing core custom OS themes.',
    words: ['OVERLORD', 'GLITCH', 'PULSEAI', 'BREACH', 'TERMINAL', 'HEXADEC'],
    secret: 'BREACH',
    reward: 'ROOT AUTHENTICATED! Unlocked TOXIC NEON Environment Theme. Select it at the header bar to activate the glowing green/purple HUD.',
    hacked: false,
    locked: true,
  }
];

// Symbols to populate the scrambled Fallout terminal
const GARBAGE_SYMBOLS = [
  '[', ']', '{', '}', '(', ')', '<', '>', '/', '\\', '|', ',', '.', ':', ';',
  '!', '@', '#', '$', '%', '^', '&', '*', '_', '-', '+', '=', '?', '~', '`'
];

function CyberBreach({ onUnlockToxicTheme, soundEnabled }) {
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem('devpulse_breach_nodes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure structure matches
        if (parsed.length === NODES_DATA.length) return parsed;
      } catch (e) {}
    }
    return NODES_DATA;
  });

  const [activeNodeId, setActiveNodeId] = useState('firewall');
  const [gameState, setGameState] = useState('idle'); // idle, scanning, hacking, compromised, failed
  const [attempts, setAttempts] = useState(4);
  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [isCheatUnlocked, setIsCheatUnlocked] = useState(false);

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('devpulse_breach_nodes', JSON.stringify(nodes));
    // Check if mainframe is hacked to unlock the theme
    const mainframe = nodes.find(n => n.id === 'mainframe');
    if (mainframe && mainframe.hacked) {
      onUnlockToxicTheme();
    }
  }, [nodes]);

  // Audio synthetics
  const playBeep = (freq = 600, duration = 0.08, type = 'sine') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  // Generate scrambled Fallout terminal block
  const generateTerminalContent = (wordsList) => {
    const lines = [];
    const hexStart = 0xF300;
    
    // Create random symbols around words
    let wordIndex = 0;
    const wordsCount = wordsList.length;

    for (let r = 0; r < 12; r++) {
      const address = (hexStart + r * 12).toString(16).toUpperCase().padStart(4, '0');
      let lineText = '';

      // Determine if this row contains a word (roughly alternate or distribute them)
      const shouldHaveWord = (r % 2 === 0 || r === 11) && wordIndex < wordsCount;
      const wordToInsert = shouldHaveWord ? wordsList[wordIndex++] : null;

      if (wordToInsert) {
        // Insert word with surrounding symbols
        const wordPos = Math.floor(Math.random() * (12 - wordToInsert.length));
        for (let i = 0; i < 12; i++) {
          if (i >= wordPos && i < wordPos + wordToInsert.length) {
            lineText += wordToInsert[i - wordPos];
          } else {
            lineText += GARBAGE_SYMBOLS[Math.floor(Math.random() * GARBAGE_SYMBOLS.length)];
          }
        }
      } else {
        // Just fill with symbols
        for (let i = 0; i < 12; i++) {
          lineText += GARBAGE_SYMBOLS[Math.floor(Math.random() * GARBAGE_SYMBOLS.length)];
        }
      }

      lines.push({ address, content: lineText });
    }
    return lines;
  };

  // Start port scan
  const handleInitiateBreach = () => {
    playBeep(440, 0.15, 'sine');
    setGameState('scanning');
    setAttempts(4);
    setTerminalLogs([
      `📡 CONNECTION TO TARGET ${activeNode.ip} ESTABLISHED.`,
      `🔍 RUNNING PORT SCANNER DAEMON ON PORT 22 & 80...`,
      `⚙️ VULNERABILITY CVE-2026-X DETECTED IN DECRYPTION SHIELD.`,
      `⚠️ FIREWALL LEVEL: ${activeNode.id === 'firewall' ? 'LOW' : activeNode.id === 'database' ? 'MEDIUM' : 'CRITICAL'}`,
      `🔄 INITIALIZING FALLOUT CODE DECIPHER ENGINE...`
    ]);

    setTimeout(() => {
      const textLines = generateTerminalContent(activeNode.words);
      setTerminalLines(textLines);
      setGameState('hacking');
      playBeep(880, 0.1, 'square');
      setTerminalLogs(prev => [...prev, `🔐 DECRYPTION PROTOCOL LOADED. SELECT ENCRYPTED WORD TO SOLVE HASH.`]);
    }, 2000);
  };

  // Check character matches ( likeness )
  const checkLikeness = (word1, word2) => {
    let matches = 0;
    const len = Math.min(word1.length, word2.length);
    for (let i = 0; i < len; i++) {
      if (word1[i] === word2[i]) {
        matches++;
      }
    }
    return matches;
  };

  // Submit word guess
  const handleSelectWord = (word) => {
    if (gameState !== 'hacking') return;
    playBeep(500, 0.08, 'triangle');

    const cleanWord = word.toUpperCase();
    if (cleanWord === activeNode.secret.toUpperCase()) {
      // COMPROMISED SUCCESS
      playBeep(1200, 0.4, 'sine');
      setTimeout(() => playBeep(1500, 0.2, 'sine'), 100);
      setGameState('compromised');
      setTerminalLogs(prev => [
        ...prev,
        `> Selecting: ${cleanWord}`,
        `✨ SUCCESS: BUFFER HASH MATCHES SECRET KEY!`,
        `🔓 COMPROMISING NODE SYSTEM PERMISSIONS...`,
        `📂 TELEMETRY DUMPED.`
      ]);

      // Update node state
      setNodes(prevNodes => {
        return prevNodes.map(n => {
          if (n.id === activeNodeId) {
            return { ...n, hacked: true };
          }
          // Unlock the next node in order
          if (activeNodeId === 'firewall' && n.id === 'database') {
            return { ...n, locked: false };
          }
          if (activeNodeId === 'database' && n.id === 'mainframe') {
            return { ...n, locked: false };
          }
          return n;
        });
      });
      
      if (activeNode.id === 'mainframe') {
        onUnlockToxicTheme();
      }
    } else {
      // WRONG WORD
      const likeness = checkLikeness(cleanWord, activeNode.secret.toUpperCase());
      const remaining = attempts - 1;
      setAttempts(remaining);

      if (remaining <= 0) {
        // FAILED LOCKOUT
        playBeep(220, 0.5, 'sawtooth');
        setGameState('failed');
        setTerminalLogs(prev => [
          ...prev,
          `> Selecting: ${cleanWord}`,
          `❌ ERROR: HASH MISMATCH. LIKENESS = ${likeness}`,
          `🚨 FIREWALL INTRUSION DETECTED! ACCESS DENIED.`,
          `💀 TERMINAL LOCKOUT ACTIVE. PLEASE TRY SCAN AGAIN.`
        ]);
      } else {
        // CONTINUE
        playBeep(330, 0.2, 'sine');
        setTerminalLogs(prev => [
          ...prev,
          `> Selecting: ${cleanWord}`,
          `❌ ACCESS DENIED. LIKENESS = ${likeness} / ${activeNode.secret.length}`,
          `⚠️ ATTEMPTS REMAINING: ${'🟩'.repeat(remaining)}${'🟥'.repeat(4 - remaining)}`
        ]);
      }
    }
  };

  // Reset current node scan
  const handleResetScan = () => {
    playBeep(600, 0.1, 'sine');
    setGameState('idle');
    setAttempts(4);
    setTerminalLogs([]);
  };

  // Select another node on the SVG graph
  const handleSelectNode = (nodeId) => {
    const target = nodes.find(n => n.id === nodeId);
    if (!target) return;
    if (target.locked) {
      playBeep(220, 0.2, 'sawtooth');
      return;
    }
    playBeep(450, 0.06, 'sine');
    setActiveNodeId(nodeId);
    setGameState('idle');
    setAttempts(4);
    setTerminalLogs([]);
  };

  // Parse scrambled lines to locate interactive word spans
  const renderScrambledRow = (row) => {
    const { address, content } = row;
    const elements = [];
    let i = 0;

    // Check if line contains any of our target words
    let matchedWord = null;
    let wordStart = -1;

    for (let word of activeNode.words) {
      const idx = content.indexOf(word);
      if (idx !== -1) {
        matchedWord = word;
        wordStart = idx;
        break;
      }
    }

    if (matchedWord) {
      // Render text before word
      if (wordStart > 0) {
        elements.push(<span key="pre" className="text-[var(--text-secondary)] opacity-60">{content.slice(0, wordStart)}</span>);
      }

      // Render interactive word button
      elements.push(
        <button
          key="word"
          onClick={() => handleSelectWord(matchedWord)}
          onMouseEnter={() => {
            setHoveredWord(matchedWord);
            playBeep(900, 0.02, 'sine');
          }}
          onMouseLeave={() => setHoveredWord(null)}
          className={`font-bold transition-all px-0.5 rounded cursor-pointer ${
            hoveredWord === matchedWord 
              ? 'bg-[var(--primary-color)] text-black font-extrabold shadow-[0_0_8px_var(--primary-color)]' 
              : 'text-[var(--primary-color)] hover:scale-105'
          }`}
        >
          {matchedWord}
        </button>
      );

      // Render text after word
      const afterIdx = wordStart + matchedWord.length;
      if (afterIdx < content.length) {
        elements.push(<span key="post" className="text-[var(--text-secondary)] opacity-60">{content.slice(afterIdx)}</span>);
      }
    } else {
      // Render standard junk characters
      elements.push(<span key="junk" className="text-[var(--text-secondary)] opacity-60">{content}</span>);
    }

    return (
      <div key={address} className="flex font-fira text-xs select-none">
        <span className="text-[var(--text-secondary)] font-semibold mr-3 font-mono">{address}:</span>
        <div className="flex-1 font-mono tracking-wider">{elements}</div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-5 glow-border bg-[rgba(0,0,0,0.25)] flex flex-col space-y-4 relative overflow-hidden transition-all duration-300">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 select-none">
        <h3 className="font-outfit text-sm font-semibold tracking-wider text-[var(--primary-color)] flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          CYBER BREACH SANDBOX
        </h3>
        <span className="font-fira text-[9px] text-[var(--text-secondary)] tracking-widest uppercase">
          SECURE_VAULT_BREACH // CORE v1.2
        </span>
      </div>

      {/* Node Map Representation */}
      <div className="bg-black/35 rounded-lg border border-[var(--border-color)] p-3 flex flex-col items-center">
        <div className="text-[9px] font-fira text-[var(--text-secondary)] self-start mb-2 uppercase">
          Subnet Network Mapping
        </div>
        
        {/* Simple visual graph interface */}
        <div className="flex items-center justify-between w-full max-w-sm relative px-4 py-2 select-none">
          {/* Connector line background */}
          <div className="absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-white/10 z-0" />
          <div className={`absolute top-[28px] left-[15%] w-[35%] h-[2px] z-0 transition-colors duration-300 ${
            nodes[0].hacked ? 'bg-[var(--success-color)]' : 'bg-white/10'
          }`} />
          <div className={`absolute top-[28px] left-[50%] w-[35%] h-[2px] z-0 transition-colors duration-300 ${
            nodes[1].hacked ? 'bg-[var(--success-color)]' : 'bg-white/10'
          }`} />

          {nodes.map((n, idx) => {
            const isActive = activeNodeId === n.id;
            const isHacked = n.hacked;
            const isLocked = n.locked;

            return (
              <button
                key={n.id}
                onClick={() => handleSelectNode(n.id)}
                disabled={isLocked && activeNodeId !== n.id}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all duration-300 ${
                  isLocked ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:scale-105'
                }`}
              >
                {/* Node Ring/Dot */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isActive 
                    ? 'border-[var(--primary-color)] bg-[rgba(203,166,247,0.15)] shadow-[0_0_12px_var(--primary-color)] scale-110' 
                    : isHacked 
                      ? 'border-[var(--success-color)] bg-green-500/10 shadow-[0_0_8px_var(--success-color)]' 
                      : 'border-[var(--border-color)] bg-black/45'
                }`}>
                  {isHacked ? (
                    <ShieldCheck className="w-4 h-4 text-[var(--success-color)]" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-[var(--text-secondary)]" />
                  ) : isActive ? (
                    <Server className="w-4 h-4 text-[var(--primary-color)] animate-pulse" />
                  ) : (
                    <Server className="w-4 h-4 text-[var(--text-primary)]" />
                  )}
                </div>

                {/* Node details tooltip hover labels */}
                <span className={`text-[8px] font-fira font-bold mt-1.5 uppercase ${
                  isActive ? 'text-[var(--primary-color)]' : isHacked ? 'text-[var(--success-color)]' : 'text-[var(--text-secondary)]'
                }`}>
                  Node {idx + 1}
                </span>
                <span className="text-[7px] text-[var(--text-secondary)] font-mono">{n.ip}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Sandbox Decryption Space */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left Side: Word decryption grid (3 columns) */}
        <div className="md:col-span-3 flex flex-col bg-black/45 rounded-lg border border-[var(--border-color)] p-4 min-h-[260px] justify-center">
          {gameState === 'idle' && (
            <div className="text-center flex flex-col items-center justify-center space-y-3 p-4 select-none">
              <Key className="w-8 h-8 text-[var(--primary-color)] animate-bounce" />
              <h4 className="font-outfit text-xs font-bold text-[var(--text-primary)]">{activeNode.name}</h4>
              <p className="text-[10px] font-fira text-[var(--text-secondary)] max-w-[220px]">
                {activeNode.desc}
              </p>
              <button
                onClick={handleInitiateBreach}
                className="px-4 py-2 border border-[var(--primary-color)] text-xs text-black font-bold bg-[var(--primary-color)] rounded shadow-[0_0_10px_var(--primary-color)] hover:scale-103 active:scale-95 transition-all cursor-pointer"
              >
                INITIATE BREACH
              </button>
            </div>
          )}

          {gameState === 'scanning' && (
            <div className="text-center flex flex-col items-center justify-center space-y-3 p-4 select-none">
              <div className="w-8 h-8 border-4 border-t-[var(--primary-color)] border-[var(--border-color)] rounded-full animate-spin" />
              <h4 className="font-fira text-[11px] text-[var(--primary-color)] animate-pulse">PROBING ENCRYPTED SHELL CORE...</h4>
              <p className="text-[9px] font-fira text-[var(--text-secondary)]">
                Bypassing active firewalls at {activeNode.ip}...
              </p>
            </div>
          )}

          {(gameState === 'hacking' || gameState === 'compromised' || gameState === 'failed') && (
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center text-[10px] font-fira border-b border-[var(--border-color)] pb-1.5 mb-1.5">
                <span className="text-[var(--text-secondary)] uppercase">Memory Core Hex Matrix</span>
                <span className="text-[var(--primary-color)] font-bold">
                  ATTEMPTS LEFT: {attempts} / 4
                </span>
              </div>
              <div className="space-y-1">
                {terminalLines.map(line => renderScrambledRow(line))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Logging & Decrypted Rewards feed (2 columns) */}
        <div className="md:col-span-2 flex flex-col bg-black/45 rounded-lg border border-[var(--border-color)] p-3.5 select-none text-[10px] font-fira min-h-[260px]">
          <div className="text-[9px] text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1 mb-2 font-bold uppercase">
            Hacker Logs / Dump Payload
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-1 text-[9px] leading-relaxed max-h-[170px] pr-1 scrollbar-thin">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="break-words">
                {log.startsWith('✨') || log.startsWith('🔓') ? (
                  <span className="text-[var(--success-color)] font-semibold">{log}</span>
                ) : log.startsWith('❌') || log.startsWith('💀') || log.startsWith('🚨') ? (
                  <span className="text-[var(--accent-color)] font-semibold">{log}</span>
                ) : log.startsWith('>') ? (
                  <span className="text-[var(--primary-color)] font-bold">{log}</span>
                ) : (
                  <span className="text-[var(--text-secondary)] opacity-85">{log}</span>
                )}
              </div>
            ))}
            {gameState === 'compromised' && (
              <div className="mt-3 p-2 bg-green-500/10 border border-[var(--success-color)]/25 rounded text-[9px] text-[var(--success-color)] leading-normal">
                <ShieldCheck className="w-4 h-4 mb-1" />
                <span className="font-bold">{activeNode.reward}</span>
              </div>
            )}
            {gameState === 'failed' && (
              <div className="mt-3 p-2 bg-red-500/10 border border-[var(--accent-color)]/25 rounded text-[9px] text-[var(--accent-color)] leading-normal">
                <AlertTriangle className="w-4 h-4 mb-1 animate-pulse" />
                <strong>SYSTEM LOCKOUT ENFORCED!</strong> Security triggers have locked current buffer credentials. Reset scanner to bypass again.
              </div>
            )}
          </div>

          {/* Action buttons at bottom */}
          {(gameState === 'compromised' || gameState === 'failed') && (
            <div className="pt-2 border-t border-[var(--border-color)] mt-2 flex gap-2">
              <button
                onClick={handleResetScan}
                className={`flex-1 py-1.5 rounded border text-[9px] font-bold text-center transition-all cursor-pointer ${
                  gameState === 'compromised'
                    ? 'border-[var(--border-color)] hover:border-[var(--primary-color)] text-[var(--text-primary)] hover:bg-white/5'
                    : 'border-[var(--accent-color)] text-[var(--accent-color)] bg-red-500/5 hover:bg-red-500/15'
                }`}
              >
                RESET TERMINAL
              </button>
              {gameState === 'compromised' && activeNodeId !== 'mainframe' && (
                <button
                  onClick={() => {
                    const nextId = activeNodeId === 'firewall' ? 'database' : 'mainframe';
                    handleSelectNode(nextId);
                  }}
                  className="flex-1 py-1.5 rounded bg-[var(--primary-color)] text-black font-bold text-[9px] text-center hover:scale-103 transition-all cursor-pointer"
                >
                  NEXT NODE
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CyberBreach;
