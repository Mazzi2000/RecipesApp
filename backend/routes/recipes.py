from flask import Flask, jsonify, abort, request, Blueprint
from flask_login import login_required
from database import get_db_connection
import json

recipes_bp = Blueprint('recipes', __name__)

VALID_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack']

@recipes_bp.route("/api/recipes")
@login_required
def get_recipes():
    connection = get_db_connection()
    cursor = connection.cursor()

    category = request.args.get('category')
    tag = request.args.get('tag')  # NEW: filter by recipe_categories tag
    search = request.args.get('search')

    if category and category not in VALID_CATEGORIES:
        return jsonify({
            "error": "Wrong category",
            "valid_categories": VALID_CATEGORIES
        }), 400

    query = "SELECT DISTINCT r.* FROM recipes r"
    conditions = []
    params = []

    if tag:
        query += " JOIN recipe_categories rc ON r.id = rc.recipe_id"
        conditions.append("rc.category_name = ?")
        params.append(tag)

    if category:
        conditions.append("r.category = ?")
        params.append(category)

    if search:
        conditions.append("r.name LIKE ?")
        params.append(f"%{search}%")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY r.id DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    connection.close()

    recipes_list = [dict(row) for row in rows]
    return jsonify(recipes_list)


@recipes_bp.route("/api/recipes/<int:recipe_id>")
def get_recipe(recipe_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    recipe = cursor.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,)).fetchone()

    if recipe is None:
        connection.close()
        abort(404, description="The recipe doesn't exist.")

    ingredients = cursor.execute(
        "SELECT * FROM ingredients WHERE recipe_id = ?", (recipe_id,)
    ).fetchall()

    categories = cursor.execute(
        "SELECT category_name FROM recipe_categories WHERE recipe_id = ?", (recipe_id,)
    ).fetchall()

    connection.close()

    result = dict(recipe)
    result['ingredients'] = [dict(ing) for ing in ingredients]
    result['recipe_categories'] = [row['category_name'] for row in categories]

    return jsonify(result)


@recipes_bp.route("/api/recipes", methods=['POST'])
@login_required
def create_recipe():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No JSON data'}), 400

    required_fields = ['name']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f"Missing required field: {field}"}), 400

    # Category is now optional
    if data.get('category') and data['category'] not in VALID_CATEGORIES:
        return jsonify({
            'error': 'Invalid category',
            'valid_categories': VALID_CATEGORIES
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            INSERT INTO recipes
                (name, description, category, image_url, source_url, source,
                 difficulty, prep_time_minutes, total_time_minutes, servings,
                 instructions, notes, tags,
                 calories_per_serving, protein_per_serving, fat_per_serving,
                 carbs_per_serving, sodium_per_serving, fiber_per_serving,
                 rating, rating_count)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            data['name'],
            data.get('description'),
            data.get('category'),
            data.get('image_url'),
            data.get('source_url'),
            data.get('source', 'manual'),
            data.get('difficulty'),
            data.get('prep_time_minutes'),
            data.get('total_time_minutes'),
            data.get('servings', 1),
            json.dumps(data.get('instructions', [])),
            data.get('notes'),
            json.dumps(data.get('tags', [])),
            data.get('calories_per_serving', 0),
            data.get('protein_per_serving', 0),
            data.get('fat_per_serving', 0),
            data.get('carbs_per_serving', 0),
            data.get('sodium_per_serving', 0),
            data.get('fiber_per_serving', 0),
            data.get('rating'),
            data.get('rating_count', 0),
        ))
        recipe_id = cursor.lastrowid

        # Insert ingredients
        for ing in data.get('ingredients', []):
            cursor.execute('''
                INSERT INTO ingredients (recipe_id, name, amount, unit, notes, original_text)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                recipe_id,
                ing.get('name', ''),
                ing.get('amount', 0),
                ing.get('unit', ''),
                ing.get('notes'),
                ing.get('original_text'),
            ))

        # Insert recipe categories/tags
        for cat in data.get('recipe_categories', []):
            cursor.execute(
                'INSERT INTO recipe_categories (recipe_id, category_name) VALUES (?, ?)',
                (recipe_id, cat)
            )

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
@login_required
def remove_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM recipe_categories WHERE recipe_id = ?', (recipe_id,))
        cursor.execute('DELETE FROM ingredients WHERE recipe_id = ?', (recipe_id,))
        cursor.execute('DELETE FROM recipes WHERE id = ?', (recipe_id,))

        if cursor.rowcount == 0:
            return jsonify({'error': 'Recipe not found'}), 404

        conn.commit()
        return jsonify({'message': 'Recipe deleted successfully'})

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        conn.close()


@recipes_bp.route("/api/recipe-tags")
def get_all_tags():
    """Return all unique recipe category tags for filtering."""
    conn = get_db_connection()
    rows = conn.execute(
        'SELECT DISTINCT category_name FROM recipe_categories ORDER BY category_name'
    ).fetchall()
    conn.close()
    return jsonify([row['category_name'] for row in rows])