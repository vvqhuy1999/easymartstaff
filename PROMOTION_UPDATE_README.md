# 📋 Cập nhật Promotion Component - Tự động sinh mã khuyến mãi

## 🎯 Mục tiêu
Cập nhật component `Promotion.vue` để tự động sinh mã khuyến mãi khi tạo mới, sử dụng logic tương tự `CodeGenerator.java` của backend.

## ✨ Tính năng mới

### 1. Tự động sinh mã khuyến mãi
- **Format**: `KM` + 8 ký tự ngẫu nhiên (tổng 10 ký tự)
- **Ví dụ**: `KMABC1234`, `KMXYZ7890`, `KM1234567`
- **Logic**: Đảm bảo có ít nhất 1 chữ cái và 1 số

### 2. Giao diện cải tiến
- Trường mã khuyến mãi chỉ đọc (readonly) khi thêm mới
- Nút sinh lại mã mới với icon 🔄
- Text helper giải thích format mã
- Background xám nhạt cho trường mã
- Hỗ trợ nhiều loại khuyến mãi khác nhau

### 3. Logic sinh mã
```javascript
const generatePromotionCode = () => {
  const prefix = 'KM'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  // Đảm bảo có ít nhất 1 chữ cái và 1 số
  result += chars.charAt(Math.floor(Math.random() * 26)) // Chữ cái đầu tiên
  result += chars.charAt(26 + Math.floor(Math.random() * 10)) // Số
  
  // Generate 6 ký tự còn lại
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.random() * chars.length)
  }
  
  return prefix + result
}
```

## 🔧 Thay đổi kỹ thuật

### Template
- Cập nhật trường mã khuyến mãi với `code-input-group`
- Thêm nút sinh lại mã và text helper
- Hiển thị trường mã khác nhau cho thêm mới và chỉnh sửa
- Cải thiện giao diện form

### Script
- Thêm `generatePromotionCode()` function
- Thêm `generateNewCode()` function để sinh lại mã
- Cập nhật `openAddModal()` để tự động sinh mã mới
- Logic sinh mã tương tự `CodeGenerator.java`
- Loại bỏ các function không cần thiết

### Style
- Thêm CSS cho `code-input-group`
- Style cho `regenerate-btn`
- Style cho `form-help` text
- Style cho `form-textarea`
- Responsive design cho mobile

## 📱 Cách sử dụng

### Thêm khuyến mãi mới
1. Nhấn nút "+ Thêm khuyến mãi mới"
2. Mã khuyến mãi sẽ được tự động sinh
3. Nếu muốn sinh mã mới, nhấn nút 🔄
4. Điền các thông tin còn lại
5. Chọn loại khuyến mãi và giá trị
6. Nhấn "Thêm mới" để lưu

### Chỉnh sửa khuyến mãi
- Trường mã hiển thị nhưng không thể chỉnh sửa
- Các thông tin khác có thể chỉnh sửa bình thường
- Hỗ trợ điều chỉnh thời gian khuyến mãi

### Xóa khuyến mãi
- Modal xác nhận trước khi xóa
- Cập nhật danh sách sau khi xóa

## 🎨 Giao diện

### Trường mã khuyến mãi
- **Background**: Xám nhạt (`#f1f5f9`)
- **Text color**: Xám đậm (`#64748b`)
- **Cursor**: `not-allowed` (chỉ đọc)
- **Nút sinh lại**: Icon 🔄 với hover effect

### Form Elements
- **Input fields**: Border xanh khi focus
- **Textarea**: Resize vertical, min-height 80px
- **Select**: Hỗ trợ các loại khuyến mãi
- **Number input**: Cho giá trị khuyến mãi
- **Datetime input**: Cho thời gian áp dụng

### Responsive Design
- Mobile-friendly layout
- Grid layout tự động điều chỉnh
- Button sizes phù hợp với touch

## 🔍 Kiểm tra chất lượng

