"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RefreshCw, Trash2 } from "lucide-react";
import { ActivitySuggester } from "@/components/activity-suggester";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const MAX_DIGITS = 6;
const SPIN_DURATION = 2500; // ms

function Reel({ targetDigit, isSpinning }: { targetDigit: number, isSpinning: boolean }) {
  const reelItems = [...Array(10)].flatMap(() => DIGITS);
  const position = targetDigit * 40; // 40px height for each digit
  
  return (
    <div className="relative h-40 w-24 overflow-hidden rounded-lg bg-secondary/50 border flex items-center justify-center shadow-inner">
      <div
        className={cn(
          "absolute flex flex-col items-center",
          isSpinning ? "transition-transform" : "transition-none"
        )}
        style={{
          transform: `translateY(calc(50% - 20px - ${position}px ${isSpinning ? `- ${10 * 10 * 40}px` : ''}))`,
          transitionDuration: isSpinning ? `${SPIN_DURATION}ms` : '0ms',
          transitionTimingFunction: `cubic-bezier(0.2, 0.8, 0.2, 1)`,
        }}
      >
        {reelItems.map((digit, i) => (
          <div key={i} className="h-10 w-24 flex items-center justify-center text-3xl font-bold font-mono">
            {digit}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-transparent to-card/80" />
      <div className="absolute top-1/2 -translate-y-1/2 h-10 w-full border-y-2 border-primary/50" />
    </div>
  );
}

export function DigitSpinner() {
  const [generatedDigits, setGeneratedDigits] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(0);

  const finalNumber = generatedDigits.length > 0 ? parseInt(generatedDigits.join(""), 10) : null;

  const handleSpin = () => {
    if (isSpinning || generatedDigits.length >= MAX_DIGITS) return;

    setIsSpinning(true);
    const randomDigit = Math.floor(Math.random() * 10);
    setCurrentTarget(randomDigit);

    setTimeout(() => {
      setGeneratedDigits((prev) => [...prev, randomDigit]);
      setIsSpinning(false);
    }, SPIN_DURATION);
  };

  const handleReset = () => {
    setGeneratedDigits([]);
    setCurrentTarget(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Combine Digits</CardTitle>
        <CardDescription>Spin for a digit and combine up to 6 to form a number.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 p-6">
        <Reel targetDigit={currentTarget} isSpinning={isSpinning} />

        <div className="text-center w-full">
            <p className="text-sm text-muted-foreground mb-2">Generated Number</p>
            <div className="text-5xl md:text-6xl font-bold tracking-widest font-mono h-[5rem] flex items-center justify-center p-4 rounded-lg bg-muted min-w-[20rem] mx-auto">
                {generatedDigits.length > 0 ? generatedDigits.join('') : '------'}
            </div>
            <p className="text-xs text-muted-foreground mt-2 h-4">
                {generatedDigits.length >= MAX_DIGITS && "Maximum number of digits reached."}
            </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={handleSpin}
            disabled={isSpinning || generatedDigits.length >= MAX_DIGITS}
            className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[120px]"
            size="lg"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSpinning && "animate-spin")} />
            {isSpinning ? "Spinning..." : "Spin"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isSpinning || generatedDigits.length === 0}
            size="lg"
            className="min-w-[120px]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {finalNumber !== null && <ActivitySuggester number={finalNumber} />}
      </CardContent>
    </Card>
  );
}
