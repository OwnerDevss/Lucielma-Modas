class Product {
    constructor(id, name, category, price, images, sizes, link, color) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.images = images.split(',');
        this.sizes = sizes.split(',');
        this.link = link;
        this.color = color;
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
            const images = productElement.dataset.images;
            const sizes = productElement.dataset.sizes;
            const link = productElement.dataset.link;
            const color = productElement.dataset.color || ''; // Extrai a cor do atributo data-color
            products.push(new Product(id, name, category, price, images, sizes, link, color));
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
                productElement.dataset.images = product.images.join(',');
                productElement.dataset.sizes = product.sizes.join(',');
                productElement.dataset.link = product.link;
                productElement.dataset.color = product.color;
                productElement.innerHTML = `
                    <div class="carousel">
                        <div class="carousel-container">
                            ${product.images.map(image => `<div class="carousel-item"><img src="${image}" alt="${product.name}"></div>`).join('')}
                        </div>
                    </div>
                    <h3>${product.name}</h3>
                    <p>R$ ${product.price}</p>
                    ${product.color ? `<p>Cor: ${product.color}</p>` : ''}
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
        const product = allProducts.find(p => p.id === id);
        if (product) {
            const cartProduct = { ...product, size };
            cart.push(cartProduct);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
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
                    <img src="${item.images[0]}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>R$ ${item.price}</p>
                    <p>Tamanho: ${item.size}</p>
                    <p>Categoria: ${item.category}</p>
                    ${item.color ? `<p>Cor: ${item.color}</p>` : ''}
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
            const whatsappNumber = '557391265271'; // Número no formato internacional sem símbolos
            const timeOfDayGreeting = getTimeOfDayGreeting();
            let message = `${timeOfDayGreeting}, gostaria de verificar esses produtos:\n`;
            cart.forEach(item => {
                message += `* ${item.name} - R$ ${item.price}\nTamanho: ${item.size}\nCategoria: ${item.category}\n${item.color ? `Cor: ${item.color}\n` : ''}Link: ${item.link}\n\n---\n\n`;
            });
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            // Limpar o carrinho após enviar a mensagem
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            updateCartCount();
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
            filteredProducts = filteredProducts.filter(product => product.name.toLowerCase().includes(searchTerm));
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
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        const carouselContainer = carousel.querySelector('.carousel-container');
        const totalSlides = carouselContainer.children.length;
        let currentSlide = 0;

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
});
