"use client";

import { useState, useEffect } from "react";

export function LiveCounter({ realCount = 0, suffix = "+ Servers", className = "" }: { realCount?: number | null, suffix?: string, className?: string }) {
  const [count, setCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [animatingLive, setAnimatingLive] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const targetCount = realCount || 0;
    
    // Launch fast initial count animation
    const offset = Math.min(targetCount, 250); // Start animating from slightly below
    let current = targetCount > 0 ? targetCount - offset : 0; 
    setCount(current);
    
    const duration = 2000; 
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed < duration) {
        // Ease Out Quartic
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 4);
        current = Math.floor((targetCount - offset) + (offset * easeOut));
        setCount(current);
        requestAnimationFrame(animate);
      } else {
        setCount(targetCount);
      }
    };
    
    requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydration safety
  if (!isClient) {
    return <span className={`text-white font-bold opacity-0 transition-opacity ${className}`}>762{suffix}</span>;
  }

  return (
    <span className={`text-transparent bg-clip-text font-black transition-all duration-300 ${animatingLive ? 'bg-gradient-to-r from-emerald-400 to-emerald-200 scale-105 inline-block' : 'bg-gradient-to-r from-white to-white'} ${className}`}>
      {count.toLocaleString('en-US')}{suffix}
    </span>
  );
}
