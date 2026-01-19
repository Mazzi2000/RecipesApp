from flask import Flask, jsonify, abort, request, Blueprint
from database import get_db_connection
import json

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

@recipes_bp.route("/api/recipes", methods=['POST'])
def create_recipe():
    data = request.get_json()

    if not data:
        return jsonify({'error' : 'No JSON data'}), 400
    
    required_fields = ['name', 'category']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f"Missing required field: {field}"}), 400
        
    if data['category'] not in VALID_CATEGORIES:
        return jsonify({
            'error': 'Invalid category',
            'valid_categories': VALID_CATEGORIES
        }),400
    
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            INSERT INTO recipes
                       (name, category, prep_time_minutes, servings, instructions, calories_per_serving, protein_per_serving, fat_per_serving, carbs_per_serving, tags, source, notes)
                       VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
            ''', (
                data['name'],
                data['category'],
                data.get('prep_time_minutes'),
                data.get('servings', 1),
                json.dumps(data.get('instructions', [])),
                data.get('calories_per_serving', 0),
                data.get('protein_per_serving', 0),
                data.get('fat_per_serving', 0),
                data.get('carbs_per_serving', 0),
                json.dumps(data.get('tags', [])),
                data.get('source', 'manual'),
                data.get('notes')
            ))
        recipe_id = cursor.lastrowid

        ingredients = data.get('ingredients', [])
        for ing in ingredients:
            cursor.execute('''
                INSERT INTO ingredients (recipe_id, name, amount, unit, notes)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                recipe_id,
                ing.get('name', ''),
                ing.get('amount', 0),
                ing.get('unit', ''),
                ing.get('notes')
            ))

        conn.commit()

        return jsonify({
            'id': recipe_id,
            'message': 'Recipe created successfully'
        }), 201
    
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        conn.close()

@recipes_bp.route("/api/recipes/<int:recipe_id>", methods=['DELETE'])
def remove_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM ingredients WHERE recipe_id = ?', (recipe_id,))
        cursor.execute('DELETE FROM recipes WHERE id = ?',(recipe_id,))

        if (cursor.rowcount == 0):
            return jsonify({
                'error': 'Recipe not found'
            }), 404
    
        conn.commit()

        return jsonify({
            'message': 'Recipe deleted successfully'
        })

    except Exception as e:
        conn.rollback()
        return jsonify({
            'error': str(e)
        }), 500

    finally:
        conn.close()