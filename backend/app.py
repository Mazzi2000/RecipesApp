from flask import Flask, jsonify, abort, request, send_from_directory
from flask_login import LoginManager
from routes.recipes import recipes_bp
from routes.statistics import statistics_bp
from routes.meal_plans import meal_plans_bp
from routes.auth import auth_bp, User
from routes.favorites import favorites_bp
from database import get_db_connection
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-fallback-key')

# Flask login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    user_row = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    if user_row:
        return User(user_row['id'], user_row['username'])
    return None

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Authentication required'}), 401

FRONTEND_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'frontend')

@app.route("/")
def serve_index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')

@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)

app.register_blueprint(recipes_bp)
app.register_blueprint(statistics_bp)
app.register_blueprint(meal_plans_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(favorites_bp)

# Ensure favorites table exists (migration for existing databases)
with app.app_context():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            recipe_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
            UNIQUE(user_id, recipe_id)
        )
    ''')
    conn.commit()
    conn.close()


@app.errorhandler(404)
def request_error(error):
    return jsonify({
        "error": "Not found the page",
        "message": "Requested page doesnt exisits"
    }),404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": "Requested resource doesnt not exist"
    }), 500


if __name__ == '__main__':
    app.run(debug=True)