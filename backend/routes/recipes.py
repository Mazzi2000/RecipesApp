from flask import Flask, jsonify, abort, request, Blueprint
from database import get_db_connection

recipes_bp = Blueprint('recipes', __name__)

VALID_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack']

@recipes_bp.route("/api/recipes")
def get_recipes():
    connection = get_db_connection()
    cursor = connection.cursor()

    category = request.args.get('category')

    if category and category not in VALID_CATEGORIES:
        return jsonify({
            "error": "Wrong category",
            "valid_categories": VALID_CATEGORIES
        }), 400
    elif category:
        cursor.execute("SELECT * FROM recipes WHERE category = ?", (category,))
    else:
        cursor.execute("SELECT * FROM recipes")

    rows = cursor.fetchall()

    connection.close()

    recipes_list = []
    for row in rows:
        recipes_list.append(dict(row))

    return jsonify(recipes_list)

@recipes_bp.route("/api/recipes/<int:recipe_id>")
def get_recipe(recipe_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    recipe = cursor.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,)).fetchone()

    if recipe is None:
        abort(404, description="The recipe doesnt exists.")
        connection.close()

    ingredients = cursor.execute("SELECT * FROM ingredients WHERE recipe_id = ?", (recipe_id,)).fetchall()
    connection.close()

    result = dict(recipe)
    result['ingredients'] = [dict(ing) for ing in ingredients]

    return jsonify(result)