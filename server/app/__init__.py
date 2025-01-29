from flask import Flask

def create_app():
    app = Flask(__name__)
    
    # Set configuration
    app.config['SECRET_KEY'] = 'c659ad2b-e49a-4cba-91a9-bb11dc4c0c5a'
    
    # Import and register blueprints
    from app.routes.upload import upload_bp
    app.register_blueprint(upload_bp)
    
    return app
