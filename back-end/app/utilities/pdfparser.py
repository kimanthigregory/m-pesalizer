import pdfplumber
import json
import os

def pdf_to_json(pdf_path, output_folder):
    """
    Extracts transactions from all pages of a PDF and saves them as a JSON array.

    Args:
        pdf_path (str): Path to the input PDF file.
        output_folder (str): Path to the output folder for the JSON file.

    Returns:
        str: Path to the output JSON file.
    """
    # Ensure output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Path for the JSON output file
    file_path = os.path.join(output_folder, 'output.json')

    # Initialize an empty list to store all rows
    all_data = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                print(f"Processing Page {page_num + 1}/{len(pdf.pages)}")
                tables = page.extract_tables()

                # Skip pages with no tables
                if not tables:
                    print(f"No tables found on Page {page_num + 1}")
                    continue

                for table in tables:
                    headers = table[0]  # Assume the first row contains headers
                    for row in table[1:]:
                        # Skip rows that don't align with the headers
                        if len(row) != len(headers):
                            continue
                        row_data = {headers[i]: row[i] for i in range(len(headers))}
                        all_data.append(row_data)

        # Write the collected data as a JSON array
        with open(file_path, "w") as json_file:
            json.dump(all_data, json_file, indent=4)  # Pretty-print for readability

        print(f"JSON file saved in {file_path}")
        return file_path
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


# Example usage:
# pdf_path = "path/to/your/pdf_file.pdf"
# output_folder = "output"
# output_file = pdf_to_json(pdf_path, output_folder)