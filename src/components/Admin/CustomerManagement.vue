<template>
  <div>
    <AdminHeader />
    <div class="container">
      <!-- Header -->
      <div class="header">
        <router-link to="/home" class="back-btn">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/>
            <path d="m12 19-7-7 7-7"/>
          </svg>
          <span class="back-text">Trang chủ</span>
          <div class="back-shine"></div>
        </router-link>
        <h2>Quản lý khách hàng</h2>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Tìm kiếm khách hàng..." 
            class="search-input"
            @input="currentPage = 1"
          />
          <button @click="searchTerm = ''" class="clear-btn" v-if="searchTerm">✕</button>
        </div>
        <select v-model="statusFilter" class="filter-select" @change="currentPage = 1">
          <option value="">Tất cả trạng thái</option>
          <option value="false">Hoạt động</option>
          <option value="true">Đã xóa</option>
        </select>
        <button @click="showAddForm = true" class="add-btn">+ Thêm khách hàng</button>
        <button @click="showRegisterForm = true" class="add-btn">+ Đăng ký tài khoản</button>
        <button @click="refreshData" class="add-btn">🔄 Làm mới</button>
      </div>

      <!-- Form đăng ký tài khoản khách hàng -->
      <div v-if="showRegisterForm" class="modal-overlay" @click="closeRegisterForm">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>Đăng Ký Tài Khoản Khách Hàng</h2>
            <button @click="closeRegisterForm" class="close-btn">&times;</button>
          </div>
          <form @submit.prevent="submitRegisterForm" class="customer-form">
            <div class="form-group">
              <label>Email (để đăng nhập) *</label>
              <input v-model="registerForm.email" type="email" required placeholder="Nhập email">
            </div>
            <div class="form-group">
              <label>Mật khẩu *</label>
              <input v-model="registerForm.matKhau" type="password" required placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)">
            </div>
            <div class="form-group">
              <label>Họ và tên *</label>
              <input v-model="registerForm.hoTen" type="text" required placeholder="Nhập họ và tên">
            </div>
            <div class="form-group">
              <label>Số điện thoại *</label>
              <input v-model="registerForm.sdt" type="tel" required placeholder="Nhập số điện thoại (10-11 số)">
            </div>
            <div class="form-group">
              <label>Địa chỉ</label>
              <textarea v-model="registerForm.diaChi" placeholder="Nhập địa chỉ (không bắt buộc)"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeRegisterForm" class="btn btn-secondary">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="registerLoading">
                {{ registerLoading ? 'Đang xử lý...' : 'Đăng ký' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Form thêm/sửa khách hàng -->
      <div v-if="showAddForm || editingCustomer" class="modal-overlay" @click="closeForm">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>{{ editingCustomer ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng Mới' }}</h2>
            <button @click="closeForm" class="close-btn">&times;</button>
          </div>
          <form @submit.prevent="submitForm" class="customer-form">
            <div class="form-group" v-if="!editingCustomer">
              <label>Mã khách hàng</label>
              <div class="code-input-group">
                <input 
                  v-model="form.maKH" 
                  type="text" 
                  class="form-input"
                  placeholder="Mã sẽ được tự động sinh"
                  readonly
                />
                <button 
                  type="button" 
                  @click="generateNewCode" 
                  class="regenerate-btn"
                  title="Sinh lại mã mới"
                >
                  🔄
                </button>
              </div>
              <small class="form-help">Mã khách hàng được tự động sinh theo định dạng KH + 8 ký tự ngẫu nhiên</small>
            </div>
            <div class="form-group">
              <label>Họ và tên *</label>
              <input v-model="form.hoTen" type="text" required placeholder="Nhập họ và tên">
            </div>
            <div class="form-group">
              <label>Số điện thoại</label>
              <input v-model="form.sdt" type="tel" placeholder="Nhập số điện thoại">
            </div>
            <div class="form-group">
              <label>Địa chỉ</label>
              <textarea v-model="form.diaChi" placeholder="Nhập địa chỉ"></textarea>
            </div>
            <div class="form-group">
              <label>Ngày sinh</label>
              <input v-model="form.ngaySinh" type="date">
            </div>
            <div class="form-group">
              <label>Điểm tích lũy</label>
              <input v-model="form.diemTichLuy" type="number" min="0" placeholder="Điểm tích lũy">
            </div>
            <div class="form-group">
              <label>Loại khách hàng</label>
              <select v-model="form.loaiKhachHang">
                <option value="Thường">Thường</option>
                <option value="VIP">VIP</option>
                <option value="Bạc">Bạc</option>
                <option value="Vàng">Vàng</option>
                <option value="Kim cương">Kim cương</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeForm" class="btn btn-secondary">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Đang xử lý...' : (editingCustomer ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading spinner -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Bảng danh sách khách hàng -->
      <div class="table-container">
        <table class="customer-table">
          <thead>
            <tr>
              <th @click="sortBy('maKH')" class="sortable">
                Mã KH <i class="fas fa-sort"></i>
              </th>
              <th @click="sortBy('hoTen')" class="sortable">
                Họ và tên <i class="fas fa-sort"></i>
              </th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Loại KH</th>
              <th>Điểm tích lũy</th>
              <th>Ngày đăng ký</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedCustomers.length === 0 && !loading">
              <td colspan="9" class="no-data">Không có dữ liệu</td>
            </tr>
            <tr v-for="customer in paginatedCustomers" :key="customer.maKH">
              <td>{{ customer.maKH }}</td>
              <td>{{ customer.hoTen }}</td>
              <td>{{ customer.nguoiDung && customer.nguoiDung.email ? customer.nguoiDung.email : 'Chưa có' }}</td>
              <td>{{ customer.sdt || 'Chưa có' }}</td>
              <td>{{ customer.diaChi || 'Chưa có' }}</td>
              <td>
                <span :class="['status', getCustomerTypeClass(customer.loaiKhachHang)]">
                  {{ customer.loaiKhachHang }}
                </span>
              </td>
              <td>{{ customer.diemTichLuy || 0 }}</td>
              <td>{{ formatDateTime(customer.ngayDangKy) }}</td>
              <td class="actions">
                <button @click="editCustomer(customer)" class="btn-action btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteCustomer(customer.maKH)" class="btn-action btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Phân trang -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="btn btn-pagination"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn btn-pagination"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        
        <span class="page-info">
          Trang {{ currentPage }} / {{ totalPages }} 
          ({{ filteredCustomers.length }} khách hàng)
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn btn-pagination"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="btn btn-pagination"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>

      <!-- Thông báo -->
      <div v-if="notification.show" :class="['notification', notification.type]">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ notification.message }}
      </div>
    </div>
    <AdminFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'

// API base URL
const API_BASE_URL = 'http://localhost:8080/api/khachhang'

// Dữ liệu reactive
const customers = ref([])
const showAddForm = ref(false)
const showRegisterForm = ref(false)
const editingCustomer = ref(null)
const searchTerm = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('maKH')
const sortDirection = ref('asc')
const loading = ref(false)
const registerLoading = ref(false)

const form = ref({
  maKH: '',
  hoTen: '',
  sdt: '',
  diaChi: '',
  ngaySinh: '',
  diemTichLuy: 0,
  loaiKhachHang: 'Thường'
})

const registerForm = ref({
  email: '',
  matKhau: '',
  hoTen: '',
  sdt: '',
  diaChi: ''
})

const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

// Code Generation Methods
const generateCustomerCode = () => {
  // Tạo mã theo format KH + 8 ký tự ngẫu nhiên (giống CodeGenerator.java)
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

const generateNewCode = () => {
  form.value.maKH = generateCustomerCode()
}

// API client configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Tăng timeout lên 15s
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Function to get authenticated headers
const getAuthenticatedHeaders = async () => {
  try {
    const { getAuthHeaders } = await import('../api.js')
    return await getAuthHeaders()
  } catch (error) {
    console.error('Error getting auth headers:', error)
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
}

// Interceptor xử lý response tốt hơn
apiClient.interceptors.request.use(
  config => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    if (config.data) {
      console.log('📤 Request data:', config.data)
    }
    return config
  },
  error => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    console.log('📥 Response data:', response.data)
    return response
  },
  error => {
    console.error('❌ API Error:', error)
    
    if (error.code === 'ECONNABORTED') {
      showNotification('Timeout: Không thể kết nối đến server. Vui lòng kiểm tra server có đang chạy không?', 'error')
    } else if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || `Lỗi HTTP ${status}`
      console.error(`❌ HTTP ${status}:`, message)
      showNotification(`Lỗi ${status}: ${message}`, 'error')
    } else if (error.request) {
      console.error('❌ Network error:', error.request)
      showNotification('Lỗi mạng: Không thể kết nối đến server. Kiểm tra server có chạy trên port 8080?', 'error')
    } else {
      console.error('❌ Unknown error:', error.message)
      showNotification('Lỗi không xác định: ' + error.message, 'error')
    }
    
    return Promise.reject(error)
  }
)

// API calls với endpoint chính xác
const fetchCustomers = async () => {
  try {
    loading.value = true
    console.log('🔍 Fetching customers from:', API_BASE_URL)
    
    // Get authenticated headers
    const headers = await getAuthenticatedHeaders()
    console.log('🔐 Using authenticated headers:', headers)
    
    // Gọi đúng endpoint (không có trailing slash vì backend là @GetMapping)
    const response = await apiClient.get('', { headers })
    
    console.log('📊 Response status:', response.status)
    console.log('📊 Response data type:', typeof response.data)
    console.log('📊 Response data:', response.data)
    
    // Kiểm tra response data format
    if (Array.isArray(response.data)) {
      customers.value = response.data
      console.log(`✅ Loaded ${customers.value.length} customers successfully`)
    } else {
      console.warn('⚠️ Response data is not an array:', response.data)
      customers.value = []
      showNotification('Dữ liệu trả về không đúng định dạng', 'error')
    }
    
  } catch (error) {
    console.error('❌ Error fetching customers:', error)
    customers.value = []
    // Error đã được xử lý trong interceptor
  } finally {
    loading.value = false
  }
}

const createCustomer = async (customerData) => {
  try {
    console.log('➕ Creating customer:', customerData)
    const headers = await getAuthenticatedHeaders()
    const response = await apiClient.post('', customerData, { headers }) // Endpoint chính xác
    return response.data
  } catch (error) {
    console.error('❌ Error creating customer:', error)
    throw error
  }
}

const updateCustomer = async (id, customerData) => {
  try {
    console.log(`🔄 Updating customer ${id}:`, customerData)
    const headers = await getAuthenticatedHeaders()
    const response = await apiClient.put(`/${id}`, customerData, { headers })
    return response.data
  } catch (error) {
    console.error('❌ Error updating customer:', error)
    throw error
  }
}

const deleteCustomerApi = async (id) => {
  try {
    console.log(`🗑️ Deleting customer: ${id}`)
    const headers = await getAuthenticatedHeaders()
    await apiClient.delete(`/${id}`, { headers })
    return true
  } catch (error) {
    console.error('❌ Error deleting customer:', error)
    throw error
  }
}

const registerCustomerAccount = async (registrationData) => {
  try {
    console.log('📝 Registering customer account:', registrationData)
    const headers = await getAuthenticatedHeaders()
    const response = await apiClient.post('/register', registrationData, { headers })
    return response.data
  } catch (error) {
    console.error('❌ Error registering customer:', error)
    throw error
  }
}

// Computed properties với better error handling
const filteredCustomers = computed(() => {
  if (!Array.isArray(customers.value)) {
    console.warn('⚠️ customers.value is not an array:', customers.value)
    return []
  }

  let filtered = [...customers.value] // Create copy to avoid mutation

  // Lọc theo từ khóa tìm kiếm
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase().trim()
    filtered = filtered.filter(customer => {
      if (!customer) return false
      
      const hoTen = customer.hoTen?.toLowerCase() || ''
      const email = customer.nguoiDung && customer.nguoiDung.email ? customer.nguoiDung.email.toLowerCase() : ''
      const sdt = customer.sdt || ''
      const maKH = customer.maKH?.toLowerCase() || ''
      
      return hoTen.includes(term) || 
             email.includes(term) || 
             sdt.includes(term) || 
             maKH.includes(term)
    })
  }

  // Lọc theo trạng thái
  if (statusFilter.value !== '') {
    const isDeleted = statusFilter.value === 'true'
    filtered = filtered.filter(customer => Boolean(customer.isDeleted) === isDeleted)
  }

  // Sắp xếp
  filtered.sort((a, b) => {
    if (!a || !b) return 0
    
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]
    
    // Handle null/undefined values
    if (aVal == null) aVal = ''
    if (bVal == null) bVal = ''
    
    // Convert to string for comparison
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal?.toString().toLowerCase() || ''
    }
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredCustomers.value.length / itemsPerPage.value)
})

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCustomers.value.slice(start, end)
})

