from flask import Flask, jsonify, abort, request, send_from_directory
from flask_login import LoginManager
from extensions import limiter
from routes.recipes import recipes_bp
from routes.statistics import statistics_bp
from routes.meal_plans import meal_plans_bp
from routes.auth import auth_bp, User
from routes.favorites import favorites_bp
from database import get_db_connection
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

app.config['JSON_AS_ASCII'] = False

secret_key = os.environ.get('SECRET_KEY')
if not secret_key:
    raise RuntimeError(
        "SECRET_KEY is not set! "
        "Generate one: python3 -c \"import secrets; print(secrets.token_hex(32))\" "
        "Then add to .env: SECRET_KEY=your_generated_key"
    )
app.config['SECRET_KEY'] = secret_key

app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# app.config['SESSION_COOKIE_SECURE'] = True    # I will uncomment when will be HTTPS
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=2)

limiter.init_app(app)

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

@app.route('/api/debug-ip')
def debug_ip():
    return jsonify({
        'remote_addr': request.remote_addr,
        'x_forwarded_for': request.headers.get('X-Forwarded-For'),
        'x_real_ip': request.headers.get('X-Real-IP')
    })

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

@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'

    return response

@app.errorhandler(429)
def rate_limit_error(error):
    return jsonify({'error': str(error.description)}), 429


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