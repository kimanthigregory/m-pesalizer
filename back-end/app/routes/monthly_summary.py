import json
import pandas as pd
from flask import Flask, jsonify, Blueprint ,session

app = Flask(__name__)

summary_bp = Blueprint('summary', __name__)

@summary_bp.route('/monthly_summary', methods=['GET'])
def monthly_summary():
    try:
        if 'json_data' not in session:
            return jsonify({"status": "error", "message": "No data available. Please upload a file first."}), 400

        json_data = session['json_data']

        # Perform analysis (e.g., calculate monthly in/out)
        monthly_summary = group_transactions_by_month(json_data)

        return jsonify({"status": "success", "data": monthly_summary}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Load JSON from a file
def load_transactions(filepath):
    with open(filepath, 'r') as file:
        data = json.load(file)
    return data

# Group Transactions by Month
def group_transactions_by_month(data):
    df = pd.DataFrame(data)
    df["Completion Time"] = pd.to_datetime(df["Completion Time"])
    df["Month"] = df["Completion Time"].dt.to_period("M")  # Extract Year-Month

    # Convert Paid In and Withdrawn to numeric (handling missing or empty strings)
    df["Paid In"] = pd.to_numeric(df["Paid In"], errors="coerce").fillna(0)
    df["Withdrawn"] = pd.to_numeric(df["Withdrawn"].str.replace(",", ""), errors="coerce").fillna(0)

    # Group by Month and aggregate totals
    monthly_data = df.groupby("Month").agg({
        "Paid In": "sum",
        "Withdrawn": "sum"
    }).reset_index()

    # Format the data as JSON-friendly
    monthly_data["Month"] = monthly_data["Month"].astype(str)  # Convert Period to String
    return monthly_data.to_dict(orient="records")

# @app.route('/monthly-summary', methods=['POST'])
# def monthly_summary():
#     # If you want to accept JSON directly from frontend
#     data = request.json
#     grouped_data = group_transactions_by_month(data)
#     return jsonify(grouped_data)

if __name__ == '__main__':
    # Load data and start server
    transactions = load_transactions('transactions.json')
    print(group_transactions_by_month(transactions))  # Test the function
    app.run(debug=True)
