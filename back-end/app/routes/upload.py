from flask import request ,Blueprint
from flask import Flask ,session
from app.utilities.pdfparser import pdf_to_json 
from app.utilities.unlock_pdf_utils import unlock_pdf



import os
import tempfile
import uuid
import shutil
import atexit

app = Flask(__name__)

 
app.secret_key = 'c659ad2b-e49a-4cba-91a9-bb11dc4c0c5a'
upload_bp = Blueprint('upload', __name__)

@app.before_request
def assign_user_id():
   if 'user_id' not in session:
      session['user_id'] = str(uuid.uuid4()) 
      print(f"Hello, your session  id is {session['user_id']}")
   else:
      print(f"Hello, your existing session  id is {session['user_id']}")
 

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
              print(session['user_id'])
              user_id = session['user_id']
              user_temp_dir = os.path.join(tempfile.gettempdir(), user_id)
              os.makedirs(user_temp_dir)
 
              file_path  = os.path.join(user_temp_dir, file.filename )
              file.save(file_path)
              print(file_path)


              unlock_file_path = os.path.join(user_temp_dir,f"unlocked_{file.filename}")
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

# @app.route('/cleanup', methods = ['POST'])
# def cleanup():
#   user_id = session['user_id']
#   user_temp_dir = os.path.join(tempfile.gettempdir(),user_id)
#   shutil.rmtree(user_temp_dir, ignore_errors = True)
#   return {"status": "success", "message": "temprary files deleted"}
