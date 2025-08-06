'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing upsell suggestions based on the current items in the cart.
 *
 * - getUpsellSuggestions - A function that takes the items in the cart and returns upsell suggestions.
 * - UpsellSuggestionsInput - The input type for the getUpsellSuggestions function.
 * - UpsellSuggestionsOutput - The return type for the getUpsellSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpsellSuggestionsInputSchema = z.object({
  cartItems: z.array(z.string()).describe('The list of items currently in the cart.'),
});
export type UpsellSuggestionsInput = z.infer<typeof UpsellSuggestionsInputSchema>;

const UpsellSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of product suggestions for upselling.'),
});
export type UpsellSuggestionsOutput = z.infer<typeof UpsellSuggestionsOutputSchema>;

export async function getUpsellSuggestions(input: UpsellSuggestionsInput): Promise<UpsellSuggestionsOutput> {
  return upsellSuggestionsFlow(input);
}

const upsellSuggestionsPrompt = ai.definePrompt({
  name: 'upsellSuggestionsPrompt',
  input: {schema: UpsellSuggestionsInputSchema},
  output: {schema: UpsellSuggestionsOutputSchema},
  prompt: `You are a helpful shopping assistant in a grocery store.
  Based on the items currently in the cart, suggest other relevant products to upsell or cross-sell to the customer.
  Be concise and provide a maximum of 3 suggestions.
  Current cart items: {{cartItems}}
  Suggestions:`, 
});

const upsellSuggestionsFlow = ai.defineFlow(
  {
    name: 'upsellSuggestionsFlow',
    inputSchema: UpsellSuggestionsInputSchema,
    outputSchema: UpsellSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await upsellSuggestionsPrompt(input);
    return output!;
  }
);
