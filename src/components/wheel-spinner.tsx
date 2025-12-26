
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Disc } from 'lucide-react';
import { Confetti } from './confetti';

type RecallSpinEvent = CustomEvent<{ onSpinComplete: (newNumber: number) => void }>;

export function WheelSpinner({ 
  onNewResult,
  min,
  max,
  isSpinning,
  setIsSpinning,
}: { 
  onNewResult: (result: number) => void,
  min: number,
  max: number,
  isSpinning: boolean,
  setIsSpinning: (isSpinning: boolean) => void,
}) {
  const [result, setResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rotation, setRotation] = useState(0);

  const wheelRef = useRef<HTMLDivElement>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winnerSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    spinSoundRef.current = new Audio('/sounds/tick.mp3');
    spinSoundRef.current.loop = true;
    winnerSoundRef.current = new Audio('/sounds/win.mp3');
    
    const handleRecallSpin = (event: Event) => {
      const recallEvent = event as RecallSpinEvent;
      const onSpinComplete = recallEvent.detail.onSpinComplete;
      handleSpin(onSpinComplete);
    };

    document.addEventListener('recallSpin', handleRecallSpin);
    
    return () => {
      // Cleanup audio objects and event listener on unmount
      document.removeEventListener('recallSpin', handleRecallSpin);
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
        spinSoundRef.current = null;
      }
      if (winnerSoundRef.current) {
        winnerSoundRef.current.pause();
        winnerSoundRef.current = null;
      }
    }
  }, []);

  const handleSpin = (recallCallback?: (newNumber: number) => void) => {
    if (isSpinning || min >= max) return;
    
    setIsSpinning(true);
    setResult(null);
    setShowConfetti(false);
    
    if (spinSoundRef.current) {
      spinSoundRef.current.volume = 1.0;
      spinSoundRef.current.play().catch(e => console.error("Error playing spin sound:", e));
    }

    const spin_duration = Math.random() * 5000 + 10000;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const baseRotation = 30 * 360; 
    const newRotation = rotation + baseRotation + (Math.random() * 360);

    setRotation(newRotation);
    
    if (wheelRef.current) {
        wheelRef.current.style.transitionDuration = `${spin_duration}ms`;
    }
    
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }

    spinTimeoutRef.current = setTimeout(() => {
      spinSoundRef.current?.pause();
      if(spinSoundRef.current) {
        spinSoundRef.current.currentTime = 0;
      }
      
      if (winnerSoundRef.current) {
        winnerSoundRef.current.volume = 1.0;
        winnerSoundRef.current.play().catch(e => console.error("Error playing winner sound:", e));
      }

      setIsSpinning(false);
      setResult(randomNumber);

      if (recallCallback) {
        recallCallback(randomNumber);
      } else {
        onNewResult(randomNumber);
      }
      
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 15000); // Confetti stops after 15 seconds
    }, spin_duration);
  };

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <Card className="w-full max-w-none shadow-none border-0 bg-transparent no-print">
        <CardContent className="flex flex-col items-center gap-8 p-6">
          <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] xl:w-[700px] xl:h-[700px]">
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '30px solid hsl(var(--primary))',
                zIndex: 10,
              }}
            />
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full border-[12px] border-primary/20 bg-card overflow-hidden transition-transform ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
               <div className="w-full h-full" style={{
                  background: `conic-gradient(
                      from 0deg, 
                      #ffadad, #ffd6a5, #fdffb6, #caffbf, #9bf6ff, #a0c4ff, #bdb2ff, #ffc6ff,
                      #ffadad, #ffd6a5, #fdffb6, #caffbf, #9bf6ff, #a0c4ff, #bdb2ff, #ffc6ff
                  )`
               }}/>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-8xl md:text-9xl lg:text-[10rem] font-bold tracking-widest font-mono h-[10rem] lg:h-[12rem] flex items-center justify-center p-4 rounded-lg bg-background/80 backdrop-blur-sm min-w-[20rem] lg:min-w-[28rem] mx-auto">
                    {result !== null ? result.toString().padStart(4, '0') : (isSpinning ? '?' : '----')}
                </div>
            </div>
          </div>
          
          <Button
            onClick={() => handleSpin()}
            disabled={isSpinning || min >= max}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[200px] h-14 text-xl mt-8"
          >
            <Disc className={`mr-2 h-6 w-6 ${isSpinning ? 'animate-spin-slow' : ''}`} />
            {isSpinning ? "Spinning..." : "Spin Wheel"}
          </Button>

        </CardContent>
      </Card>
    </>
  );
}
