import React, { useState, useEffect, useRef } from 'react';

const SUGGESTED_COMMANDS = ['help', 'about', 'skills', 'projects', 'contact', 'theme', 'sound', 'clear', 'neofetch'];

function TerminalInput({ onCommandSubmit, contactFormMode, contactStep, playTypeSound }) {
  const [value, setValue] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);

  // Keep input focused automatically on clicking the terminal container
  useEffect(() => {
    focusInput();
  }, []);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    // 1. Enter key executes the command
    if (e.key === 'Enter') {
      const commandText = value.trim();
      if (commandText) {
        onCommandSubmit(commandText);
        if (!contactFormMode) {
          setHistoryList(prev => [commandText, ...prev]);
        }
        setHistoryIndex(-1);
        setValue('');
      }
      return;
    }

    // 2. Tab completion (disabled in contact input mode)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (contactFormMode) return;

      const trimmedVal = value.trim().toLowerCase();
      if (!trimmedVal) return;

      const matched = SUGGESTED_COMMANDS.find(cmd => cmd.startsWith(trimmedVal));
      if (matched) {
        setValue(matched);
      }
      return;
    }

    // 3. ArrowUp and ArrowDown history recall (disabled in contact input mode)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (contactFormMode || historyList.length === 0) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex < historyList.length) {
        setHistoryIndex(nextIndex);
        setValue(historyList[nextIndex]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (contactFormMode || historyList.length === 0) return;

      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setValue(historyList[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setValue('');
      }
      return;
    }
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
    playTypeSound();
  };

  // Build the prompt prefix
  const getPromptPrefix = () => {
    if (contactFormMode) {
      if (contactStep === 0) return "[Name] 👤 ➜ ";
      if (contactStep === 1) return "[Email] ✉️ ➜ ";
      if (contactStep === 2) return "[Message] 💬 ➜ ";
    }
    return "visitor@devpulse:~$ ";
  };

  return (
    <div 
      className="flex items-center px-4 py-3 bg-[rgba(0,0,0,0.2)] border-t border-[var(--border-color)] font-fira text-sm cursor-text"
      onClick={focusInput}
    >
      <span className="text-[var(--primary-color)] mr-2 font-semibold select-none">
        {getPromptPrefix()}
      </span>
      <div className="relative flex-1 flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full bg-transparent text-[var(--text-primary)] border-none outline-none font-fira text-sm caret-transparent select-none z-10"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
        {/* Customized visual text renderer to simulate blink cursor */}
        <span className="text-[var(--text-primary)] font-fira text-sm whitespace-pre pointer-events-none">
          {value}
        </span>
        <span className="terminal-cursor pointer-events-none" />
      </div>
    </div>
  );
}

export default TerminalInput;
