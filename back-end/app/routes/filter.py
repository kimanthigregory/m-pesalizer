import json
import os
import pandas as pd
from flask import Flask, jsonify, Blueprint , request, session

app = Flask(__name__)

summary_bp = Blueprint('summary', __name__)

@summary_bp.route('/filter_transactions', methods=['POST'])
def filter_transactions_form():
    json_path = session['json_data']  # Path to the JSON file
    search_name = request.form.get('name', '').strip()  # Name to search for

    if not json_path or not os.path.exists(json_path):
        return {"status": "error", "message": "JSON file not found"}, 404

    if not search_name:
        return {"status": "error", "message": "Search name not provided"}, 400

    # Load the JSON data
    try:
        with open(json_path, "r") as json_file:
            data = json.load(json_file)

        # Convert to a DataFrame
        df = pd.DataFrame(data)

        # Filter transactions containing the search name in the "Details" column
        filtered_df = df[df['Details'].str.contains(search_name, case=False, na=False)]

        # Convert the filtered DataFrame back to JSON
        filtered_data = filtered_df.to_dict(orient='records')

        # Render the filtered data in a template or return JSON (based on your front-end)
        return json.dump(filtered_data, indent=4)
    except Exception as e:
        return {"status": "error", "message": f"An error occurred: {str(e)}"}, 500
