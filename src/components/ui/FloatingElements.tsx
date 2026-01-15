import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'circle' | 'square' | 'hexagon';
}

export function FloatingElements() {
  const shapes: FloatingShape[] = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 40 + 20,
    rotation: Math.random() * 360,
    type: ['circle', 'square', 'hexagon'][Math.floor(Math.random() * 3)] as FloatingShape['type'],
  }));

  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes with framer-motion */}
      {shapes.map((shape, i) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 10, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div 
            className={`border border-primary/20 backdrop-blur-sm ${
              shape.type === 'circle' ? 'rounded-full bg-primary/5' : 
              shape.type === 'hexagon' ? 'bg-accent/5' : 'bg-secondary/5'
            }`}
            style={{ 
              width: shape.size, 
              height: shape.size,
              clipPath: shape.type === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : undefined,
            }} 
          />
        </motion.div>
      ))}

      {/* Animated glow orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-2/3 right-1/4 w-24 h-24 rounded-full bg-secondary/15 blur-2xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
