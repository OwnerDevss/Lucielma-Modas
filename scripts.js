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
    const productList = document.getElementById('product-list');
    let allProducts = [];

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
                    <button class="add-to-cart-button" onclick="addToCart(${product.id}, document.getElementById('size${product.id}').value)">Adicionar ao Carrinho</button>
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
            updateCartCount();
        }
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
    }

    function updateCart() {
        if (cartItems) {
            cartItems.innerHTML = '';
            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>R$ ${item.price}</p>
                    <p>Tamanho: ${item.size}</p>
                    <p>Categoria: ${item.category}</p>
                    <button class="remove-button" onclick="removeFromCart(${index})">Remover</button>
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
        checkbox.addEventListener('change', applyFilters);
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked && (cb.value === "masculino" || cb.value === "feminino"))
            .map(cb => cb.value);
        
        const selectedSizes = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked && !selectedCategories.includes(cb.value))
            .map(cb => cb.value);
    
        let filteredProducts = allProducts;
    
        // Filtra primeiro por categoria, se alguma foi selecionada
        if (selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter(product => selectedCategories.includes(product.category));
        }
    
        // Depois filtra por tamanho, garantindo que o tamanho escolhido pertença à categoria filtrada
        if (selectedSizes.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                product.sizes.some(size => selectedSizes.includes(size))
            );
        }
    
        // Filtra pelo termo de pesquisa, se houver
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product => product.name.includes(searchTerm));
        }
    
        displayProducts(filteredProducts);
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

    allProducts = getProductsFromHTML();
    displayProducts(allProducts);
    updateCart();
    updateCartCount();

    // Carrossel
    const carouselContainer = document.querySelector('.carousel-container');
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.carousel-item').length;

    function updateCarousel() {
        const offset = -currentSlide * 100;
        carouselContainer.style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        currentSlide = (currentSlide < totalSlides - 1) ? currentSlide + 1 : 0;
        updateCarousel();
    }

    // Movimentação automática do carrossel
    setInterval(nextSlide, 3000); // Muda de slide a cada 3 segundos
});
