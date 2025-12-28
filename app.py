from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import hashlib

app = Flask(__name__)
CORS(app)

DATABASE = 'products.db'

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    """Initialize the database tables"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image_url TEXT
        )
    ''')
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total REAL NOT NULL,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Create order_items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    ''')
    
    
    conn.commit()
    conn.close()

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products from database"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM products ORDER BY id')
    rows = cursor.fetchall()
    
    products = [dict(row) for row in rows]
    
    conn.close()
    return jsonify(products)

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data['email']
    password = hash_password(data['password'])
    name = data['name']
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (email, password, name)
            VALUES (?, ?, ?)
        ''', (email, password, name))
        conn.commit()
        user_id = cursor.lastrowid
        
        conn.close()
        return jsonify({
            'success': True,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Email already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    email = data['email']
    password = hash_password(data['password'])
    
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, name FROM users WHERE email = ? AND password = ?', (email, password))
    user = cursor.fetchone()
    
    conn.close()
    
    if user:
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        })
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.get_json()
    
    if not data or not data.get('cart') or not data.get('name') or not data.get('address'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    cart = data['cart']
    user_id = data.get('user_id')
    name = data['name']
    address = data['address']
    email = data.get('email', '')
    
    # Calculate total
    total = sum(item['price'] * item['quantity'] for item in cart)
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Insert order
    cursor.execute('''
        INSERT INTO orders (user_id, total, name, address, email)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, total, name, address, email))
    
    order_id = cursor.lastrowid
    
    # Insert order items
    for item in cart:
        cursor.execute('''
            INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        ''', (order_id, item['id'], item['name'], item['price'], item['quantity']))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'order_id': order_id,
        'total': total
    }), 201

@app.route('/api/orders/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    """Get all orders for a user"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get orders
    cursor.execute('''
        SELECT id, total, name, address, email, created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    ''', (user_id,))
    
    orders = []
    for order_row in cursor.fetchall():
        order = dict(order_row)
        
        # Get order items
        cursor.execute('''
            SELECT product_id, product_name, price, quantity
            FROM order_items
            WHERE order_id = ?
        ''', (order['id'],))
        
        order['items'] = [dict(item) for item in cursor.fetchall()]
        orders.append(order)
    
    conn.close()
    return jsonify(orders)

if __name__ == '__main__':
    init_db()
    print("Flask server starting on http://localhost:5001")
    print("API endpoint: http://localhost:5001/api/products")
    app.run(debug=True, port=5001)
