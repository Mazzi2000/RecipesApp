DROP TABLE IF EXISTS recipe_categories;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,                    -- optional meal type: breakfast/lunch/dinner/snack (nullable now)
    image_url TEXT,
    source_url TEXT,                  -- original recipe URL
    source TEXT DEFAULT 'manual',     -- origin: 'centrumrespo', 'instagram', 'manual', etc.
    difficulty TEXT,                  -- 'Łatwy', 'Średni', 'Trudny'
    prep_time_minutes INTEGER,
    total_time_minutes INTEGER,
    servings INTEGER DEFAULT 1,
    instructions TEXT,                -- JSON array of strings
    notes TEXT,
    tags TEXT,                        -- JSON array (legacy support)

    -- Nutrition per serving
    calories_per_serving REAL DEFAULT 0,
    protein_per_serving REAL DEFAULT 0,
    fat_per_serving REAL DEFAULT 0,
    carbs_per_serving REAL DEFAULT 0,
    sodium_per_serving REAL DEFAULT 0,
    fiber_per_serving REAL DEFAULT 0,

    -- Rating
    rating REAL,
    rating_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Separate table for multi-value categories/tags like "Dla dzieci", "Bez laktozy", "Vege"
CREATE TABLE recipe_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    category_name TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipe_categories_recipe ON recipe_categories(recipe_id);
CREATE INDEX idx_recipe_categories_name ON recipe_categories(category_name);

CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL,
    unit TEXT,
    notes TEXT,
    original_text TEXT,               -- store the raw string from source for display
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    recipe_id INTEGER NOT NULL,
    servings REAL DEFAULT 1,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);