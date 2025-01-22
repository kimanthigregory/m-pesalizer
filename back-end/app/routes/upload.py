from flask import request, Blueprint, session, redirect, url_for
import os
import tempfile
import uuid
import shutil
from app.utilities.pdfparser import pdf_to_json
from app.utilities.unlock_pdf_utils import unlock_pdf

upload_bp = Blueprint('upload', __name__)
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.before_request
def ensure_user_id():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        print(f"Assigned new session ID: {session['user_id']}")
    else:
        print(f"Existing session ID: {session['user_id']}")

@upload_bp.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'the_file' not in request.files:
            return "No file part", 400

        file = request.files['the_file']
        pass_key = request.form.get('pass_code')
        if file.filename == '':
            return "No selected file", 400

        if file and allowed_files(file.filename):
            try:
                user_id = session['user_id']
                user_temp_dir = os.path.join(tempfile.gettempdir(), user_id)
                os.makedirs(user_temp_dir, exist_ok=True)

                file_path = os.path.join(user_temp_dir, file.filename)
                file.save(file_path)
                print(f"Uploaded file saved to: {file_path}")

                unlock_file_path = os.path.join(user_temp_dir, f"unlocked_{file.filename}")
                unlock_result = unlock_pdf(file_path, unlock_file_path, pass_key)

                if not unlock_result.endswith(".pdf"):
                    print(f"Error unlocking PDF: {unlock_result}")
                    return {"status": "error", "message": unlock_result}

                print(f"Unlocked file saved at: {unlock_file_path}")
                pdf_to_json(unlock_file_path,user_temp_dir)
                return f"File uploaded and processed successfully. Unlocked file: {unlock_file_path}"
            except Exception as e:
                return str(e), 500
        else:
            return "File type not allowed", 400

    return '''<!doctype html>
    <html>
      <head><title>Upload a File</title></head>
      <body>
        <h1>Upload a File</h1>
        <form method="POST" enctype="multipart/form-data">
          <input type="file" name="the_file">
          <input type = "password" name = "pass_code">
          <input type="submit" value="Upload">
        </form>
      
      
        <form action="/end_session" method="POST">
          <button type="submit">End Session</button>
        </form>
      </body>
    </html>'''

@upload_bp.route('/end_session', methods=['POST'])
def end_session():
    try:
        if 'user_id' in session:
            user_id = session['user_id']
            user_temp_dir = os.path.join(tempfile.gettempdir(), user_id)

            if os.path.exists(user_temp_dir):
                shutil.rmtree(user_temp_dir)
                print(f"Cleaned up temporary files for user: {user_id}")

            session.pop('user_id', None)
            print("Session ended.")
    except Exception as e:
        print(f"Error ending session: {e}")

    return redirect(url_for('upload.upload_file'))
