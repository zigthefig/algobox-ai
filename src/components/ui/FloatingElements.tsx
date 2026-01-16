import { motion } from 'framer-motion';

interface FloatingElementsProps {
  count?: number;
}

export function FloatingElements({ count = 6 }: FloatingElementsProps) {
  const elements = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 6,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    duration: 12 + Math.random() * 8,
    delay: Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: el.size,
            height: el.size,
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: el.delay,
          }}
        />
      ))}
    </div>
  );
}
