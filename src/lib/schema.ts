import { z } from 'zod';

export const strokeRiskSchema = z.object({
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Gender is required.',
  }),
  age: z.coerce.number()
    .min(1, 'Age is required.')
    .max(120, 'Age must be 120 or less.'),
  hypertension: z.boolean().default(false),
  heartDisease: z.boolean().default(false),
  everMarried: z.enum(['Yes', 'No'], {
    required_error: 'Marital status is required.',
  }),
  workType: z.enum(['Private', 'Self-employed', 'Govt_job', 'children', 'Never_worked'], {
    required_error: 'Work type is required.',
  }),
  residenceType: z.enum(['Urban', 'Rural'], {
    required_error: 'Residence type is required.',
  }),
  avgGlucoseLevel: z.coerce.number()
    .min(50, 'Average glucose level must be at least 50.')
    .max(300, 'Average glucose level must be 300 or less.'),
  bmi: z.coerce.number()
    .min(10, 'BMI must be at least 10.')
    .max(100, 'BMI must be 100 or less.'),
  smokingStatus: z.enum(['formerly smoked', 'never smoked', 'smokes', 'Unknown'], {
    required_error: 'Smoking status is required.',
  }),
});

export type StrokeRiskFormValues = z.infer<typeof strokeRiskSchema>;
