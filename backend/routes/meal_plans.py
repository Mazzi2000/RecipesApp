from flask import jsonify, Blueprint, request
from database import get_db_connection
from datetime import datetime

meal_plans_bp = Blueprint('meal_plans', __name__, url_prefix="/api")

@meal_plans_bp.route('/meal-plans')
def get_meal_plans():
    conn = get_db_connection()

    #If no date is provided, it is today's date
    date = request.args.get('date') if request.args.get('date') else datetime.today().strftime('%Y-%m-%d')

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

@meal_plans_bp.route('/meal-plans', methods=["POST"])
def add_plans():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON data'}), 400

        date = data.get('date')
        meal_type = data.get('meal_type')
        recipe_id = data.get('recipe_id')
        servings = data.get('servings')

        required = ['date', 'meal_type', 'recipe_id']

        for field in required:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

    recipe = conn.execute('''SELECT * FROM recipes WHERE id = ?''', (recipe_id,)).fetchone()

    if recipe:
        cursor = conn.execute('''INSERT INTO meal_plans (date, meal_type, recipe_id, servings) VALUES (?, ?, ?, ?)''', (date, meal_type, recipe_id, servings))
    else:
        return jsonify({'error': 'Recipe not found'}), 404

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'id': new_id,
        'date': date,
        'meal_type': meal_type,
        'recipe_id': recipe_id,
        'servings': servings,
        'message': 'Meal plan created successfully'
    }), 201

@meal_plans_bp.route('/meal-plans/<int:meal_id>', methods = ['DELETE'])
def delete_meal(meal_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM meal_plans WHERE id = ?', (meal_id,))

    #Checking if a meal plan existed
    if cursor.rowcount == 0:
        return jsonify({
            'error': 'Meal plan not found'
        }), 404

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Meal plan deleted successfully'
    })