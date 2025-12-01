DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS recipies;

CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    prep_time_minutes INTEGER,
    servings INTEGER,
    instructions TEXT,
    calories_per_serving REAL,
    protein_per_serving REAL,
    fat_per_serving REAL,
    carbs_per_serving REAL,
    tags TEXT,
    source TEXT,
    notes TEXT
);

CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL,
    unit TEXT,
    notes TEXT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

CREATE TABLE meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    recipe_id INTEGER NOT NULL,
    servings REAL DEFAULT 1,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);