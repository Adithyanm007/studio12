'use server';

/**
 * @fileOverview Generates personalized insights and prevention tips based on stroke risk assessment.
 *
 * - generateInsights - A function that takes user data and risk assessment to provide personalized insights and prevention tips.
 * - GenerateInsightsInput - The input type for the generateInsights function, including user data and risk score.
 * - GenerateInsightsOutput - The return type for the generateInsights function, providing personalized insights and prevention tips.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightsInputSchema = z.object({
  riskScore: z.number().describe('The calculated stroke risk score for the user.'),
  age: z.number().describe('The age of the user.'),
  gender: z.string().describe('The gender of the user.'),
  hypertension: z.boolean().describe('Whether the user has hypertension.'),
  heartDisease: z.boolean().describe('Whether the user has heart disease.'),
  smokingStatus: z.string().describe('The smoking status of the user.'),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights based on the risk assessment.'),
  preventionTips: z.string().describe('Personalized prevention tips to reduce stroke risk.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {schema: GenerateInsightsInputSchema},
  output: {schema: GenerateInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in providing personalized health insights and stroke prevention tips.

  Based on the user's risk score, age, gender, hypertension status, heart disease status, and smoking status, provide personalized insights into their stroke risk and offer actionable prevention tips.

  Risk Score: {{riskScore}}
  Age: {{age}}
  Gender: {{gender}}
  Hypertension: {{hypertension}}
  Heart Disease: {{heartDisease}}
  Smoking Status: {{smokingStatus}}

  Format the output into two sections:

  1.  Insights: Provide a concise explanation of the user's stroke risk based on the provided information.
  2.  Prevention Tips: Offer specific and practical advice on how the user can reduce their stroke risk, considering their individual circumstances.
  `,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