// Methods với better error handling
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  console.log(`📢 Notification (${type}): ${message}`)
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

const resetForm = () => {
  form.value = {
    maKH: generateCustomerCode(), // Tự động sinh mã mới
    hoTen: '',
    sdt: '',
    diaChi: '',
    ngaySinh: '',
    diemTichLuy: 0,
    loaiKhachHang: 'Thường'
  }
}

const resetRegisterForm = () => {
  registerForm.value = {
    email: '',
    matKhau: '',
    hoTen: '',
    sdt: '',
    diaChi: ''
  }
}

const closeForm = () => {
  showAddForm.value = false
  editingCustomer.value = null
  resetForm()
}

const closeRegisterForm = () => {
  showRegisterForm.value = false
  resetRegisterForm()
}

const refreshData = async () => {
  console.log('🔄 Refreshing data...')
  await fetchCustomers()
  showNotification('Dữ liệu đã được làm mới!')
}

// Submit form với validation tốt hơn
const submitForm = async () => {
  try {
    loading.value = true
    
    // Validation cơ bản
    if (!form.value.hoTen?.trim()) {
      showNotification('Họ tên không được để trống', 'error')
      return
    }
    
    // Chuẩn bị dữ liệu
    const customerData = {
      hoTen: form.value.hoTen.trim(),
      sdt: form.value.sdt?.trim() || null,
      diaChi: form.value.diaChi?.trim() || null,
      ngaySinh: form.value.ngaySinh || null,
      diemTichLuy: parseInt(form.value.diemTichLuy) || 0,
      loaiKhachHang: form.value.loaiKhachHang || 'Thường',
      isDeleted: false
    }

    if (editingCustomer.value) {
      // Cập nhật khách hàng
      customerData.maKH = editingCustomer.value.maKH
      const updated = await updateCustomer(editingCustomer.value.maKH, customerData)
      
      // Cập nhật trong danh sách local
      const index = customers.value.findIndex(c => c.maKH === editingCustomer.value.maKH)
      if (index !== -1) {
        customers.value[index] = updated
      }
      
      showNotification('Cập nhật khách hàng thành công!')
    } else {
      // Thêm khách hàng mới
      if (form.value.maKH?.trim()) {
        customerData.maKH = form.value.maKH.trim()
      }
      
      const newCustomer = await createCustomer(customerData)
      customers.value.unshift(newCustomer) // Thêm vào đầu danh sách
      showNotification('Thêm khách hàng thành công!')
    }
    
    closeForm()
  } catch (error) {
    console.error('❌ Error submitting form:', error)
    // Error message đã được xử lý trong interceptor
  } finally {
    loading.value = false
  }
}

