from flask import jsonify, request, Blueprint
from flask_login import login_required, current_user
from database import get_db_connection
 
favorites_bp = Blueprint('favorites', __name__)
 
 
@favorites_bp.route("/api/favorites")
@login_required
def get_favorites():
    """Get favorite recipes for the current user, paginated."""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)

    conn = get_db_connection()
    cursor = conn.cursor()

    total = cursor.execute(
        'SELECT COUNT(*) FROM favorites WHERE user_id = ?',
        (current_user.id,)
    ).fetchone()[0]

    total_pages = max(1, (total + per_page - 1) // per_page)
    page = max(1, min(page, total_pages))
    offset = (page - 1) * per_page

    rows = cursor.execute('''
        SELECT r.* FROM recipes r
        JOIN favorites f ON r.id = f.recipe_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
    ''', (current_user.id, per_page, offset)).fetchall()

    conn.close()
    return jsonify({
        "recipes": [dict(row) for row in rows],
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages
    })
 
 
@favorites_bp.route("/api/favorites/ids")
@login_required
def get_favorite_ids():
    """Get just the recipe IDs that are favorited by the current user."""
    conn = get_db_connection()
    rows = conn.execute(
        'SELECT recipe_id FROM favorites WHERE user_id = ?',
        (current_user.id,)
    ).fetchall()
    conn.close()
    return jsonify([row['recipe_id'] for row in rows])
 
 
@favorites_bp.route("/api/favorites/<int:recipe_id>", methods=['POST'])
@login_required
def add_favorite(recipe_id):
    """Add a recipe to the current user's favorites."""
    conn = get_db_connection()
    cursor = conn.cursor()
 
    try:
        cursor.execute(
            'INSERT OR IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)',
            (current_user.id, recipe_id)
        )
        conn.commit()
        return jsonify({'message': 'Recipe added to favorites'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
 
 
@favorites_bp.route("/api/favorites/<int:recipe_id>", methods=['DELETE'])
@login_required
def remove_favorite(recipe_id):
    """Remove a recipe from the current user's favorites."""
    conn = get_db_connection()
    cursor = conn.cursor()
 
    try:
        cursor.execute(
            'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?',
            (current_user.id, recipe_id)
        )
        conn.commit()
        return jsonify({'message': 'Recipe removed from favorites'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
 