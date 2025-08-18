'use server';

/**
 * @fileOverview Summarizes the key factors contributing to a user's stroke risk.
 *
 * - summarizeFactors - A function that summarizes the key factors contributing to a user's stroke risk.
 * - SummarizeFactorsInput - The input type for the summarizeFactors function.
 * - SummarizeFactorsOutput - The return type for the summarizeFactors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFactorsInputSchema = z.object({
  age: z.number().describe('The age of the patient.'),
  gender: z.string().describe('The gender of the patient.'),
  hypertension: z.boolean().describe('Whether the patient has hypertension.'),
  heartDisease: z.boolean().describe('Whether the patient has heart disease.'),
  everMarried: z.boolean().describe('Whether the patient has ever been married.'),
  workType: z.string().describe('The work type of the patient.'),
  residenceType: z.string().describe('The residence type of the patient.'),
  avgGlucoseLevel: z.number().describe('The average glucose level of the patient.'),
  bmi: z.number().describe('The BMI of the patient.'),
  smokingStatus: z.string().describe('The smoking status of the patient.'),
});
export type SummarizeFactorsInput = z.infer<typeof SummarizeFactorsInputSchema>;

const SummarizeFactorsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key factors contributing to the stroke risk.'),
});
export type SummarizeFactorsOutput = z.infer<typeof SummarizeFactorsOutputSchema>;

export async function summarizeFactors(input: SummarizeFactorsInput): Promise<SummarizeFactorsOutput> {
  return summarizeFactorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFactorsPrompt',
  input: {schema: SummarizeFactorsInputSchema},
  output: {schema: SummarizeFactorsOutputSchema},
  prompt: `You are an expert health advisor, summarizing key stroke risk factors for patients.

  Given the following patient information, identify and summarize the most important factors that contribute to their stroke risk. Focus on aspects of their health profile that elevate risk based on common medical knowledge.

  Age: {{{age}}}
  Gender: {{{gender}}}
  Hypertension: {{{hypertension}}}
  Heart Disease: {{{heartDisease}}}
  Ever Married: {{{everMarried}}}
  Work Type: {{{workType}}}
  Residence Type: {{{residenceType}}}
  Avg Glucose Level: {{{avgGlucoseLevel}}}
  BMI: {{{bmi}}}
  Smoking Status: {{{smokingStatus}}}

  Summary:`,
});

const summarizeFactorsFlow = ai.defineFlow(
  {
    name: 'summarizeFactorsFlow',
    inputSchema: SummarizeFactorsInputSchema,
    outputSchema: SummarizeFactorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
