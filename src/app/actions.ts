
'use server';

import { spawn, type ChildProcess } from 'child_process';
import { summarizeFactors, type SummarizeFactorsInput } from '@/ai/flows/summarize-factors';
import { generateInsights, type GenerateInsightsInput, type GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';

// This function calls the ML model to get a risk score.
async function getStrokeRisk(payload: StrokeRiskFormValues, modelName: string): Promise<number> {
  
  return new Promise((resolve, reject) => {
    let pythonProcess: ChildProcess;
    try {
      // First, try to use 'python3'
      pythonProcess = spawn('python3', ['src/ai/predict.py', modelName]);
    } catch (error) {
      // If 'python3' fails, try 'python'. This provides flexibility across environments.
      try {
        pythonProcess = spawn('python', ['src/ai/predict.py', modelName]);
      } catch (e) {
         console.error('Failed to start subprocess with both python3 and python.', e);
         reject(new Error('Could not execute prediction script. Please ensure Python is installed and in the system PATH.'));
         return;
      }
    }

    let predictionData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      predictionData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(errorData);
        // Try to parse errorData as JSON, as the python script sends structured errors
        try {
          const errorJson = JSON.parse(errorData);
          reject(new Error(errorJson.error || 'Prediction script failed.'));
        } catch (e) {
          reject(new Error(errorData || 'Prediction script failed with an unknown error.'));
        }
        return;
      }
      try {
        const result = JSON.parse(predictionData);
        if (result.strokeRisk !== undefined) {
          console.log('Predicted stroke risk:', result.strokeRisk);
          // The model returns a value between 0 and 1, so we convert it to a percentage.
          resolve(Math.round(result.strokeRisk * 100));
        } else {
          console.error('Error from prediction script:', result.error);
          reject(new Error(result.error || 'Failed to get stroke risk from script.'));
        }
      } catch (error) {
        console.error('Failed to parse prediction script output:', predictionData);
        console.error('Stderr from script:', errorData);
        reject(new Error('Could not parse prediction output.'));
      }
    });

    pythonProcess.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
        reject(new Error('Could not execute prediction script. Please ensure Python is installed and in the system PATH.'));
    });

    // Send payload to the python script
    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();
  });
}


export type PredictionAndInsightsResult = {
  riskScore: number;
  summary: string;
  insights: string;
  preventionTips: GenerateInsightsOutput['preventionTips'];
};


export async function getStrokePredictionAndInsights(formData: StrokeRiskFormValues): Promise<PredictionAndInsightsResult> {
    const validatedData = strokeRiskSchema.parse(formData);
    const { model, ...patientData } = validatedData;

    // You can now specify which model to use, e.g., getStrokeRisk(validatedData, 'other_model.pkl')
    const riskScore = await getStrokeRisk(validatedData, model);

    const summaryInput: SummarizeFactorsInput = {
        ...patientData,
        everMarried: patientData.everMarried === 'Yes',
    };
    const summaryResult = await summarizeFactors(summaryInput);

    const insightsInput: GenerateInsightsInput = {
        riskScore,
        age: patientData.age,
        gender: patientData.gender,
        hypertension: patientData.hypertension,
        heartDisease: patientData.heartDisease,
        smokingStatus: patientData.smokingStatus,
    };
    const insightsResult = await generateInsights(insightsInput);

    if (!summaryResult.summary || !insightsResult.insights || !insightsResult.preventionTips) {
        throw new Error('Failed to generate AI insights.');
    }

    return {
        riskScore,
        summary: summaryResult.summary,
        insights: insightsResult.insights,
        preventionTips: insightsResult.preventionTips,
    };
}
