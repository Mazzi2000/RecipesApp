from flask import Flask, jsonify, abort, request
from routes.recipes import recipes_bp

app = Flask(__name__)

app.register_blueprint(recipes_bp)

app.config['JSON_AS_ASCII'] = False

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


@app.route("/")
def hello_adam():
    return "<p>How you doing men </p>"

if __name__ == '__main__':
    app.run(debug=True)