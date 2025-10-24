import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut as firebaseSignOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// === KHỞI TẠO BIẾN TOÀN CỤC VÀ FIREBASE ===
// Biến toàn cục được cung cấp bởi môi trường Canvas
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let products = []; // Dữ liệu sẽ được tải từ Firestore
let cart = [];
let total = 0;
let editingDocId = null; // ID document của Firestore đang sửa
let userId = null; // ID người dùng hiện tại

// Xác định đường dẫn collection công khai
function getProductsCollectionRef() {
    // Lưu trữ công khai để dữ liệu sản phẩm có thể dùng chung giữa các người dùng
    return collection(db, 'artifacts', appId, 'public/data', 'products');
}

// === XỬ LÝ ĐĂNG NHẬP VÀ XÁC THỰC ===
async function initializeAuthAndFirestore() {
    // Nếu có custom token, sử dụng nó để đăng nhập
    if (__initial_auth_token) {
        try {
            await signInWithCustomToken(auth, __initial_auth_token);
        } catch (error) {
            console.error("Lỗi đăng nhập bằng custom token. Đăng nhập ẩn danh thay thế:", error);
            await signInAnonymously(auth);
        }
    } else {
        // Đăng nhập ẩn danh (cho môi trường thử nghiệm)
        await signInAnonymously(auth);
    }
}

// Hàm Đăng xuất
window.signOutUser = async function() {
    try {
        await firebaseSignOut(auth);
        // onAuthStateChanged sẽ tự động xử lý cập nhật UI
        console.log("Đăng xuất thành công!");
    } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
    }
}

// Lắng nghe trạng thái xác thực
onAuthStateChanged(auth, (user) => {
    const authStatusDiv = document.getElementById('auth-status');
    const addProductBtn = document.getElementById('add-product-btn');
    const footer = document.querySelector('footer');
    
    // Xóa User ID cũ (nếu có)
    const oldUserIdDisplay = footer.querySelector('#user-id-display');
    if (oldUserIdDisplay) oldUserIdDisplay.remove();

    if (user) {
        userId = user.uid;
        console.log("Người dùng đã đăng nhập. UID:", userId);
        
        // 1. Hiển thị trạng thái và nút Đăng xuất
        authStatusDiv.innerHTML = `
            Đăng nhập với ID: <span style="font-weight: bold; color: #38a169;">${userId}</span> 
            <button onclick="signOutUser()" style="background-color: #8c8c8c; padding: 3px 6px; font-size: 0.8em; border-radius: 4px;">Đăng xuất</button>
        `;
        addProductBtn.style.display = 'inline-block'; // Hiển thị nút Thêm SP
        
        // 2. Hiển thị User ID ở footer (Quan trọng cho ứng dụng đa người dùng)
        const p = document.createElement('p');
        p.id = 'user-id-display';
        p.textContent = `User ID (Chủ sở hữu dữ liệu công khai): ${userId}`;
        footer.appendChild(p);

        // Bắt đầu lắng nghe dữ liệu sau khi xác thực
        listenForProducts();
    } else {
        // Trạng thái Đăng xuất
        userId = null;
        authStatusDiv.innerHTML = `
            Bạn đang ở trạng thái Khách. 
            <button onclick="initializeAuthAndFirestore()" style="background-color: #4CAF50; padding: 3px 6px; font-size: 0.8em; border-radius: 4px;">Đăng nhập lại</button>
        `;
        addProductBtn.style.display = 'none'; // Ẩn nút Thêm SP
        products = []; // Xóa sản phẩm nếu không có người dùng
        renderProducts(); // Render lại danh sách trống
        console.log("Người dùng đã đăng xuất hoặc đang chờ.");
    }
});

initializeAuthAndFirestore();

// === CHỨC NĂNG LẮNG NGHE DỮ LIỆU TỪ FIRESTORE (REAL-TIME) ===
function listenForProducts() {
    // Chỉ lắng nghe nếu userId đã có (đã đăng nhập)
    if (!userId) return; 

    const productsQuery = query(getProductsCollectionRef());
    
    // onSnapshot sẽ lắng nghe mọi thay đổi trong collection products
    onSnapshot(productsQuery, (snapshot) => {
        products = [];
        snapshot.forEach((doc) => {
            products.push({ ...doc.data(), id: doc.id }); // Lưu ID document Firestore vào trường 'id'
        });
        // Cập nhật giao diện sau khi tải dữ liệu
        renderProducts();
    }, (error) => {
        console.error("Lỗi khi lắng nghe Firestore:", error);
    });
}

// === CHỨC NĂNG GIAO DIỆN VÀ HIỂN THỊ ===

