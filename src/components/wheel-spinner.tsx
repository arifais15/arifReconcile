'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Disc } from 'lucide-react';
import { Confetti } from './confetti';

// Custom hook for audio playback to ensure it's browser-safe
const useAudio = (isSpinning: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const spinningMelodyNoteIndexRef = useRef(0);

  const noteFrequencies: { [key: string]: number } = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
  };

  // Melody for "O amar bondhu go chirodin pothchola"
  const spinningMelody = [
    'G4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4',
    'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'G4',
  ];

  const playSpinningMelodyNote = useCallback(() => {
    if (!audioContextRef.current) return;
    const context = audioContextRef.current;

    const noteName = spinningMelody[spinningMelodyNoteIndexRef.current];
    const freq = noteFrequencies[noteName];

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, context.currentTime);

    // Gentle pluck sound
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.25);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);

    spinningMelodyNoteIndexRef.current = (spinningMelodyNoteIndexRef.current + 1) % spinningMelody.length;
  }, [noteFrequencies, spinningMelody]);

  const playWinnerSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const context = audioContextRef.current;

    const baseFrequencies = [261.63, 329.63, 392.00]; // C, E, G for a C-Major chord
    const detuneAmount = 5; // Detune in cents

    baseFrequencies.forEach(baseFreq => {
      // Create a chorus effect with multiple oscillators
      [-detuneAmount, 0, detuneAmount].forEach(detune => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(baseFreq, context.currentTime);
        oscillator.detune.setValueAtTime(detune, context.currentTime); // Detune for chorus effect

        // Swelling and fading effect
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.2); // Swell in
        gain.gain.linearRampToValueAtTime(0, context.currentTime + 1.5); // Fade out

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 1.5);
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    let melodyInterval: NodeJS.Timeout | null = null;

    if (isSpinning) {
      // melodyInterval = setInterval(playSpinningMelodyNote, 300);
    } else {
      if (melodyInterval) {
        clearInterval(melodyInterval);
      }
      spinningMelodyNoteIndexRef.current = 0;
    }

    return () => {
      if (melodyInterval) {
        clearInterval(melodyInterval);
      }
    };
  }, [isSpinning, playSpinningMelodyNote]);
  
  return { playWinnerSound };
};

const generateSecureRandomNumber = (min: number, max: number, excludedNumbers: number[] = []) => {
  const range = max - min + 1;
  const availableNumbers = range - excludedNumbers.length;
  if (availableNumbers <= 0) {
    throw new Error("No available numbers in the specified range.");
  }

  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const randomBytes = new Uint8Array(bytesNeeded);
  
  let randomValue;
  let randomNumber;
  do {
    do {
      window.crypto.getRandomValues(randomBytes);
      randomValue = randomBytes.reduce((acc, byte) => (acc << 8) | byte, 0);
    } while (randomValue >= Math.pow(2, bytesNeeded * 8) - (Math.pow(2, bytesNeeded * 8) % range));
    randomNumber = min + (randomValue % range);
  } while (excludedNumbers.includes(randomNumber));
  
  return randomNumber;
};

type RecallSpinEvent = CustomEvent<{ onSpinComplete: (newNumber: number) => void }>;

type SpinResult = {
  number: number;
  status: "active" | "discarded";
  serial: number;
};

export function WheelSpinner({ 
  onNewResult,
  min,
  max,
  isSpinning,
  setIsSpinning,
  spinHistory,
}: { 
  onNewResult: (result: number) => void,
  min: number,
  max: number,
  isSpinning: boolean,
  setIsSpinning: (isSpinning: boolean) => void,
  spinHistory: SpinResult[];
}) {
  const [result, setResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rotation, setRotation] = useState(0);

  const wheelRef = useRef<HTMLDivElement>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { playWinnerSound } = useAudio(isSpinning);

  useEffect(() => {
    const handleRecallSpin = (event: Event) => {
      const recallEvent = event as RecallSpinEvent;
      const onSpinComplete = recallEvent.detail.onSpinComplete;
      handleSpin(onSpinComplete);
    };

    document.addEventListener('recallSpin', handleRecallSpin);
    
    return () => {
      document.removeEventListener('recallSpin', handleRecallSpin);
    }
  }, [spinHistory]);

  const handleSpin = (recallCallback?: (newNumber: number) => void) => {
    if (isSpinning || min >= max) return;
    
    setIsSpinning(true);
    setResult(null);
    setShowConfetti(false);
    
    const spin_duration = generateSecureRandomNumber(8000, 12000);
    const excludedNumbers = spinHistory.map(r => r.number);
    const randomNumber = generateSecureRandomNumber(min, max, excludedNumbers);
    
    const baseRotation = 30 * 360; 
    const newRotation = rotation + baseRotation + generateSecureRandomNumber(0, 359);

    setRotation(newRotation);
    
    if (wheelRef.current) {
        wheelRef.current.style.transitionDuration = `${spin_duration}ms`;
    }
    
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }

    spinTimeoutRef.current = setTimeout(() => {
      playWinnerSound();

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
      }, 15000);
    }, spin_duration);
  };

  useEffect(() => {
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
                <div className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-widest font-mono h-[10rem] lg:h-[12rem] flex items-center justify-center p-4 rounded-lg bg-background/80 backdrop-blur-sm min-w-[20rem] lg:min-w-[28rem] mx-auto">
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
