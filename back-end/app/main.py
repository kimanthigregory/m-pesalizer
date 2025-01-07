from flask import Flask
from app.routes.upload import upload_bp
app = Flask(__name__)

app.register_blueprint(upload_bp)
print(app.url_map)

@app.route("/")
def hello_world():
    return "hello world"


