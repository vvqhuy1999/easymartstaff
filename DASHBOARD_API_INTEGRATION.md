# 🚀 Dashboard API Integration Guide

## 📋 Tổng quan

Dashboard đã được tích hợp với các API backend để hiển thị dữ liệu thực từ hệ thống siêu thị mini. Các thống kê, hoạt động gần đây, sản phẩm bán chạy và biểu đồ đều được lấy từ database thông qua REST API.

## 🔌 API Endpoints được sử dụng

### 1. **KhachHangRestController** (`/api/khachhang`)
- **GET** `/api/khachhang` - Lấy danh sách khách hàng
- **GET** `/api/khachhang/{id}` - Lấy thông tin khách hàng theo ID
- **GET** `/api/khachhang/by-nguoidung/{maNguoiDung}` - Lấy khách hàng theo mã người dùng

### 2. **HoaDonRestController** (`/api/hoadon`)
- **GET** `/api/hoadon` - Lấy danh sách hóa đơn
- **GET** `/api/hoadon/{id}` - Lấy thông tin hóa đơn theo ID

### 3. **ChiTietHoaDonRestController** (`/api/chitiethoadon`)
- **GET** `/api/chitiethoadon` - Lấy chi tiết hóa đơn
- **GET** `/api/chitiethoadon/{id}` - Lấy chi tiết hóa đơn theo ID

### 4. **SanPhamRestController** (`/api/sanpham`)
- **GET** `/api/sanpham` - Lấy danh sách sản phẩm
- **GET** `/api/sanpham/{id}` - Lấy thông tin sản phẩm theo ID
- **GET** `/api/sanpham/optimized` - Lấy sản phẩm tối ưu (ít trường hơn)

### 5. **ThongKeBaoCaoRestController** (`/api/thongkebaocao`)
- **GET** `/api/thongkebaocao` - Lấy danh sách báo cáo thống kê
- **GET** `/api/thongkebaocao/{id}` - Lấy báo cáo theo ID

## 🎯 Dashboard Functions

### 1. **getDashboardStats()**
Tính toán thống kê tổng quan:
- **Doanh thu**: Tổng từ các đơn hàng đã hoàn thành
- **Đơn hàng**: Số lượng đơn hàng tổng cộng
- **Khách hàng**: Số lượng khách hàng đã đăng ký
- **Sản phẩm**: Số lượng sản phẩm trong hệ thống

```javascript
const stats = await getDashboardStats();
// Returns: { revenue, orders, customers, products }
```

### 2. **getRecentActivities()**
Lấy hoạt động gần đây:
- Đơn hàng mới (3 đơn hàng gần nhất)
- Khách hàng mới (2 khách hàng đăng ký gần nhất)
- Sắp xếp theo thời gian

```javascript
const activities = await getRecentActivities();
// Returns: Array of activity objects
```

### 3. **getTopProducts()**
Lấy sản phẩm bán chạy:
- Tính toán dựa trên số lượng bán và doanh thu
- Chỉ xét đơn hàng đã hoàn thành
- Sắp xếp theo doanh thu giảm dần

```javascript
const topProducts = await getTopProducts();
// Returns: Array of top 5 products
```

### 4. **getChartData(timeFilter)**
Lấy dữ liệu biểu đồ theo thời gian:
- **timeFilter**: `today`, `week`, `month`, `year`
- Dữ liệu 7 ngày gần nhất
- Biểu đồ doanh thu, đơn hàng, khách hàng

```javascript
const chartData = await getChartData('week');
// Returns: { revenue, orders, customers }
```

## 🛠️ Cách sử dụng

### 1. **Import API functions**
```javascript
import { 
  getDashboardStats, 
  getRecentActivities, 
  getTopProducts, 
  getChartData 
} from '../api.js';
```

### 2. **Load data khi component mount**
```javascript
onMounted(async () => {
  await loadDashboardData();
});

const loadDashboardData = async () => {
  try {
    const [statsData, activitiesData, productsData, chartData] = await Promise.all([
      getDashboardStats(),
      getRecentActivities(),
      getTopProducts(),
      getChartData(selectedTimeFilter.value)
    ]);
    
    // Update reactive data
    stats.value = statsData;
    recentActivities.value = activitiesData;
    topProducts.value = productsData;
    // ... update charts
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
};
```

