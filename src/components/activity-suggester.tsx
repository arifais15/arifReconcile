"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, AlertTriangle } from "lucide-react";
import { suggestNumberActivities } from "@/ai/flows/suggest-number-activities";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export function ActivitySuggester({ number }: { number: number }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await suggestNumberActivities({ number });
      setSuggestions(result.activities);
    } catch (e) {
      setError("Failed to generate suggestions. Please try again later.");
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full mt-4 flex flex-col items-center gap-4">
      <Button onClick={getSuggestions} disabled={isLoading} variant="outline" className="text-primary border-primary/50 hover:bg-primary/10 hover:text-primary">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        Suggest activities for {number}
      </Button>

      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions.length > 0 && !isLoading && (
        <Card className="w-full bg-primary/5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-primary">Here are some ideas:</h3>
            <ul className="list-disc pl-5 space-y-2 text-foreground/80">
              {suggestions.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
