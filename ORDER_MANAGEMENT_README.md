# 📋 Hệ thống Quản lý Đơn hàng - Tích hợp API Backend

## 🎯 Tổng quan

Hệ thống quản lý đơn hàng đã được tích hợp hoàn toàn với các API backend để hiển thị dữ liệu thực từ cơ sở dữ liệu thay vì dữ liệu mẫu.

## 🚀 Tính năng chính

### ✅ Hiển thị dữ liệu thực
- **Đơn hàng**: Lấy từ API `HoaDonRestController`
- **Chi tiết đơn hàng**: Lấy từ API `ChiTietHoaDonRestController`
- **Khách hàng**: Lấy từ API `KhachHangRestController`
- **Sản phẩm**: Lấy từ API `SanPhamRestController`
- **Giá sản phẩm**: Lấy từ API `GiaSanPhamRestController`
- **Người dùng**: Lấy từ API `NguoiDungRestController`

### ✅ Chức năng quản lý
- Xem danh sách đơn hàng với thông tin đầy đủ
- Cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao, Đã hủy)
- Xem chi tiết đơn hàng (thông tin khách hàng, sản phẩm, giá cả)
- Xóa đơn hàng (soft delete)
- Tìm kiếm và lọc đơn hàng
- Sắp xếp theo ngày, giá, trạng thái
- Xuất dữ liệu Excel

### ✅ Giao diện người dùng
- Dashboard thống kê (số lượng đơn hàng theo trạng thái, tổng doanh thu)
- Bảng hiển thị đơn hàng với thông tin tổng hợp
- Modal xem chi tiết đơn hàng
- Responsive design cho mobile và desktop

## 🔧 Cài đặt và Sử dụng

### 1. Khởi động Backend
```bash
# Đảm bảo backend đang chạy trên localhost:8080
cd mini_Supermarket
mvn spring-boot:run
```

### 2. Khởi động Frontend
```bash
cd NhanVien
npm install
npm run dev
```

### 3. Truy cập hệ thống
- Mở trình duyệt và truy cập: `http://localhost:5173`
- Điều hướng đến trang "Quản lý đơn hàng"

## 📊 Cấu trúc dữ liệu

### Đơn hàng (Order)
```javascript
{
  id: "HD001",                    // Mã đơn hàng
  customer: "Nguyễn Văn An",     // Tên khách hàng
  phone: "0901234567",           // Số điện thoại
  address: "123 Đường ABC...",   // Địa chỉ
  date: "2024-01-15T10:30:00",  // Ngày đặt hàng
  total: 850000,                 // Tổng tiền
  subtotal: 800000,              // Tạm tính
  shipping: 50000,               // Phí giao hàng
  status: "completed",           // Trạng thái
  products: [...],                // Danh sách sản phẩm
  originalOrder: {...},           // Dữ liệu gốc từ backend
  customerData: {...}             // Thông tin khách hàng đầy đủ
}
```

### Sản phẩm trong đơn hàng
```javascript
{
  id: 1,                         // ID chi tiết đơn hàng
  name: "Áo sơ mi nam",          // Tên sản phẩm
  variant: "Màu trắng, Size M",  // Biến thể
  quantity: 2,                   // Số lượng
  price: 250000,                 // Đơn giá
  totalPrice: 500000             // Thành tiền
}
```

## 🔌 API Endpoints được sử dụng

### 1. HoaDon (Đơn hàng)
- `GET /api/hoadon` - Lấy tất cả đơn hàng
- `GET /api/hoadon/{id}` - Lấy đơn hàng theo ID
- `PUT /api/hoadon/{id}` - Cập nhật đơn hàng
- `DELETE /api/hoadon/{id}` - Xóa đơn hàng

### 2. ChiTietHoaDon (Chi tiết đơn hàng)
- `GET /api/chitiethoadon` - Lấy tất cả chi tiết đơn hàng

### 3. KhachHang (Khách hàng)
- `GET /api/khachhang` - Lấy tất cả khách hàng
- `GET /api/khachhang/{id}` - Lấy khách hàng theo ID

### 4. SanPham (Sản phẩm)
- `GET /api/sanpham` - Lấy tất cả sản phẩm
- `GET /api/sanpham/optimized` - Lấy sản phẩm tối ưu
- `GET /api/sanpham/{id}` - Lấy sản phẩm theo ID

### 5. GiaSanPham (Giá sản phẩm)
- `GET /api/giasanpham` - Lấy tất cả giá sản phẩm

