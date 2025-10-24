let products = [
    { id: 1, name: 'Cà rốt', price: 20000, category: 'Rau', image: 'https://placehold.co/200x150/4CAF50/white?text=Cà+Rốt' },
    { id: 2, name: 'Táo', price: 30000, category: 'Quả', image: 'https://placehold.co/200x150/FF6347/white?text=Táo+Mỹ' },
    { id: 3, name: 'Dưa chuột', price: 10000, category: 'Rau', image: 'https://placehold.co/200x150/4CAF50/white?text=Dưa+Chuột' },
    { id: 4, name: 'Bí đao', price: 15000, category: 'Rau', image: 'https://placehold.co/200x150/4CAF50/white?text=Bí+Đao' },
    { id: 5, name: 'Thanh long', price: 18000, category: 'Quả', image: 'https://placehold.co/200x150/FF6347/white?text=Thanh+Long' },
    { id: 6, name: 'Chuối', price: 17000, category: 'Quả', image: 'https://placehold.co/200x150/FF6347/white?text=Chuối' }
];
let cart = [];
let total = 0;
let editingId = null; // ID sản phẩm đang sửa

const categories = ['Rau', 'Quả'];

function renderProducts(filter = 'all') {
    const list = document.getElementById('products-list');
    list.innerHTML = '';
    products.filter(p => filter === 'all' || p.category === filter).forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto; border-radius: 5px;">
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
    editingId = null; // Reset cho thêm mới
}

function hideForm() {
    document.getElementById('product-form').style.display = 'none';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').value = 'Rau';
    document.getElementById('product-image').value = ''; // Xóa tệp đã chọn
}

// Hàm này sử dụng Base64 để chuyển đổi tệp ảnh thành URL Data URL tạm thời
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function saveProduct() {
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const imageInput = document.getElementById('product-image');
    
    let imageUrl = '';
    
    // Xử lý tệp được chọn
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        try {
            // Chuyển đổi tệp thành Base64 URL (ảnh sẽ được lưu trong bộ nhớ tạm của trình duyệt)
            imageUrl = await fileToBase64(file);
        } catch (error) {
            console.error("Lỗi khi đọc file:", error);
            return;
        }
    } else if (editingId) {
        // Nếu đang sửa và không chọn file mới, giữ nguyên ảnh cũ
        imageUrl = products.find(p => p.id === editingId).image;
    } else {
        // Nếu thêm mới và không chọn ảnh, dùng placeholder
        imageUrl = category === 'Rau' 
            ? 'https://placehold.co/200x150/4CAF50/white?text=Rau' 
            : 'https://placehold.co/200x150/FF6347/white?text=Quả';
    }
    
    if (!name || !price) {
        console.error('Vui lòng điền đầy đủ Tên và Giá!');
        return;
    }
    
    if (editingId) {
        // Sửa sản phẩm
        const product = products.find(p => p.id === editingId);
        product.name = name;
        product.price = price;
        product.category = category;
        product.image = imageUrl;
    } else {
        // Thêm sản phẩm mới
        const newId = products.length ? products[products.length - 1].id + 1 : 1;
        products.push({ id: newId, name, price, category, image: imageUrl });
    }
    
    renderProducts();
    hideForm();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    // Không thể điền giá trị vào input type="file" vì lý do bảo mật.
    // Người dùng phải chọn lại file nếu muốn thay đổi ảnh.
    document.getElementById('product-image').value = '';
    editingId = id;
    showForm();
}

function deleteProduct(id) {
    // Thay confirm() bằng modal UI
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

// Khởi tạo
renderProducts();
