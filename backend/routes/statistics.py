from flask import Flask, Blueprint, jsonify
from database import get_db_connection

statistics_bp = Blueprint('statistics', __name__, url_prefix="/api")

@statistics_bp.route('/statistics')
def get_statistic():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM recipes", )

    count_of_recipes = cursor.fetchone()

    conn.close()

    count = count_of_recipes[0]

    return jsonify(count)


