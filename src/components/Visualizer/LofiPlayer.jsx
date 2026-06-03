import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Terminal, Sparkles } from 'lucide-react';

function LofiPlayer({ 
  audioElement, 
  isPlaying, 
  currentTrack, 
  volume, 
  playTrack, 
  pauseTrack, 
  togglePlay, 
  nextTrack, 
  prevTrack, 
  setVolume, 
  playlist 
}) {
  const [visualizerMode, setVisualizerMode] = useState('neon'); // 'neon' or 'ascii'
  const canvasRef = useRef(null);
  const asciiRef = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Setup HTML5 AudioContext & AnalyserNode safely (avoiding double-connection bugs)
  useEffect(() => {
    if (!audioElement) return;

    const setupAudioContext = () => {
      // Re-use already set up nodes on window to avoid reconnect exceptions in React
      if (analyserRef.current) return;

      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        
        let ctx = window.__sharedLofiAudioContext;
        if (!ctx) {
          ctx = new AudioContextClass();
          window.__sharedLofiAudioContext = ctx;
        }

        let analyser = window.__sharedLofiAnalyser;
        if (!analyser) {
          analyser = ctx.createAnalyser();
          analyser.fftSize = 64; // 32 frequency bins
          window.__sharedLofiAnalyser = analyser;
        }

        let source = window.__sharedLofiSource;
        if (!source) {
          source = ctx.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(ctx.destination);
          window.__sharedLofiSource = source;
        }

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      } catch (err) {
        console.warn("AudioContext setup failed:", err);
      }
    };

    if (isPlaying) {
      setupAudioContext();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  }, [audioElement, isPlaying]);

  // Handle the visualization drawing loops
  useEffect(() => {
    let animationFrameId;

    const renderNeonCanvas = (dataArray, bufferLength) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      // Extract colors dynamically from CSS variables
      const rootStyle = getComputedStyle(document.documentElement);
      const primaryColor = rootStyle.getPropertyValue('--primary-color').trim() || '#cba6f7';
      const secondaryColor = rootStyle.getPropertyValue('--secondary-color').trim() || '#89b4fa';

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.85;

        // Visual gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, secondaryColor);
        gradient.addColorStop(1, primaryColor);

        ctx.fillStyle = gradient;

        // Draw rounded rectangle
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, height - barHeight, barWidth - 4, barHeight, 3);
        } else {
          ctx.rect(x, height - barHeight, barWidth - 4, barHeight);
        }
        ctx.fill();

        x += barWidth;
      }
    };

    const renderAsciiText = (dataArray, bufferLength) => {
      const asciiElement = asciiRef.current;
      if (!asciiElement) return;

      const numCols = 14;
      const numRows = 6;
      const colWidth = 2;

      // Downsample 32 bands to 14
      const cols = [];
      const step = Math.floor(bufferLength / numCols);
      for (let c = 0; c < numCols; c++) {
        let sum = 0;
        for (let s = 0; s < step; s++) {
          sum += dataArray[c * step + s] || 0;
        }
        cols.push(sum / step);
      }

      // Build grid string
      let grid = "";
      for (let r = 0; r < numRows; r++) {
        let rowStr = "";
        for (let c = 0; c < numCols; c++) {
          const val = cols[c] / 255;
          const cellHeight = val * numRows;
          const targetHeight = numRows - r;

          if (cellHeight >= targetHeight) {
            rowStr += "█".repeat(colWidth);
          } else if (cellHeight >= targetHeight - 0.5) {
            rowStr += "▄".repeat(colWidth);
          } else {
            rowStr += " ".repeat(colWidth);
          }
          rowStr += " "; // spacing
        }
        grid += rowStr + "\n";
      }
      asciiElement.textContent = grid;
    };

    const clearNeonCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const clearAsciiText = () => {
      const asciiElement = asciiRef.current;
      if (!asciiElement) return;

      const numCols = 14;
      const numRows = 6;
      const colWidth = 2;
      let grid = "";
      for (let r = 0; r < numRows; r++) {
        let rowStr = "";
        for (let c = 0; c < numCols; c++) {
          if (r === numRows - 1) {
            rowStr += "▄".repeat(colWidth);
          } else {
            rowStr += " ".repeat(colWidth);
          }
          rowStr += " ";
        }
        grid += rowStr + "\n";
      }
      asciiElement.textContent = grid;
    };

    const tick = () => {
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        if (visualizerMode === 'neon') {
          renderNeonCanvas(dataArray, bufferLength);
        } else {
          renderAsciiText(dataArray, bufferLength);
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      tick();
    } else {
      if (visualizerMode === 'neon') {
        clearNeonCanvas();
      } else {
        clearAsciiText();
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, visualizerMode]);

  // Adjust volume change
  const handleVolumeSlider = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const currentTrackInfo = playlist[currentTrack] || { title: "Station Off", artist: "DevPulse OS" };

  return (
    <div className="glass-panel glow-border p-4 md:p-5 flex flex-col gap-4 bg-[rgba(10,10,12,0.65)] relative overflow-hidden">
      {/* Small Cyberpunk background layout detail */}
      <div className="absolute top-1 right-2 font-fira text-[8px] text-[var(--text-secondary)] select-none opacity-40">
        LOFI_STATION // CH:1
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
        <Music className="w-4 h-4 text-[var(--primary-color)] animate-pulse" />
        <h2 className="font-outfit text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase select-none">
          Lofi Focus Deck
        </h2>
        <span className={`w-1.5 h-1.5 rounded-full ml-auto ${isPlaying ? 'bg-[var(--success-color)] shadow-[0_0_8px_var(--success-color)]' : 'bg-red-500 animate-pulse'}`} />
      </div>

      {/* Main player layout splitting */}
      <div className="flex items-center gap-4">
        {/* Animated Record Disk */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-full border border-[var(--border-color)] flex items-center justify-center bg-black/40 shadow-inner overflow-hidden ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
            {/* Record Grooves */}
            <div className="absolute w-12 h-12 rounded-full border border-dashed border-white/5" />
            <div className="absolute w-8 h-8 rounded-full border border-dashed border-white/10" />
            {/* Record Label */}
            <div className="w-6 h-6 rounded-full bg-[var(--primary-color)] flex items-center justify-center z-10 shadow-[0_0_8px_var(--primary-color)]">
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
            </div>
          </div>
          {/* Tone Arm element */}
          <div className={`absolute top-0 right-[-4px] w-5 h-8 origin-top-right transition-transform duration-500 ${isPlaying ? 'rotate-12' : 'rotate-0'} pointer-events-none`}>
            <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
              <path d="M15 2 L10 12 L12 25 L8 26" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="6" y="24" width="4" height="4" rx="1" fill="var(--primary-color)" />
            </svg>
          </div>
        </div>

        {/* Track Metadata Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center select-none">
          <div className="font-outfit text-xs text-[var(--text-secondary)] tracking-widest uppercase">
            Now Playing
          </div>
          <div className="font-outfit text-sm font-bold text-[var(--text-primary)] truncate tracking-wider glow-text">
            {currentTrackInfo.title}
          </div>
          <div className="font-fira text-[11px] text-[var(--text-secondary)] truncate">
            {currentTrackInfo.artist}
          </div>
          <div className="font-fira text-[9px] text-[var(--text-secondary)] mt-1 opacity-70">
            Track {currentTrack + 1} of {playlist.length}
          </div>
        </div>
      </div>

      {/* Visualizer Panel Container */}
      <div className="relative w-full h-16 bg-black/30 border border-[var(--border-color)] rounded-lg overflow-hidden flex items-center justify-center p-1">
        {visualizerMode === 'neon' ? (
          <canvas 
            ref={canvasRef} 
            width={240} 
            height={56} 
            className="w-full h-full opacity-80" 
          />
        ) : (
          <pre 
            ref={asciiRef} 
            className="font-fira text-[7px] text-[var(--primary-color)] font-bold tracking-wider leading-none select-none text-center"
          />
        )}
      </div>

      {/* Visualizer Mode Switch and Audio Controls */}
      <div className="flex flex-col gap-3">
        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Visualizer mode toggle */}
          <button 
            onClick={() => setVisualizerMode(prev => prev === 'neon' ? 'ascii' : 'neon')}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[rgba(255,255,255,0.03)] border border-[var(--border-color)] hover:border-[var(--primary-color)] transition-all font-fira text-[9px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Toggle Visualizer Mode"
          >
            {visualizerMode === 'neon' ? (
              <>
                <Terminal className="w-3 h-3 text-[var(--primary-color)]" />
                <span>MODE: NEON</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[var(--primary-color)]" />
                <span>MODE: ASCII</span>
              </>
            )}
          </button>

          {/* Media controller */}
          <div className="flex items-center gap-3">
            <button 
              onClick={prevTrack}
              className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] border border-transparent hover:border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={togglePlay}
              className="p-2 rounded-full bg-[var(--primary-color)] text-black hover:scale-105 active:scale-95 shadow-[0_0_10px_var(--primary-color)] transition-all cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
            </button>
            <button 
              onClick={nextTrack}
              className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] border border-transparent hover:border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dummy element for spacer */}
          <div className="w-20 hidden md:block" />
        </div>

        {/* Volume controller row */}
        <div className="flex items-center gap-3 px-1">
          <Volume2 className="w-3.5 h-3.5 text-[var(--text-secondary)] flex-shrink-0" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolumeSlider}
            className="flex-1 h-1 rounded-lg bg-[rgba(255,255,255,0.1)] appearance-none cursor-pointer accent-[var(--primary-color)]"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
          <span className="font-fira text-[10px] text-[var(--text-secondary)] min-w-[28px] text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default LofiPlayer;
