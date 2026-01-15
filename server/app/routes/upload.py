from flask import request, Blueprint, session, jsonify
import os, tempfile, uuid, threading, json  # Added json import
from app.utilities.pdfparser import pdf_to_json
from app.utilities.unlock_pdf_utils import unlock_pdf

upload_bp = Blueprint('upload', __name__)
socketio = None 

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_files(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_socketio(sock):
    global socketio
    socketio = sock

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'the_file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    file = request.files['the_file']
    pass_key = request.form.get('pass_code')
    socket_id = request.form.get('socket_id') # Received from React

    if file.filename == '' or not allowed_files(file.filename):
        return jsonify({"status": "error", "message": "Invalid file"}), 400

    user_id = session.get('user_id', str(uuid.uuid4()))
    user_temp_dir = os.path.join(tempfile.gettempdir(), user_id)
    os.makedirs(user_temp_dir, exist_ok=True)

    file_path = os.path.join(user_temp_dir, file.filename)
    file.save(file_path)

    # Start background thread
    thread = threading.Thread(target=process_pdf, args=(user_id, file_path, pass_key, socket_id))
    thread.daemon = True
    thread.start()

    return jsonify({"status": "success", "user_id": user_id}), 200

def process_pdf(user_id, file_path, pass_key, socket_id):
    try:
        print(f"--- Starting Processing for {user_id} ---")
        
        unlocked_path = os.path.join(tempfile.gettempdir(), user_id, "unlocked.pdf")
        
        if pass_key:
            print("Attempting to unlock PDF...")
            unlock_result = unlock_pdf(file_path, unlocked_path, pass_key)
            if isinstance(unlock_result, str) and unlock_result.startswith("failed"):
                if socketio:
                    socketio.emit("processing_update", {"status": "failed", "error": unlock_result}, to=socket_id)
                return
        else:
            unlocked_path = file_path

        output_folder = os.path.join(tempfile.gettempdir(), user_id)
        
        # 1. Run your parser (this creates the .json file on disk)
        pdf_to_json(unlocked_path, output_folder)

        # 2. VITAL STEP: Read the generated JSON file
        # Check for 'output.json' (ensure this filename matches what pdf_to_json creates)
        json_file_path = os.path.join(output_folder, "output.json")
        
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r') as f:
                parsed_data = json.load(f)
            
            print(f"✅ Success: Parsed {len(parsed_data)} transactions.")
            
            # 3. Send data to the frontend
            if socketio:
                print(f"Emitting data to socket: {socket_id}")
                socketio.emit("processing_update", {
                    "status": "done",
                    "data": parsed_data
                }, to=socket_id)
        else:
            print(f"❌ Error: JSON file not found at {json_file_path}")
            socketio.emit("processing_update", {"status": "failed", "error": "Parser failed to create output"}, to=socket_id)

    except Exception as e:
        print(f"❌ Background Error: {str(e)}")
        if socketio:
            socketio.emit("processing_update", {"status": "failed", "error": str(e)}, to=socket_id)