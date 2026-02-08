from flask import Blueprint, request, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# --- User model for Flask-Login ---

class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

# --- Auth routes ---

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400

    conn = get_db_connection()
    user_row = conn.execute(
        'SELECT * FROM users WHERE username = ?', (data['username'],)
    ).fetchone()
    conn.close()

    if user_row and check_password_hash(user_row['password_hash'], data['password']):
        user = User(user_row['id'], user_row['username'])
        login_user(user)
        return jsonify({
            'message': 'Logged in successfully',
            'user': {'id': user.id, 'username': user.username}
        })

    return jsonify({'error': 'Invalid username or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/me')
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {'id': current_user.id, 'username': current_user.username}
        })
    return jsonify({'authenticated': False})