"""
Admin tool: Create user accounts from the command line.

Usage:
    python create_user.py <username> <password>

Example:
    python create_user.py natalia MySecurePass123
    python create_user.py adam HisPassword456
"""

import sys
from werkzeug.security import generate_password_hash
from database import get_db_connection

def create_user(username, password):
    conn = get_db_connection()

    # Check if user exists
    existing = conn.execute(
        'SELECT id FROM users WHERE username = ?', (username,)
    ).fetchone()

    if existing:
        print(f"Error: User '{username}' already exists.")
        conn.close()
        return False

    # Create user with hashed password
    conn.execute(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        (username, generate_password_hash(password))
    )
    conn.commit()
    conn.close()

    print(f"User '{username}' created successfully.")
    return True

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python create_user.py <username> <password>")
        sys.exit(1)

    create_user(sys.argv[1], sys.argv[2])