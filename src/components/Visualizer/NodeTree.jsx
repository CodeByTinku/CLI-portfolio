import React, { useEffect, useRef, useState } from 'react';

const SKILL_NODES = [
  { id: 'react', label: 'React', size: 38, tag: 'react' },
  { id: 'nextjs', label: 'Next.js', size: 34, tag: 'react' },
  { id: 'js', label: 'JavaScript', size: 35, tag: 'js' },
  { id: 'tailwind', label: 'Tailwind v4', size: 36, tag: 'tailwindcss' },
  { id: 'framer', label: 'Framer Motion', size: 32, tag: 'framer' },
  { id: 'node', label: 'Node.js', size: 33, tag: 'node' },
  { id: 'canvas', label: 'HTML5 Canvas', size: 30, tag: 'canvas' },
  { id: 'git', label: 'Git & GitHub', size: 32, tag: 'git' }
];

// Node class for visual canvas updates
class SkillNode {
  constructor(data, width, height) {
    this.id = data.id;
    this.label = data.label;
    this.size = data.size;
    this.tag = data.tag;
    
    // Random position in canvas boundaries
    this.x = Math.random() * (width - 100) + 50;
    this.y = Math.random() * (height - 100) + 50;
    
    // Small random velocity vector
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    
    this.glow = 0;
    this.targetGlow = 0;
  }

  update(width, height, mouseX, mouseY) {
    // 1. Move the node based on velocity
    this.x += this.vx;
    this.y += this.vy;

    // 2. Dynamic Bounce Boundaries
    if (this.x - this.size < 0) {
      this.x = this.size;
      this.vx *= -1;
    } else if (this.x + this.size > width) {
      this.x = width - this.size;
      this.vx *= -1;
    }

    if (this.y - this.size < 0) {
      this.y = this.size;
      this.vy *= -1;
    } else if (this.y + this.size > height) {
      this.y = height - this.size;
      this.vy *= -1;
    }

    // 3. Subtle attraction toward mouse coordinate if within range
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 150) {
      this.vx += (dx / dist) * 0.04;
      this.vy += (dy / dist) * 0.04;
      
      // Limit speed
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1.2) {
        this.vx = (this.vx / speed) * 1.2;
        this.vy = (this.vy / speed) * 1.2;
      }
    } else {
      // Return to cruising speed
      this.vx += (Math.random() - 0.5) * 0.02;
      this.vy += (Math.random() - 0.5) * 0.02;
    }

    // Smooth glowing transitions
    this.glow += (this.targetGlow - this.glow) * 0.1;
  }

  draw(ctx, primaryColor, secondaryColor, textColor, accentColor) {
    ctx.save();
    
    // Draw neon connection ring
    ctx.shadowBlur = this.glow > 0.1 ? 15 + this.glow * 10 : 8;
    ctx.shadowColor = this.glow > 0.1 ? accentColor : primaryColor;

    // Circle background fill
    ctx.fillStyle = this.glow > 0.1 ? 'rgba(0,0,0,0.45)' : 'rgba(0, 0, 0, 0.3)';
    ctx.strokeStyle = this.glow > 0.1 ? accentColor : primaryColor;
    ctx.lineWidth = this.glow > 0.1 ? 3 : 1.5;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Node inner text label
    ctx.shadowBlur = 0; // disable shadows for text sharpness
    ctx.fillStyle = this.glow > 0.1 ? accentColor : textColor;
    ctx.font = '500 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x, this.y);

    ctx.restore();
  }
}

function NodeTree({ onSelectCommand, triggerGlowCommand }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 350 });
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Get active computed theme styles dynamically from DOM CSS variable mapping
  const getThemeColors = () => {
    if (typeof window === 'undefined') return {};
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue('--primary-color').trim() || '#cba6f7',
      secondary: styles.getPropertyValue('--secondary-color').trim() || '#89b4fa',
      accent: styles.getPropertyValue('--accent-color').trim() || '#f38ba8',
      text: styles.getPropertyValue('--text-primary').trim() || '#cdd6f4',
    };
  };

  // Re-calculate container dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 350
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize nodes only once or on major resize
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      nodesRef.current = SKILL_NODES.map(node => new SkillNode(node, dimensions.width, dimensions.height));
    }
  }, [dimensions]);

  // Handle external visual glows triggered from terminal shell commands
  useEffect(() => {
    if (triggerGlowCommand === 'skills') {
      // Glow all nodes momentarily
      nodesRef.current.forEach(n => {
        n.targetGlow = 1;
        setTimeout(() => {
          n.targetGlow = 0;
        }, 3000);
      });
    }
  }, [triggerGlowCommand]);

  // Main canvas animation loop
  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const colors = getThemeColors();

      // 1. Draw connections lines between near nodes
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            ctx.save();
            ctx.strokeStyle = colors.primary;
            ctx.globalAlpha = Math.max(0.02, (160 - dist) / 160) * 0.25;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 2. Update and draw nodes
      nodes.forEach(node => {
        node.update(dimensions.width, dimensions.height, mouseRef.current.x, mouseRef.current.y);
        node.draw(ctx, colors.primary, colors.secondary, colors.text, colors.accent);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [dimensions]);

  // Handle click captures to execute visual tags selection
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked inside a node circle boundaries
    const clickedNode = nodesRef.current.find(node => {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.size;
    });

    if (clickedNode) {
      // Glow clicked node
      clickedNode.targetGlow = 1;
      setTimeout(() => {
        clickedNode.targetGlow = 0;
      }, 1000);

      // Execute custom script filters in Terminal Shell
      onSelectCommand(`projects --tag ${clickedNode.tag}`);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <div 
      ref={containerRef} 
      className="relative flex flex-col items-center glass-panel p-4 glow-border bg-[rgba(0,0,0,0.2)]"
    >
      <div className="w-full flex items-center justify-between border-b border-[var(--border-color)] pb-2 mb-3">
        <h3 className="font-outfit text-sm font-semibold tracking-wider text-[var(--primary-color)] flex items-center gap-2 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] animate-ping" />
          INTERACTIVE SKILLS CONNECTORS
        </h3>
        <span className="text-[10px] font-fira text-[var(--text-secondary)] select-none">
          CLICK NODE TO FILTER PROJECTS
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair w-full h-[350px] transition-colors duration-300"
      />
    </div>
  );
}

export default NodeTree;
