# 📚 HƯỚNG DẪN CALL API ĐƠN GIẢN

## 🎯 **Mục đích**
Tài liệu này giúp bạn call API một cách dễ dàng mà không cần hiểu sâu về cấu hình phức tạp.

---

## 📋 **Thông tin cần cung cấp để call API**

### 1. **URL cơ bản**
```
http://localhost:8080/api
```

### 2. **Các endpoint có sẵn**
- `/sanpham` - Quản lý sản phẩm
- `/hinhanh` - Quản lý hình ảnh  
- `/nguoidung` - Quản lý người dùng
- `/loaisanpham` - Quản lý loại sản phẩm
- `/donhang` - Quản lý đơn hàng

### 3. **Các method HTTP**
- `GET` - Lấy dữ liệu
- `POST` - Tạo mới
- `PUT` - Cập nhật
- `DELETE` - Xóa

---

## 🚀 **Ví dụ cụ thể**

### **Ví dụ 1: Lấy danh sách sản phẩm**
```javascript
// Bạn cần cung cấp:
const API_URL = "http://localhost:8080/api/sanpham"
const PARAMS = {
  page: 1,        // Trang hiện tại
  limit: 20,      // Số sản phẩm mỗi trang
  search: "",     // Từ khóa tìm kiếm
  sortBy: "tenSP", // Sắp xếp theo trường nào
  sortOrder: "asc" // Thứ tự sắp xếp
}
```

### **Ví dụ 2: Tạo sản phẩm mới**
```javascript
// Bạn cần cung cấp:
const API_URL = "http://localhost:8080/api/sanpham"
const PRODUCT_DATA = {
  maSP: "SP999",           // Mã sản phẩm
  tenSP: "Tên sản phẩm",   // Tên sản phẩm
  giaBan: 100000,          // Giá bán
  moTa: "Mô tả",           // Mô tả
  loaiSP: "Loại A",        // Loại sản phẩm
  trangThai: true          // Trạng thái
}
```