### Functionality
- ✅ Tự động sinh mã khi mở modal thêm mới
- ✅ Nút sinh lại mã hoạt động
- ✅ Trường mã chỉ đọc
- ✅ Logic sinh mã đúng format
- ✅ Hỗ trợ nhiều loại khuyến mãi
- ✅ Quản lý thời gian linh hoạt

### Giao diện
- ✅ Stats cards hiển thị tổng quan
- ✅ Bảng khuyến mãi với sorting và filtering
- ✅ Modal xem chi tiết và chỉnh sửa
- ✅ Responsive design
- ✅ Loading states và error handling

## 🚀 Để test

1. **Chạy development server**:
   ```bash
   npm run dev
   ```

2. **Mở browser** và truy cập đường dẫn được hiển thị

3. **Điều hướng** đến trang quản lý khuyến mãi

4. **Test tính năng**:
   - Thêm khuyến mãi mới
   - Kiểm tra mã tự động sinh
   - Test nút sinh lại mã
   - Test chỉnh sửa khuyến mãi
   - Test xóa khuyến mãi
   - Test các loại khuyến mãi khác nhau
   - Kiểm tra responsive design

## 📝 Lưu ý

- Mã khuyến mãi được sinh theo format chuẩn của backend
- Logic sinh mã đảm bảo tính ngẫu nhiên và đa dạng
- Giao diện thân thiện với người dùng
- Component tương thích với Vue 3 và Vite
- Hỗ trợ nhiều loại khuyến mãi khác nhau

## 🔗 Liên quan

- **Backend**: `CodeGenerator.java` - Logic sinh mã
- **Frontend**: `Promotion.vue` - Component quản lý khuyến mãi
- **API**: `/api/khuyenmai` - Endpoint quản lý khuyến mãi

## 📊 So sánh với các component khác

| Tính năng | SupplierList | StaffList | CustomerManagement | CategoryList | Promotion |
|-----------|--------------|-----------|-------------------|--------------|-----------|
| Prefix mã | NCC | NV | KH | DM | KM |
| Độ dài mã | 10 ký tự | 10 ký tự | 10 ký tự | 10 ký tự | 10 ký tự |
| Ký tự ngẫu nhiên | 7 ký tự | 8 ký tự | 8 ký tự | 8 ký tự | 8 ký tự |
| Format | NCC + 7 ký tự | NV + 8 ký tự | KH + 8 ký tự | DM + 8 ký tự | KM + 8 ký tự |
| Logic sinh | Tương tự | Tương tự | Tương tự | Tương tự | Tương tự |
| Đặc biệt | - | - | Hỗ trợ đăng ký tài khoản | Hỗ trợ danh mục cha-con | Hỗ trợ nhiều loại KM |

## 🎯 Tính năng đặc biệt

### Quản lý thời gian khuyến mãi
- Hỗ trợ điều chỉnh thời gian linh hoạt
- Nút điều chỉnh nhanh (-7, -1, +1, +7 ngày)
- Hiển thị thời gian khuyến mãi
- Validation thời gian bắt đầu và kết thúc

### Loại khuyến mãi đa dạng
- **Phần trăm**: Giảm giá theo phần trăm
- **Số tiền**: Giảm giá theo số tiền cố định
- **Điểm**: Tặng điểm thưởng
- **Mua X tặng Y**: Khuyến mãi mua hàng

### Stats và báo cáo
- Tổng số khuyến mãi
- Số khuyến mãi đang hoạt động
- Số khuyến mãi sắp diễn ra
- Số khuyến mãi đã kết thúc

### Tìm kiếm và lọc
- Tìm kiếm theo tên chương trình
- Lọc theo trạng thái
- Sorting theo các tiêu chí
- Pagination cho danh sách dài

---

*Cập nhật hoàn thành ✅ - Component đã sẵn sàng để sử dụng với tính năng tự động sinh mã khuyến mãi và quản lý chương trình khuyến mãi toàn diện.*
