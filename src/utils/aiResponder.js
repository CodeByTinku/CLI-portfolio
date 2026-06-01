// PulseAI - Local Chatbot Pattern-Matching Responder Logic
export const getAIResponse = (query) => {
  const cleanQuery = query.toLowerCase().trim();

  // Helper matching function
  const matches = (keywords) => {
    return keywords.some(keyword => cleanQuery.includes(keyword));
  };

  // 1. GREETINGS
  if (matches(["hi", "hello", "hey", "sup", "yo", "namaste", "greetings"])) {
    return {
      text: "🤖 PulseAI: Hello human! I am the automated terminal AI co-pilot. How can I assist you with Tinku's workstation today?\nType 'skills', 'projects', 'contact', or simply ask me a question!",
      type: "success"
    };
  }

  // 2. IDENTITY / CREATOR
  if (matches(["who are you", "your name", "what is this", "pulseai", "bot", "identity"])) {
    return {
      text: "🤖 PulseAI: I am PulseAI v1.0, a simulated sandbox helper agent running on DevPulse OS.\nMy purpose is to guide you through Tinku's portfolio workstation, explain his technical stack, and reveal system easter eggs! 🛸",
      type: "success"
    };
  }

  if (matches(["tinku", "creator", "author", "developer"])) {
    return {
      text: "🤖 PulseAI: Tinku is a passionate full-stack developer who loves crafting high-fidelity interactive visual architectures.\nHe has built this entire terminal emulator and node-physics graph from scratch using React 19 and Tailwind CSS v4! 💻",
      type: "success"
    };
  }

  // 3. SKILLS / TECHNOLOGIES
  if (matches(["skills", "stack", "languages", "technologies", "tech", "react", "javascript", "css", "node"])) {
    return {
      text: "🤖 PulseAI: Tinku is highly proficient in modern web tech:\n" +
            "• React 19 / Next.js (90%)\n" +
            "• JavaScript ES6+ (85%)\n" +
            "• Tailwind CSS v4 (92%)\n" +
            "• HTML5 Canvas & Physics Engine (70%)\n" +
            "• Node.js & Express (75%)\n\n" +
            "👉 Quick Tip: You can execute the 'skills' command in the main prompt to see a cool progress-bar matrix representation!",
      type: "success"
    };
  }

  // 4. PROJECTS
  if (matches(["projects", "portfolio", "work", "apps", "websites", "repository", "github"])) {
    return {
      text: "🤖 PulseAI: Tinku has built some stellar projects:\n" +
            "1. 🎮 Game Explorer - Modern game discovery powered by RAWG API.\n" +
            "2. 🌸 Anime Explorer - Watchlist tracking engine with clean motion frames.\n" +
            "3. 📈 Finance Flow - Student budget optimizer with Recharts visualizations.\n" +
            "4. 📊 Github-Visualizer - Visual activity boards & commits metrics dashboard.\n\n" +
            "👉 Quick Tip: Type 'projects' in the main terminal to fetch direct URLs & interactive stack listings!",
      type: "success"
    };
  }

  // 5. CONTACT / HIRE
  if (matches(["contact", "hire", "email", "reach", "message", "social", "github", "linkedin"])) {
    return {
      text: "🤖 PulseAI: Want to get in touch with Tinku?\n" +
            "• Email Wizard: Type 'contact' in the main console to trigger the interactive mailing assistant!\n" +
            "• GitHub: https://github.com/swarnkar-tinku\n" +
            "Let's build something epic together! 🤝",
      type: "success"
    };
  }

  // 6. RESUME / EDUCATION / EXPERIENCE
  if (matches(["resume", "job", "education", "experience", "college", "degree"])) {
    return {
      text: "🤖 PulseAI: Tinku is currently a 12th grade student .  \n" +
            "He has built active projects utilizing serverless microservices, Canvas render loops, and standard state management pipelines. He is open to internship roles and collaborative project builds!",
      type: "success"
    };
  }

  // 6a. AGE / BIRTHDAY
  if (matches(["age", "how old", "umar", "saal", "birthday", "birth"])) {
    return {
      text: "🤖 PulseAI: Tinku is currently 17 years old, balancing high school studies with a deep passion for full-stack programming! ⚡",
      type: "success"
    };
  }

  // 6b. LOCATION / RESIDENCE
  if (matches(["live", "location", "city", "where from", "address", "rehte ho", "ghar", "country"])) {
    return {
      text: "🤖 PulseAI: Tinku is from India! 🇮🇳\nHe creates futuristic interactive architectures right from his home workstation.",
      type: "success"
    };
  }

  // 6c. STUDY / SCHOOL / STREAM
  if (matches(["study", "school", "class", "grade", "stream", "subject", "padh rahe ho", "kaha padhte ho"])) {
    return {
      text: "🤖 PulseAI: Tinku is currently pursuing his 12th grade!\n" +
            "• Stream: Commerce Stream (with strong focus on Computer Science) 🔬💻\n" +
            "• Mindset: Continuous self-taught development and building modern user interfaces.",
      type: "success"
    };
  }


  // 7. EASTER EGGS / SYSTEM SECRETS
  if (matches(["secrets", "easter eggs", "hacks", "game", "play", "snake"])) {
    return {
      text: "🤖 PulseAI: [CLASSIFIED INFORMATION DETECTED] 🤫\n" +
            "• Try typing 'play' to unlock the integrated arcade cabinet Snake game!\n" +
            "• Try switching environments using 'theme cyberpunk' or 'theme matrix'.\n" +
            "• There might be secret commands like 'neofetch' waiting to be run...",
      type: "success"
    };
  }

  // 8. BYE / EXIT
  if (matches(["bye", "goodbye", "exit", "quit", "close"])) {
    return {
      text: "🤖 PulseAI: Powering down chatbot thread... Goodbye human! Type 'exit' to return to standard shell.",
      type: "system"
    };
  }

  // 9. FALLBACK FOR UNKNOWN INPUTS
  const fallbacks = [
    "🤖 PulseAI: Analyzing input... [No direct match found].\nCould you ask about 'skills', 'projects', 'contact' or 'secrets'?",
    "🤖 PulseAI: I'm still learning! Ask me about Tinku's 'experience', 'technologies', or try typing 'projects'.",
    "🤖 PulseAI: Accessing local files... 🔎\nI couldn't find a direct match. Try asking: 'Who is Tinku?' or 'What are his skills?'",
    "🤖 PulseAI: Command recognized as natural speech. I recommend asking me about 'who are you', 'hire', or 'themes'!"
  ];

  return {
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    type: "success"
  };
};
