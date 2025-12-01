from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_adam():
    return "<p>How you doing men </p>"

if __name__ == '__main__':
    app.run(debug=True)