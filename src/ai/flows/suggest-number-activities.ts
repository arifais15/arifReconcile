'use server';

/**
 * @fileOverview A flow that suggests activities to do with the generated numbers.
 *
 * - suggestNumberActivities - A function that suggests activities based on the input number.
 * - SuggestNumberActivitiesInput - The input type for the suggestNumberActivities function.
 * - SuggestNumberActivitiesOutput - The return type for the suggestNumberActivities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNumberActivitiesInputSchema = z.object({
  number: z.number().describe('The number to generate activities for.'),
});
export type SuggestNumberActivitiesInput = z.infer<
  typeof SuggestNumberActivitiesInputSchema
>;

const SuggestNumberActivitiesOutputSchema = z.object({
  activities: z
    .array(z.string())
    .describe('A list of activities to do with the number.'),
});
export type SuggestNumberActivitiesOutput = z.infer<
  typeof SuggestNumberActivitiesOutputSchema
>;

export async function suggestNumberActivities(
  input: SuggestNumberActivitiesInput
): Promise<SuggestNumberActivitiesOutput> {
  return suggestNumberActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNumberActivitiesPrompt',
  input: {schema: SuggestNumberActivitiesInputSchema},
  output: {schema: SuggestNumberActivitiesOutputSchema},
  prompt: `You are a creative assistant that can suggest activities to do with a given number.

  Suggest some interesting and fun activities that can be done with the number. Return 3 different suggestions.

  Number: {{{number}}}`,
});

const suggestNumberActivitiesFlow = ai.defineFlow(
  {
    name: 'suggestNumberActivitiesFlow',
    inputSchema: SuggestNumberActivitiesInputSchema,
    outputSchema: SuggestNumberActivitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
