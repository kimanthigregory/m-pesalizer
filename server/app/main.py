from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from app.routes.upload import upload_bp, init_socketio
from app.routes.monthly_summary import summary_bp
from app.routes.filter import filter_bp
from app.routes.transaction_type import type_bp

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # ✅ Initialize WebSockets

app.secret_key = 'c659ad2b-e49a-4cba-91a9-bb11dc4c0c5a'

# ✅ Pass socketio instance to upload.py
init_socketio(socketio)

# Register Blueprints
app.register_blueprint(upload_bp)
app.register_blueprint(summary_bp)
app.register_blueprint(type_bp)
app.register_blueprint(filter_bp)

print(app.url_map)

@app.route("/")
def hello_world():
    return "hello world"

if __name__ == '__main__':
    socketio.run(app, debug=True)  # ✅ Ensure socketio runs the app