### 6. NguoiDung (Người dùng)
- `GET /api/nguoidung` - Lấy tất cả người dùng
- `GET /api/nguoidung/{id}` - Lấy người dùng theo ID

## 🛠️ Các hàm API chính

### `getCompleteOrderData()`
Hàm tổng hợp để lấy dữ liệu đơn hàng hoàn chỉnh:
- Lấy tất cả đơn hàng
- Lấy chi tiết đơn hàng
- Lấy thông tin khách hàng
- Lấy thông tin sản phẩm
- Lấy giá sản phẩm
- Tính toán tổng tiền và phí giao hàng
- Map trạng thái từ backend sang frontend

### `updateOrderStatus(orderId, newStatus)`
Cập nhật trạng thái đơn hàng:
- Map trạng thái frontend sang backend
- Gọi API cập nhật
- Cập nhật state local
- Hiển thị thông báo thành công/lỗi

### `deleteOrder(orderId)`
Xóa đơn hàng:
- Gọi API xóa (soft delete)
- Cập nhật danh sách local
- Hiển thị thông báo xác nhận

## 🎨 Giao diện người dùng

### Dashboard thống kê
- **Đang xử lý**: Số đơn hàng có trạng thái "pending"
- **Đang giao**: Số đơn hàng có trạng thái "processing"
- **Đã giao**: Số đơn hàng có trạng thái "completed"
- **Tổng doanh thu**: Tổng tiền từ các đơn hàng đã giao

### Bảng đơn hàng
- ID đơn hàng
- Thông tin khách hàng (tên, số điện thoại)
- Tóm tắt sản phẩm (số lượng, tên sản phẩm chính)
- Ngày đặt hàng
- Tổng tiền
- Trạng thái (có thể thay đổi)
- Các thao tác (xem chi tiết, in, xóa)

### Modal chi tiết đơn hàng
- Thông tin khách hàng đầy đủ
- Danh sách sản phẩm với số lượng và giá
- Tính toán chi tiết (tạm tính, phí giao hàng, tổng cộng)

## 🔍 Tìm kiếm và Lọc

### Tìm kiếm
- Theo ID đơn hàng
- Theo tên khách hàng
- Theo số điện thoại

### Lọc
- Theo trạng thái đơn hàng
- Theo ngày đặt hàng
- Theo tổng tiền

### Sắp xếp
- Ngày mới nhất/cũ nhất
- Giá cao nhất/thấp nhất

## 📱 Responsive Design

- **Desktop**: Hiển thị đầy đủ thông tin, bảng rộng
- **Tablet**: Bảng có thể scroll ngang
- **Mobile**: Bảng dọc, các cột xếp chồng

## 🧪 Kiểm tra API

Sử dụng file `test-order-api.html` để kiểm tra:
- Kết nối API
- Chức năng của từng endpoint
- Dữ liệu trả về
- Xử lý lỗi

## ⚠️ Lưu ý quan trọng

### 1. Backend phải đang chạy
- Đảm bảo Spring Boot application đang chạy trên port 8080
- Kiểm tra CORS configuration nếu cần

### 2. Cấu trúc dữ liệu
- Backend phải trả về dữ liệu đúng format
- Các trường bắt buộc: `maHD`, `khachHang`, `sanPham`, `ngayTao`
- Trạng thái đơn hàng phải được map đúng

### 3. Xử lý lỗi
- Hiển thị loading state khi đang tải dữ liệu
- Hiển thị error state khi có lỗi
- Có nút "Thử lại" để reload dữ liệu

### 4. Performance
- Sử dụng `Promise.all()` để gọi song song các API
- Cache dữ liệu trong component state
- Chỉ reload khi cần thiết

## 🚀 Phát triển tiếp theo

### Tính năng có thể thêm:
- Phân trang cho danh sách đơn hàng
- Export PDF thay vì chỉ Excel
- Thông báo real-time khi có đơn hàng mới
- Dashboard với biểu đồ thống kê
- Quản lý vận chuyển và tracking
- Tích hợp thanh toán online

### Tối ưu hóa:
- Lazy loading cho danh sách sản phẩm
- Virtual scrolling cho bảng lớn
- Debounce cho tìm kiếm
- Offline support với Service Worker

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console browser để xem lỗi
2. Kiểm tra Network tab để xem API calls
3. Sử dụng file test để kiểm tra từng API
4. Đảm bảo backend đang chạy và có dữ liệu

---

**Hệ thống đã sẵn sàng sử dụng với dữ liệu thực từ backend! 🎉**
