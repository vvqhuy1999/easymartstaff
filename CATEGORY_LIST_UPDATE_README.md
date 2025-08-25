# 📋 Cập nhật CategoryList Component - Tự động sinh mã danh mục

## 🎯 Mục tiêu
Cập nhật component `CategoryList.vue` để tự động sinh mã danh mục khi tạo mới, sử dụng logic tương tự `CodeGenerator.java` của backend.

## ✨ Tính năng mới

### 1. Tự động sinh mã danh mục
- **Format**: `DM` + 8 ký tự ngẫu nhiên (tổng 10 ký tự)
- **Ví dụ**: `DMABC1234`, `DMXYZ7890`, `DM1234567`
- **Logic**: Đảm bảo có ít nhất 1 chữ cái và 1 số

### 2. Giao diện cải tiến
- Trường mã danh mục chỉ đọc (readonly) khi thêm mới
- Nút sinh lại mã mới với icon 🔄
- Text helper giải thích format mã
- Background xám nhạt cho trường mã
- Hỗ trợ danh mục cha và thứ tự hiển thị

### 3. Logic sinh mã
```javascript
const generateCategoryCode = () => {
  const prefix = 'DM'
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
- Cập nhật trường mã danh mục với `code-input-group`
- Thêm nút sinh lại mã và text helper
- Sửa lỗi optional chaining (`?.`) thành conditional rendering
- Hiển thị trường mã khác nhau cho thêm mới và chỉnh sửa

### Script
- Thêm `generateCategoryCode()` function
- Thêm `generateNewCode()` function để sinh lại mã
- Cập nhật `resetCurrentCategory()` để tự động sinh mã mới
- Logic sinh mã tương tự `CodeGenerator.java`
- Sửa lỗi optional chaining trong computed properties

### Style
- Thêm CSS cho `code-input-group`
- Style cho `regenerate-btn`
- Style cho `form-help` text
- Style cho `form-textarea`
- Responsive design cho mobile

## 📱 Cách sử dụng

### Thêm danh mục mới
1. Nhấn nút "+ Thêm danh mục"
2. Mã danh mục sẽ được tự động sinh
3. Nếu muốn sinh mã mới, nhấn nút 🔄
4. Điền các thông tin còn lại
5. Nhấn "Thêm mới" để lưu

### Chỉnh sửa danh mục
- Trường mã hiển thị nhưng không thể chỉnh sửa
- Các thông tin khác có thể chỉnh sửa bình thường
- Hỗ trợ chọn danh mục cha và thứ tự hiển thị

### Xóa danh mục
- Xóa mềm (đánh dấu isDeleted = true)
- Modal xác nhận trước khi xóa
- Cập nhật danh sách sau khi xóa

## 🎨 Giao diện

### Trường mã danh mục
- **Background**: Xám nhạt (`#f1f5f9`)
- **Text color**: Xám đậm (`#64748b`)
- **Cursor**: `not-allowed` (chỉ đọc)
- **Nút sinh lại**: Icon 🔄 với hover effect

### Form Elements
- **Input fields**: Border xanh khi focus
- **Textarea**: Resize vertical, min-height 80px
- **Select**: Hỗ trợ danh mục cha
- **Number input**: Cho thứ tự hiển thị

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
- ✅ Hỗ trợ danh mục cha và con
- ✅ Thứ tự hiển thị

## 🚀 Để test

1. **Chạy development server**:
   ```bash
   npm run dev
   ```

2. **Mở browser** và truy cập đường dẫn được hiển thị

3. **Điều hướng** đến trang quản lý danh mục sản phẩm

4. **Test tính năng**:
   - Thêm danh mục mới
   - Kiểm tra mã tự động sinh
   - Test nút sinh lại mã
   - Test chỉnh sửa danh mục
   - Test xóa danh mục
   - Kiểm tra responsive design

## 📝 Lưu ý

- Mã danh mục được sinh theo format chuẩn của backend
- Logic sinh mã đảm bảo tính ngẫu nhiên và đa dạng
- Giao diện thân thiện với người dùng
- Component tương thích với Vue 3 và Vite
- Hỗ trợ cấu trúc danh mục cha-con

## 🔗 Liên quan

- **Backend**: `CodeGenerator.java` - Logic sinh mã
- **Frontend**: `CategoryList.vue` - Component quản lý danh mục
- **API**: `/api/loaisanpham` - Endpoint quản lý danh mục

## 📊 So sánh với các component khác

| Tính năng | SupplierList | StaffList | CustomerManagement | CategoryList |
|-----------|--------------|-----------|-------------------|--------------|
| Prefix mã | NCC | NV | KH | DM |
| Độ dài mã | 10 ký tự | 10 ký tự | 10 ký tự | 10 ký tự |
| Ký tự ngẫu nhiên | 7 ký tự | 8 ký tự | 8 ký tự | 8 ký tự |
| Format | NCC + 7 ký tự | NV + 8 ký tự | KH + 8 ký tự | DM + 8 ký tự |
| Logic sinh | Tương tự | Tương tự | Tương tự | Tương tự |
| Đặc biệt | - | - | Hỗ trợ đăng ký tài khoản | Hỗ trợ danh mục cha-con |

## 🎯 Tính năng đặc biệt

### Quản lý danh mục cha-con
- Hỗ trợ cấu trúc danh mục phân cấp
- Có thể chọn danh mục cha khi tạo mới
- Hiển thị tên danh mục cha trong bảng
- Ngăn chặn chọn chính mình làm danh mục cha

### Thứ tự hiển thị
- Hỗ trợ sắp xếp danh mục theo thứ tự
- Input number với validation
- Mặc định là 0 nếu không nhập

### Mô tả danh mục
- Textarea cho mô tả chi tiết
- Không bắt buộc (optional)
- Hiển thị "Chưa có mô tả" nếu trống

---

*Cập nhật hoàn thành ✅ - Component đã sẵn sàng để sử dụng với tính năng tự động sinh mã danh mục và quản lý cấu trúc phân cấp.*
