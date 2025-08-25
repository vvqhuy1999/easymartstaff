# Component Chi Tiết Phiếu Xuất (ChiTietPhieuXuat.vue)

## Tổng quan

Component `ChiTietPhieuXuat.vue` được tạo để quản lý chi tiết phiếu xuất hàng trong hệ thống quản lý siêu thị. Component này cho phép người dùng xem, thêm, sửa và xóa các sản phẩm trong phiếu xuất.

## Chức năng chính

### 1. Hiển thị danh sách chi tiết phiếu xuất
- Bảng hiển thị thông tin sản phẩm xuất
- Các cột: Sản phẩm, Số lượng xuất, Đơn giá xuất, Thành tiền, Ghi chú
- Tổng kết số lượng sản phẩm và tổng tiền

### 2. Thêm sản phẩm mới
- Modal form để nhập thông tin sản phẩm
- Validation dữ liệu đầu vào
- Tự động tính thành tiền

### 3. Chỉnh sửa sản phẩm
- Modal form để sửa thông tin sản phẩm
- Cập nhật dữ liệu real-time

### 4. Xóa sản phẩm
- Xác nhận trước khi xóa
- Cập nhật danh sách sau khi xóa

## Cấu trúc file

```
NhanVien/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── ChiTietPhieuXuat.vue          # Component chính
│   │   │   └── PhieuXuatHang.vue             # Component cha
│   │   └── api.js                            # API functions
├── test-chi-tiet-phieu-xuat.html             # File test demo
└── CHI_TIET_PHIEU_XUAT_README.md            # File này
```

## Cách sử dụng

### 1. Import component

```vue
<script>
import ChiTietPhieuXuat from './ChiTietPhieuXuat.vue'

export default {
  components: {
    ChiTietPhieuXuat
  }
}
</script>
```

### 2. Sử dụng trong template

```vue
<template>
  <div>
    <chi-tiet-phieu-xuat :phieu-xuat-id="1"></chi-tiet-phieu-xuat>
  </div>
</template>
```

### 3. Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `phieuXuatId` | Number/String | Yes | ID của phiếu xuất cần hiển thị chi tiết |

## API Endpoints

Component sử dụng các API endpoints sau:

### Chi tiết phiếu xuất
- `GET /api/chitietphieuxuatkho` - Lấy tất cả chi tiết phiếu xuất
- `GET /api/chitietphieuxuatkho/{id}` - Lấy chi tiết theo ID
- `GET /api/chitietphieuxuatkho/phieuxuatkho/{maPXK}` - Lấy chi tiết theo phiếu xuất
- `POST /api/chitietphieuxuatkho` - Tạo chi tiết mới
- `PUT /api/chitietphieuxuatkho/{id}` - Cập nhật chi tiết
- `DELETE /api/chitietphieuxuatkho/{id}` - Xóa chi tiết

### Cấu trúc dữ liệu

```javascript
// Chi tiết phiếu xuất
{
  maCTPXK: 1,                    // ID chi tiết
  soLuongXuat: 10,              // Số lượng xuất
  donGiaXuat: 50000,            // Đơn giá xuất
  thanhTien: 500000,            // Thành tiền
  ghiChu: 'Ghi chú',            // Ghi chú
  sanPham: {                     // Thông tin sản phẩm
    maSP: 1,
    tenSP: 'Tên sản phẩm',
    giaHienTai: 50000
  },
  phieuXuatKho: {                // Thông tin phiếu xuất
    maPXK: 1
  }
}
```

## Styling

Component sử dụng CSS với các đặc điểm:

- **Responsive design**: Tương thích với mobile và desktop
- **Modern UI**: Sử dụng shadow, border-radius, và transitions
- **Color scheme**: 
  - Primary: #27ae60 (green)
  - Secondary: #3498db (blue)
  - Danger: #e74c3c (red)
  - Neutral: #95a5a6 (gray)

## Xử lý lỗi

Component có xử lý lỗi cho:
- API calls thất bại
- Validation dữ liệu
- Network errors
- Loading states

## Testing

Để test component:

1. Mở file `test-chi-tiet-phieu-xuat.html` trong trình duyệt
2. Component sẽ load với mock data
3. Test các chức năng: thêm, sửa, xóa
4. Kiểm tra responsive design

## Tích hợp với backend

### 1. Khởi động backend
```bash
cd mini_Supermarket
mvn spring-boot:run
```

### 2. Kiểm tra API
```bash
curl http://localhost:8080/api/chitietphieuxuatkho
```

### 3. Cập nhật API_BASE_URL trong `api.js`
```javascript
const API_BASE_URL = 'http://localhost:8080/api'
```

## Troubleshooting

### Lỗi 404 khi gọi API
- Kiểm tra backend có đang chạy không
- Kiểm tra endpoint có đúng không
- Kiểm tra SecurityConfig có cho phép endpoint không

### Component không hiển thị
- Kiểm tra import component
- Kiểm tra props được truyền đúng
- Kiểm tra console errors

### Dữ liệu không load
- Kiểm tra network tab trong DevTools
- Kiểm tra API response
- Kiểm tra error handling

## Tương lai

Các tính năng có thể thêm:
- Pagination cho danh sách lớn
- Search và filter
- Export data (Excel, PDF)
- Batch operations
- Real-time updates
- Advanced validation rules

## Liên hệ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng kiểm tra:
1. Console logs
2. Network requests
3. Backend logs
4. Database connectivity

