let products = [
    { id: 1, name: 'Cà rốt', price: 20000, category: 'Rau', image: 'images/carot.jpg' },
    { id: 2, name: 'Táo', price: 30000, category: 'Quả', image: 'images/apple.jpg' },
    { id: 3, name: 'Dưa chuột', price: 10000, category: 'Rau', image: 'images/cucumber.jpg' },
    { id: 4, name: 'Bí đao', price: 15000, category: 'Rau', image: 'images/bitter-melon.jpg' },
    { id: 5, name: 'Thanh long', price: 18000, category: 'Quả', image: 'images/dragon-fruit.jpg' },
    { id: 6, name: 'Chuối', price: 17000, category: 'Quả', image: 'images/banana.jpg' }
];

let cart = [];
let total = 0;
let editingId = null; // ID sản phẩm đang sửa

const categories = ['Rau', 'Quả'];

function renderProducts(filter = 'all') {
    const list = document.getElementById('products-list');
    list.innerHTML = '';
    products
        .filter(p => filter === 'all' || p.category === filter)
        .forEach(product => {
            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Danh mục: ${product.category}</p>
                <p>Giá: ${product.price} VND</p>
                <button onclick="addToCart('${product.name}', ${product.price})">Thêm vào giỏ</button>
                <button class="edit-btn" onclick="editProduct(${product.id})">Sửa</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Xóa</button>
            `;
            list.appendChild(div);
        });
}

function filterProducts() {
    const filter = document.getElementById('category-select').value;
    renderProducts(filter);
}

function showForm() {
    document.getElementById('product-form').style.display = 'block';
    // ❌ Bỏ dòng "editingId = null;" để giữ trạng thái sửa
}

function hideForm() {
    document.getElementById('product-form').style.display = 'none';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').value = 'Rau';
    document.getElementById('product-image').value = '';
}

function saveProduct() {
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const image = document.getElementById('product-image').value;
    
    if (!name || !price || !image) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    if (editingId) {
        // Sửa sản phẩm
        const product = products.find(p => p.id === editingId);
        product.name = name;
        product.price = price;
        product.category = category;
        product.image = image;
        alert('Đã cập nhật sản phẩm thành công!');
    } else {
        // Thêm sản phẩm mới
        const newId = products.length ? products[products.length - 1].id + 1 : 1;
        products.push({ id: newId, name, price, category, image });
        alert('Đã thêm sản phẩm mới!');
    }
    
    renderProducts();
    hideForm();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = product.image;
    editingId = id;
    showForm();
}

function deleteProduct(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        products = products.filter(p => p.id !== id);
        renderProducts();
    }
}

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.price} VND`;
        cartItems.appendChild(li);
    });
    document.getElementById('total').textContent = total;
}

// Gợi ý: Nút "Thêm sản phẩm" trong HTML nên gọi như sau:
// <button onclick="editingId = null; showForm();">Thêm sản phẩm</button>

// Khởi tạo
renderProducts();
