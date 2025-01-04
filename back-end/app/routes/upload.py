from flask import request ,Blueprint
from flask import Flask
from utilities.pdfparser import pdf_to_json 
from utilities.unlock_pdf_utils import unlock_pdf

import os

app = Flask(__name__)

upload_bp = Blueprint('upload', __name__)

UPLOAD_FOLDER = 'uploads'
UNLOCKED_FOLDER = ' unlocked_pdfs'

app.config['UNLOCKED_FOLDER'] = UNLOCKED_FOLDER
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route('/upload', methods =['GET','POST'])
def upload_file():
    if request.method == 'POST':
        if 'the_file' not in request.files:
            return "no file part" , 400

        file = request.files['the_file']

        if file.filename =='':
            return 'no selected file', 400
        
        if file and allowed_files(file.filename):
            file_path  = os.path.join(app.config['UPLOAD_FOLDER'], file.filename )
            file.save(file_path)
            unlock_file_path = os.path.join(app.config['UNLOCKED_FOLDER'])
            file.save(unlock_file_path)
      
            try:
              unlock_result = unlock_pdf(file_path, unlock_file_path, '598850')
              if isinstance(unlock_result, str):
                  return unlock_result, 400
              
            except Exception as e:
                return str(e), 400
            try:
              pdf_data = pdf_to_json(unlock_result)
              return {"message":  "file uploaded successfully","data": pdf_data}, 200
            except Exception as e:
              return f"file not uploaded ", 400

        else:
            return "file type not allowed", 400
    
    return '''<!doctype html>
    <html>
      <head><title>Upload a File</title></head>
      <body>
        <h1>Upload a File</h1>
        <form method="POST" enctype="multipart/form-data">
          <input type="file" name="the_file">
          <input type="submit">
        </form>
      </body>
    </html>
    </form>'''
