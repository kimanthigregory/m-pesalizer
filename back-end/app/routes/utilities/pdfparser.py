import pdfplumber
import json

def pdf_to_json(pdf_path):
    data =[ ]
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                # Extract the header (first row) and use it as the keys for the JSON objects
                headers = table[0]
                for row in table[1:]:
                    # Create a dictionary for each row using the header as keys
                    row_data = {headers[i]: row[i] for i in range(len(headers))}
                    data.append(row_data)

    # Convert the data to JSON
    json_output = json.dumps(data, indent=4)

    # Print or save the JSON data
    print(json_output)

    # Optionally, save the JSON data to a file
    with open("output.json", "w") as json_file:
        json.dump(data, json_file, indent=4)
