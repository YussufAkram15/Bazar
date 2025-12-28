# 🛍️ Bazar - Egyptian Souvenirs E-Commerce

A modern e-commerce website for authentic Egyptian souvenirs, featuring a Flask backend with SQLite database, user authentication, and order management.

![Bazar](images/hero-image.avif)

## ✨ Features

### 🎨 Frontend
- **Responsive Design**: Beautiful, mobile-friendly UI with Bootstrap 5
- **Product Catalog**: Browse authentic Egyptian souvenirs with detailed descriptions
- **Shopping Cart**: Add/remove items, adjust quantities, real-time cart updates
- **Smooth Animations**: Confetti celebrations and cart notifications
- **Modern UI**: Glassmorphism effects, gradient backgrounds, and premium aesthetics

### 🔐 User Authentication
- **User Registration**: Create account with email and password
- **Secure Login**: SHA-256 password hashing
- **Session Management**: Persistent login across pages
- **User Profile**: Display logged-in user in navbar

### 📦 Order Management
- **Place Orders**: Save orders to database with customer details
- **Order Tracking**: View order history for logged-in users
- **Order Details**: Track items, quantities, prices, and totals

### 🗄️ Backend
- **Flask API**: RESTful API endpoints
- **SQLite Database**: Lightweight, file-based database
- **CORS Enabled**: Cross-origin requests supported
- **Clean Architecture**: Simple, maintainable code structure

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- pip (Python package manager)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YussufAkram15/Bazar.git
cd Bazar
```

2. **Create virtual environment**
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the Flask server**
```bash
python app.py
```

The server will start at `http://localhost:5001`

5. **Open the website**
Open `index.html` in your browser:
```
file:///path/to/Bazar/index.html
```

## 📁 Project Structure

```
Bazar/
├── app.py                 # Flask backend with API endpoints
├── requirements.txt       # Python dependencies
├── products.db           # SQLite database (auto-generated)
├── index.html            # Homepage
├── products.html         # Products catalog page
├── cart.html             # Shopping cart page
├── checkout.html         # Checkout page
├── login.html            # Login/Registration page
├── css/
│   └── styles.css        # Custom styles
├── js/
│   └── main.js           # Frontend JavaScript
├── images/               # Product images
└── .gitignore           # Git ignore file
```

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products

### Authentication
- `POST /api/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /api/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Orders
- `POST /api/orders` - Place new order
  ```json
  {
    "user_id": 1,
    "name": "John Doe",
    "address": "123 Main St",
    "email": "user@example.com",
    "cart": [
      {
        "id": 1,
        "name": "Product Name",
        "price": 45.99,
        "quantity": 2
      }
    ]
  }
  ```

- `GET /api/orders/<user_id>` - Get user's orders

## 🗃️ Database Schema

### `products`
- `id` - Product ID (Primary Key)
- `name` - Product name
- `price` - Product price
- `description` - Product description
- `image_url` - Product image path

### `users`
- `id` - User ID (Primary Key, Auto-increment)
- `email` - User email (Unique)
- `password` - Hashed password (SHA-256)
- `name` - User full name
- `created_at` - Registration timestamp

### `orders`
- `id` - Order ID (Primary Key, Auto-increment)
- `user_id` - Foreign key to users table
- `total` - Order total amount
- `name` - Customer name
- `address` - Shipping address
- `email` - Customer email
- `created_at` - Order timestamp

### `order_items`
- `id` - Item ID (Primary Key, Auto-increment)
- `order_id` - Foreign key to orders table
- `product_id` - Product ID
- `product_name` - Product name
- `price` - Product price at time of order
- `quantity` - Quantity ordered

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3 (Bootstrap 5)
- JavaScript (ES6+)
- Canvas Confetti (for celebrations)

### Backend
- Python 3.12
- Flask 3.0.0
- Flask-CORS 4.0.0
- SQLite3

## 🎯 Usage

1. **Browse Products**: Visit the homepage or products page to see available items
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Register/Login**: Create an account or login to save orders
4. **Checkout**: Fill in shipping details and place your order
5. **View Orders**: Check your order history (coming soon)

## 🔒 Security

- Passwords are hashed using SHA-256 before storage
- No plain-text passwords stored in database
- CORS configured for secure cross-origin requests

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

**Yussuf Akram**
- GitHub: [@YussufAkram15](https://github.com/YussufAkram15)

## 🙏 Acknowledgments

- Egyptian heritage and culture for inspiration
- Bootstrap team for the amazing CSS framework
- Flask community for excellent documentation

---

**Note**: This is a demo project. For production use, consider:
- Using a production WSGI server (e.g., Gunicorn)
- Implementing stronger password hashing (e.g., bcrypt)
- Adding input validation and sanitization
- Using environment variables for configuration
- Implementing proper error handling
- Adding rate limiting and security headers
