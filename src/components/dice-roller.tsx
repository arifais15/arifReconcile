"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dices } from "lucide-react";
import { Die } from "./die";
import { Separator } from "@/components/ui/separator";

const MAX_DICE = 6;
const ROLL_DURATION = 1000;

export function DiceRoller() {
  const [numberOfDice, setNumberOfDice] = useState(1);
  const [diceValues, setDiceValues] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [total, setTotal] = useState(1);

  const rollSoundRef = useRef<HTMLAudioElement>(null);
  const winnerSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setDiceValues(Array(numberOfDice).fill(1));
    setTotal(numberOfDice);
  }, [numberOfDice]);

  const handleRoll = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    rollSoundRef.current?.play().catch(e => console.error("Error playing roll sound:", e));

    const newValues = Array.from({ length: numberOfDice }, () => Math.floor(Math.random() * 6) + 1);

    setTimeout(() => {
      setDiceValues(newValues);
      setTotal(newValues.reduce((sum, val) => sum + val, 0));
      setIsRolling(false);
      winnerSoundRef.current?.play().catch(e => console.error("Error playing winner sound:", e));
    }, ROLL_DURATION);
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Dice Roller</CardTitle>
        <CardDescription>Roll up to six dice for games, decisions, and more.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 p-6">
        <audio ref={rollSoundRef} src="/sounds/dice-roll.mp3" preload="auto"></audio>
        <audio ref={winnerSoundRef} src="/sounds/winner.mp3" preload="auto"></audio>
      
        <div className="flex items-center gap-4">
          <label htmlFor="dice-select" className="text-sm font-medium">Number of Dice:</label>
          <Select
            value={String(numberOfDice)}
            onValueChange={(val) => setNumberOfDice(Number(val))}
            disabled={isRolling}
          >
            <SelectTrigger id="dice-select" className="w-[80px]">
              <SelectValue placeholder="Number of dice" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: MAX_DICE }, (_, i) => i + 1).map(n => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap justify-center gap-4 min-h-[84px]">
          {diceValues.map((value, i) => (
            <Die key={i} value={value} isRolling={isRolling} />
          ))}
        </div>
        
        <div className="w-full max-w-sm">
          <Separator className="my-4" />
          <div className="flex justify-center items-baseline gap-2">
            <p className="text-muted-foreground">Total:</p>
            <p className="text-4xl font-bold">{total}</p>
          </div>
          <Separator className="my-4" />
        </div>

        <Button
          onClick={handleRoll}
          disabled={isRolling}
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[150px]"
        >
          <Dices className="mr-2 h-5 w-5" />
          {isRolling ? "Rolling..." : "Roll Dice"}
        </Button>
      </CardContent>
    </Card>
  );
}
