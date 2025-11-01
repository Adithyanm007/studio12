
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Construct the absolute path to the model file
model_path = os.path.join(os.path.dirname(__file__), 'model', 'stroke_model.pkl')

try:
    model = joblib.load(model_path)
except FileNotFoundError:
    model = None
    print(f"Error: Model file not found at {model_path}")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': f"Model file not found at {model_path}. Please ensure the model exists."}), 500

    try:
        data = request.get_json()

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
        
        # Return the result as JSON
        return jsonify({'strokeRisk': float(prediction)})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # Use 0.0.0.0 to make it accessible from other containers
    app.run(host='0.0.0.0', port=5001)
