/**
 * Beef Hive Butchery - Main Script
 * Real contact info:
 *   WhatsApp / Phone: 0714 534 463 (International: 254714534463)
 *   TikTok: @jm.kesh
 *   Location: Near Rainbow Ruiru Resort, Ruiru, Kiambu County
 *   Wholesale Price: KSh 650 / kg
 */

// 1. Central Configuration
const CONFIG = {
  businessName: 'Beef Hive Butchery',
  whatsappNumber: '254714534463', // Real WhatsApp number
  phoneDisplay: '0714 534 463',
  tiktokUrl: 'https://www.tiktok.com/@jm.kesh',
  tiktokHandle: '@jm.kesh',
  location: 'Near Rainbow Ruiru Resort, Ruiru',
  wholesalePrice: 650,
  defaultMessage: 'Hi Beef Hive Butchery, I would like to inquire about your fresh cuts and delivery.'
};

// 2. Helper to construct WhatsApp URLs
function waLink(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// 3. Application State
let allProducts = [];
let currentCategory = 'all';
let currentSlideIndex = 0;
let slideInterval = null;
let cart = [];
let searchQuery = '';

// DOM Elements
const catalogGrid = document.getElementById('catalog-grid');
const filterPillsContainer = document.getElementById('filter-pills');
const wholesaleBtn = document.getElementById('wholesale-wa-btn');
const topBarWaLink = document.getElementById('top-bar-wa-link');
const footerWaBtn = document.getElementById('footer-wa-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

// Cart DOM Elements
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const mobileBarCartBtn = document.getElementById('mobile-bar-cart-btn');
const mobileCartBadge = document.getElementById('mobile-cart-badge');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartDrawerItems = document.getElementById('cart-drawer-items');
const cartCountBadge = document.getElementById('cart-count-badge');
const cartDrawerCountBadge = document.getElementById('cart-drawer-count-badge');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartWaCheckoutBtn = document.getElementById('cart-wa-checkout-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');
const cartNotesInput = document.getElementById('cart-notes');
const cartToast = document.getElementById('cart-toast');

// 4. Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  setupStaticWaLinks();
  setupMobileNav();
  setupDropdownCategoryLinks();
  setupHeroSlider();
  setupCartDrawerEvents();
  setupCatalogSearch();
  setupFaqAccordion();
  setupCookieBanner();
  fetchProducts();
});

// Load Cart from LocalStorage
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('beef_hive_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading cart:', e);
    cart = [];
  }
  updateCartUI();
}

// Save Cart to LocalStorage
function saveCart() {
  try {
    localStorage.setItem('beef_hive_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
  updateCartUI();
}

// Add Item to Cart
function addToCart(productId, quantity = 1) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex(item => item.id === productId);
  if (existingIndex > -1) {
    cart[existingIndex].qty += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      qty: quantity
    });
  }

  saveCart();
  showToast(`Added ${quantity} ${product.unit} x ${product.name} to Cart`);
}

// Update Item Quantity in Cart
function updateCartItemQty(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty = newQty;
    saveCart();
  }
}

// Remove Item from Cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
}

// Clear Cart
function clearCart() {
  cart = [];
  saveCart();
}

