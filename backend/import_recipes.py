import json
from database import get_db_connection


recipesFilePath = "../data/recipes.json"

def import_recipes():
    conn = get_db_connection()
    cursor = conn.cursor()

    with open(recipesFilePath, "r", encoding="UTF-8") as f:
        recipes = json.load(f)


        for recipe in recipes:
            insertSql = "INSERT INTO recipes (name, category, prep_time_minutes, servings, instructions, calories_per_serving, protein_per_serving,fat_per_serving, carbs_per_serving, tags, source, notes) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

            recordsToInsert = [
                recipe['name'],
                recipe['category'],
                recipe['prep_time_minutes'],
                recipe['servings'],
                json.dumps(recipe['instructions']),
                recipe['nutrition_per_serving']['calories'],
                recipe['nutrition_per_serving']['protein_g'],
                recipe['nutrition_per_serving']['fat_g'],
                recipe['nutrition_per_serving']['carbs_g'],
                json.dumps(recipe['tags']),
                recipe['source'],
                recipe['notes']
            ]

            cursor.execute(insertSql, recordsToInsert)
            recipe_id = cursor.lastrowid

            for ingredient in recipe['ingredients']:
                ingredient_insert_sql = "INSERT INTO ingredients (recipe_id, name, amount, unit, notes) VALUES (?, ?, ?, ?, ?)"

                cursor.execute(ingredient_insert_sql,(
                    recipe_id,
                    ingredient['name'],
                    ingredient['amount'],
                    ingredient['unit'],
                    ingredient['notes']
                ))

        conn.commit()
        conn.close()

        print(f"{len(recipes)} recipes imported successfully.")

if __name__ == "__main__":
    import_recipes()