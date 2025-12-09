from flask import jsonify, Blueprint, request
from database import get_db_connection
from datetime import datetime

meal_plans_bp = Blueprint('meal_plans', __name__, url_prefix="/api")

@meal_plans_bp.route('/meal-plans')
def get_meal_plans():
    conn = get_db_connection()

    date = request.args.get('date') if request.args.get('date') else datetime.today()

    valid_date = is_valid_date(date)
    if valid_date:
        meals = conn.execute('''SELECT mp.id, mp.meal_type, mp.recipe_id, mp.servings, r.name as recipe_name, r.calories_per_serving, r.protein_per_serving, r.fat_per_serving, r.carbs_per_serving 
                    FROM meal_plans mp
                    JOIN recipes r ON mp.recipe_id = r.id
                    WHERE date = ?
                    ORDER BY
                    CASE mp.meal_type
                        WHEN 'breakfast' THEN 1
                        WHEN 'lunch' THEN 2
                        WHEN 'dinner' THEN 3
                        WHEN 'snack' THEN 4
                    END''', (date,)).fetchall()
        
    conn.close()

    totals = {'calories': 0, 'protein': 0, 'fat': 0, 'carbs': 0}

    meals_list = []
 
    for meal in meals:
        meals_list.append(dict(meal))
        totals['calories'] += meal['calories_per_serving'] * meal['servings']
        totals['protein'] += meal['protein_per_serving'] * meal['servings']
        totals['fat'] += meal['fat_per_serving'] * meal['servings']
        totals['carbs'] += meal['carbs_per_serving'] * meal['servings']

    meals_list.append(totals)

    return jsonify(meals_list)

def is_valid_date(date_string):
    try:
        datetime.strptime(date_string, '%Y-%m-%d')
        return True
    except ValueError:
        return False

# @meal_plans_bp.route('/meal-plans', methods=["POST"])
# def add_plans():
#     conn = get_db_connection()
#     if request.method == 'POST':
#         data = request.get_json()

#         if not data:
#             return jsonify({'error': 'No JSON data'}), 400

#         date = data.get('date')
#         meal_type = data.get('meal_type')
#         recipe_id = data.get('recipe_id')
#         servings = data.get('servings')

#         required = ['date', 'meal_type', 'recipe_id']

#         for field in required:
#             if field not in data:
#                 return jsonify({'error': f'Missing field: {field}'}), 400

#     recipe = conn.execute('''SELECT * FROM recipes WHERE id = ?''', (data['recipe_id'],)).fetchall()

#     if recipe:
#         conn.execute('''INSERT INTO meal_plans (date, meal_type, recipe_id, servings) VALUES (?, ?, ?, ?)''', (date, meal_type, recipe_id, servings))
