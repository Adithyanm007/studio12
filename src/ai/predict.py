
import sys
import json
import joblib
import pandas as pd
import os

def predict():
    try:
        # The first argument is the patient data (JSON string), the second is the model path
        patient_data_json = sys.argv[1]
        model_path = sys.argv[2]
        
        # Load the patient data
        data = json.loads(patient_data_json)
        
        # Verify model file exists
        if not os.path.exists(model_path):
            print(json.dumps({'error': f"Model file not found at {model_path}"}))
            sys.exit(1)

        # Load the model
        model = joblib.load(model_path)

        # Prepare the data for the model
        # The frontend sends boolean `true`/`false`, so we convert them to `1`/`0`
        data['hypertension'] = 1 if data['hypertension'] else 0
        data['heart_disease'] = 1 if data['heartDisease'] else 0
        
        # The feature names used by the model
        model_features = [
            "gender", "age", "hypertension", "heart_disease", "ever_married",
            "work_type", "Residence_type", "avg_glucose_level", "bmi", "smoking_status"
        ]

        # The DataFrame must have the columns in the correct order.
        input_data = {
            "gender": data["gender"],
            "age": data["age"],
            "hypertension": data["hypertension"],
            "heart_disease": data["heart_disease"],
            "ever_married": data["everMarried"],
            "work_type": data["workType"],
            "Residence_type": data["residenceType"],
            "avg_glucose_level": data["avgGlucoseLevel"],
            "bmi": data["bmi"],
            "smoking_status": data["smokingStatus"]
        }

        input_df = pd.DataFrame([input_data])[model_features]

        # Make prediction
        prediction = model.predict_proba(input_df)[0][1]
        
        # Print the result as JSON to stdout
        print(json.dumps({'strokeRisk': float(prediction)}))

    except Exception as e:
        # Print error as JSON to stdout so the Node.js process can capture it
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    predict()
