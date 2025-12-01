from flask import Flask, jsonify
from database import get_db_connection

app = Flask(__name__)

@app.route("/api/recipes")
def get_data():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM recipes")
    rows = cursor.fetchall()

    connection.close()

    recipes_list = []
    for row in rows:
        recipes_list.append(dict(row))

    return jsonify(recipes_list)

@app.route("/")
def hello_adam():
    return "<p>How you doing men </p>"

if __name__ == '__main__':
    app.run(debug=True)