### **Ví dụ 3: Cập nhật sản phẩm**
```javascript
// Bạn cần cung cấp:
const PRODUCT_ID = "SP001"
const API_URL = `http://localhost:8080/api/sanpham/${PRODUCT_ID}`
const UPDATE_DATA = {
  tenSP: "Tên mới",        // Chỉ cập nhật tên
  giaBan: 150000           // Chỉ cập nhật giá
}
```

---

## 📝 **Template đơn giản để copy-paste**

### **Template cơ bản**
```javascript
// Copy đoạn code này và thay đổi thông tin
async function callAPI(method, endpoint, data = null, params = null) {
  const baseURL = "http://localhost:8080/api"
  let url = `${baseURL}${endpoint}`
  
  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  if (data) {
    config.body = JSON.stringify(data)
  }
  
  if (params) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }
  
  try {
    const response = await fetch(url, config)
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
```

### **Cách sử dụng template**
```javascript
// 1. Lấy danh sách sản phẩm
const products = await callAPI('GET', '/sanpham', null, {
  page: 1, 
  limit: 10
})

// 2. Tạo sản phẩm mới
const newProduct = await callAPI('POST', '/sanpham', {
  maSP: "SP999",
  tenSP: "Sản phẩm mới",
  giaBan: 100000
})

// 3. Cập nhật sản phẩm
const updatedProduct = await callAPI('PUT', '/sanpham/SP001', {
  tenSP: "Tên mới"
})

// 4. Xóa sản phẩm
await callAPI('DELETE', '/sanpham/SP001')
```

---

## 📊 **Bảng thông tin cần cung cấp**

| Loại API | Method | Endpoint | Data cần cung cấp | Ví dụ |
|-----------|--------|----------|-------------------|--------|
| **Lấy danh sách** | GET | `/sanpham` | Query params | `{page: 1, limit: 20}` |
| **Lấy chi tiết** | GET | `/sanpham/{id}` | ID sản phẩm | `id = "SP001"` |
| **Tạo mới** | POST | `/sanpham` | Thông tin sản phẩm | `{tenSP: "...", giaBan: 100000}` |
| **Cập nhật** | PUT | `/sanpham/{id}` | ID + thông tin mới | `id + {tenSP: "Tên mới"}` |
| **Xóa** | DELETE | `/sanpham/{id}` | ID sản phẩm | `id = "SP001"` |

---

## 🔧 **Các trường dữ liệu phổ biến**

### **Sản phẩm (Product)**
```javascript
{
  maSP: "SP001",           // Mã sản phẩm (bắt buộc)
  tenSP: "Tên sản phẩm",   // Tên sản phẩm (bắt buộc)
  giaBan: 100000,          // Giá bán (bắt buộc)
  moTa: "Mô tả",           // Mô tả (không bắt buộc)
  loaiSP: "Loại A",        // Loại sản phẩm (bắt buộc)
  trangThai: true,          // Trạng thái (bắt buộc)
  soLuong: 100             // Số lượng (không bắt buộc)
}
```

### **Hình ảnh (Image)**
```javascript
{
  maHinh: "H001",          // Mã hình ảnh (bắt buộc)
  url: "path/to/image.jpg", // Đường dẫn hình ảnh (bắt buộc)
  moTa: "Mô tả hình ảnh",  // Mô tả (không bắt buộc)
  laChinh: false,           // Có phải hình chính không (bắt buộc)
  thuTuHienThi: 1,         // Thứ tự hiển thị (không bắt buộc)
  sanPham: { maSP: "SP001" } // Tham chiếu sản phẩm (bắt buộc)
}
```

---

## ⚠️ **Lưu ý quan trọng**

1. **URL phải đúng**: Kiểm tra `http://localhost:8080/api` có đúng không
2. **Endpoint phải tồn tại**: Kiểm tra `/sanpham`, `/hinhanh` có đúng không
3. **Method phải đúng**: GET để lấy, POST để tạo, PUT để sửa, DELETE để xóa
4. **Data phải đúng format**: JSON với các trường bắt buộc
5. **ID phải tồn tại**: Khi sửa/xóa, ID phải có trong database

---

## 🆘 **Khi gặp lỗi**

### **Lỗi thường gặp:**
- **404**: Endpoint không tồn tại → Kiểm tra URL
- **400**: Dữ liệu sai format → Kiểm tra JSON
- **500**: Lỗi server → Liên hệ backend developer

### **Cách debug:**
```javascript
// Thêm console.log để kiểm tra
console.log('URL:', url)
console.log('Data:', data)
console.log('Response:', response)
```

---

## 📱 **Ví dụ hoàn chỉnh trong Vue component**

```vue
<template>
  <div>
    <button @click="getProducts">Lấy danh sách</button>
    <button @click="createProduct">Tạo mới</button>
    <div v-for="product in products" :key="product.maSP">
      {{ product.tenSP }} - {{ product.giaBan }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const products = ref([])

// Lấy danh sách sản phẩm
const getProducts = async () => {
  try {
    const data = await callAPI('GET', '/sanpham', null, {
      page: 1,
      limit: 20
    })
    products.value = data
    console.log('Sản phẩm:', data)
  } catch (error) {
    console.error('Lỗi:', error)
  }
}

// Tạo sản phẩm mới
const createProduct = async () => {
  try {
    const newProduct = await callAPI('POST', '/sanpham', {
      maSP: "SP999",
      tenSP: "Sản phẩm mới",
      giaBan: 100000,
      loaiSP: "Loại A",
      trangThai: true
    })
    console.log('Đã tạo:', newProduct)
    getProducts() // Lấy lại danh sách
  } catch (error) {
    console.error('Lỗi:', error)
  }
}

// Copy template function này
async function callAPI(method, endpoint, data = null, params = null) {
  const baseURL = "http://localhost:8080/api"
  let url = `${baseURL}${endpoint}`
  
  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  if (data) {
    config.body = JSON.stringify(data)
  }
  
  if (params) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }
  
  try {
    const response = await fetch(url, config)
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
</script>
```

---

## 🎉 **Tóm tắt**

**Để call API, bạn chỉ cần:**

1. **Copy template function** `callAPI` ở trên
2. **Thay đổi thông tin** theo bảng dưới:

| Action | Method | Endpoint | Data/Params |
|--------|--------|----------|-------------|
| Lấy danh sách | GET | `/sanpham` | `{page: 1, limit: 20}` |
| Tạo mới | POST | `/sanpham` | `{maSP: "SP001", tenSP: "..."}` |
| Sửa | PUT | `/sanpham/SP001` | `{tenSP: "Tên mới"}` |
| Xóa | DELETE | `/sanpham/SP001` | Không cần data |

**Đơn giản vậy thôi! 🚀**
