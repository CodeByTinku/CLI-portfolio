import { useState, useCallback, useRef } from 'react';

// Core projects data
const PROJECTS_DATA = [
  { name: "Game Explorer", desc: "A modern game discovery React app utilizing RAWG API with trivia quiz.", link: "https://game-explorer-pink.vercel.app/", tags: ["React", "TailwindCSS", "Framer Motion", "Axios"] },
  { name: "Anime Tracker", desc: "Interactive media journal to manage watched series and releases.", link: "#", tags: ["React", "Zustand", "TailwindCSS"] },
  { name: "DevPulse Portfolio", desc: "This CLI interactive hacker terminal dashboard app.", link: "#", tags: ["React", "HTML5 Canvas", "Recharts", "Framer Motion"] },
  { name: "Retro Chat", desc: "A real-time socket-based web chat application with nostalgic pixel-art styles.", link: "#", tags: ["Socket.io", "Express", "React"] }
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

export function useTerminal(activeTheme, setActiveTheme, onNodeTrigger) {
  const [history, setHistory] = useState([
    { text: "Welcome to DevPulse OS v1.0.4", type: "system" },
    { text: "Type 'help' to fetch all supported core shell commands.", type: "system" },
    { text: "Clicking nodes in the Right Graph will execute visual command syncs.", type: "system" },
    { text: "", type: "spacing" }
  ]);
  const [commandQueue, setCommandQueue] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Contact form multi-step state
  const [contactForm, setContactForm] = useState({
    active: false,
    step: 0,
    name: '',
    email: '',
    message: ''
  });

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

  const handleCommand = useCallback((rawInput) => {
    const input = rawInput.trim();
    if (!input) return;

    // Play keystroke select click sound
    playTypeSound();

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
        addLine("  theme <val> - Switch skins: [dracula, cyberpunk, matrix, retro]", "normal");
        addLine("  sound       - Toggle interface typing sound click [on/off]", "normal");
        addLine("  clear       - Wipes the console terminal history grid.", "normal");
        addLine("  neofetch    - Retro hardware and profile spec list.", "normal");
        break;

      case 'about':
        addLine("System Bio:", "title");
        addLine("Hi! I'm Tinku, an aspiring full-stack learner who loves crafting visual systems.", "normal");
        addLine("I specialize in frontend development , high-level interactive Canvas grids, and backend services.", "normal");
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

      case 'theme':
        if (!args[0]) {
          addLine("⚠️ Please specify a theme name. Options: [dracula, cyberpunk, matrix, retro]", "error");
          break;
        }
        const targetTheme = args[0].toLowerCase();
        if (['dracula', 'cyberpunk', 'matrix', 'retro'].includes(targetTheme)) {
          setActiveTheme(targetTheme);
          addLine(`🎨 Environment theme successfully switched to: [${targetTheme}]`, "success");
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

  }, [contactForm, addLine, clearHistory, playTypeSound, setActiveTheme, onNodeTrigger, soundEnabled]);

  return {
    history,
    contactFormMode: contactForm.active,
    contactStep: contactForm.step,
    handleCommand,
    addLine,
    playTypeSound
  };
}