// Update Cart UI
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cartCountBadge) cartCountBadge.innerText = totalItems;
  if (mobileCartBadge) mobileCartBadge.innerText = totalItems;
  if (cartDrawerCountBadge) cartDrawerCountBadge.innerText = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
  if (cartTotalPrice) cartTotalPrice.innerText = `KSh ${totalCost.toLocaleString()}`;

  if (!cartDrawerItems) return;

  if (cart.length === 0) {
    cartDrawerItems.innerHTML = `
      <div class="cart-empty-msg">
        <svg class="cart-empty-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Your order cart is currently empty.</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Browse our fresh daily cuts and tap "Add to Cart" to start your order.</p>
      </div>
    `;
    return;
  }

  cartDrawerItems.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.image || 'images/ribeye-steak.jpg'}" alt="${escapeHtml(item.name)}" class="cart-item-img">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${escapeHtml(item.name)}</h4>
        <div class="cart-item-price-unit">KSh ${item.price.toLocaleString()} / ${item.unit}</div>
        <div class="cart-item-bottom">
          <div class="qty-control">
            <button type="button" class="qty-btn cart-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <input type="text" class="qty-input" value="${item.qty}" readonly aria-label="Quantity">
            <button type="button" class="qty-btn cart-qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <div class="cart-item-subtotal">KSh ${(item.price * item.qty).toLocaleString()}</div>
        </div>
      </div>
      <button type="button" class="cart-item-remove" data-id="${item.id}" title="Remove item" aria-label="Remove item">&times;</button>
    </div>
  `).join('');

  // Attach event listeners for cart items
  cartDrawerItems.querySelectorAll('.cart-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const item = cart.find(i => i.id === id);
      if (item) updateCartItemQty(id, item.qty - 1);
    });
  });

  cartDrawerItems.querySelectorAll('.cart-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const item = cart.find(i => i.id === id);
      if (item) updateCartItemQty(id, item.qty + 1);
    });
  });

  cartDrawerItems.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      removeFromCart(id);
    });
  });
}

// Toast Notification Display
function showToast(message) {
  if (!cartToast) return;
  cartToast.innerText = message;
  cartToast.classList.add('show');
  setTimeout(() => {
    cartToast.classList.remove('show');
  }, 3000);
}

// Setup Cart Drawer Events
function setupCartDrawerEvents() {
  if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', openCartDrawer);
  }
  if (mobileBarCartBtn) {
    mobileBarCartBtn.addEventListener('click', openCartDrawer);
  }
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', closeCartDrawer);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartDrawer);
  }
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (cart.length > 0 && confirm('Are you sure you want to clear your cart?')) {
        clearCart();
      }
    });
  }
  if (cartWaCheckoutBtn) {
    cartWaCheckoutBtn.addEventListener('click', checkoutCartViaWhatsApp);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('active')) {
      closeCartDrawer();
    }
  });
}

function openCartDrawer() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Checkout Cart via WhatsApp
function checkoutCartViaWhatsApp() {
  if (cart.length === 0) {
    alert('Your order cart is empty! Please add fresh cuts to your cart first.');
    return;
  }

  const notes = cartNotesInput ? cartNotesInput.value.trim() : '';
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  let msg = `🥩 *NEW ORDER - BEEF HIVE BUTCHERY* 🥩\n\n`;
  msg += `*Order Items:* \n`;

  cart.forEach((item, index) => {
    msg += `${index + 1}. *${item.name}* — ${item.qty} ${item.unit} @ KSh ${item.price.toLocaleString()} = KSh ${(item.price * item.qty).toLocaleString()}\n`;
  });

  msg += `\n💰 *Total Order Amount:* KSh ${totalCost.toLocaleString()}\n`;
  if (notes) {
    msg += `📝 *Special Instructions:* ${notes}\n`;
  }
  msg += `📍 *Pickup/Delivery:* Near Rainbow Ruiru Resort, Ruiru\n\n`;
  msg += `Please confirm availability & total price. Thank you!`;

  window.open(waLink(msg), '_blank');
}

// Setup pre-filled WhatsApp links
function setupStaticWaLinks() {
  const defaultWaMsg = `Hi, I'd like to place an order at ${CONFIG.businessName}.`;
  const wholesaleMsg = `Hi, I'm interested in wholesale meat pricing (Beef KSh 650/kg & Matumbo from KSh 350/kg) from ${CONFIG.businessName}.`;

  if (wholesaleBtn) {
    wholesaleBtn.href = waLink(wholesaleMsg);
    wholesaleBtn.setAttribute('target', '_blank');
    wholesaleBtn.setAttribute('rel', 'noopener noreferrer');
  }

  [topBarWaLink, footerWaBtn].forEach(btn => {
    if (btn) {
      btn.href = waLink(defaultWaMsg);
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Update telephone links
  document.querySelectorAll('.phone-link-dyn').forEach(link => {
    link.href = `tel:+${CONFIG.whatsappNumber}`;
    link.innerText = CONFIG.phoneDisplay;
  });
}

// Mobile Navigation Toggle
function setupMobileNav() {
  if (!mobileMenuBtn || !navLinks) return;

  mobileMenuBtn.addEventListener('click', () => {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Setup Header Navigation Category Dropdown Shortcuts
function setupDropdownCategoryLinks() {
  const categoryLinks = document.querySelectorAll('.cat-drop-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const category = link.getAttribute('data-cat');
      if (category) {
        setCategory(category);
      }
    });
  });
}

// 5. Full-Width Hero Slider Carousel Logic
function setupHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');

  if (slides.length === 0) return;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active-slide', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active-dot', i === index);
    });
    currentSlideIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetSlideTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetSlideTimer(); });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const slideIdx = parseInt(e.currentTarget.getAttribute('data-slide'), 10);
      showSlide(slideIdx);
      resetSlideTimer();
    });
  });

  function startSlideTimer() {
    slideInterval = setInterval(nextSlide, 6000);
  }

  function resetSlideTimer() {
    clearInterval(slideInterval);
    startSlideTimer();
  }

  startSlideTimer();
}

