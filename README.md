# 🖥️ DevPulse OS v1.0.4

> A futuristic, interactive, terminal-based developer portfolio combined with a visual GUI workspace. Featuring interactive physics-based node graphs, dynamic multi-theme simulation, simulated GitHub analytics, and synthesized retro sound effects.

---

## 🚀 Welcome to DevPulse OS

**DevPulse OS** is a premium, high-impact developer portfolio designed to captivate visitors with a sleek command-line interface (CLI) and an elegant graphical user interface (GUI). Instead of a standard static landing page, DevPulse OS offers a fully immersive, retro-futuristic simulation of a hacker workstation workstation.

Built on top of **React 19**, **Tailwind CSS v4**, and **Framer Motion**, DevPulse OS synchronizes standard CLI command flows with visual graphic widgets.

---

## 🎨 Tech Stack & Badges

![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4.0-E10098?style=for-the-badge&logo=framer&logoColor=white)
![HTML5 Canvas](https://img.shields.io/badge/HTML5_Canvas-HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3.8.1-22B573?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---
## 
🚀 Demo You can try **CLI-Portfolio** live here: [![Deploy with Vercel](https://vercel.com/button)]()

## ✨ Key Features & Experience Design

### ⌨️ Interactive Hacker Terminal (CLI)
* **Custom Terminal Engine**: Features a simulated `bash` prompt environment running under standard React states.
* **Auto-Focus & Interactive Caret**: Fully custom blink cursor and input overlay.
* **Tab Completion**: Hit `[Tab]` to autocomplete shell commands instantly.
* **Command History Navigation**: Use `[ArrowUp]` and `[ArrowDown]` to walk through previously run commands.
* **Typing Synthesizer**: Uses the browser's **Web Audio API** to dynamically generate real-time oscillator sine-wave tick sounds for realistic keystroke feedback.
* **CRT Grid Scanlines Filter**: CRT monitor overlay emulation that adds nostalgic scanline flickers to retro themes.

### 🌐 Physics-Based Connectors Node Graph
* **Canvas Physics Simulator**: A customized HTML5 Canvas particle system acting as a dynamic skills bubble graph.
* **Collision Bouncing**: Node bubbles float and bounce realistically off the container borders.
* **Mouse Gravity Field**: Node particles detect mouse proximity and exhibit a magnetic attraction to the cursor coordinates.
* **Inter-Node Connector Web**: Visual neon nodes dynamically draw lines connecting near neighbors.
* **Bi-directional Terminal Sync**: Clicking any floating skill node dynamically runs the custom command `projects --tag <tag>` in the terminal to filter matching portfolio projects.

### 🎭 Multi-Theme OS Environment Switcher
Switch visual layouts instantly using either the top GUI selector or by running the `theme <val>` shell command. The entire design system is powered by Tailwind CSS v4 variables mapping:

1. **🧛 Dracula (Default)**: Sleek cyber-gothic palette featuring pastel purples, soft pinks, and dark shadows.
2. **🦾 Cyberpunk**: High-octane neon cyan accents, hot pink boundaries, and a digital neon backdrop matrix grid.
3. **🟢 Matrix**: Deep black void containing a dynamic canvas binary code stream (Katakana matrix digital rain).
4. **🔶 Retro IBM**: Nostalgic classic amber PC phosphor feel, CRT flickering scanlines, and high-contrast terminal lines.

### 📊 Git Analytics & Contribution Board
* **Visual Language Distribution**: Responsive chart powered by Recharts detailing developer skills (JavaScript, React/JSX, CSS/Tailwind, Node/Express).
* **90-Day Contribution Commit Heatmap**: Visual activity stream grid mimicking GitHub contribution commits with custom level weight color shifts and scaling hover states.

### ✉️ Interactive Lead Generation Form Wizard
* **Terminal Wizard Mode**: Typing `contact` suspends the standard CLI shell and launches a step-by-step conversational mailing guide.
* **Linear Validation**: Collects Name, Email (with syntax regex validation), and Message directly inside the terminal.
* **Serverless Pipeline**: Transmits payloads to your inbox seamlessly using **Web3Forms API** with failure alerts and success states.

### 🕹️ Interactive CLI Retro Arcade Cabinet
* **Simulated Arcade Screen**: Typing `play` or `game` seamlessly suspends standard terminal flow and initializes a fully responsive retro-themed Snake arcade cabinet environment within the left panel!
* **High Score Persistence**: Persists your highest score records locally in the browser via **LocalStorage API**.
* **Synthesized Audio Prompts**: Emits retro beep frequency transitions for game start boots, score acquisitions, and system crash game-over sweeps.
* **Responsive Visual Board**: Features custom neon-glowing CSS cell rendering styled dynamically with active visual themes variables mapping (Amber in Retro, Hacker Green in Matrix, Cyan/Pink in Cyberpunk).

---


## 🐚 Supported Shell Commands Index

Typing `help` in the terminal details all supported interactive shell commands:

| Command | Usage | Description |
|:---|:---|:---|
| `help` | `help` | Fetches a list of all supported core console operations. |
| `about` | `about` | Prints biography, developer stats, and core philosophies. |
| `skills` | `skills` | Renders a visual ASCII horizontal progress bar representing tech skills. |
| `projects` | `projects` | Renders portfolio repositories list with links, details, and stack tags. |
| `projects --tag <val>` | `projects --tag react` | Filters and displays only projects tagged with the specified technology. |
| `contact` | `contact` | Initializes the multi-step interactive contact mailing assistant. |
| `theme <val>` | `theme cyberpunk` | Switches the theme environment instantly. Options: `[dracula, cyberpunk, matrix, retro]`. |
| `sound <val>` | `sound off` | Toggles Web Audio typing synthesizer click sounds. Options: `[on, off]`. |
| `play` | `play` | Suspends standard shell to launch interactive Retro Snake Arcade Game. |
| `neofetch` | `neofetch` | Outputs classic retro hardware system specs, React core, and OS status. |
| `clear` | `clear` | Wipes the console screen buffer clean. |


---

## 🛠️ Local Installation & Development

Get your custom DevPulse OS workstation up and running on your local machine:

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd devpulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory to store your API credentials:
```env
VITE_WEB3FORMS_KEY=your-web3forms-access-key-here
```
*(If left empty, a fallback submission key is provided to ensure contact flow validation works out-of-the-box.)*

### 4. Launch the local dev server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```

---

## 📁 File Structure Highlights

```
devpulse/
├── src/
│   ├── components/
│   │   ├── Terminal/
│   │   │   ├── TerminalHistory.jsx  # Renders scrolling shell list
│   │   │   └── TerminalInput.jsx    # Custom keyboard capture & auto-completion
│   │   ├── Visualizer/
│   │   │   ├── GithubStats.jsx      # Recharts graph & commit matrix
│   │   │   └── NodeTree.jsx         # HTML5 Canvas physics bubble graph
│   │   └── ThemeSelector.jsx        # GUI theme button container
│   ├── hooks/
│   │   └── useTerminal.js           # CLI State machine & command processors
│   ├── App.jsx                      # Main workspace grid & backgrounds
│   ├── App.css
│   ├── index.css                    # Tailwind CSS v4 setup & theme variables
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 👤 Author & Design

Designed and developed with ❤️ by **Tinku**. 
Feel free to launch the terminal and type `contact` to get in touch!
