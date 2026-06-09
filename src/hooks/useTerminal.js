import { useState, useCallback, useRef, useEffect } from 'react';
import { getAIResponse } from '../utils/aiResponder';

// Lofi music playlist data
const MUSIC_PLAYLIST = [
  {
    title: "Back Alley Daydream",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/01-2258203-Dave%20Crum-Back%20Alley%20Daydream.mp3",
    duration: "1:55"
  },
  {
    title: "Clouds on Repeat",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/02-2258205-Dave%20Crum-Clouds%20on%20Repeat.mp3",
    duration: "1:50"
  },
  {
    title: "Rain on the Skylight",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/03-2258241-Dave%20Crum-Rain%20on%20the%20Skylight.mp3",
    duration: "2:11"
  },
  {
    title: "Raindrops on Pine Needles",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/04-2258243-Dave%20Crum-Raindrops%20on%20Pine%20Needles.mp3",
    duration: "2:36"
  },
  {
    title: "Roots and Reflections",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/05-2258244-Dave%20Crum-Roots%20and%20Reflections.mp3",
    duration: "2:05"
  },
  {
    title: "Whispers Between Trees",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/06-2258248-Dave%20Crum-Whispers%20Between%20Trees.mp3",
    duration: "1:45"
  },
  {
    title: "Wind-Up Dreamscape",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/07-2258249-Dave%20Crum-Wind-Up%20Dreamscape.mp3",
    duration: "2:36"
  },
  {
    title: "Waves on Cassette",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/08-2258247-Dave%20Crum-Waves%20on%20Cassette.mp3",
    duration: "2:18"
  },
  {
    title: "Umbrellas and Echoes",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/09-2258246-Dave%20Crum-Umbrellas%20and%20Echoes.mp3",
    duration: "2:52"
  },
  {
    title: "The Wind Knows My Name",
    artist: "Dave Crum",
    src: "https://archive.org/download/jamendo-605372/10-2258245-Dave%20Crum-The%20Wind%20Knows%20My%20Name.mp3",
    duration: "2:09"
  }
];


// Core projects data
const PROJECTS_DATA = [
  { name: "Game Explorer", desc: "A modern game discovery React app utilizing RAWG API with trivia quiz.", link: "https://game-explorer-pink.vercel.app/", tags: ["React", "TailwindCSS", "Framer Motion", "Axios"] },
  { name: "Anime Explorer", desc: "A React app to discover anime and manage your personal watchlist, powered by the Jikan API.", link: "https://anime-explorer-chi.vercel.app/", tags: ["React-Router", "Axios", "Lucide-React", "TailwindCSS"] },
  { name: "Finance Flow", desc: "A modern, interactive budgeting tool designed specifically for students and young professionals.", link: "https://finance-flow-kohl.vercel.app/", tags: ["React", "Rechart-js", "TailwindCSS", "Typescript"] },
  { name: "Github-Visualizer", desc: "React GitHub Dashboard: Animated stats, heatmaps, badges & profile card.", link: "https://git-hub-visualizer.vercel.app/", tags: ["React", "Framer-Motion", "Axios", "Lucide-React"] },
  { name: "AI-virtual-mouse", desc: "Transforms your webcam into a responsive, low-latency mouse controlled by hand gestures.", link: "#", tags: ["Python", "OpenCV", "mediapipe", "pyautogui", "Numpy"] },
  
];

// Core skills data
const SKILLS_DATA = [
  { name: "React / Next.js", level: 90, bar: "█████████░" },
  { name: "JavaScript (ES6+)", level: 85, bar: "████████░░" },
  { name: "Tailwind CSS v4", level: 92, bar: "█████████░" },
  { name: "Framer Motion", level: 80, bar: "████████░░" },
  { name: "Node.js / Express", level: 75, bar: "███████░░░" },
  { name: "HTML5 Canvas / SVG", level: 70, bar: "███████░░░" },
  { name: "Git / Github", level: 80, bar: "████████░░" },
  { name: "Redux / Toolkit", level: 60, bar: "██████░░░░" },
  { name: "Python", level: 50, bar: "█████░░░░░" },
  { name: "C / C++", level: 40, bar: "████░░░░░░" },
  { name: "GSAP", level: 30, bar: "███░░░░░░░" },
  { name: "CLI", level: 70, bar: "███████░░░" },
  { name: "Figma", level: 80, bar: "████████░░" },
];

