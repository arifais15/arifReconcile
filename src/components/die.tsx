"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const Pip = ({ className }: { className?: string }) => <div className={cn("aspect-square w-[18%] rounded-full bg-primary-foreground", className)} />;

const faces: Record<number, React.ReactNode> = {
  1: <div className="flex size-full items-center justify-center"><Pip /></div>,
  2: <div className="flex size-full flex-col justify-between p-1"><Pip className="self-start" /><Pip className="self-end" /></div>,
  3: <div className="flex size-full flex-col justify-between p-1"><Pip className="self-start" /><Pip className="self-center" /><Pip className="self-end" /></div>,
  4: <div className="flex size-full justify-between p-1"><div className="flex flex-col justify-between"><Pip /><Pip /></div><div className="flex flex-col justify-between"><Pip /><Pip /></div></div>,
  5: <div className="flex size-full justify-between p-1"><div className="flex flex-col justify-between"><Pip /><Pip /></div><div className="flex flex-col justify-center"><Pip /></div><div className="flex flex-col justify-between"><Pip /><Pip /></div></div>,
  6: <div className="flex size-full justify-between p-1"><div className="flex flex-col justify-between"><Pip /><Pip /><Pip /></div><div className="flex flex-col justify-between"><Pip /><Pip /><Pip /></div></div>,
};

export function Die({ value, isRolling }: { value: number; isRolling: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 80);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [isRolling, value]);

  return (
    <div className="size-20 bg-primary rounded-lg shadow-md flex justify-center items-center p-2 transition-transform duration-300 transform-gpu group hover:scale-105">
      {faces[displayValue]}
    </div>
  );
}
