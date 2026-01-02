# 🍽️ RecipesApp

 
A meal planning app that helps you store your favorite recipes in one place, plan meals for upcoming days, and track macronutrients and calories.


 
### Recipe List

![Recipe List](docs/screenshots/RecipeListView.png)

*Browse all recipes with category filters (Breakfast, Lunch, Dinner, Snack)*

 

### Meal Planner

![Meal Planner](docs/screenshots/MealPlannerView.png)

*Plan your daily meals and see total macro summary*

 

### Recipe Detail

![Recipe Detail](docs/screenshots/RecipeDetail.png)

*View ingredients, instructions, and nutritional info per serving*

 

## Features

 

- 📚 Store and browse recipes with category filtering

- 📅 Plan meals for any day with easy add/remove

- 🔢 Automatic macro calculation (calories, protein, fat, carbs)

- ➕➖ Adjust serving sizes in meal planner

- 📊 Daily nutritional summary

 

## Tech Stack

 

- **Backend:** Python 3.10+, Flask

- **Frontend:** HTML, CSS, JavaScript (vanilla)

- **Database:** SQLite

 

## Getting Started

**Note:** The UI is currently in Polish only.

### Prerequisites

 

- Python 3.10 or higher

- pip

 

### Installation

 

```bash

# Clone the repository

git clone https://github.com/Mazzi2000/RecipesApp

cd RecipesApp

 

# Install dependencies

pip install -r requirements.txt

 

# Initialize the database

cd backend

python database.py

 

# Import sample recipes (optional)

python import_recipes.py

 

# Run the app

python app.py

```

 

The app will be available at `http://127.0.0.1:5000`

 

## 🤖 Adding Recipes (AI-Assisted Workflow)

 

This app uses a clever workflow to convert messy recipes into structured data:

 

1. **Collect recipes** from anywhere (Instagram, notes, websites)

2. **Use AI** (ChatGPT/Claude) with the prompt in `docs/recipe-prompt.md` to structure them

3. **Save** the generated JSON to `data/recipes.json`

4. **Import** by running `python import_recipes.py`

 

The AI automatically:

- Categorizes meals (breakfast/lunch/dinner/snack)

- Calculates nutritional values from ingredients

- Standardizes units and formats

 

## Project Structure

 

```

RecipesApp/

├── backend/

│   ├── app.py              # Flask application

│   ├── database.py         # Database connection & init

│   ├── schema.sql          # Database schema

│   ├── import_recipes.py   # Recipe import script

│   └── routes/             # API endpoints

├── frontend/

│   ├── index.html

│   ├── css/styles.css

│   └── js/

├── data/

│   └── recipes.json        # Recipe data file

└── requirements.txt

```

 

## Status

 

🚧 Learning project - actively developed