export function useTerminal(activeTheme, setActiveTheme, onNodeTrigger, setDashboardTab) {
  const [history, setHistory] = useState([
    { text: "Welcome to DevPulse OS v1.0.4", type: "system" },
    { text: "Type 'help' to fetch all supported core shell commands.", type: "system" },
    { text: "Clicking nodes in the Right Graph will execute visual command syncs.", type: "system" },
    { text: "", type: "spacing" }
  ]);
  const [commandQueue, setCommandQueue] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameActive, setGameActive] = useState(false);
  const [sysmonActive, setSysmonActive] = useState(false);

  // Audio Player states & instances
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.5);

  const audioRef = useRef(null);
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";
    audioRef.current.volume = audioVolume;
  }


  // Contact form multi-step state
  const [contactForm, setContactForm] = useState({
    active: false,
    step: 0,
    name: '',
    email: '',
    message: ''
  });

  // PulseAI Interactive Mode State
  const [aiMode, setAiMode] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);


  // Sound effects player
  const playTypeSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800 + Math.random() * 200, audioCtx.currentTime); // random typing beep frequency
      gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime); // keep it subtle
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.04); // short duration click sound
    } catch (e) {
      // AudioContext failed/not authorized yet
    }
  }, [soundEnabled]);

  const addLine = useCallback((text, type = "normal") => {
    setHistory(prev => [...prev, { text, type }]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([
      { text: "Console history wiped clean.", type: "system" },
      { text: "Type 'help' to display options.", type: "system" }
    ]);
  }, []);

  const playTrack = useCallback((index) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (index < 0 || index >= MUSIC_PLAYLIST.length) return;

    const track = MUSIC_PLAYLIST[index];
    const isNewTrack = audio.src !== track.src;
    
    if (isNewTrack) {
      audio.src = track.src;
      audio.load();
    }

    audio.play()
      .then(() => {
        setIsPlaying(true);
        setCurrentTrack(index);
      })
      .catch(err => {
        console.log("Audio playback failed:", err);
        setIsPlaying(false);
      });
  }, []);

  const pauseTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(currentTrack);
    }
  }, [isPlaying, currentTrack, playTrack, pauseTrack]);

  const nextTrack = useCallback(() => {
    const nextIdx = (currentTrack + 1) % MUSIC_PLAYLIST.length;
    playTrack(nextIdx);
  }, [currentTrack, playTrack]);

  const prevTrack = useCallback(() => {
    const prevIdx = (currentTrack - 1 + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
    playTrack(prevIdx);
  }, [currentTrack, playTrack]);

  const changeVolume = useCallback((val) => {
    const cleanVal = Math.max(0, Math.min(1, val));
    setAudioVolume(cleanVal);
    if (audioRef.current) {
      audioRef.current.volume = cleanVal;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextTrack]);

  const simulateTyping = useCallback((text, type = "normal", speed = 10) => {
    setAiTyping(true);
    let currentText = "";
    
    // Add an empty line first
    setHistory(prev => [...prev, { text: "", type }]);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setHistory(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { text: currentText, type };
          }
          return updated;
        });
        
        if (soundEnabled && index % 2 === 0) {
          playTypeSound();
        }
        index++;
      } else {
        clearInterval(interval);
        setAiTyping(false);
      }
    }, speed);
  }, [soundEnabled, playTypeSound]);


  const handleCommand = useCallback((rawInput) => {
    const input = rawInput.trim();
    if (!input) return;

    // Play keystroke select click sound
    playTypeSound();

    // 2. If PulseAI Interactive Chatbot Mode is ACTIVE, handle inputs via the AI responder
    if (aiMode) {
      addLine(`> ${input}`, "input");
      
      const lowerInput = input.toLowerCase().trim();
      if (lowerInput === "exit" || lowerInput === "quit") {
        setAiMode(false);
        addLine("🤖 Exiting PulseAI session. Back to normal shell.", "system");
        return;
      }
      
      const response = getAIResponse(input);
      simulateTyping(response.text, response.type);
      return;
    }

    // 1. If Contact Form Wizard is ACTIVE, handle inputs linearly rather than as terminal commands
    if (contactForm.active) {

      addLine(`> ${input}`, "input");
      
      if (contactForm.step === 0) { // Name step
        setContactForm(prev => ({ ...prev, step: 1, name: input }));
        addLine("Enter your email address:", "system");
      } else if (contactForm.step === 1) { // Email step
        // Simple regex check
        if (!input.includes("@") || !input.includes(".")) {
          addLine("⚠️ Invalid email format. Please enter a valid email:", "error");
          return;
        }
        setContactForm(prev => ({ ...prev, step: 2, email: input }));
        addLine("Enter your message:", "system");
      } else if (contactForm.step === 2) { // Message step
        const finalForm = { ...contactForm, message: input };
        addLine("Processing payload and transmitting form details to inbox...", "system");
        
        // Real Web3Forms API submission
        const accessKey = import.meta.env.VITE_WEB3FORMS_KEY || "25c01e83-d762-49be-a531-5bfabe8ee922";
        
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            access_key: accessKey,
            name: finalForm.name,
            email: finalForm.email,
            message: finalForm.message,
            subject: `New Contact from Portfolio - ${finalForm.name}`
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              addLine("✨ Message transmitted successfully! I will get back to you soon.", "success");
            } else {
              addLine(`⚠️ API Transmission failed: ${data.message || 'Unknown error'}. Please try again later.`, "error");
            }
          })
          .catch(err => {
            addLine("❌ Critical connection error: Failed to connect to server.", "error");
          })
          .finally(() => {
            addLine("Exited contact prompt wizard mode.", "system");
            setContactForm({ active: false, step: 0, name: '', email: '', message: '' });
          });
      }
      return;
    }

    // Standard CLI Command Execution Flow
    addLine(`visitor@devpulse:~$ ${input}`, "input");

    const parts = input.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        addLine("Supported commands:", "system");
        addLine("  about       - Detailed biography and developer profile.", "normal");
        addLine("  skills      - Displays tech proficiency values visually.", "normal");
        addLine("  projects    - List active development repositories and links.", "normal");
        addLine("  contact     - Launches interactive input wizard to send me an email.", "normal");
        addLine("  ai          - Launches interactive conversational PulseAI chatbot.", "normal");
        addLine("  ask <query> - Instantly query PulseAI with a single natural language question.", "normal");
        addLine("  theme <val> - Switch skins: [dracula, cyberpunk, matrix, retro, toxic]", "normal");
        addLine("  sound       - Toggle interface typing sound click [on/off]", "normal");
        addLine("  play <game> - Launches Retro Arcade. Try: 'play', 'play snake', 'play invaders'", "normal");
        addLine("  music <opt> - Control Lofi Radio. Try: 'music list', 'music play', 'music pause'", "normal");
        addLine("  volume <val>- Set volume level (0-100).", "normal");
        addLine("  sysmon      - Launches interactive fullscreen system diagnostics monitor.", "normal");
        addLine("  hack        - Launch Cyber Breach visual interface in Right Panel.", "normal");
        addLine("  hack status - Display target node network permission levels.", "normal");
        addLine("  clear       - Wipes the console terminal history grid.", "normal");
        addLine("  neofetch    - Retro hardware and profile spec list.", "normal");
        break;

      case 'sysmon':
      case 'monitor':
      case 'status':
        addLine("🖥️ Booting System Resource Monitor & Diagnostic Daemon...", "success");
        setSysmonActive(true);
        break;

      case 'hack':
      case 'breach': {
        const sub = args[0] ? args[0].toLowerCase() : null;
        if (sub === 'status') {
          addLine("📡 Current Subnet Breach Status:", "title");
          const savedNodes = localStorage.getItem('devpulse_breach_nodes');
          if (savedNodes) {
            try {
              const parsed = JSON.parse(savedNodes);
              parsed.forEach((n, idx) => {
                addLine(`Node ${idx + 1}: ${n.name.padEnd(16)} [${n.ip}] - ${n.hacked ? '🔓 COMPROMISED' : n.locked ? '🔒 LOCKED' : '🔴 VULNERABLE'}`, n.hacked ? "success" : n.locked ? "secondary" : "error");
              });
            } catch (e) {
              addLine("Error parsing breach nodes database.", "error");
            }
          } else {
            addLine("Node 1: Firewall Gate    [192.168.42.1] - 🔴 VULNERABLE", "error");
            addLine("Node 2: Database Core    [192.168.42.5] - 🔒 LOCKED", "secondary");
            addLine("Node 3: Mainframe Admin  [192.168.42.9] - 🔒 LOCKED", "secondary");
          }
          break;
        }
        
        addLine("📡 Initializing Cyber Breach Terminal. Connection mapped to Right Panel dashboard tab...", "success");
        if (setDashboardTab) setDashboardTab('breach');
        break;
      }



      case 'about':
        addLine("System Bio:", "title");
        addLine("Hi! I'm Tinku, an aspiring full-stack learner who loves crafting visual systems.", "normal");
        addLine("I specialize in frontend development.", "normal");
        addLine("I believe websites should not just function, they should WOW the user visually with seamless motion.", "normal");
        break;

      case 'skills':
        addLine("Core Skill Matrix Proficiency:", "title");
        SKILLS_DATA.forEach(skill => {
          addLine(`${skill.name.padEnd(20)} ${skill.bar} ${skill.level}%`, "normal");
        });
        addLine("Tip: You can click the floating nodes in the Right Panel to trigger direct skills commands!", "system");
        if (onNodeTrigger) onNodeTrigger("skills");
        break;

      case 'projects':
        addLine("Highlighted Repositories:", "title");
        PROJECTS_DATA.forEach((proj, idx) => {
          addLine(`[${idx + 1}] ${proj.name} - ${proj.desc}`, "success");
          addLine(`    Link: ${proj.link} | Stack: ${proj.tags.join(', ')}`, "secondary");
        });
        break;

      case 'contact':
        addLine("💡 Initializing interactive contact mailing assistant...", "system");
        addLine("Type your full name to start:", "system");
        setContactForm({ active: true, step: 0, name: '', email: '', message: '' });
        break;

      case 'ai':
      case 'chat':
      case 'pulseai':
        addLine("🤖 PulseAI Interactive Chatbot Thread Activated!", "title");
        addLine("Hi! I am PulseAI. How can I assist you with Tinku's portfolio workstation today?", "success");
        addLine("Type your questions below (e.g., 'skills', 'projects', 'resume', 'secrets').", "normal");
        addLine("Type 'exit' or 'quit' to return to standard shell.", "secondary");
        setAiMode(true);
        break;

      case 'ask':
        if (args.length === 0) {
          addLine("⚠️ Usage: ask <your question here>", "error");
        } else {
          const query = args.join(" ");
          const response = getAIResponse(query);
          simulateTyping(response.text, response.type);
        }
        break;


      case 'theme':
        if (!args[0]) {
          addLine("⚠️ Please specify a theme name. Options: [dracula, cyberpunk, matrix, retro, toxic]", "error");
          break;
        }
        const targetTheme = args[0].toLowerCase();
        if (['dracula', 'cyberpunk', 'matrix', 'retro'].includes(targetTheme)) {
          setActiveTheme(targetTheme);
          addLine(`🎨 Environment theme successfully switched to: [${targetTheme}]`, "success");
        } else if (targetTheme === 'toxic') {
          const savedNodes = localStorage.getItem('devpulse_breach_nodes');
          let unlocked = false;
          if (savedNodes) {
            try {
              const parsed = JSON.parse(savedNodes);
              const mainframe = parsed.find(n => n.id === 'mainframe');
              if (mainframe && mainframe.hacked) unlocked = true;
            } catch (e) {}
          }
          if (unlocked) {
            setActiveTheme('toxic');
            addLine("🎨 Environment theme successfully switched to: [toxic]", "success");
          } else {
            addLine("⚠️ Theme 'toxic' is locked. Compromise Node 3 (Mainframe Admin) in Cyber Breach to unlock!", "error");
          }
        } else {
          addLine(`⚠️ Theme '${targetTheme}' is not supported. Try help.`, "error");
        }
        break;

      case 'sound':
        if (!args[0]) {
          addLine(`Sound is currently: ${soundEnabled ? '[ON]' : '[OFF]'}`, "system");
          addLine("Toggle usage: 'sound on' or 'sound off'", "secondary");
          break;
        }
        const state = args[0].toLowerCase();
        if (state === 'on') {
          setSoundEnabled(true);
          addLine("🔊 Keystroke sound effects activated.", "success");
        } else if (state === 'off') {
          setSoundEnabled(false);
          addLine("🔇 Terminal sound muted.", "system");
        } else {
          addLine("⚠️ Invalid option. Use: sound [on/off]", "error");
        }
        break;

      case 'play':
      case 'game':
        const chosenGame = args[0] ? args[0].toLowerCase() : null;
        if (chosenGame === 'snake') {
          addLine("🎮 Initializing Snake.OS Virtual Thread...", "system");
          setGameActive('snake');
        } else if (['invaders', 'space', 'shooter'].includes(chosenGame)) {
          addLine("🎮 Initializing DevInvaders Virtual Thread...", "system");
          setGameActive('invaders');
        } else if (chosenGame === 'music' || chosenGame === 'lofi') {
          addLine("🎵 Booting Lofi Music Station daemon...", "success");
          playTrack(currentTrack);
        } else {
          addLine("🎮 Initializing DevPulse Retro Arcade Cabinet Selection Thread...", "system");
          setGameActive('menu');
        }
        break;

      case 'music':
      case 'lofi': {
        const subCommand = args[0] ? args[0].toLowerCase() : null;
        if (!subCommand) {
          addLine("🎵 Lofi Music Station CLI", "title");
          addLine("Available options:", "system");
          addLine("  music play        - Start playing current lofi track.", "normal");
          addLine("  music play <1-10> - Play specific track from playlist.", "normal");
          addLine("  music pause       - Pause playing music.", "normal");
          addLine("  music next        - Skip to next track.", "normal");
          addLine("  music prev        - Go back to previous track.", "normal");
          addLine("  music list        - Display tracks list.", "normal");
          addLine("  music volume <0-100> - Adjust station volume.", "normal");
          break;
        }

        if (subCommand === 'play') {
          const trackArg = args[1];
          if (trackArg) {
            const trackNum = parseInt(trackArg, 10);
            if (isNaN(trackNum) || trackNum < 1 || trackNum > MUSIC_PLAYLIST.length) {
              const query = args.slice(1).join(" ").toLowerCase();
              const foundIdx = MUSIC_PLAYLIST.findIndex(t => t.title.toLowerCase().includes(query));
              if (foundIdx !== -1) {
                addLine(`🔊 Stream requested: [${foundIdx + 1}] ${MUSIC_PLAYLIST[foundIdx].title} by ${MUSIC_PLAYLIST[foundIdx].artist}...`, "success");
                playTrack(foundIdx);
              } else {
                addLine(`⚠️ Invalid track index or search query. Must be 1 to ${MUSIC_PLAYLIST.length} or track title.`, "error");
              }
            } else {
              addLine(`🔊 Stream requested: [${trackNum}] ${MUSIC_PLAYLIST[trackNum - 1].title} by ${MUSIC_PLAYLIST[trackNum - 1].artist}...`, "success");
              playTrack(trackNum - 1);
            }
          } else {
            addLine(`🔊 Resuming lofi stream: ${MUSIC_PLAYLIST[currentTrack].title}...`, "success");
            playTrack(currentTrack);
          }
        } else if (subCommand === 'pause' || subCommand === 'stop') {
          pauseTrack();
          addLine("⏸️ Lofi stream paused.", "system");
        } else if (subCommand === 'next') {
          nextTrack();
          const nextIdx = (currentTrack + 1) % MUSIC_PLAYLIST.length;
          addLine(`⏭️ Skipping to: [${nextIdx + 1}] ${MUSIC_PLAYLIST[nextIdx].title}...`, "success");
        } else if (subCommand === 'prev') {
          prevTrack();
          const prevIdx = (currentTrack - 1 + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
          addLine(`⏮️ Returning to: [${prevIdx + 1}] ${MUSIC_PLAYLIST[prevIdx].title}...`, "success");
        } else if (subCommand === 'list') {
          addLine("🎵 DevPulse Lofi Station Playlist:", "title");
          MUSIC_PLAYLIST.forEach((t, i) => {
            const isCurrent = i === currentTrack && isPlaying;
            addLine(`${isCurrent ? '▶ ' : '  '}[${i + 1}] ${t.title.padEnd(28)} - ${t.artist} (${t.duration})`, isCurrent ? "success" : "normal");
          });
        } else if (subCommand === 'volume') {
          const volArg = args[1];
          if (!volArg) {
            addLine(`🔊 Station Volume: ${Math.round(audioVolume * 100)}%`, "system");
          } else {
            const pct = parseInt(volArg, 10);
            if (isNaN(pct) || pct < 0 || pct > 100) {
              addLine("⚠️ Volume must be a number between 0 and 100.", "error");
            } else {
              changeVolume(pct / 100);
              addLine(`🔊 Volume set to ${pct}%`, "success");
            }
          }
        } else {
          addLine(`⚠️ Unknown music command option: '${subCommand}'. Try 'music' or 'help'.`, "error");
        }
        break;
      }

      case 'volume':
        if (!args[0]) {
          addLine(`🔊 Volume level: ${Math.round(audioVolume * 100)}%`, "system");
          addLine("Usage: volume <0-100>", "secondary");
        } else {
          const pct = parseInt(args[0], 10);
          if (isNaN(pct) || pct < 0 || pct > 100) {
            addLine("⚠️ Volume level must be between 0 and 100.", "error");
          } else {
            changeVolume(pct / 100);
            addLine(`🔊 Volume adjusted to: ${pct}%`, "success");
          }
        }
        break;

      case 'clear':

        clearHistory();
        break;

      case 'neofetch':
        addLine("               ,g,           OS: DevPulse OS v1.0.4 x86_64", "success");
        addLine("              dBMBb          Host: Tinku Workstation", "success");
        addLine("            ,dBBBBBBb        Kernel: React 19.0.0", "success");
        addLine("          ,dBBBBBBBBBBb      Uptime: 2h 45m", "success");
        addLine("        ,dBBBBBBBBBBBBBBb    Shell: Antigravity Custom Shell", "success");
        addLine("      ,dBBBBBBBBBBBBBBBBBBb  Resolution: 1920x1080 (Neon Fluid)", "success");
        addLine("    ,dBBBBBBBBBBBBBBBBBBBBBb Terminal: HTML5/CSS3 Web Console", "success");
        addLine("   dBBBBBBBBBBBBBBBBBBBBBBBBb CPU: Gemini Flash Core 3.5", "success");
        addLine("   `YBBBBBBBBBBBBBBBBBBBBBBb' GPU: Tailwind Engine CSS 4", "success");
        addLine("     `YBBBBBBBBBBBBBBBBBBb'   Memory: 16GB Virtual LocalStorage", "success");
        break;

      default:
        // Check for node specific searches
        if (command.startsWith("project") && input.includes("--tag")) {
          const tag = input.split("--tag ")[1]?.toLowerCase();
          if (tag) {
            addLine(`Filtering projects associated with tag: [${tag}]`, "system");
            const filtered = PROJECTS_DATA.filter(p => p.tags.some(t => t.toLowerCase() === tag));
            if (filtered.length > 0) {
              filtered.forEach(p => addLine(`-> ${p.name}: ${p.desc}`, "success"));
            } else {
              addLine(`No projects found featuring the stack tag [${tag}].`, "error");
            }
          }
          break;
        }

        addLine(`⚠️ Command not found: '${command}'. Type 'help' for available instructions.`, "error");
    }

  }, [contactForm, addLine, clearHistory, playTypeSound, setActiveTheme, onNodeTrigger, soundEnabled, setGameActive, sysmonActive, setSysmonActive, aiMode, simulateTyping, isPlaying, currentTrack, audioVolume, playTrack, pauseTrack, nextTrack, prevTrack, changeVolume, setDashboardTab]);

  return {
    history,
    contactFormMode: contactForm.active,
    contactStep: contactForm.step,
    aiMode,
    aiTyping,
    handleCommand,
    addLine,
    playTypeSound,
    gameActive,
    setGameActive,
    sysmonActive,
    setSysmonActive,
    soundEnabled,
    
    // Audio Player integrations
    audioElement: audioRef.current,
    isPlaying,
    currentTrack,
    audioVolume,
    playTrack,
    pauseTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    changeVolume,
    playlist: MUSIC_PLAYLIST
  };

}