// 6. Fetch Products Data
async function fetchProducts() {
  if (!catalogGrid) return;

  try {
    catalogGrid.innerHTML = `
      <div class="catalog-loading" role="status">
        <div class="spinner"></div>
        <p>Loading fresh cuts from butchery...</p>
      </div>
    `;

    const response = await fetch(`data/products.json?v=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to load catalog data (Status: ${response.status})`);
    }

    const data = await response.json();
    allProducts = data.products || [];

    renderFilterPills();
    renderCatalog();
  } catch (error) {
    console.error('Error fetching products:', error);
    catalogGrid.innerHTML = `
      <div class="catalog-error" role="alert">
        <p>⚠️ Unable to load product catalog. Please try again later.</p>
        <a href="${waLink('Hi Beef Hive Butchery, please send me your current price list.')}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
          Order directly on WhatsApp
        </a>
      </div>
    `;
  }
}

// 7. Category Filter Pills Setup
function renderFilterPills() {
  if (!filterPillsContainer) return;

  const categories = [
    { id: 'all', label: 'All Cuts' },
    { id: 'beef', label: 'Beef' },
    { id: 'goat', label: 'Goat' },
    { id: 'mutton', label: 'Mutton' },
    { id: 'poultry', label: 'Poultry' },
    { id: 'offal', label: 'Offal' }
  ];

  filterPillsContainer.innerHTML = categories.map(cat => `
    <button 
      type="button" 
      class="filter-pill ${cat.id === currentCategory ? 'active' : ''}"
      data-category="${cat.id}"
      role="tab"
      aria-selected="${cat.id === currentCategory ? 'true' : 'false'}"
      aria-controls="catalog-grid"
      id="tab-${cat.id}"
    >
      ${cat.label}
    </button>
  `).join('');

  filterPillsContainer.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const category = e.currentTarget.getAttribute('data-category');
      setCategory(category);
    });
  });
}

function setCategory(category) {
  currentCategory = category;

  const pills = filterPillsContainer.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    const isSelected = pill.getAttribute('data-category') === currentCategory;
    pill.classList.toggle('active', isSelected);
    pill.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  renderCatalog();
}

// Live Instant Search Handler
function setupCatalogSearch() {
  const searchInput = document.getElementById('catalog-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    if (clearBtn) {
      clearBtn.style.display = searchQuery.length > 0 ? 'inline-block' : 'none';
    }
    renderCatalog();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.style.display = 'none';
      renderCatalog();
    });
  }
}

// FAQ Accordion Handler
function setupFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Close other open FAQ items
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isExpanded);
      btn.setAttribute('aria-expanded', !isExpanded);
    });
  });
}

