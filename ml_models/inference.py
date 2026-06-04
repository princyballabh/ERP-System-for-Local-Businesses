import sys
import json
import joblib
import os
import pandas as pd

def main():
    try:
        # Get input data from command line argument
        if len(sys.argv) < 2:
            raise ValueError("No input data provided")
            
        input_json = sys.argv[1]
        item_data_dict = json.loads(input_json)
        
        # Determine paths
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'stock_prediction_model.pkl')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        # Load model and required features
        saved_data = joblib.load(model_path)
        loaded_model = saved_data['model']
        required_features = saved_data['features']
        
        # Prepare DataFrame from input
        input_df = pd.DataFrame([item_data_dict])
        
        # Ensure all required features are present
        for col in required_features:
            if col not in input_df.columns:
                raise ValueError(f"Missing required feature: {col}")
                
        input_features = input_df[required_features]
        
        # Make Prediction
        prediction = loaded_model.predict(input_features)[0]
        # predict_proba returns a 2D array, e.g., [[prob_0, prob_1]]
        probability = loaded_model.predict_proba(input_features)[0][1]
        
        # Format the output successfully
        result = {
            'success': True,
            'needs_refill': bool(prediction),
            'probability': round(float(probability), 4)
        }
        
        # Print pure JSON to stdout for Node.js to capture
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()
