class Product {
    constructor(id, name, category, price, image, sizes) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.image = image;
        this.sizes = sizes.split(',');
    }
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.getElementById('cart-items');
    const orderButton = document.getElementById('order-button');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const searchInput = document.getElementById('search');
    const cartCount = document.getElementById('cart-count');

    function getProductsFromHTML() {
        const productElements = document.querySelectorAll('.product');
        const products = [];
        productElements.forEach(productElement => {
            const id = parseInt(productElement.dataset.id);
            const name = productElement.dataset.name;
            const category = productElement.dataset.category;
            const price = parseFloat(productElement.dataset.price);
            const image = productElement.dataset.image;
            const sizes = productElement.dataset.sizes;
            products.push(new Product(id, name, category, price, image, sizes));
        });
        return products;
    }

    function displayProducts(productsToDisplay) {
        const productList = document.getElementById('product-list');
        if (productList) {
            productList.innerHTML = '';
            productsToDisplay.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';
                productElement.dataset.id = product.id;
                productElement.dataset.name = product.name;
                productElement.dataset.category = product.category;
                productElement.dataset.price = product.price;
                productElement.dataset.image = product.image;
                productElement.dataset.sizes = product.sizes.join(',');
                productElement.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>R$ ${product.price}</p>
                    <label for="size${product.id}">Tamanho:</label>
                    <select id="size${product.id}">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                    <button onclick="addToCart(${product.id}, document.getElementById('size${product.id}').value)">Adicionar ao Carrinho</button>
                `;
                productList.appendChild(productElement);
            });
        }
    }

    window.addToCart = function(id, size) {
        const products = getProductsFromHTML();
        const product = products.find(p => p.id === id);
        if (product) {
            const cartProduct = { ...product, size };
            cart.push(cartProduct);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            updateCartCount();
        }
    }

    window.removeFromCart = function(id) {
        cart = cart.filter(product => product.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
    }

    function updateCart() {
        if (cartItems) {
            cartItems.innerHTML = '';
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>R$ ${item.price}</p>
                    <p>Tamanho: ${item.size}</p>
                    <p>Categoria: ${item.category}</p>
                    <button class="remove-button" onclick="removeFromCart(${item.id})">Remover</button>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }

    function updateCartCount() {
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }

    if (orderButton) {
        orderButton.addEventListener('click', () => {
            const whatsappNumber = '73991037723';
            const timeOfDayGreeting = getTimeOfDayGreeting();
            let message = `${timeOfDayGreeting}, gostaria de verificar esses produtos:\n`;
            cart.forEach(item => {
                message += `* ${item.name} - R$ ${item.price}\nTamanho: ${item.size}\nCategoria: ${item.category}\n`;
                message += `${window.location.origin}/${item.image}\n`;
            });
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const products = getProductsFromHTML();
            const selectedOptions = Array.from(categoryCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            let filteredProducts;

            if (selectedOptions.length === 0) {
                filteredProducts = products;
            } else {
                filteredProducts = products.filter(product => {
                    const matchesCategory = selectedOptions.includes(product.category);
                    const matchesSize = product.sizes.some(size => selectedOptions.includes(size));
                    return matchesCategory || matchesSize;
                });
            }

            displayProducts(filteredProducts);
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const products = getProductsFromHTML();
            const searchTerm = searchInput.value.toLowerCase();
            const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm));
            displayProducts(filteredProducts);
        });
    }

    function getTimeOfDayGreeting() {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            return 'Bom dia';
        } else if (currentHour < 18) {
            return 'Boa tarde';
        } else {
            return 'Boa noite';
        }
    }

    const products = getProductsFromHTML();
    displayProducts(products);
    updateCart();
    updateCartCount();
});

function prevSlide() {
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.scrollBy({ left: -carouselContainer.clientWidth, behavior: 'smooth' });
}

function nextSlide() {
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.scrollBy({ left: carouselContainer.clientWidth, behavior: 'smooth' });
}