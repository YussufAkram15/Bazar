// js/main.js

const PRODUCTS_URL = 'data/products.json';
const CART_KEY = 'bazar_cart';

// Utility: format price
function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

// Utility: get current cart from localStorage
function getCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error parsing cart from localStorage', e);
    return [];
  }
}

// Utility: save cart and update count badge
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// Fetch products JSON
async function fetchProducts() {
  const response = await fetch(PRODUCTS_URL);
  if (!response.ok) {
    throw new Error('Failed to load products');
  }
  return response.json();
}

// Show cart notification
function showCartNotification(product) {
  // Remove any existing notification
  const existingNotification = document.querySelector('.cart-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'cart-notification show';
  notification.innerHTML = `
    <div class="cart-notification-icon">✓</div>
    <div class="cart-notification-content">
      <div class="cart-notification-title">Added to Cart!</div>
      <div class="cart-notification-message">${product.name}</div>
    </div>
    <button class="cart-notification-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Celebration effect (confetti)
function celebrate() {
  if (typeof confetti === 'undefined') {
    // Fallback if confetti library not loaded
    return;
  }
  
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Confetti from left
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    
    // Confetti from right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

// Add product to cart
function addToCart(product) {
  if (!product || typeof product.id === 'undefined') return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1
    });
  }
  saveCart(cart);
  
  // Show notification
  showCartNotification(product);
  
  // Celebration effect
  celebrate();
}

// Update navbar cart count
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    // Add red background only when cart has items
    if (count > 0) {
      badge.classList.add('has-items');
    } else {
      badge.classList.remove('has-items');
    }
  }
}

// Load featured products on home page (first 2)
async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  try {
    const products = await fetchProducts();
    const featured = products.slice(0, 2);

    container.innerHTML = '';
    featured.forEach((product) => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      col.innerHTML = `
        <div class="card product-card h-100 shadow-sm">
          <img src="${product.image_url}" class="card-img-top" alt="${product.name}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text text-muted small mb-2">
              ${product.description}
            </p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="fw-bold">${formatPrice(product.price)}</span>
              <button class="btn btn-sm btn-primary" data-add-to-cart data-id="${product.id}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

    // Attach listeners
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const productsList = await fetchProducts();
      const product = productsList.find((p) => p.id === id);
      addToCart(product);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">Unable to load featured products.</div>
      </div>
    `;
  }
}

// Load all products on products page
async function loadProductsPage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const products = await fetchProducts();
    grid.innerHTML = '';
    products.forEach((product) => {
      const col = document.createElement('div');
      col.className = 'col-sm-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card product-card h-100 shadow-sm">
          <img src="${product.image_url}" class="card-img-top" alt="${product.name}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text text-muted small mb-2">
              ${product.description}
            </p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="fw-bold">${formatPrice(product.price)}</span>
              <button class="btn btn-sm btn-primary" data-add-to-cart data-id="${product.id}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(col);
    });

    // Delegate click for Add to Cart
    grid.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const productsList = await fetchProducts();
      const product = productsList.find((p) => p.id === id);
      addToCart(product);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">Unable to load products.</div>
      </div>
    `;
  }
}

// Clear cart
function clearCart() {
  if (confirm('Are you sure you want to clear all items from your cart?')) {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    loadCartPage();
  }
}

// Cart page event handler (attached once)
let cartPageHandler = null;

// Load cart page
function loadCartPage() {
  const cartItemsBody = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  const cartTotal = document.getElementById('cart-total');

  if (!cartItemsBody || !cartEmpty || !cartContent || !cartTotal) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartEmpty.classList.remove('d-none');
    cartContent.classList.add('d-none');
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartEmpty.classList.add('d-none');
  cartContent.classList.remove('d-none');

  cartItemsBody.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <img src="${item.image_url}" alt="${item.name}" class="rounded me-3" style="width:60px;height:60px;object-fit:cover;" />
          <div>
            <div class="fw-semibold">${item.name}</div>
          </div>
        </div>
      </td>
      <td class="text-end">${formatPrice(item.price)}</td>
      <td class="text-center">
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-secondary" data-qty-minus data-index="${index}">-</button>
          <span class="btn btn-light disabled">${item.quantity}</span>
          <button type="button" class="btn btn-outline-secondary" data-qty-plus data-index="${index}">+</button>
        </div>
      </td>
      <td class="text-end">${formatPrice(subtotal)}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-outline-danger" data-remove-item data-index="${index}">
          Remove
        </button>
      </td>
    `;
    cartItemsBody.appendChild(tr);
  });

  cartTotal.textContent = formatPrice(total);

  // Quantity & remove handlers - only attach once
  if (!cartPageHandler) {
    cartPageHandler = (e) => {
      const minusBtn = e.target.closest('[data-qty-minus]');
      const plusBtn = e.target.closest('[data-qty-plus]');
      const removeBtn = e.target.closest('[data-remove-item]');

      let cartData = getCart();

      if (minusBtn) {
        const index = parseInt(minusBtn.getAttribute('data-index'), 10);
        if (cartData[index]) {
          cartData[index].quantity -= 1;
          if (cartData[index].quantity <= 0) {
            cartData.splice(index, 1);
          }
          saveCart(cartData);
          loadCartPage();
        }
      } else if (plusBtn) {
        const index = parseInt(plusBtn.getAttribute('data-index'), 10);
        if (cartData[index]) {
          cartData[index].quantity += 1;
          saveCart(cartData);
          loadCartPage();
        }
      } else if (removeBtn) {
        const index = parseInt(removeBtn.getAttribute('data-index'), 10);
        if (cartData[index]) {
          cartData.splice(index, 1);
          saveCart(cartData);
          loadCartPage();
        }
      }
    };
    cartItemsBody.addEventListener('click', cartPageHandler);
  }

  // Clear cart button handler
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn && !clearCartBtn.hasAttribute('data-listener-attached')) {
    clearCartBtn.addEventListener('click', clearCart);
    clearCartBtn.setAttribute('data-listener-attached', 'true');
  }
}

// Load checkout summary and handle form
function loadCheckoutPage() {
  const itemsCountEl = document.getElementById('summary-items-count');
  const totalEl = document.getElementById('summary-total');
  const form = document.getElementById('checkout-form');

  const cart = getCart();
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (itemsCountEl) itemsCountEl.textContent = itemsCount;
  if (totalEl) totalEl.textContent = formatPrice(total);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name');
      const address = document.getElementById('address');

      if (!name.value.trim() || !address.value.trim()) {
        alert('Please fill in the required fields.');
        return;
      }

      alert('Order Placed');
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      form.reset();
    });
  }
}

// Init common UI things
function initCommon() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
  updateCartCount();
}

// Main entry point
document.addEventListener('DOMContentLoaded', () => {
  initCommon();

  const page = document.body.dataset.page;

  switch (page) {
    case 'home':
      loadFeaturedProducts();
      break;
    case 'products':
      loadProductsPage();
      break;
    case 'cart':
      loadCartPage();
      break;
    case 'checkout':
      loadCheckoutPage();
      break;
    case 'login':
    default:
      // No specific JS needed
      break;
  }
});


