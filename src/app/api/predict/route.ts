
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';
import { summarizeFactors, type SummarizeFactorsInput } from '@/ai/flows/summarize-factors';
import { generateInsights, type GenerateInsightsInput } from '@/ai/flows/generate-insights';

async function getStrokeRisk(payload: StrokeRiskFormValues): Promise<number> {
    return new Promise((resolve, reject) => {
        const { model, ...patientData } = payload;
        
        console.log('Sending payload to python script:', { patientData, modelName: model });

        // Construct absolute paths for safety
        const scriptPath = path.resolve(process.cwd(), 'src', 'ai', 'predict.py');
        const modelPath = path.resolve(process.cwd(), 'src', 'ai', 'model', model);

        // Use an absolute path to the python executable
        const pythonExecutable = '/usr/bin/python3';

        const pythonProcess = spawn(pythonExecutable, [
            scriptPath,
            JSON.stringify(patientData),
            modelPath
        ]);

        let predictionResult = '';
        let errorResult = '';

        pythonProcess.stdout.on('data', (data) => {
            predictionResult += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorResult += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorResult}`);
                return reject(new Error(`Prediction script failed: ${errorResult}`));
            }
            try {
                const result = JSON.parse(predictionResult);
                if (result.strokeRisk !== undefined) {
                    console.log('Predicted stroke risk:', result.strokeRisk);
                    resolve(Math.round(result.strokeRisk * 100));
                } else {
                    console.error('Error from prediction script:', result.error);
                    reject(new Error(result.error || 'Failed to get stroke risk from script.'));
                }
            } catch (e) {
                console.error('Failed to parse python script output:', predictionResult);
                reject(new Error('Failed to parse prediction result.'));
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('Failed to start subprocess.', err);
            reject(new Error('Could not execute prediction script. Please ensure Python is installed and in the system PATH.'));
        });
    });
}

export async function POST(req: Request) {
    try {
        const formData: StrokeRiskFormValues = await req.json();
        const validatedData = strokeRiskSchema.parse(formData);
        const { model, ...patientData } = validatedData;

        const riskScore = await getStrokeRisk(validatedData);

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

        const response = {
            riskScore,
            summary: summaryResult.summary,
            insights: insightsResult.insights,
            preventionTips: insightsResult.preventionTips,
        };
        
        return NextResponse.json(response);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