// Submit register form với error handling tốt hơn
const submitRegisterForm = async () => {
  try {
    registerLoading.value = true
    
    // Validation cơ bản
    if (!registerForm.value.email?.trim()) {
      showNotification('Email không được để trống', 'error')
      return
    }
    if (!registerForm.value.matKhau || registerForm.value.matKhau.length < 6) {
      showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error')
      return
    }
    if (!registerForm.value.hoTen?.trim()) {
      showNotification('Họ tên không được để trống', 'error')
      return
    }
    if (!registerForm.value.sdt?.trim()) {
      showNotification('Số điện thoại không được để trống', 'error')
      return
    }
    
    const response = await registerCustomerAccount(registerForm.value)
    
    // Xử lý response từ backend
    if (response && response.success) {
      showNotification(response.message || 'Đăng ký tài khoản thành công!')
      
      // Thêm khách hàng mới vào danh sách
      if (response.customer) {
        customers.value.unshift(response.customer)
      }
      
      closeRegisterForm()
      
      // Hiển thị thông tin đăng nhập
      setTimeout(() => {
        showNotification(`Có thể đăng nhập bằng email: ${registerForm.value.email}`, 'success')
      }, 1000)
    } else {
      showNotification(response?.message || 'Đăng ký không thành công', 'error')
    }
    
  } catch (error) {
    console.error('❌ Error registering customer:', error)
    
    if (error.response?.data?.errors) {
      // Hiển thị lỗi validation chi tiết
      const errors = error.response.data.errors
      const errorMessages = Object.values(errors).join(', ')
      showNotification(`Lỗi: ${errorMessages}`, 'error')
    } else if (error.response?.data?.message) {
      showNotification(error.response.data.message, 'error')
    }
    // Các lỗi khác đã được xử lý trong interceptor
  } finally {
    registerLoading.value = false
  }
}

