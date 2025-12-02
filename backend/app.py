from flask import Flask, jsonify, abort
from database import get_db_connection

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.route("/api/recipes")
def get_recipes():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM recipes")
    rows = cursor.fetchall()

    connection.close()

    recipes_list = []
    for row in rows:
        recipes_list.append(dict(row))

    return jsonify(recipes_list)

@app.route("/api/recipes/<int:recipe_id>")
def get_recipe(recipe_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    recipe = cursor.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,)).fetchone()

    if recipe is None:
        abort(404, description="The recipe doesnt exists.")
        connection.close()

    '''
    SELECT r.*, i.name as ingredient_name, i.amount, i.unit, i.notes as ingredient_notes
    FROM recipes r
    LEFT JOIN ingredients i ON r.id = i.recipe_id
    WHERE r.id = ?'''

    ingredients = cursor.execute("SELECT * FROM ingredients WHERE recipe_id = ?", (recipe_id,)).fetchall()
    connection.close()

    result = dict(recipe)
    result['ingredients'] = [dict(ing) for ing in ingredients]

    return jsonify(result)

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