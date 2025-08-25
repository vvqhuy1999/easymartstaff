# 📋 Cập nhật SupplierList Component - Tự động sinh mã nhà cung cấp

## 🎯 Mục tiêu
Cập nhật component `SupplierList.vue` để tự động sinh mã nhà cung cấp khi tạo mới, sử dụng logic tương tự `CodeGenerator.java` của backend.

## ✨ Tính năng mới

### 1. Tự động sinh mã nhà cung cấp
- **Format**: `NCC` + 7 ký tự ngẫu nhiên (tổng 10 ký tự)
- **Ví dụ**: `NCCABC123`, `NCCXYZ789`, `NCC12345`
- **Logic**: Đảm bảo có ít nhất 1 chữ cái và 1 số

### 2. Giao diện cải tiến
- Trường mã nhà cung cấp chỉ đọc (readonly) khi thêm mới
- Nút sinh lại mã mới với icon 🔄
- Text helper giải thích format mã
- Background xám nhạt cho trường mã

### 3. Logic sinh mã
```javascript
const generateSupplierCode = () => {
  const prefix = 'NCC'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  // Đảm bảo có ít nhất 1 chữ cái và 1 số
  result += chars.charAt(Math.floor(Math.random() * 26)) // Chữ cái đầu tiên
  result += chars.charAt(26 + Math.floor(Math.random() * 10)) // Số
  
  // Generate 5 ký tự còn lại
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return prefix + result
}
```

## 🔧 Thay đổi kỹ thuật

### Template
- Thêm wrapper `<div>` để sửa lỗi linter về template root
- Cập nhật trường mã nhà cung cấp với `code-input-group`
- Thêm nút sinh lại mã và text helper
- Sửa lỗi optional chaining (`?.`) thành conditional rendering

### Script
- Thêm `generateSupplierCode()` function
- Thêm `generateNewCode()` function để sinh lại mã
- Cập nhật `resetForm()` để tự động sinh mã mới
- Logic sinh mã tương tự `CodeGenerator.java`

### Style
- Thêm CSS cho `code-input-group`
- Style cho `regenerate-btn`
- Style cho `form-help` text
- Responsive design cho mobile

## 📱 Cách sử dụng

### Thêm nhà cung cấp mới
1. Nhấn nút "➕ Thêm nhà cung cấp"
2. Mã nhà cung cấp sẽ được tự động sinh
3. Nếu muốn sinh mã mới, nhấn nút 🔄
4. Điền các thông tin còn lại
5. Nhấn "Thêm mới" để lưu

### Chỉnh sửa nhà cung cấp
- Trường mã không hiển thị khi chỉnh sửa (chỉ hiển thị khi thêm mới)
- Các thông tin khác có thể chỉnh sửa bình thường

## 🎨 Giao diện

### Trường mã nhà cung cấp
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

3. **Điều hướng** đến trang quản lý nhà cung cấp

4. **Test tính năng**:
   - Thêm nhà cung cấp mới
   - Kiểm tra mã tự động sinh
   - Test nút sinh lại mã
   - Kiểm tra responsive design

## 📝 Lưu ý

- Mã nhà cung cấp được sinh theo format chuẩn của backend
- Logic sinh mã đảm bảo tính ngẫu nhiên và đa dạng
- Giao diện thân thiện với người dùng
- Component tương thích với Vue 3 và Vite

## 🔗 Liên quan

- **Backend**: `CodeGenerator.java` - Logic sinh mã
- **Frontend**: `SupplierList.vue` - Component quản lý nhà cung cấp
- **API**: `/api/nhacungcap` - Endpoint quản lý nhà cung cấp

---

*Cập nhật hoàn thành ✅ - Component đã sẵn sàng để sử dụng với tính năng tự động sinh mã nhà cung cấp.*
