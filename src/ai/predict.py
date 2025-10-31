
import sys
import json
import joblib
import pandas as pd

# This script is designed to be called from a Node.js environment.
# It reads a single line of JSON from stdin, which contains the patient data.
# It then loads the pre-trained model, makes a prediction, and prints the result as JSON to stdout.

MODEL_PATH = 'src/ai/model/stroke_model.pkl'

# The order of features expected by the model.
MODEL_FEATURES = ["gender","age","hypertension","heart_disease","ever_married",
                  "work_type","Residence_type","avg_glucose_level","bmi","smoking_status"]

def main():
    try:
        # 1. Load the model
        try:
            model = joblib.load(MODEL_PATH)
        except FileNotFoundError:
            print(json.dumps({'error': f'Model file not found at {MODEL_PATH}. Please ensure the model file exists.'}), file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(json.dumps({'error': f'Failed to load model: {str(e)}'}), file=sys.stderr)
            sys.exit(1)
            
        # 2. Read patient data from standard input
        input_data_str = sys.stdin.readline()
        if not input_data_str:
            print(json.dumps({'error': 'No input data received from stdin.'}), file=sys.stderr)
            sys.exit(1)
            
        patient_data = json.loads(input_data_str)
        
        # 3. Prepare the DataFrame for prediction
        # The frontend sends boolean `true`/`false`, but the model might have been trained
        # on `1`/`0`. Let's convert them.
        patient_data['hypertension'] = 1 if patient_data.get('hypertension') else 0
        patient_data['heartDisease'] = 1 if patient_data.get('heartDisease') else 0
        
        # Ensure correct column names expected by the model
        if 'residenceType' in patient_data:
            patient_data['Residence_type'] = patient_data.pop('residenceType')
        if 'avgGlucoseLevel' in patient_data:
            patient_data['avg_glucose_level'] = patient_data.pop('avgGlucoseLevel')
        if 'everMarried' in patient_data:
            patient_data['ever_married'] = patient_data.pop('everMarried')
        if 'workType' in patient_data:
            patient_data['work_type'] = patient_data.pop('workType')
        if 'smokingStatus' in patient_data:
            patient_data['smoking_status'] = patient_data.pop('smokingStatus')


        input_df = pd.DataFrame([patient_data])[MODEL_FEATURES]

        # 4. Make a prediction
        prediction_proba = model.predict_proba(input_df)[0][1]

        # 5. Print the result as JSON to stdout
        result = {'strokeRisk': float(prediction_proba)}
        print(json.dumps(result))

    except Exception as e:
        # Print any errors to stderr so they can be captured by the calling process
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

