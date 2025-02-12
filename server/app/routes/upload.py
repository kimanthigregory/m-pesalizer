from flask import request, Blueprint, session, jsonify, current_app
from flask_cors import CORS
import os, tempfile, uuid, threading
from flask_socketio import SocketIO

from app.utilities.pdfparser import pdf_to_json
from app.utilities.unlock_pdf_utils import unlock_pdf

upload_bp = Blueprint('upload', __name__)
socketio = None  # Will be initialized from main.py

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.before_request
def ensure_user_id():
    """Assigns a unique user ID to each session if not already set."""
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    """Handles file upload and starts background processing."""
    if 'the_file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    file = request.files['the_file']
    pass_key = request.form.get('pass_code')

    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    if file and allowed_files(file.filename):
        user_id = session['user_id']
        user_temp_dir = os.path.join(tempfile.gettempdir(), user_id)
        os.makedirs(user_temp_dir, exist_ok=True)

        file_path = os.path.join(user_temp_dir, file.filename)
        file.save(file_path)

        # ✅ Start processing in a separate thread (passing only 3 arguments)
        thread = threading.Thread(target=process_pdf, args=(user_id, file_path, pass_key))
        thread.daemon = True  # Ensure thread exits with the app
        thread.start()

        return jsonify({"status": "success", "message": "File uploaded, processing started", "user_id": user_id}), 200

def process_pdf(user_id, file_path, pass_key):
    """Processes the uploaded PDF file."""
    try:
        print("Processing PDF...")

        # Define output path for unlocked PDF
        unlocked_path = os.path.join(tempfile.gettempdir(), user_id, "unlocked.pdf")

        # Check if the PDF requires unlocking
        if pass_key:
            unlock_result = unlock_pdf(file_path, unlocked_path, pass_key)
            if isinstance(unlock_result, str) and unlock_result.startswith("failed"):
                print("❌", unlock_result)
                if socketio:
                    socketio.emit("processing_update", {"user_id": user_id, "status": "failed", "error": unlock_result})
                return  # Exit function if decryption failed
        else:
            unlocked_path = file_path  # ✅ Use original file if no password

        # Define output folder for JSON conversion
        output_folder = os.path.join(tempfile.gettempdir(), user_id)
        os.makedirs(output_folder, exist_ok=True)

        # Convert PDF to JSON
        pdf_data = pdf_to_json(unlocked_path, output_folder)  # ✅ Now passing required `output_folder`

        # ✅ Ensure `socketio` is initialized before emitting
        if socketio:
            socketio.emit("processing_update", {"user_id": user_id, "status": "done"})
        else:
            print("⚠️ Warning: SocketIO is not initialized!")

    except TypeError as e:
        print("❌ TypeError:", str(e))
        if "missing 1 required positional argument" in str(e):
            print("⚠️ Likely cause: pdf_to_json() was called without all required arguments.")
        if socketio:
            socketio.emit("processing_update", {"user_id": user_id, "status": "failed", "error": str(e)})

    except Exception as e:
        print("❌ Error processing file:", str(e))
        if socketio:
            socketio.emit("processing_update", {"user_id": user_id, "status": "failed", "error": str(e)})
        else:
            print("⚠️ Warning: SocketIO is not initialized!")



def init_socketio(sock):
    """Initialize socketio with the Flask app."""
    global socketio
    socketio = sock
