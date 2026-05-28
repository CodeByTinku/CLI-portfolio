import React, { useEffect, useRef } from 'react';

function TerminalHistory({ history }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom of the console history grid
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const getLineStyle = (type) => {
    switch (type) {
      case 'system':
        return 'text-[var(--text-secondary)] opacity-90 font-medium';
      case 'input':
        return 'text-[var(--primary-color)] font-semibold';
      case 'success':
        return 'text-[var(--success-color)] font-medium glow-text';
      case 'error':
        return 'text-[var(--accent-color)] font-semibold';
      case 'title':
        return 'text-[var(--primary-color)] text-lg font-bold border-b border-dashed border-[var(--border-color)] pb-1 mb-1';
      case 'secondary':
        return 'text-[var(--text-secondary)] italic text-sm opacity-80';
      case 'spacing':
        return 'h-3';
      default:
        return 'text-[var(--text-primary)]';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-3 font-fira text-sm leading-relaxed space-y-1 scroll-smooth"
    >
      {history.map((line, idx) => (
        <div 
          key={idx} 
          className={`${getLineStyle(line.type)} whitespace-pre-wrap`}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}

export default TerminalHistory;
