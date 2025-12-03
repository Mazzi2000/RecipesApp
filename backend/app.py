from flask import Flask, jsonify, abort, request, send_from_directory
from routes.recipes import recipes_bp
import os

app = Flask(__name__)

FRONTEND_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'frontend')

app.config['JSON_AS_ASCII'] = False

@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')

@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)

app.register_blueprint(recipes_bp)

@app.errorhandler(404)
def request_error(error):
    return jsonify({
        "error": "Not faound the page",
        "messgae": "Requested page doesnt exisits"
    }),404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": "Requested resource doesnt not exist"
    }), 500


if __name__ == '__main__':
    app.run(debug=True)