// 8. Render Product Cards Grid with Real Product Photos, Quantity Selectors & Add to Cart
function renderCatalog() {
  if (!catalogGrid) return;

  let filtered = currentCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());

  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      p.desc.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    catalogGrid.innerHTML = `
      <div class="catalog-empty">
        <p>No products found matching "${escapeHtml(searchQuery || currentCategory)}".</p>
      </div>
    `;
    return;
  }

  const categoryIcons = {
    beef: '🥩',
    goat: '🍖',
    mutton: '🥩',
    poultry: '🍗',
    offal: '🥓'
  };

  catalogGrid.innerHTML = filtered.map(product => {
    const productMsg = `Hi, I'd like to order: ${product.name} (per ${product.unit}) — KSh ${product.price.toLocaleString()} from ${CONFIG.businessName}.`;
    const productWaUrl = waLink(productMsg);
    const catIcon = categoryIcons[product.category] || '🥩';
    const imgSrc = product.image ? `${product.image}?v=2` : 'images/ribeye-steak.jpg';

    return `
      <article class="product-card" data-category="${product.category}">
        <div class="product-card-img-wrap">
          <img src="${imgSrc}" alt="${escapeHtml(product.name)} fresh cut at Beef Hive Butchery" loading="lazy">
          <span class="category-tag">${product.category.toUpperCase()}</span>
        </div>
        
        <div class="product-card-body">
          <div class="product-card-title-row">
            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            <span class="unit-badge">Per ${product.unit}</span>
          </div>
          <p class="product-desc">${escapeHtml(product.desc)}</p>
        </div>

        <div class="product-card-footer">
          <div class="product-price">
            <span class="currency">KSh</span>
            <span class="amount">${product.price.toLocaleString()}</span>
            <span class="per-unit">/ ${product.unit}</span>
          </div>

          <div class="product-qty-row">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Qty (${product.unit}):</span>
            <div class="qty-control">
              <button type="button" class="qty-btn card-qty-minus" data-id="${product.id}" aria-label="Decrease quantity">-</button>
              <input type="text" id="card-qty-${product.id}" class="qty-input" value="1" readonly aria-label="Quantity">
              <button type="button" class="qty-btn card-qty-plus" data-id="${product.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div class="product-actions-grid">
            <button 
              type="button" 
              class="btn btn-add-cart" 
              data-id="${product.id}"
              aria-label="Add ${escapeHtml(product.name)} to cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> ADD TO CART
            </button>

            <a 
              href="${productWaUrl}" 
              class="btn btn-wa-direct" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Quick Order on WhatsApp"
              aria-label="Order ${escapeHtml(product.name)} directly on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFFFFF" aria-hidden="true" style="width:22px;height:22px;fill:#FFFFFF;display:block;">
                <path fill="#FFFFFF" d="M12.031 2c-5.514 0-9.998 4.486-9.998 10 0 1.761.458 3.473 1.328 4.985L2 22l5.143-1.35A9.957 9.957 0 0012.031 22c5.515 0 9.999-4.486 9.999-10s-4.484-10-9.999-10zm5.82 14.28c-.244.687-1.42 1.312-1.956 1.365-.503.051-1.144.225-3.76-.8-3.08-1.205-5.06-4.32-5.215-4.526-.153-.207-1.246-1.66-1.246-3.167 0-1.507.78-2.247 1.056-2.553.275-.306.6-.383.8-.383.2 0 .4 0 .574.01.184.01.433-.07.675.51.244.58.83 2.025.903 2.174.073.148.12.325.024.517-.096.191-.144.31-.288.48-.144.17-.303.38-.432.51-.144.143-.294.3-.127.587.168.287.747 1.233 1.602 1.996 1.099.98 2.026 1.285 2.313 1.428.287.143.456.12.624-.072.168-.192.72-.837.912-1.124.192-.287.384-.24.648-.143.264.095 1.68.792 1.968.935.288.143.48.215.552.335.072.12.072.697-.172 1.384z"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach Card Event Listeners
  catalogGrid.querySelectorAll('.card-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const input = document.getElementById(`card-qty-${id}`);
      if (input) {
        let val = parseInt(input.value, 10) || 1;
        if (val > 1) input.value = val - 1;
      }
    });
  });

  catalogGrid.querySelectorAll('.card-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const input = document.getElementById(`card-qty-${id}`);
      if (input) {
        let val = parseInt(input.value, 10) || 1;
        input.value = val + 1;
      }
    });
  });

  catalogGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const input = document.getElementById(`card-qty-${id}`);
      const qty = input ? (parseInt(input.value, 10) || 1) : 1;
      addToCart(id, qty);
    });
  });
}

// Utility: Escape HTML
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Cookie Consent Notification Banner Setup
function setupCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies-btn');
  const rejectBtn = document.getElementById('reject-cookies-btn');
  if (!banner) return;

  const consent = localStorage.getItem('beef_hive_cookie_consent');
  if (!consent) {
    setTimeout(() => {
      banner.classList.add('show');
    }, 1000);
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('beef_hive_cookie_consent', 'accepted');
      banner.classList.remove('show');
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('beef_hive_cookie_consent', 'rejected');
      banner.classList.remove('show');
    });
  }
}
