
"use client";

import { History, Printer, Trash2, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { Separator } from "@/components/ui/separator";

const WheelSpinner = dynamic(() => import('@/components/wheel-spinner').then(mod => mod.WheelSpinner), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

type SpinResult = {
  number: number;
  status: "active" | "discarded";
  serial: number;
};

export default function Home() {
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(3000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [maxResults, setMaxResults] = useState(25);
  const [nextSerial, setNextSerial] = useState(25);

  const handleNewResult = (result: number) => {
    if (nextSerial >= 1) {
      setSpinHistory(prev => [{ number: result, status: "active", serial: nextSerial }, ...prev]);
      setNextSerial(prev => prev - 1);
    }
  };
  
  const handleDiscardResult = (serialToDiscard: number) => {
    setSpinHistory(prev => 
      prev.map((item) => 
        item.serial === serialToDiscard ? { ...item, status: 'discarded' } : item
      )
    );
  };

  const handleRecallResult = (serialToRecall: number) => {
    if (isSpinning) return;
  
    // This function will now be passed to the WheelSpinner
    // to be executed after a new spin is complete.
    const onSpinComplete = (newNumber: number) => {
      setSpinHistory(prev => 
        prev.map((item) => 
          item.serial === serialToRecall 
            ? { ...item, number: newNumber, status: 'active' } 
            : item
        )
      );
    };

    // We find the WheelSpinner's spin button and click it programmatically
    // We also pass our special on-recall-complete logic.
    const recallSpinEvent = new CustomEvent('recallSpin', { detail: { onSpinComplete } });
    document.dispatchEvent(recallSpinEvent);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const activeResults = spinHistory.filter(item => item.status === 'active').slice(0, maxResults);
    if (activeResults.length === 0) return;
  
    const csvHeader = "No.,Result\n";
    const csvRows = activeResults
      .slice()
      .reverse() // Oldest to newest for CSV
      .map((result) => `${result.serial},${result.number.toString().padStart(4, '0')}`)
      .join("\n");
  
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "raffle_draw_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMaxResultsChange = (value: number) => {
    const newMax = Math.max(1, value);
    setMaxResults(newMax);
    if (spinHistory.length === 0) {
      setNextSerial(newMax);
    }
  }
  
  const displayedHistory = spinHistory.slice(0, maxResults);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="absolute top-4 left-4 z-10 no-print">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
            Digital Lottery System 
        </h1>
        <div className="grid w-48 items-center gap-1.5 mt-2">
            <Label htmlFor="max-results" className="text-foreground">Maximum Prize</Label>
            <Input
              type="number"
              id="max-results"
              value={maxResults}
              onChange={e => handleMaxResultsChange(parseInt(e.target.value) || 1)}
              disabled={isSpinning || spinHistory.length > 0}
              className="text-center w-full"
            />
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 flex items-center justify-center bg-grid-pattern overflow-hidden">
          <WheelSpinner 
            onNewResult={handleNewResult}
            min={min}
            max={max}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
        </main>

        <aside className="w-full md:w-[350px] h-[45vh] md:h-full flex flex-col p-4 border-l bg-background">
          <div className="flex items-center justify-center gap-4 no-print">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="min-range">Min</Label>
                <Input 
                  type="number" 
                  id="min-range" 
                  value={min}
                  onChange={e => setMin(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isSpinning || spinHistory.length > 0}
                  className="text-center w-full"
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="max-range">Max</Label>
                <Input 
                  type="number" 
                  id="max-range"
                  value={max}
                  onChange={e => setMax(Math.max(min + 1, parseInt(e.target.value) || min + 1))}
                  disabled={isSpinning || spinHistory.length > 0}
                  className="text-center w-full"
                />
              </div>
          </div>

          <Separator className="my-4 no-print" />

          <div className="w-full flex-1 flex flex-col min-h-0 printable-section">
              <div className="flex items-center justify-center gap-2 mb-4">
                  <h3 className="text-2xl font-medium flex items-center gap-2">
                      <History className="size-7" />
                      Drawing Results
                  </h3>
                  <Button variant="ghost" size="icon" onClick={handlePrint} className="h-8 w-8 no-print">
                   
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8 no-print">
                    <Download className="size-5" />
                  </Button>
              </div>
              <ScrollArea className="flex-1 rounded-md border p-4 bg-background/70">
                <div className="flex flex-col gap-2 text-xl text-muted-foreground">
                  {displayedHistory.length > 0 ? (
                    displayedHistory.map((pastResult) => {
                      return (
                        <div key={pastResult.serial} className="relative w-full flex items-center justify-between p-3 bg-muted rounded-md group">
                          <span className={cn("text-lg font-medium text-muted-foreground/70 w-8 text-center", pastResult.status === 'discarded' && "line-through text-muted-foreground/50")}>{pastResult.serial}.</span>
                          <span className={cn(
                            "font-mono tracking-widest text-2xl flex-1 text-center",
                            pastResult.status === 'discarded' && "line-through text-muted-foreground/50"
                          )}>
                            {pastResult.number.toString().padStart(4, '0')}
                          </span>
                          <div className="w-8">
                            {pastResult.status === 'active' ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity no-print"
                                onClick={() => handleDiscardResult(pastResult.serial)}
                              >
                                <Trash2 className="size-5" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"
                                onClick={() => handleRecallResult(pastResult.serial)}
                              >
                                <RotateCcw className="size-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center p-8">No results yet.</p>
                  )}
                </div>
              </ScrollArea>
          </div>
        </aside>
      </div>
      <div className="absolute bottom-4 left-4 text-sm text-muted-foreground z-10 no-print">
        Developer: Ariful Islam, AGM (Finance)
      </div>
    </div>
  );
}
