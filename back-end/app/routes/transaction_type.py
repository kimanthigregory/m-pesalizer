from flask import Blueprint, jsonify, session
import json
import os

type_bp = Blueprint('type', __name__)

@type_bp.route('/transaction-types', methods=['GET'])
def transaction_types_summary():
    """
    Endpoint to return the summarized transaction types directly from the JSON file.
    """
    try:
        # Check if the session contains the JSON file path
        if 'json_data' not in session:
            return jsonify({"status": "error", "message": "No data available. Please upload a file first."}), 400

        # Get the file path from the session
        json_file_path = session['json_data']
        print(f"File path: {json_file_path}")

        if not os.path.exists(json_file_path):
            return jsonify({"status": "error", "message": "JSON file path does not exist."}), 400

        # Load the JSON data
        with open(json_file_path, 'r') as file:
            data = json.load(file)  # Load the JSON as a single object/array

        # Extract only the transaction type summary
        transaction_types = []
        for entry in data:
            if "TRANSACTION TYPE" in entry:  # Stop processing once other transaction entries start
                transaction_types.append(entry)
            else:
                break  # Stop at the first non-summary entry

        return jsonify({"status": "success", "transaction_types": transaction_types}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
