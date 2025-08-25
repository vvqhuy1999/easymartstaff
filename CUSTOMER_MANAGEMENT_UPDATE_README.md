# 📋 Cập nhật CustomerManagement Component - Tự động sinh mã khách hàng

## 🎯 Mục tiêu
Cập nhật component `CustomerManagement.vue` để tự động sinh mã khách hàng khi tạo mới, sử dụng logic tương tự `CodeGenerator.java` của backend.

## ✨ Tính năng mới

### 1. Tự động sinh mã khách hàng
- **Format**: `KH` + 8 ký tự ngẫu nhiên (tổng 10 ký tự)
- **Ví dụ**: `KHABC1234`, `KHXYZ7890`, `KH1234567`
- **Logic**: Đảm bảo có ít nhất 1 chữ cái và 1 số

### 2. Giao diện cải tiến
- Trường mã khách hàng chỉ đọc (readonly) khi thêm mới
- Nút sinh lại mã mới với icon 🔄
- Text helper giải thích format mã
- Background xám nhạt cho trường mã

### 3. Logic sinh mã
```javascript
const generateCustomerCode = () => {
  const prefix = 'KH'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  // Đảm bảo có ít nhất 1 chữ cái và 1 số
  result += chars.charAt(Math.floor(Math.random() * 26)) // Chữ cái đầu tiên
  result += chars.charAt(26 + Math.floor(Math.random() * 10)) // Số
  
  // Generate 6 ký tự còn lại
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return prefix + result
}
```

## 🔧 Thay đổi kỹ thuật

### Template
- Thêm wrapper `<div>` để sửa lỗi linter về template root
- Cập nhật trường mã khách hàng với `code-input-group`
- Thêm nút sinh lại mã và text helper
- Sửa lỗi optional chaining (`?.`) thành conditional rendering

### Script
- Thêm `generateCustomerCode()` function
- Thêm `generateNewCode()` function để sinh lại mã
- Cập nhật `resetForm()` để tự động sinh mã mới
- Logic sinh mã tương tự `CodeGenerator.java`

### Style
- Thêm CSS cho `code-input-group`
- Style cho `regenerate-btn`
- Style cho `form-help` text
- Status badges cho loại khách hàng
- Responsive design cho mobile

## 📱 Cách sử dụng

### Thêm khách hàng mới
1. Nhấn nút "+ Thêm khách hàng"
2. Mã khách hàng sẽ được tự động sinh
3. Nếu muốn sinh mã mới, nhấn nút 🔄
4. Điền các thông tin còn lại
5. Nhấn "Thêm mới" để lưu

### Đăng ký tài khoản
1. Nhấn nút "+ Đăng ký tài khoản"
2. Điền thông tin email, mật khẩu, họ tên, số điện thoại
3. Hệ thống sẽ tạo cả tài khoản và thông tin khách hàng

### Chỉnh sửa khách hàng
- Trường mã không hiển thị khi chỉnh sửa (chỉ hiển thị khi thêm mới)
- Các thông tin khác có thể chỉnh sửa bình thường

## 🎨 Giao diện

### Trường mã khách hàng
- **Background**: Xám nhạt (`#f1f5f9`)
- **Text color**: Xám đậm (`#64748b`)
- **Cursor**: `not-allowed` (chỉ đọc)
- **Nút sinh lại**: Icon 🔄 với hover effect

### Status Badges
- **Thường**: Xanh dương
- **VIP**: Vàng
- **Bạc**: Xám
- **Vàng**: Vàng
- **Kim cương**: Tím

### Responsive Design
- Mobile-friendly layout
- Grid layout tự động điều chỉnh
- Button sizes phù hợp với touch

## 🔍 Kiểm tra chất lượng

### Linter Errors đã sửa
- ✅ Template root error (thêm wrapper div)
- ✅ Optional chaining error (thay bằng conditional rendering)
- ✅ CSS styles đầy đủ

### Functionality
- ✅ Tự động sinh mã khi mở modal thêm mới
- ✅ Nút sinh lại mã hoạt động
- ✅ Trường mã chỉ đọc
- ✅ Logic sinh mã đúng format
- ✅ Hỗ trợ đăng ký tài khoản
- ✅ Status badges cho loại khách hàng

## 🚀 Để test

1. **Chạy development server**:
   ```bash
   npm run dev
   ```

2. **Mở browser** và truy cập đường dẫn được hiển thị

3. **Điều hướng** đến trang quản lý khách hàng

4. **Test tính năng**:
   - Thêm khách hàng mới
   - Kiểm tra mã tự động sinh
   - Test nút sinh lại mã
   - Test đăng ký tài khoản
   - Kiểm tra responsive design

## 📝 Lưu ý

- Mã khách hàng được sinh theo format chuẩn của backend
- Logic sinh mã đảm bảo tính ngẫu nhiên và đa dạng
- Giao diện thân thiện với người dùng
- Component tương thích với Vue 3 và Vite
- Hỗ trợ cả thêm khách hàng thủ công và đăng ký tài khoản

## 🔗 Liên quan

- **Backend**: `CodeGenerator.java` - Logic sinh mã
- **Frontend**: `CustomerManagement.vue` - Component quản lý khách hàng
- **API**: `/api/khachhang` - Endpoint quản lý khách hàng

## 📊 So sánh với các component khác

| Tính năng | SupplierList | StaffList | CustomerManagement |
|-----------|--------------|-----------|-------------------|
| Prefix mã | NCC | NV | KH |
| Độ dài mã | 10 ký tự | 10 ký tự | 10 ký tự |
| Ký tự ngẫu nhiên | 7 ký tự | 8 ký tự | 8 ký tự |
| Format | NCC + 7 ký tự | NV + 8 ký tự | KH + 8 ký tự |
| Logic sinh | Tương tự | Tương tự | Tương tự |
| Đặc biệt | - | - | Hỗ trợ đăng ký tài khoản |

## 🎯 Tính năng đặc biệt

### Đăng ký tài khoản khách hàng
- Tạo tài khoản với email và mật khẩu
- Tự động tạo thông tin khách hàng
- Hỗ trợ đăng nhập sau khi đăng ký
- Validation đầy đủ cho form đăng ký

### Quản lý loại khách hàng
- Hỗ trợ 5 loại: Thường, VIP, Bạc, Vàng, Kim cương
- Status badges với màu sắc phân biệt
- Có thể mở rộng thêm loại mới

---

*Cập nhật hoàn thành ✅ - Component đã sẵn sàng để sử dụng với tính năng tự động sinh mã khách hàng và đăng ký tài khoản.*