const editCustomer = (customer) => {
  console.log('✏️ Editing customer:', customer)
  editingCustomer.value = customer
  form.value = {
    maKH: customer.maKH,
    hoTen: customer.hoTen || '',
    sdt: customer.sdt || '',
    diaChi: customer.diaChi || '',
    ngaySinh: customer.ngaySinh || '',
    diemTichLuy: customer.diemTichLuy || 0,
    loaiKhachHang: customer.loaiKhachHang || 'Thường'
  }
  showAddForm.value = false
}

const deleteCustomer = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
    try {
      loading.value = true
      await deleteCustomerApi(id)
      
      // Xóa khỏi danh sách local
      const index = customers.value.findIndex(c => c.maKH === id)
      if (index !== -1) {
        customers.value.splice(index, 1)
      }
      
      showNotification('Xóa khách hàng thành công!')
      
      // Điều chỉnh trang hiện tại nếu cần
      if (paginatedCustomers.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    } catch (error) {
      console.error('❌ Error deleting customer:', error)
      // Error đã được xử lý trong interceptor
    } finally {
      loading.value = false
    }
  }
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

// Format datetime tốt hơn
const formatDateTime = (dateTime) => {
  if (!dateTime) return 'Chưa có'
  
  try {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) return 'Ngày không hợp lệ'
    
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('❌ Error formatting date:', error)
    return 'Lỗi định dạng'
  }
}

