# HƯỚNG DẪN TÍCH HỢP API VÀO DỰ ÁN VUE.JS

## 📋 Tổng quan dự án
- **Framework**: Vue.js 3 với Composition API
- **Build tool**: Vite
- **Router**: Vue Router 4
- **HTTP Client**: Axios (đã cài đặt) + Fetch API (đang sử dụng)

## 🚀 Những thứ cần thiết để call API

### 1. **Cấu hình môi trường (Environment Configuration)**

#### 1.1 Tạo file `.env`
```bash
# .env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000
VITE_API_VERSION=v1
```

#### 1.2 Tạo file `.env.production`
```bash
# .env.production
VITE_API_BASE_URL=https://your-production-domain.com/api
VITE_API_TIMEOUT=30000
VITE_API_VERSION=v1
```

#### 1.3 Tạo file `.env.development`
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000
VITE_API_VERSION=v1
```

### 2. **Cài đặt dependencies cần thiết**

#### 2.1 Cài đặt thêm packages
```bash
npm install axios interceptor-js
npm install --save-dev @types/node
```

#### 2.2 Cài đặt packages cho development
```bash
npm install --save-dev vite-plugin-env
```

### 3. **Cấu hình Vite (vite.config.js)**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            api: ['axios']
          }
        }
      }
    }
  }
})
```

### 4. **Cấu trúc thư mục API**

```
src/
├── api/
│   ├── config/
│   │   ├── axios.config.js
│   │   ├── interceptors.js
│   │   └── endpoints.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── image.service.js
│   │   └── user.service.js
│   ├── models/
│   │   ├── product.model.js
│   │   ├── image.model.js
│   │   └── user.model.js
│   └── utils/
│       ├── api.utils.js
│       └── error.handler.js
```

### 5. **Cấu hình Axios (src/api/config/axios.config.js)**

```javascript
import axios from 'axios'

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Nếu cần gửi cookies
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Thêm timestamp để tránh cache
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('Response Error:', error)
    
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    
    // Xử lý lỗi 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error('Access denied')
    }
    
    // Xử lý lỗi 500 (Internal Server Error)
    if (error.response?.status >= 500) {
      console.error('Server error')
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
```

### 6. **Định nghĩa endpoints (src/api/config/endpoints.js)**

```javascript
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Products
  PRODUCTS: {
    LIST: '/sanpham',
    DETAIL: (id) => `/sanpham/${id}`,
    CREATE: '/sanpham',
    UPDATE: (id) => `/sanpham/${id}`,
    DELETE: (id) => `/sanpham/${id}`,
    SEARCH: '/sanpham/search',
    CATEGORIES: '/sanpham/categories',
  },
  
  // Images
  IMAGES: {
    LIST: '/hinhanh',
    DETAIL: (id) => `/hinhanh/${id}`,
    CREATE: '/hinhanh',
    UPDATE: (id) => `/hinhanh/${id}`,
    DELETE: (id) => `/hinhanh/${id}`,
    BY_PRODUCT: (productId) => `/hinhanh/sanpham/${productId}`,
    UPLOAD: '/hinhanh/upload',
    SET_MAIN: (id) => `/hinhanh/${id}/set-main`,
  },
  
  // Users
  USERS: {
    LIST: '/nguoidung',
    DETAIL: (id) => `/nguoidung/${id}`,
    CREATE: '/nguoidung',
    UPDATE: (id) => `/nguoidung/${id}`,
    DELETE: (id) => `/nguoidung/${id}`,
    PROFILE: '/nguoidung/profile',
    CHANGE_PASSWORD: '/nguoidung/change-password',
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/loaisanpham',
    DETAIL: (id) => `/loaisanpham/${id}`,
    CREATE: '/loaisanpham',
    UPDATE: (id) => `/loaisanpham/${id}`,
    DELETE: (id) => `/loaisanpham/${id}`,
  },
  
  // Orders
  ORDERS: {
    LIST: '/donhang',
    DETAIL: (id) => `/donhang/${id}`,
    CREATE: '/donhang',
    UPDATE: (id) => `/donhang/${id}`,
    DELETE: (id) => `/donhang/${id}`,
    BY_USER: (userId) => `/donhang/nguoidung/${userId}`,
    UPDATE_STATUS: (id) => `/donhang/${id}/status`,
  }
}
```

### 7. **Service layer (src/api/services/product.service.js)**

