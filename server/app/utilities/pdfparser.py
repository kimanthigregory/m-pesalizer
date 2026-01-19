import pdfplumber
import json
import os
import gc

def pdf_to_json(pdf_path, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    file_path = os.path.join(output_folder, 'output.json')

    all_data = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages):
                # 1. Extract only the current page
                tables = page.extract_tables()

                if tables:
                    for table in tables:
                        if not table or len(table) < 2:
                            continue
                        
                        headers = table[0]
                        for row in table[1:]:
                            if len(row) == len(headers):
                                row_data = {str(headers[i]): row[i] for i in range(len(headers))}
                                all_data.append(row_data)

                # 2. CRITICAL: Clear the pdfplumber internal cache for this page
                page.flush_cache()
                
                # 3. Manual Garbage Collection every 10 pages to prevent RAM buildup
                if (page_num + 1) % 10 == 0:
                    print(f"Cleanup at page {page_num + 1}...")
                    gc.collect()

                print(f"Processed Page {page_num + 1}/{total_pages}")

        # 4. Final write to disk
        with open(file_path, "w") as json_file:
            json.dump(all_data, json_file)

        # Clear the list from memory immediately after writing
        del all_data
        gc.collect()

        return file_path

    except Exception as e:
        print(f"An error occurred: {e}")
        return None