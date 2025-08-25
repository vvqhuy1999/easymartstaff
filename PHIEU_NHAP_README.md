# 📋 Hệ thống Quản lý Phiếu Nhập Hàng

## 🎯 Tổng quan

Hệ thống quản lý phiếu nhập hàng được xây dựng để quản lý việc nhập hàng từ nhà cung cấp vào kho. Hệ thống bao gồm:

- **Phiếu nhập hàng**: Quản lý thông tin chung về đợt nhập hàng
- **Chi tiết phiếu nhập**: Quản lý danh sách sản phẩm trong từng phiếu nhập
- **Tích hợp API**: Kết nối với backend Spring Boot

## 🏗️ Cấu trúc dự án

```
src/components/Admin/
├── PhieuNhapHang.vue          # Component chính quản lý phiếu nhập
├── ChiTietPhieuNhap.vue       # Component quản lý chi tiết phiếu nhập
└── ...

src/components/
├── api.js                     # Các API functions
└── router/
    └── index.js              # Router configuration
```

## 🚀 Tính năng chính

### 1. Quản lý Phiếu Nhập Hàng
- ✅ Tạo phiếu nhập mới
- ✅ Xem danh sách phiếu nhập
- ✅ Cập nhật thông tin phiếu nhập
- ✅ Xóa phiếu nhập (soft delete)
- ✅ Tìm kiếm và lọc theo trạng thái, ngày
- ✅ Thống kê theo trạng thái

### 2. Quản lý Chi Tiết Phiếu Nhập
- ✅ Thêm sản phẩm vào phiếu nhập
- ✅ Cập nhật số lượng, đơn giá
- ✅ Xóa sản phẩm khỏi phiếu nhập
- ✅ Tính tổng tiền tự động

### 3. Giao diện người dùng
- ✅ Responsive design
- ✅ Modal forms cho thêm/sửa
- ✅ Loading states
- ✅ Error handling
- ✅ Success notifications

## 🔌 API Endpoints

### Phiếu Nhập Hàng
```
GET    /api/phieunhaphang          # Lấy tất cả phiếu nhập
GET    /api/phieunhaphang/{id}     # Lấy phiếu nhập theo ID
POST   /api/phieunhaphang          # Tạo phiếu nhập mới
PUT    /api/phieunhaphang/{id}     # Cập nhật phiếu nhập
DELETE /api/phieunhaphang/{id}     # Xóa phiếu nhập
```

### Chi Tiết Phiếu Nhập
```
GET    /api/chitietphieunhap          # Lấy tất cả chi tiết
GET    /api/chitietphieunhap/{id}     # Lấy chi tiết theo ID
POST   /api/chitietphieunhap          # Tạo chi tiết mới
PUT    /api/chitietphieunhap/{id}     # Cập nhật chi tiết
DELETE /api/chitietphieunhap/{id}     # Xóa chi tiết
```

### Các API khác
```
GET    /api/nhacungcap              # Lấy danh sách nhà cung cấp
GET    /api/nhanvien                # Lấy danh sách nhân viên
GET    /api/sanpham                 # Lấy danh sách sản phẩm
```

## 🛠️ Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

### 3. Truy cập ứng dụng
```
http://localhost:5173/phieu-nhap-hang
```

## 📱 Cách sử dụng

### 1. Tạo phiếu nhập mới
1. Click nút "Tạo Phiếu Nhập Mới"
2. Chọn nhà cung cấp và nhân viên
3. Nhập ngày tạo và trạng thái
4. Thêm ghi chú (nếu cần)
5. Click "Tạo mới"

### 2. Thêm sản phẩm vào phiếu nhập
1. Click "Xem chi tiết" trên phiếu nhập
2. Click "Thêm Sản phẩm"
3. Chọn sản phẩm từ danh sách
4. Nhập số lượng và đơn giá
5. Click "Thêm mới"

### 3. Quản lý phiếu nhập
- **Sửa**: Click nút edit (✏️) trên phiếu nhập
- **Xóa**: Click nút delete (🗑️) trên phiếu nhập
- **Tìm kiếm**: Sử dụng ô tìm kiếm và bộ lọc

## 🧪 Testing

### 1. Test API trực tiếp
Mở file `test-import-api.html` trong trình duyệt để test các API endpoints.

### 2. Test giao diện
1. Chạy ứng dụng Vue.js
2. Truy cập trang phiếu nhập hàng
3. Test các chức năng CRUD

## 🔧 Cấu hình

### 1. API Base URL
Trong file `src/components/api.js`, thay đổi:
```javascript
const API_BASE_URL = 'http://localhost:8080/api'
```

### 2. CORS
Đảm bảo backend Spring Boot có cấu hình CORS:
```java
@CrossOrigin(origins = "*")
```

## 📊 Cấu trúc dữ liệu

### Phiếu Nhập Hàng
```json
{
  "maPN": 1,
  "ngayTao": "2024-01-15",
  "maNCC": 1,
  "maNV": 1,
  "trangThai": "CHUA_NHAP",
  "ghiChu": "Nhập hàng tháng 1",
  "tongTien": 5000000,
  "isDeleted": false
}
```

### Chi Tiết Phiếu Nhập
```json
{
  "maCTPN": 1,
  "phieuNhapHang": { "maPN": 1 },
  "sanPham": { "maSP": 1 },
  "soLuong": 100,
  "donGia": 50000,
  "isDeleted": false
}
```

## 🚨 Xử lý lỗi

### 1. Lỗi kết nối API
- Kiểm tra backend có đang chạy không
- Kiểm tra URL API có đúng không
- Kiểm tra CORS configuration

### 2. Lỗi dữ liệu
- Kiểm tra format dữ liệu gửi lên
- Kiểm tra validation rules
- Kiểm tra database constraints

## 🔄 Cập nhật và bảo trì

### 1. Thêm tính năng mới
1. Tạo component mới trong `src/components/Admin/`
2. Thêm route trong `src/components/router/index.js`
3. Thêm menu item trong `src/components/Admin/AdminHome.vue`

### 2. Sửa lỗi
1. Kiểm tra console logs
2. Kiểm tra network requests
3. Kiểm tra API responses

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ:
1. Kiểm tra logs trong console
2. Kiểm tra network tab trong DevTools
3. Kiểm tra API responses
4. Liên hệ team development

## 📝 Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Tạo component PhieuNhapHang.vue
- ✅ Tạo component ChiTietPhieuNhap.vue
- ✅ Tích hợp API backend
- ✅ Thêm routing và navigation
- ✅ Tạo file test API
- ✅ Viết documentation

---

**Lưu ý**: Đảm bảo backend Spring Boot đang chạy trước khi test frontend.