function renderProducts(filter = 'all') {
    const list = document.getElementById('products-list');
    list.innerHTML = '';
    
    const filteredProducts = products.filter(p => filter === 'all' || p.category === filter);

    if (filteredProducts.length === 0) {
        list.innerHTML = '<p style="width: 100%; text-align: center; color: #777;">' + 
                         (userId ? 'Chưa có sản phẩm nào.' : 'Đăng nhập để xem và quản lý sản phẩm.') + 
                         '</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        
        // Kiểm tra xem người dùng có phải là chủ sở hữu để hiển thị nút Sửa/Xóa
        const isOwner = userId && product.ownerId === userId; 
        
        const actionButtons = isOwner ? `
            <button class="edit-btn" onclick="editProduct('${product.id}')">Sửa</button>
            <button class="delete-btn" onclick="deleteProduct('${product.id}')">Xóa</button>
        ` : `<span style="font-size: 0.8em; color: #777;">(Chỉ Chủ sở hữu mới có thể Sửa/Xóa)</span>`;
        
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto; border-radius: 5px;">
            <h3>${product.name}</h3>
            <p>Danh mục: ${product.category}</p>
            <p>Giá: ${product.price} VND</p>
            <button onclick="addToCart('${product.name}', ${product.price})">Thêm vào giỏ</button>
            <div style="margin-top: 10px;">${actionButtons}</div>
        `;
        list.appendChild(div);
    });
}

window.filterProducts = function() {
    const filter = document.getElementById('category-select').value;
    renderProducts(filter);
}

window.showForm = function() {
    if (!userId) {
        console.error("Vui lòng đăng nhập để thêm sản phẩm.");
        return;
    }
    document.getElementById('product-form').style.display = 'block';
    editingDocId = null; // Reset cho thêm mới
}

window.hideForm = function() {
    document.getElementById('product-form').style.display = 'none';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-category').value = 'Rau';
    document.getElementById('product-image').value = ''; // Xóa tệp đã chọn
}

// === CHỨC NĂNG BASE64 VÀ ASYNC/AWAIT ===

// Hàm này sử dụng Base64 để chuyển đổi tệp ảnh thành URL Data URL tạm thời
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// === CHỨC NĂNG THÊM/SỬA SẢN PHẨM (CRUD) ===

window.saveProduct = async function() {
    if (!userId) {
        console.error("Firestore chưa sẵn sàng. Vui lòng chờ đăng nhập.");
        return;
    }
    
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const imageInput = document.getElementById('product-image');
    
    let imageUrl = '';
    
    if (!name || isNaN(price)) {
        console.error('Vui lòng điền đầy đủ Tên và Giá hợp lệ!');
        return;
    }
    
    // 1. Xử lý ảnh: Base64 cho ảnh mới được chọn
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        try {
            imageUrl = await fileToBase64(file);
        } catch (error) {
            console.error("Lỗi khi đọc file:", error);
            return;
        }
    } else if (editingDocId) {
        // 2. Nếu đang sửa và không chọn file mới, giữ nguyên ảnh cũ
        const existingProduct = products.find(p => p.id === editingDocId);
        imageUrl = existingProduct ? existingProduct.image : '';
    } else {
        // 3. Nếu thêm mới và không chọn ảnh, dùng placeholder
        imageUrl = category === 'Rau' 
            ? 'https://placehold.co/200x150/4CAF50/white?text=Rau' 
            : 'https://placehold.co/200x150/FF6347/white?text=Qua';
    }

    const productData = {
        name,
        price,
        category,
        image: imageUrl,
        createdAt: new Date().toISOString(),
        ownerId: userId // Lưu ID người tạo sản phẩm
    };
    
    try {
        if (editingDocId) {
            // Cập nhật sản phẩm hiện có
            const docRef = doc(getProductsCollectionRef(), editingDocId);
            await updateDoc(docRef, productData);
            console.log("Cập nhật sản phẩm thành công!");
        } else {
            // Thêm sản phẩm mới
            await addDoc(getProductsCollectionRef(), productData);
            console.log("Thêm sản phẩm thành công!");
        }
    } catch (e) {
        console.error("Lỗi khi lưu dữ liệu lên Firestore: ", e);
    }
    
    hideForm();
}

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Kiểm tra quyền chỉnh sửa
    if (product.ownerId !== userId) {
        console.error("Bạn không có quyền chỉnh sửa sản phẩm này.");
        return;
    }
    
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = ''; // Không thể điền file cũ
    editingDocId = id; // Lưu ID document Firestore
    showForm();
}

window.deleteProduct = async function(id) {
    if (!userId) {
        console.error("Firestore chưa sẵn sàng.");
        return;
    }
    
    const product = products.find(p => p.id === id);
    if (!product || product.ownerId !== userId) {
        console.error("Bạn không có quyền xóa sản phẩm này.");
        return;
    }
    
    // Thay confirm() bằng modal UI, tạm thời dùng confirm()
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) { 
        try {
            await deleteDoc(doc(getProductsCollectionRef(), id));
            console.log("Xóa sản phẩm thành công!");
        } catch (e) {
            console.error("Lỗi khi xóa dữ liệu khỏi Firestore: ", e);
        }
    }
}

// === CHỨC NĂNG GIỎ HÀNG (GIỮ NGUYÊN BỘ NHỚ TẠM THỜI) ===

window.addToCart = function(name, price) {
    cart.push({ name, price });
    total += price;
    updateCart();
}

window.updateCart = function() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.price} VND`;
        cartItems.appendChild(li);
    });
    document.getElementById('total').textContent = total;
}
