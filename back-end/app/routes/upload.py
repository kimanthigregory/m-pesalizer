from flask import request ,Blueprint
from flask import Flask
from utilities.pdfparser import pdf_to_json

import os

app = Flask(__name__)

upload_bp = Blueprint('upload', __name__)

UPLOAD_FOLDER = 'uploads'

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
            pdf_to_json(file_path)
            
            return f"file {file.filename}  uploaded successfully ", 200

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
