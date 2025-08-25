# 📋 Cập nhật StaffList Component - Tự động sinh mã nhân viên

## 🎯 Mục tiêu
Cập nhật component `StaffList.vue` để tự động sinh mã nhân viên khi tạo mới, sử dụng logic tương tự `CodeGenerator.java` của backend.

## ✨ Tính năng mới

### 1. Tự động sinh mã nhân viên
- **Format**: `NV` + 8 ký tự ngẫu nhiên (tổng 10 ký tự)
- **Ví dụ**: `NVABC1234`, `NVXYZ7890`, `NV1234567`
- **Logic**: Đảm bảo có ít nhất 1 chữ cái và 1 số

### 2. Giao diện cải tiến
- Trường mã nhân viên chỉ đọc (readonly) khi thêm mới
- Nút sinh lại mã mới với icon 🔄
- Text helper giải thích format mã
- Background xám nhạt cho trường mã

### 3. Logic sinh mã
```javascript
const generateStaffCode = () => {
  const prefix = 'NV'
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
- Cập nhật trường mã nhân viên với `code-input-group`
- Thêm nút sinh lại mã và text helper
- Sửa lỗi optional chaining (`?.`) thành conditional rendering

### Script
- Thêm `generateStaffCode()` function
- Thêm `generateNewCode()` function để sinh lại mã
- Cập nhật `resetCurrentStaff()` để tự động sinh mã mới
- Logic sinh mã tương tự `CodeGenerator.java`

### Style
- Thêm CSS cho `code-input-group`
- Style cho `regenerate-btn`
- Style cho `form-help` text
- Responsive design cho mobile

## 📱 Cách sử dụng

### Thêm nhân viên mới
1. Nhấn nút "+ Thêm nhân viên"
2. Mã nhân viên sẽ được tự động sinh
3. Nếu muốn sinh mã mới, nhấn nút 🔄
4. Điền các thông tin còn lại
5. Nhấn "Thêm mới" để lưu

### Chỉnh sửa nhân viên
- Trường mã không hiển thị khi chỉnh sửa (chỉ hiển thị khi thêm mới)
- Các thông tin khác có thể chỉnh sửa bình thường

## 🎨 Giao diện

### Trường mã nhân viên
- **Background**: Xám nhạt (`#f1f5f9`)
- **Text color**: Xám đậm (`#64748b`)
- **Cursor**: `not-allowed` (chỉ đọc)
- **Nút sinh lại**: Icon 🔄 với hover effect

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

## 🚀 Để test

1. **Chạy development server**:
   ```bash
   npm run dev
   ```

2. **Mở browser** và truy cập đường dẫn được hiển thị

3. **Điều hướng** đến trang quản lý nhân viên

4. **Test tính năng**:
   - Thêm nhân viên mới
   - Kiểm tra mã tự động sinh
   - Test nút sinh lại mã
   - Kiểm tra responsive design

## 📝 Lưu ý

- Mã nhân viên được sinh theo format chuẩn của backend
- Logic sinh mã đảm bảo tính ngẫu nhiên và đa dạng
- Giao diện thân thiện với người dùng
- Component tương thích với Vue 3 và Vite

## 🔗 Liên quan

- **Backend**: `CodeGenerator.java` - Logic sinh mã
- **Frontend**: `StaffList.vue` - Component quản lý nhân viên
- **API**: `/api/nhanvien` - Endpoint quản lý nhân viên

## 📊 So sánh với SupplierList

| Tính năng | SupplierList | StaffList |
|-----------|--------------|-----------|
| Prefix mã | NCC | NV |
| Độ dài mã | 10 ký tự | 10 ký tự |
| Ký tự ngẫu nhiên | 7 ký tự | 8 ký tự |
| Format | NCC + 7 ký tự | NV + 8 ký tự |
| Logic sinh | Tương tự | Tương tự |

---

*Cập nhật hoàn thành ✅ - Component đã sẵn sàng để sử dụng với tính năng tự động sinh mã nhân viên.*
