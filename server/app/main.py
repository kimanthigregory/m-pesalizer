import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from app.routes.upload import upload_bp, init_socketio
from app.routes.monthly_summary import summary_bp
from app.routes.filter import filter_bp
from app.routes.transaction_type import type_bp

app = Flask(__name__)

# Use an Environment Variable for the secret key in production
app.secret_key = os.environ.get('SECRET_KEY', 'default-key-for-dev')

CORS(app)
# In production, you might want to replace "*" with your actual Vercel URL
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet') 

init_socketio(socketio)

# Register Blueprints
app.register_blueprint(upload_bp)
app.register_blueprint(summary_bp)
app.register_blueprint(type_bp)
app.register_blueprint(filter_bp)

@app.route("/")
def health_check():
    return {"status": "healthy", "service": "M-Pesa Lens API"}, 200

if __name__ == '__main__':
    # Use the port defined by the hosting provider, default to 5000
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)