### 3. **Refresh data**
```javascript
const refreshData = async () => {
  await loadDashboardData();
};
```

### 4. **Filter theo thời gian**
```javascript
const onTimeFilterChange = async () => {
  await loadDashboardData();
};
```

## 📊 Cấu trúc dữ liệu

### Dashboard Stats
```javascript
{
  revenue: { value: "2.4M VNĐ", change: 12.3 },
  orders: { value: "156", change: 8.7 },
  customers: { value: "89", change: 15.2 },
  products: { value: "234", change: -2.1 }
}
```

### Recent Activities
```javascript
[
  {
    id: "order-1001",
    type: "order",
    icon: "📦",
    title: "Đơn hàng mới #1001",
    description: "Khách hàng: Nguyễn Văn A",
    value: "450,000 VNĐ",
    time: "5 phút trước"
  }
]
```

### Top Products
```javascript
[
  {
    id: "SP001",
    name: "iPhone 15 Pro Max",
    category: "Điện thoại",
    sold: 23,
    revenue: "650M VNĐ"
  }
]
```

### Chart Data
```javascript
{
  revenue: [
    { value: "1.2M", percentage: 60 },
    { value: "1.8M", percentage: 80 }
    // ... 7 days
  ],
  orders: [...],
  customers: [...]
}
```

## 🔧 Cấu hình

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### CORS Configuration
Backend đã được cấu hình CORS để cho phép frontend truy cập:
```java
@CrossOrigin(origins = "*")
```

## 🧪 Testing

### Test file: `test-dashboard-api.html`
- Kiểm tra từng API endpoint
- Test dashboard functions
- Hiển thị kết quả real-time

### Cách test:
1. Mở file `test-dashboard-api.html` trong browser
2. Đảm bảo backend server đang chạy trên `localhost:8080`
3. Click các nút test để kiểm tra API
4. Xem kết quả và logs trong console

## 🚨 Error Handling

### Loading States
```javascript
const loading = ref(true);
const error = ref(null);

// Show loading spinner
<div v-if="loading" class="loading-container">
  <div class="loading-spinner"></div>
  <p>Đang tải dữ liệu...</p>
</div>
```

### Error States
```javascript
// Show error message
<div v-else-if="error" class="error-container">
  <div class="error-icon">⚠️</div>
  <h3>Lỗi khi tải dữ liệu</h3>
  <p>{{ error }}</p>
  <button @click="loadDashboardData" class="retry-btn">Thử lại</button>
</div>
```

### Retry Mechanism
```javascript
try {
  await loadDashboardData();
} catch (err) {
  error.value = 'Không thể tải dữ liệu dashboard. Vui lòng kiểm tra kết nối mạng và thử lại.';
} finally {
  loading.value = false;
}
```

## 📱 Responsive Design

Dashboard được thiết kế responsive với:
- Grid layout tự động điều chỉnh
- Mobile-first approach
- Touch-friendly controls
- Adaptive charts

## 🔄 Performance Optimization

### Parallel API Calls
```javascript
const [statsData, activitiesData, productsData, chartData] = await Promise.all([
  getDashboardStats(),
  getRecentActivities(),
  getTopProducts(),
  getChartData(selectedTimeFilter.value)
]);
```

### Caching Strategy
- Data được load một lần khi component mount
- Refresh button để cập nhật dữ liệu mới
- Time filter để lọc dữ liệu theo nhu cầu

## 🚀 Deployment

### Frontend
1. Build Vue.js project: `npm run build`
2. Deploy dist folder lên web server

### Backend
1. Build Spring Boot project: `mvn clean package`
2. Deploy JAR file lên server
3. Cấu hình database connection
4. Cập nhật CORS origins nếu cần

## 📝 Notes

- Đảm bảo backend server đang chạy trước khi test frontend
- Kiểm tra CORS configuration nếu gặp lỗi cross-origin
- Monitor API response times để optimize performance
- Log errors để debug và monitor system health

## 🤝 Support

Nếu gặp vấn đề:
1. Kiểm tra browser console cho errors
2. Verify backend server status
3. Test API endpoints trực tiếp
4. Check network connectivity
5. Review CORS configuration
