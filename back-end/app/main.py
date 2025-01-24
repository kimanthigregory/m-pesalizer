from flask import Flask
from app.routes.upload import upload_bp
from app.routes.monthly_summary import summary_bp


app = Flask(__name__)


app.secret_key = 'c659ad2b-e49a-4cba-91a9-bb11dc4c0c5a'
app.register_blueprint(upload_bp)
app.register_blueprint(summary_bp)
print(app.url_map)

@app.route("/")
def hello_world():
    return "hello world"