```javascript
import apiClient from '../config/axios.config.js'
import { API_ENDPOINTS } from '../config/endpoints.js'

export class ProductService {
  // Lấy danh sách sản phẩm
  static async getProducts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }
  
  // Lấy chi tiết sản phẩm
  static async getProductById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id))
      return response.data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }
  
  // Tạo sản phẩm mới
  static async createProduct(productData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, productData)
      return response.data
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }
  
  // Cập nhật sản phẩm
  static async updateProduct(id, productData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), productData)
      return response.data
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }
  
  // Xóa sản phẩm
  static async deleteProduct(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id))
      return response.data
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
  
  // Tìm kiếm sản phẩm
  static async searchProducts(query, filters = {}) {
    try {
      const params = { q: query, ...filters }
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params })
      return response.data
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }
  
  // Lấy danh mục sản phẩm
  static async getCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.CATEGORIES)
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }
}

export default ProductService
```

### 8. **Error handling (src/api/utils/error.handler.js)**

```javascript
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server trả về response với status code lỗi
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return new ApiError('Dữ liệu không hợp lệ', status, 'BAD_REQUEST', data)
      case 401:
        return new ApiError('Không có quyền truy cập', status, 'UNAUTHORIZED', data)
      case 403:
        return new ApiError('Bị từ chối truy cập', status, 'FORBIDDEN', data)
      case 404:
        return new ApiError('Không tìm thấy tài nguyên', status, 'NOT_FOUND', data)
      case 409:
        return new ApiError('Xung đột dữ liệu', status, 'CONFLICT', data)
      case 422:
        return new ApiError('Dữ liệu không hợp lệ', status, 'UNPROCESSABLE_ENTITY', data)
      case 500:
        return new ApiError('Lỗi server', status, 'INTERNAL_SERVER_ERROR', data)
      case 502:
        return new ApiError('Lỗi gateway', status, 'BAD_GATEWAY', data)
      case 503:
        return new ApiError('Dịch vụ không khả dụng', status, 'SERVICE_UNAVAILABLE', data)
      default:
        return new ApiError('Lỗi không xác định', status, 'UNKNOWN_ERROR', data)
    }
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    return new ApiError('Không thể kết nối đến server', 0, 'NETWORK_ERROR')
  } else {
    // Lỗi khác
    return new ApiError(error.message || 'Lỗi không xác định', 0, 'UNKNOWN_ERROR')
  }
}

export const showErrorMessage = (error) => {
  if (error instanceof ApiError) {
    // Hiển thị lỗi API
    console.error(`API Error [${error.code}]: ${error.message}`)
    // Có thể hiển thị toast notification ở đây
    return error.message
  } else {
    // Hiển thị lỗi khác
    console.error('Unexpected error:', error)
    return 'Đã xảy ra lỗi không xác định'
  }
}
```

### 9. **Sử dụng trong component Vue**

```vue
<template>
  <div class="product-list">
    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-for="product in products" :key="product.maSP">
        {{ product.tenSP }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProductService from '@/api/services/product.service.js'
import { handleApiError, showErrorMessage } from '@/api/utils/error.handler.js'

const products = ref([])
const loading = ref(false)
const error = ref(null)

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    const data = await ProductService.getProducts({
      page: 1,
      limit: 20,
      sortBy: 'tenSP',
      sortOrder: 'asc'
    })
    
    products.value = data.items || data
  } catch (err) {
    const apiError = handleApiError(err)
    error.value = showErrorMessage(apiError)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
```

### 10. **Cấu hình CORS (Backend)**

Nếu bạn đang phát triển backend, cần cấu hình CORS:

```javascript
// Node.js/Express
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Spring Boot
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, 
             allowCredentials = "true")
```

### 11. **Testing API**

#### 11.1 Sử dụng Postman/Insomnia
- Test các endpoint
- Kiểm tra response format
- Test error handling

#### 11.2 Sử dụng console
```javascript
// Trong browser console
import ProductService from './src/api/services/product.service.js'
ProductService.getProducts().then(console.log).catch(console.error)
```

### 12. **Monitoring và Logging**

```javascript
// Thêm vào axios config
apiClient.interceptors.request.use((config) => {
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ ${error.response?.status || 'NETWORK'} ${error.config?.url || 'Unknown'}`)
    return Promise.reject(error)
  }
)
```

## 🔧 Checklist triển khai

- [ ] Tạo file môi trường (.env)
- [ ] Cài đặt dependencies
- [ ] Cấu hình Vite
- [ ] Tạo cấu trúc thư mục API
- [ ] Cấu hình Axios và interceptors
- [ ] Định nghĩa endpoints
- [ ] Tạo service layer
- [ ] Implement error handling
- [ ] Test API endpoints
- [ ] Cấu hình CORS (backend)
- [ ] Monitoring và logging

## 📚 Tài liệu tham khảo

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Axios Documentation](https://axios-http.com/)
- [Vite Configuration](https://vitejs.dev/config/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## 🆘 Hỗ trợ

Nếu gặp vấn đề trong quá trình tích hợp API, hãy kiểm tra:
1. Console browser để xem lỗi
2. Network tab để kiểm tra request/response
3. Backend logs
4. CORS configuration
5. Environment variables
