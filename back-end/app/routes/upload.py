from flask import request ,Blueprint
from flask import Flask
from app.utilities.pdfparser import pdf_to_json 
from app.utilities.unlock_pdf_utils import unlock_pdf
from threading import Timer


import os
import tempfile
import uuid
import shutil
import atexit

app = Flask(__name__)

upload_bp = Blueprint('upload', __name__)

user_id= 123467

# UNLOCKED_FOLDER = ' unlocked_pdfs'

# app.config['UNLOCKED_FOLDER'] = UNLOCKED_FOLDER
def shedule_delete_folder(folder_path, delay = 60):
   Timer(delay, lambda: shutil.rmtree(folder_path, ignore_errors=True)).start()


def  get_temp_dir(user_id):
    session_id = f"{user_id}-{uuid.uuid4()}"
    user_temp_dir = os.path.join(tempfile.gettempdir(),session_id)
    os.makedirs(user_temp_dir)
    shedule_delete_folder(user_temp_dir)
    return user_temp_dir

temp_dir = get_temp_dir(user_id)

UPLOAD_FOLDER = temp_dir
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
            try:
              file_path  = os.path.join(app.config['UPLOAD_FOLDER'], file.filename )
              file.save(file_path)
              print(file_path)
              unlock_file_path = os.path.join(app.config['UPLOAD_FOLDER'],f"unlocked_{file.filename}")
              file.save(unlock_file_path)
              print(unlock_file_path)
              unlock_result = unlock_pdf(file_path,unlock_file_path, '598850')
              if not unlock_result.endswith(".pdf"):
                print(f"Error unlocking PDF: {unlock_result}")
                return {"status": "error", "message": unlock_result}

              print(f"Unlocked file saved at: {unlock_file_path}")
              # print (unlock_file_path)
              pdf_to_json(unlock_file_path)
            except Exception as e:
              return str(e), 400
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
