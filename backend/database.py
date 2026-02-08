import sqlite3
import os 

# Absolute path
DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'recipes.db')
SCHEMA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema.sql')

def get_db_connection():
    conn = sqlite3.connect(DATABASE)

    #When i set this below SQLLite returns Row object instead of plain tuples(i have to print that like object)
    conn.row_factory = sqlite3.Row

    conn.execute("PRAGMA foreign_keys = ON")

    return conn

def init_db():
    conn = get_db_connection()

    with open(SCHEMA, 'r') as f:
        conn.executescript(f.read())

        conn.commit()

        conn.close()

        print("Database initialized")

if __name__ == "__main__":
    init_db()