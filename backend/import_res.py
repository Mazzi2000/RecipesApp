"""
Import recipes from res JSON data.

Usage:
    python import_res.py ../data/res_recipes.json

The JSON should have a "recipes" array with objects matching the centrumrespo.pl format.
"""

import json
import re
import sys
from database import get_db_connection


def parse_ingredient(raw_amount, raw_ingredient):
    """
    Parse centrumrespo ingredient format into structured fields.
    
    Examples:
        "150 g", "mięsa z piersi kurczaka"  -> amount=150, unit='g', name='mięsa z piersi kurczaka'
        "0,5", "sztuki czerwonej papryki 85 g"  -> amount=0.5, unit='szt', name='czerwonej papryki', notes='85 g'
        "3", "łyżeczki sosu BBQ 30 g"  -> amount=3, unit='łyżeczka', name='sosu BBQ', notes='30 g'
    """
    # Normalize Polish decimal comma
    amount_str = raw_amount.replace(',', '.')
    
    # Try to extract amount and unit from the amount field (e.g., "150 g")
    amount_match = re.match(r'^([\d.]+)\s*(g|kg|ml|l)$', amount_str.strip())
    
    if amount_match:
        # Amount field contains both number and unit like "150 g"
        amount = float(amount_match.group(1))
        unit = amount_match.group(2)
        name = raw_ingredient
    else:
        # Amount is just a number, unit is embedded in ingredient text
        try:
            amount = float(amount_str.strip())
        except ValueError:
            amount = 0
        
        # Extract unit from ingredient text
        unit, name = extract_unit_from_ingredient(raw_ingredient)
    
    # Extract weight hint in parentheses or at end like "85 g"
    weight_match = re.search(r'(\d+(?:,\d+)?)\s*g\s*$', name)
    notes = None
    if weight_match:
        notes = weight_match.group(0).strip()
        name = name[:weight_match.start()].strip()
    
    # Store original combined text for display
    original_text = f"{raw_amount} {raw_ingredient}"
    
    return {
        'amount': amount,
        'unit': unit,
        'name': name.strip(),
        'notes': notes,
        'original_text': original_text
    }


def extract_unit_from_ingredient(ingredient_text):
    """Extract unit keyword from the beginning of ingredient text."""
    unit_mappings = [
        (r'^sztuk[aiy]?\s+', 'szt'),
        (r'^sztuek\s+', 'szt'),
        (r'^opakowania?\s+', 'opakowanie'),
        (r'^łyże?k\s+', 'łyżka'),
        (r'^łyżki\s+', 'łyżka'),
        (r'^łyżeczk[aiy]?\s+', 'łyżeczka'),
        (r'^plastr[óy]w?\s+', 'plaster'),
        (r'^plastra?\s+', 'plaster'),
        (r'^ząbek\s+', 'ząbek'),
        (r'^ząbki\s+', 'ząbek'),
        (r'^szczypta?\s+', 'szczypta'),
        (r'^łodyga?\s+', 'łodyga'),
    ]
    
    for pattern, unit in unit_mappings:
        match = re.match(pattern, ingredient_text, re.IGNORECASE)
        if match:
            remaining = ingredient_text[match.end():]
            return unit, remaining
    
    return '', ingredient_text


def import_centrumrespo(filepath):
    """Import recipes from res JSON export."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    recipes = data.get('recipes', data) if isinstance(data, dict) else data
    
    imported = 0
    skipped = 0
    
    for recipe in recipes:
        # Check for duplicate by source_url
        url = recipe.get('url', '')
        if url:
            existing = cursor.execute(
                'SELECT id FROM recipes WHERE source_url = ?', (url,)
            ).fetchone()
            if existing:
                skipped += 1
                continue
        
        # Extract nutrition
        nutrition = recipe.get('nutrition', {})
        
        # Insert recipe
        cursor.execute('''
            INSERT INTO recipes (
                name, description, image_url, source_url, source, difficulty,
                prep_time_minutes, total_time_minutes, servings,
                instructions, notes,
                calories_per_serving, protein_per_serving, fat_per_serving,
                carbs_per_serving, sodium_per_serving, fiber_per_serving,
                rating, rating_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            recipe.get('title', 'Untitled'),
            recipe.get('description', ''),
            recipe.get('image_url', ''),
            recipe.get('url', ''),
            'centrumrespo',
            recipe.get('difficulty', ''),
            recipe.get('prep_time_min'),
            recipe.get('total_time_min'),
            recipe.get('servings'),
            json.dumps(recipe.get('instructions', []), ensure_ascii=False),
            recipe.get('article_text', ''),
            nutrition.get('kcal', 0),
            nutrition.get('protein_g', 0),
            nutrition.get('fat_g', 0),
            nutrition.get('carbs_g', 0),
            nutrition.get('sodium_mg', 0),
            nutrition.get('fiber_g', 0),
            recipe.get('rating'),
            recipe.get('rating_count', 0),
        ))
        
        recipe_id = cursor.lastrowid
        
        # Insert categories (the tag-like labels)
        for cat in recipe.get('categories', []):
            cursor.execute(
                'INSERT INTO recipe_categories (recipe_id, category_name) VALUES (?, ?)',
                (recipe_id, cat)
            )
        
        # Insert ingredients
        for ing in recipe.get('ingredients', []):
            parsed = parse_ingredient(ing.get('amount', ''), ing.get('ingredient', ''))
            cursor.execute('''
                INSERT INTO ingredients (recipe_id, name, amount, unit, notes, original_text)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                recipe_id,
                parsed['name'],
                parsed['amount'],
                parsed['unit'],
                parsed['notes'],
                parsed['original_text'],
            ))
        
        imported += 1
    
    conn.commit()
    conn.close()
    
    print(f"Imported: {imported}, Skipped (duplicates): {skipped}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        filepath = '../data/res_recipes_2.json'
    else:
        filepath = sys.argv[1]
    
    import_centrumrespo(filepath)