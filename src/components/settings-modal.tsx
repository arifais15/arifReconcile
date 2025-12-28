'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function SettingsModal({ open, onOpenChange, title, onTitleChange }) {
  const [newTitle, setNewTitle] = useState(title);

  const handleSave = () => {
    onTitleChange(newTitle);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings and User Manual </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div>
            <h3 className="text-lg font-medium mb-2">User Manual</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Getting Started</AccordionTrigger>
                <AccordionContent>
                  <p className='mb-2'>
                    <strong>1. Set the Maximum Prize:</strong> Before starting, enter the total number of prizes you want to award in the "Maximum Prize" field.
                  </p>
                  <p>
                    <strong>2. Set the Number Range:</strong> In the "Min" and "Max" fields, define the range of numbers for the raffle. The wheel will spin to select a number within this range.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Spinning the Wheel</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Click the "Spin Wheel" button to start the raffle. The wheel will spin and land on a random number. The result will be displayed on the wheel and added to the "Drawing Results" list.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Managing Results</AccordionTrigger>
                <AccordionContent>
                  <p className='mb-2'>
                    <strong>Cancel a Result:</strong> If you need to Cancel a winning number, click the trash icon next to it in the results list. This will mark the number as "canceled."
                  </p>
                  <p>
                    <strong>Recall a Canceled Number:</strong> To re-spin for a Canceled number, click the "recall" icon next to it. The wheel will spin again, and the new result will replace the Canceled one.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Exporting and Printing</AccordionTrigger>
                <AccordionContent>
                  <p className='mb-2'>
                    <strong>Download Results:</strong> Click the "Download" icon to save the list of winning numbers as a CSV file.
                  </p>
                  <p>
                    <strong>Print Results:</strong> Click the "Print" icon to open the print dialog and print the raffle results.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
