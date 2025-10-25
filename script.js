// =======================
// DỮ LIỆU BAN ĐẦU
// =======================
let products = [
    { id: 1, name: 'Cà rốt', price: 20000, category: 'Rau', image: 'images/carot.jpg' },
    { id: 2, name: 'Táo', price: 30000, category: 'Quả', image: 'images/apple.jpg' },
    { id: 3, name: 'Chuối', price: 17000, category: 'Quả', image: 'images/banana.jpg' },
    { id: 4, name: 'Bí đao', price: 15000, category: 'Rau', image: 'images/bitter-melon.jpg' },
    { id: 5, name: 'Thanh long', price: 18000, category: 'Quả', image: 'images/dragon-fruit.jpg' },
    { id: 6, name: 'Chuối', price: 17000, category: 'Quả', image: 'images/banana.jpg' }
];

let editingId = null; // Lưu ID sản phẩm đang được sửa


// =======================
// HIỂN THỊ DANH SÁCH SẢN PHẨM
// =======================
function renderProducts() {
    const list = document.getElementById('products-list');
    list.innerHTML = ''; // Xóa nội dung cũ

    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Danh mục: ${product.category}</p>
            <p>Giá: ${product.price.toLocaleString()} VND</p>
            <div class="product-actions">
                <button onclick="editProduct(${product.id})">Sửa</button>
                <button onclick="deleteProduct(${product.id})">Xóa</button>
            </div>
        `;
        list.appendChild(div);
    });
}


// =======================
// HIỂN THỊ / ẨN FORM
// =======================
function showForm() {
    document.getElementById('product-form').style.display = 'block';
}

function hideForm() {
    document.getElementById('product-form').style.display = 'none';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').value = 'Rau';
    document.getElementById('product-image').value = '';
    editingId = null; // Reset lại trạng thái
}


// =======================
// LƯU SẢN PHẨM (THÊM HOẶC SỬA)
// =======================
function saveProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseInt(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const image = document.getElementById('product-image').value.trim();

    // Kiểm tra dữ liệu
    if (!name || !price || !image) {
        alert('Vui lòng nhập đầy đủ thông tin sản phẩm!');
        return;
    }

    if (editingId) {
        // --- Sửa sản phẩm ---
        const product = products.find(p => p.id === editingId);
        if (product) {
            product.name = name;
            product.price = price;
            product.category = category;
            product.image = image;
            alert('Cập nhật sản phẩm thành công!');
        }
    } else {
        // --- Thêm sản phẩm mới ---
        const newId = products.length ? products[products.length - 1].id + 1 : 1;
        products.push({ id: newId, name, price, category, image });
        alert('Đã thêm sản phẩm mới!');
    }

    hideForm();
    renderProducts();
}


// =======================
// CHỌN SẢN PHẨM ĐỂ SỬA
// =======================
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = product.image;

    editingId = id; // Ghi nhớ sản phẩm đang sửa
    showForm();
}


// =======================
// XÓA SẢN PHẨM
// =======================
function deleteProduct(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
        products = products.filter(p => p.id !== id);
        renderProducts();
    }
}


// =======================
// KHỞI TẠO TRANG
// =======================
window.onload = function() {
    renderProducts();
};
