from flask import jsonify, request, Blueprint
from flask_login import login_required, current_user
from database import get_db_connection

favorites_bp = Blueprint('favorites', __name__)


@favorites_bp.route("/api/favorites")
@login_required
def get_favorites():
    """Get all favorite recipes for the current user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    rows = cursor.execute('''
        SELECT r.* FROM recipes r
        JOIN favorites f ON r.id = f.recipe_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ''', (current_user.id,)).fetchall()

    conn.close()
    return jsonify([dict(row) for row in rows])


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
