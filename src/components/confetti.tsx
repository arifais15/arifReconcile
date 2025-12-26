
"use client";

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAR_COUNT = 50;
const STAR_COLORS = ['#FFD700', '#FFAC33', '#FF8C00', '#FF6347', '#FF4500'];
const STAR_SIZES = [8, 12, 16];

type Star = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
};

export function Confetti() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 30,
      vx: Math.random() * 4 - 2, 
      vy: Math.random() * 2 + 1,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      size: STAR_SIZES[Math.floor(Math.random() * STAR_SIZES.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setStars(prevStars => 
        prevStars.map(star => {
          const newY = star.y + star.vy;
          if (newY > window.innerHeight + 20) {
            // Reset star to the top
            return {
              ...star,
              y: -20,
              x: Math.random() * window.innerWidth,
            };
          }
          return {
            ...star,
            y: newY,
            x: star.x + star.vx,
            rotation: star.rotation + star.rotationSpeed,
          };
        }).filter(star => star.y <= window.innerHeight + 20)
      );
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [stars]);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
      {stars.map(star => (
        <Star
          key={star.id}
          className="absolute"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            color: star.color,
            fill: star.color,
            transform: `rotate(${star.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