const getCustomerTypeClass = (type) => {
  const typeClasses = {
    'Thường': 'normal',
    'VIP': 'vip',
    'Bạc': 'silver',
    'Vàng': 'gold',
    'Kim cương': 'diamond'
  }
  return typeClasses[type] || 'normal'
}

// Khởi tạo với error handling
onMounted(async () => {
  console.log('🚀 Component mounted, initializing...')
  
  // Test connection trước
  try {
    console.log('🔗 Testing server connection...')
    const headers = await getAuthenticatedHeaders()
    await apiClient.get('/health', { headers }) // Test endpoint nếu có
    console.log('✅ Server connection OK')
  } catch (error) {
    console.warn('⚠️ Health check failed, but continuing...')
  }
  
  // Load dữ liệu
  await fetchCustomers()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.back-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
  transform: translateX(-3px);
}

.back-text {
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.back-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.back-btn:hover .back-shine {
  left: 100%;
}

.header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.add-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 80px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255,255,255,0.2);
}

.customer-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-group textarea {
  resize: vertical;
  height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-group {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 48px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.filter-select {
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  min-width: 180px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 24px;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}

.customer-table th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.customer-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.customer-table th.sortable:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.customer-table th i {
  margin-left: 8px;
  opacity: 0.6;
}

.customer-table td {
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.customer-table tr:hover {
  background-color: #f8f9fa;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-edit {
  background: #17a2b8;
  color: white;
}

.btn-edit:hover {
  background: #138496;
  transform: translateY(-2px);
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.btn-pagination {
  padding: 10px 16px;
  border: 2px solid #e1e5e9;
  background: white;
  color: #495057;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pagination:hover:not(:disabled) {
  border-color: #4facfe;
  color: #4facfe;
  transform: translateY(-2px);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 10px 20px;
  background: white;
  border-radius: 8px;
  font-weight: 500;
  color: #495057;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.notification.error {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Code Input Group */
.code-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.code-input-group .form-input {
  flex: 1;
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.regenerate-btn {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  font-size: 1rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.regenerate-btn:hover {
  background: #e2e8f0;
  color: #475569;
  border-color: #cbd5e1;
  transform: scale(1.05);
}

.form-help {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 4px;
  font-style: italic;
}

/* Form Inputs */
.form-input, .form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn, .save-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.save-btn {
  background: #3b82f6;
  color: white;
}

.save-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Confirmation Modal */
.confirm-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 400px;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.confirm-modal h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.confirm-modal p {
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-actions .cancel-btn,
.confirm-actions .delete-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.confirm-actions .cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.confirm-actions .delete-btn {
  background: #dc2626;
  color: white;
  border: none;
}

.confirm-actions .delete-btn:hover {
  background: #b91c1c;
}

/* Loading States */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
}

/* Status Badges */
.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status.normal {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #60a5fa;
}

.status.vip {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.status.silver {
  background: #e5e7eb;
  color: #374151;
  border: 1px solid #9ca3af;
}

.status.gold {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.status.diamond {
  background: #e0e7ff;
  color: #6366f1;
  border: 1px solid #a5b4fc;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 16px 0;
  }
  
  .header h2 {
    font-size: 1.5rem;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .search-box {
    max-width: none;
  }
  
  .customer-table {
    font-size: 12px;
  }
  
  .customer-table th,
  .customer-table td {
    padding: 8px;
  }
  
  .modal {
    width: 95%;
    margin: 10px;
  }
  
  .customer-form {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .code-input-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .regenerate-btn {
    width: 100%;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .customer-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .page-info {
    order: -1;
    width: 100%;
    text-align: center;
  }
}
</style>