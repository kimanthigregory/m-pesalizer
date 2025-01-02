from PyPDF2 import PdfReader, PdfWriter

def unlock_pdf(input_path, output_path, password):
    try:
        reader = PdfReader(input_path)
        if reader.is_encrypted:
            reader.decrypt(password)

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        return output_path
        
    except Exception as e:
        return str(e)
