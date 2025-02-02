const cartManager = {
    cartItems: [],
    
    init() {
        const savedCart = localStorage.getItem('urbanWatchesCart');
        if (savedCart) {
            this.cartItems = JSON.parse(savedCart);
            this.updateCartUI();
        }
        
        // Initialize product page specific elements
        this.initProductPage();
        this.initProductListPage();
        this.initCartPanel();
    },

    initCartPanel() {
        // Create popup HTML if it doesn't exist
        if (!document.getElementById('popup')) {
            const popupHTML = `
                <div id="popup" class="popup">
                    <div class="popup-content">
                        <span class="close-popup">&times;</span>
                        <h2>Coming Soon!</h2>
                        <p>The checkout feature will be available soon.</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', popupHTML);
        }

        // Add event listeners for popup
        const popup = document.getElementById('popup');
        const closePopupBtn = popup.querySelector('.close-popup');

        // Close popup when clicking the X button
        closePopupBtn.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        // Close popup when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === popup) {
                popup.style.display = 'none';
            }
        });
    },
    
    initProductPage() {
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            const decreaseBtn = document.querySelector('.decrease');
            const increaseBtn = document.querySelector('.increase');
            const buyNowBtn = document.querySelector('.add-to-cart');
            
            decreaseBtn?.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 0;
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });
            
            increaseBtn?.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 0;
                quantityInput.value = currentValue + 1;
            });
            
            buyNowBtn?.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value) || 0;
                if (quantity > 0) {
                    const product = {
                        id: window.location.pathname,
                        name: document.querySelector('.product-title')?.textContent,
                        price: parseFloat(document.querySelector('.product-price')?.textContent.replace(/[^0-9]/g, '')),
                        quantity: quantity,
                        image: document.querySelector('.product-image img')?.src
                    };
                    this.addItem(product);
                    this.toggleCart();
                }
            });
        }
    },
    
    initProductListPage() {
        const addToCartButtons = document.querySelectorAll('.cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const product = {
                    id: button.dataset.productId,
                    name: button.dataset.productName,
                    price: parseFloat(button.dataset.productPrice),
                    quantity: 1,
                    image: button.closest('.produc')?.querySelector('img')?.src
                };
                this.addItem(product);
                this.toggleCart();
            });
        });
    },
    
    addItem(product) {
        const existingItem = this.cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            this.cartItems.push(product);
        }
        
        this.saveCart();
        this.updateCartUI();
    },
    
    removeItem(productId) {
        const itemIndex = this.cartItems.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            this.cartItems.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartUI();
        }
    },
    
    saveCart() {
        localStorage.setItem('urbanWatchesCart', JSON.stringify(this.cartItems));
    },
    
    updateCartUI() {
        // Update cart count
        const cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = cartCount;
        });
        
        // Update cart panel items
        const cartItemsContainer = document.querySelector('.cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            
            this.cartItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Rs. ${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <button onclick="cartManager.removeItem('${item.id}')" class="remove-item">×</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        
        // Update subtotal
        const subtotal = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        document.querySelectorAll('.subtotal-amount').forEach(element => {
            element.textContent = `Rs. ${subtotal.toLocaleString()}`;
        });

        // Add checkout button event listener
        const checkoutButton = document.querySelector('.go-to-checkout');
        if (checkoutButton) {
            // Remove existing listener to prevent duplicates
            checkoutButton.replaceWith(checkoutButton.cloneNode(true));
            // Add new listener
            document.querySelector('.go-to-checkout').addEventListener('click', () => {
                document.getElementById('popup').style.display = 'block';
            });
        }
    },
    
    toggleCart() {
        const cartPanel = document.querySelector('.cart-panel');
        cartPanel?.classList.toggle('active');
    }
};

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    cartManager.init();
});

// Export toggleCart for global usage
window.toggleCart = () => cartManager.toggleCart();