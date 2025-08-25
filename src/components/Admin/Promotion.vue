<template>
  <div class="promotion-management-container">
    <AdminHeader />
    <!-- Header Section -->
    <div class="header">
              <router-link to="/home" class="back-btn">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"/>
          <path d="m12 19-7-7 7-7"/>
        </svg>
        <span class="back-text">Trang chủ</span>
        <div class="back-shine"></div>
      </router-link>
      <h2>Quản lý chương trình khuyến mãi</h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchPromotions" class="retry-btn">Thử lại</button>
    </div>

    <div v-if="!loading && !error">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">📊</div>
          <div class="stat-info">
            <h3>{{ promotions.length }}</h3>
            <p>Tổng khuyến mãi</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active">🎯</div>
          <div class="stat-info">
            <h3>{{ activePromotions }}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon upcoming">⏰</div>
          <div class="stat-info">
            <h3>{{ upcomingPromotions }}</h3>
            <p>Sắp diễn ra</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon expired">💸</div>
          <div class="stat-info">
            <h3>{{ expiredPromotions }}</h3>
            <p>Đã kết thúc</p>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-filter-group">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm khuyến mãi..." 
              v-model="searchQuery"
              class="form-input"
            >
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">×</button>
          </div>
          <select v-model="statusFilter" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="expired">Đã kết thúc</option>
            <option value="paused">Tạm dừng</option>
          </select>
        </div>
        <div class="toolbar-actions">
          <button @click="openAddModal" class="add-btn">
            + Thêm khuyến mãi mới
          </button>
        </div>
      </div>

      <!-- Promotions Table -->
      <div class="table-container">
        <table class="promotion-table" v-if="filteredPromotions.length > 0">
          <thead>
            <tr>
              <th class="table-header">Mã coupon</th>
              <th class="table-header">Tên chương trình</th>
              <th class="table-header">Loại & Giá trị</th>
              <th class="table-header">Số lượng</th>
              <th class="table-header">Thời gian</th>
              <th class="table-header">Trạng thái</th>
              <th class="table-header">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in filteredPromotions" :key="promo.maKM" class="promotion-row">
              <td class="promotion-id">
                <div class="id-container">
                  <div class="coupon-id">{{ promo.couponCode }}</div>
                </div>
              </td>
              <td class="promotion-info">
                <div class="promotion-name">{{ promo.tenChuongTrinh }}</div>
                <div class="promotion-description" v-if="promo.moTa">{{ promo.moTa }}</div>
              </td>
              <td class="type-value-cell">
                <div class="type-badge">{{ promo.loaiKM }}</div>
                <div class="value-badge">{{ formatDiscount(promo) }}</div>
              </td>
              <td class="quantity-cell">
                <div class="quantity-main">{{ promo.soLuongToiDa || 'Không giới hạn' }}</div>
                <div class="used-count" v-if="promo.soLuongToiDa">(Đã dùng: {{ promo.daSuDung || 0 }})</div>
              </td>
              <td class="time-cell">
                <div class="time-item">
                  <span class="time-label">Bắt đầu:</span>
                  <span class="time-value">{{ formatDate(promo.ngayBatDau) }}</span>
                </div>
                <div class="time-item">
                  <span class="time-label">Kết thúc:</span>
                  <span class="time-value">{{ formatDate(promo.ngayKetThuc) }}</span>
                </div>
              </td>
              <td class="status-cell">
                <span :class="['status-badge', getStatusClass(promo)]">
                  {{ getStatusText(promo) }}
                </span>
              </td>
              <td class="action-buttons">
                <button @click="viewPromotion(promo)" class="view-btn" title="Xem chi tiết">👁</button>
                <button @click="editPromotion(promo)" class="edit-btn" title="Chỉnh sửa">✏</button>
                <button @click="deletePromotion(promo)" class="delete-btn" title="Xóa">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- No Data State -->
        <div v-else class="no-data">
          <div class="no-data-icon">📋</div>
          <p>Không tìm thấy khuyến mãi nào</p>
        </div>
      </div>
    </div>

    <!-- View Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết khuyến mãi {{ selectedPromo.couponCode }}</h3>
          <button @click="closeDetailModal" class="close-btn">×</button>
        </div>
        
        <div class="promotion-detail-content">
          <div class="detail-section">
            <h4>Thông tin cơ bản</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Tên chương trình</label>
                <span>{{ selectedPromo.tenChuongTrinh }}</span>
              </div>
              <div class="detail-item">
                <label>Mã khuyến mãi (ID)</label>
                <span class="detail-id">{{ selectedPromo.maKM }}</span>
              </div>
              <div class="detail-item">
                <label>Mã coupon</label>
                <span class="detail-coupon">{{ selectedPromo.couponCode }}</span>
              </div>
              <div class="detail-item">
                <label>Loại khuyến mãi</label>
                <span>{{ selectedPromo.loaiKM }}</span>
              </div>
              <div class="detail-item">
                <label>Giá trị</label>
                <span class="discount-value">{{ formatDiscount(selectedPromo) }}</span>
              </div>
              <div class="detail-item">
                <label>Số lượng tối đa</label>
                <span>{{ selectedPromo.soLuongToiDa || 'Không giới hạn' }}</span>
              </div>
              <div class="detail-item">
                <label>Đã sử dụng</label>
                <span>{{ selectedPromo.daSuDung || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Thời gian áp dụng</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Ngày bắt đầu</label>
                <span>{{ formatDateTime(selectedPromo.ngayBatDau) }}</span>
              </div>
              <div class="detail-item">
                <label>Ngày kết thúc</label>
                <span>{{ formatDateTime(selectedPromo.ngayKetThuc) }}</span>
              </div>
              <div class="detail-item">
                <label>Thời gian</label>
                <span>{{ calculateDuration(selectedPromo) }} ngày</span>
              </div>
              <div class="detail-item">
                <label>Trạng thái</label>
                <span :class="['status-badge', getStatusClass(selectedPromo)]">
                  {{ getStatusText(selectedPromo) }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Mô tả và điều kiện</h4>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>Mô tả</label>
                <span>{{ selectedPromo.moTa || 'Không có mô tả' }}</span>
              </div>
              <div class="detail-item full-width">
                <label>Điều kiện áp dụng</label>
                <span>{{ selectedPromo.dieuKienApDung || 'Không có điều kiện đặc biệt' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="savePromotion" class="modal-form">
          <div class="form-section">
            <h4>Thông tin cơ bản</h4>
            
            <div class="form-group" v-if="isEditing">
              <label>Mã khuyến mãi (ID)</label>
              <input 
                type="text" 
                v-model="currentPromo.maKM" 
                readonly
                class="form-input readonly"
              >
            </div>

            <div class="form-group">
              <label>Tên chương trình *</label>
              <input 
                type="text" 
                v-model="currentPromo.tenChuongTrinh" 
                required 
                class="form-input"
                placeholder="Nhập tên chương trình khuyến mãi"
              >
            </div>

            <div class="form-group" v-if="!isEditing">
              <label>Mã khuyến mãi (ID) *</label>
              <div class="code-input-group">
                <input 
                  type="text" 
                  v-model="currentPromo.maKM" 
                  required 
                  class="form-input"
                  placeholder="Mã ID sẽ được tự động sinh"
                  readonly
                >
                <button 
                  type="button" 
                  @click="generateNewCode" 
                  class="regenerate-btn"
                  title="Sinh lại mã mới"
                >
                  🔄
                </button>
              </div>
              <small class="form-help">Mã khuyến mãi (ID) được tự động sinh theo định dạng KM + 8 ký tự ngẫu nhiên</small>
            </div>

            <div class="form-group" v-if="!isEditing">
              <label>Mã coupon *</label>
              <div class="code-input-group">
                <input 
                  type="text" 
                  v-model="currentPromo.couponCode" 
                  required 
                  class="form-input"
                  placeholder="Mã coupon sẽ được tự động sinh"
                  readonly
                >
                <button 
                  type="button" 
                  @click="generateNewCouponCode" 
                  class="regenerate-btn"
                  title="Sinh lại mã coupon mới"
                >
                  🔄
                </button>
              </div>
              <small class="form-help">Mã coupon được tự động sinh theo định dạng KM + 8 ký tự ngẫu nhiên</small>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Loại khuyến mãi *</label>
                <select v-model="currentPromo.loaiKM" required class="form-input">
                  <option value="">Chọn loại khuyến mãi</option>
                  <option value="PhầnTrăm">Phần trăm (%)</option>
                  <option value="SốTiền">Số tiền (VNĐ)</option>
                  <option value="Điểm">Điểm thưởng</option>
                  <option value="MuaXTangY">Mua X tặng Y</option>
                </select>
              </div>
              <div class="form-group">
                <label>Giá trị khuyến mãi *</label>
                <input 
                  type="number" 
                  v-model="currentPromo.giaTriKM" 
                  min="0"
                  step="0.01"
                  required 
                  class="form-input"
                  :placeholder="getValuePlaceholder(currentPromo.loaiKM)"
                >
              </div>
            </div>

            <div class="form-group">
              <label>Số lượng tối đa</label>
              <input 
                type="number" 
                v-model="currentPromo.soLuongToiDa" 
                min="1"
                class="form-input"
                placeholder="Để trống nếu không giới hạn"
              >
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="currentPromo.moTa"
                class="form-input"
                rows="3"
                placeholder="Mô tả chi tiết về chương trình khuyến mãi"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Điều kiện áp dụng</label>
              <textarea 
                v-model="currentPromo.dieuKienApDung"
                class="form-input"
                rows="2"
                placeholder="Điều kiện để áp dụng khuyến mãi (ví dụ: Hóa đơn từ 500,000 VNĐ)"
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <h4>Thời gian áp dụng</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Ngày bắt đầu *</label>
                <input 
                  type="datetime-local" 
                  v-model="currentPromo.ngayBatDau" 
                  required 
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label>Ngày kết thúc *</label>
                <input 
                  type="datetime-local" 
                  v-model="currentPromo.ngayKetThuc" 
                  required 
                  class="form-input"
                >
              </div>
            </div>

            <!-- Date Adjustment Controls -->
            <div class="date-controls">
              <h5>Điều chỉnh thời gian khuyến mãi</h5>
              <div class="date-adjustment">
                <button type="button" @click="adjustDays(-7)" class="adjust-btn">-7 ngày</button>
                <button type="button" @click="adjustDays(-1)" class="adjust-btn">-1 ngày</button>
                <span class="duration-display">
                  Thời gian: {{ calculateCurrentPromoDuration() }} ngày
                </span>
                <button type="button" @click="adjustDays(1)" class="adjust-btn">+1 ngày</button>
                <button type="button" @click="adjustDays(7)" class="adjust-btn">+7 ngày</button>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Trạng thái</h4>
            <div class="form-group">
              <label>Trạng thái hoạt động</label>
              <select v-model="currentPromo.trangThai" class="form-input">
                <option :value="1">Đang áp dụng</option>
                <option :value="0">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn" :disabled="saving">Hủy</button>
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="confirm-icon">🗑️</div>
        <h3>Xác nhận xóa</h3>
        <p>Bạn có chắc chắn muốn xóa chương trình khuyến mãi này không? Hành động này không thể hoàn tác.</p>
        <div class="confirm-actions">
          <button @click="closeDeleteModal" class="cancel-btn" :disabled="deleting">Hủy</button>
          <button @click="confirmDelete" class="delete-btn" :disabled="deleting">
            {{ deleting ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </div>
    </div>
    <AdminFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'

// API base URL - thay đổi theo môi trường của bạn
const API_BASE_URL = 'http://localhost:8080/api/khuyenmai'

// Reactive data
const promotions = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const currentPromo = ref({})
const selectedPromo = ref({})
const deleteId = ref(null)

// Loading states
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')

// Code Generation Methods
const generatePromotionCode = () => {
  // Tạo mã theo format KM + 8 ký tự ngẫu nhiên (giống CodeGenerator.java)
  const prefix = 'KM'
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
  currentPromo.value.maKM = generatePromotionCode()
}

const generateNewCouponCode = () => {
  currentPromo.value.couponCode = generatePromotionCode()
}

// API methods
async function fetchPromotions() {
  loading.value = true
  error.value = ''
  try {
    console.log('Fetching promotions from:', API_BASE_URL)
    const response = await fetch(API_BASE_URL)
    
    console.log('Fetch response status:', response.status)
    console.log('Fetch response headers:', response.headers)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Fetch error response:', errorText)
      
      if (response.status === 404) {
        error.value = 'API endpoint không tồn tại. Vui lòng kiểm tra URL API.'
      } else if (response.status === 500) {
        error.value = 'Lỗi server. Vui lòng kiểm tra backend.'
      } else {
        error.value = `Lỗi HTTP ${response.status}: ${errorText}`
      }
      return
    }
    
    const data = await response.json()
    console.log('Fetched promotions:', data)
    console.log('Type of data:', typeof data)
    console.log('Is array:', Array.isArray(data))
    
    if (Array.isArray(data)) {
      // Kiểm tra từng item trong array
      data.forEach((promo, index) => {
        console.log(`Promo ${index}:`, promo)
        console.log(`Promo ${index} maKM:`, promo.maKM, typeof promo.maKM)
        console.log(`Promo ${index} couponCode:`, promo.couponCode, typeof promo.couponCode)
      })
      
      promotions.value = data
      console.log(`Đã tải ${data.length} khuyến mãi`)
    } else {
      console.error('API response is not an array:', data)
      error.value = 'Dữ liệu API không đúng định dạng'
    }
  } catch (err) {
    console.error('Error fetching promotions:', err)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      error.value = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.'
    } else {
      error.value = `Không thể tải dữ liệu khuyến mãi: ${err.message}`
    }
  } finally {
    loading.value = false
  }
}

async function createPromotion(promotionData) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promotionData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const newPromotion = await response.json()
    return newPromotion
  } catch (err) {
    console.error('Error creating promotion:', err)
    throw err
  }
}

async function updatePromotion(id, promotionData) {
  try {
    console.log(`Updating promotion with ID: ${id}`)
    console.log('Request URL:', `${API_BASE_URL}/${id}`)
    console.log('Request data:', promotionData)
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promotionData)
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    const updatedPromotion = await response.json()
    console.log('Update successful:', updatedPromotion)
    return updatedPromotion
  } catch (err) {
    console.error('Error updating promotion:', err)
    throw err
  }
}

async function deletePromotionAPI(id) {
  try {
    console.log(`Deleting promotion with ID: ${id}`)
    console.log('Delete URL:', `${API_BASE_URL}/${id}`)
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    })
    
    console.log('Delete response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Delete error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
    
    return true
  } catch (err) {
    console.error('Error deleting promotion:', err)
    throw err
  }
}

// Computed properties
const filteredPromotions = computed(() => {
  let filtered = promotions.value.filter(promo =>
    promo.tenChuongTrinh.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (statusFilter.value) {
    filtered = filtered.filter(promo => getPromoStatus(promo) === statusFilter.value)
  }

  return filtered
})

const activePromotions = computed(() => {
  return promotions.value.filter(promo => getPromoStatus(promo) === 'active').length
})

const upcomingPromotions = computed(() => {
  return promotions.value.filter(promo => getPromoStatus(promo) === 'upcoming').length
})

const expiredPromotions = computed(() => {
  return promotions.value.filter(promo => getPromoStatus(promo) === 'expired').length
})

// Utility methods
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A'
  const date = new Date(dateTimeString)
  return date.toLocaleString('vi-VN')
}

function formatDate(dateTimeString) {
  if (!dateTimeString) return 'N/A'
  const date = new Date(dateTimeString)
  return date.toLocaleDateString('vi-VN')
}

function formatDiscount(promo) {
  if (!promo.giaTriKM) return 'N/A'
  
  switch (promo.loaiKM) {
    case 'PhầnTrăm':
      return `${promo.giaTriKM}%`
    case 'SốTiền':
      return `${Number(promo.giaTriKM).toLocaleString('vi-VN')} VNĐ`
    case 'Điểm':
      return `${promo.giaTriKM} điểm`
    case 'MuaXTangY':
      return `Mua ${promo.giaTriKM} tặng Y`
    default:
      return promo.giaTriKM
  }
}

function getPromoStatus(promo) {
  if (promo.trangThai === 0) return 'paused'
  
  const today = new Date()
  const start = new Date(promo.ngayBatDau)
  const end = new Date(promo.ngayKetThuc)

  if (today < start) return 'upcoming'
  if (today > end) return 'expired'
  return 'active'
}

function getStatusClass(promo) {
  return getPromoStatus(promo)
}

function getStatusText(promo) {
  const status = getPromoStatus(promo)
  const statusMap = {
    active: 'Đang hoạt động',
    upcoming: 'Sắp diễn ra',
    expired: 'Đã kết thúc',
    paused: 'Tạm dừng'
  }
  return statusMap[status] || 'Không xác định'
}

function getValuePlaceholder(type) {
  switch (type) {
    case 'PhầnTrăm':
      return 'Ví dụ: 10 (cho 10%)'
    case 'SốTiền':
      return 'Ví dụ: 50000 (cho 50,000 VNĐ)'
    case 'Điểm':
      return 'Ví dụ: 100 (cho 100 điểm)'
    case 'MuaXTangY':
      return 'Ví dụ: 2 (mua 2 tặng Y)'
    default:
      return 'Nhập giá trị'
  }
}

function clearSearch() {
  searchQuery.value = ''
}

function viewPromotion(promo) {
  selectedPromo.value = { ...promo }
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedPromo.value = {}
}

function openAddModal() {
  currentPromo.value = {
    maKM: generatePromotionCode(), // Tạo maKM mới
    tenChuongTrinh: '',
    couponCode: generatePromotionCode(), // Tự động sinh mã mới
    loaiKM: '',
    giaTriKM: '',
    soLuongToiDa: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    moTa: '',
    dieuKienApDung: '',
    trangThai: 1
  }
  isEditing.value = false
  showModal.value = true
}

function editPromotion(promo) {
  console.log('Editing promotion:', promo)
  
  currentPromo.value = { ...promo }
  
  // Convert datetime to local format for input
  if (promo.ngayBatDau) {
    currentPromo.value.ngayBatDau = new Date(promo.ngayBatDau).toISOString().slice(0, 16)
  }
  if (promo.ngayKetThuc) {
    currentPromo.value.ngayKetThuc = new Date(promo.ngayKetThuc).toISOString().slice(0, 16)
  }
  
  // Đảm bảo có maKM để cập nhật
  if (!currentPromo.value.maKM) {
    console.error('No maKM found for editing:', promo)
    alert('Không tìm thấy mã khuyến mãi để chỉnh sửa')
    return
  }
  
  // Log thông tin để debug
  console.log('Current promo for editing:', currentPromo.value)
  console.log('maKM:', currentPromo.value.maKM)
  console.log('couponCode:', currentPromo.value.couponCode)
  
  isEditing.value = true
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  currentPromo.value = {}
}

async function savePromotion() {
  saving.value = true
  error.value = ''
  try {
    // Prepare data for API
    const promotionData = {
      maKM: currentPromo.value.maKM, // Thêm maKM
      tenChuongTrinh: currentPromo.value.tenChuongTrinh,
      couponCode: currentPromo.value.couponCode.toUpperCase(),
      loaiKM: currentPromo.value.loaiKM,
      giaTriKM: parseFloat(currentPromo.value.giaTriKM),
      soLuongToiDa: currentPromo.value.soLuongToiDa ? parseInt(currentPromo.value.soLuongToiDa) : null,
      ngayBatDau: new Date(currentPromo.value.ngayBatDau).toISOString(),
      ngayKetThuc: new Date(currentPromo.value.ngayKetThuc).toISOString(),
      moTa: currentPromo.value.moTa,
      dieuKienApDung: currentPromo.value.dieuKienApDung,
      trangThai: currentPromo.value.trangThai,
      daSuDung: currentPromo.value.daSuDung || 0
    }

    if (isEditing.value) {
      // Sử dụng maKM để cập nhật
      const updateId = currentPromo.value.maKM
      if (!updateId) {
        throw new Error('Không tìm thấy mã khuyến mãi để cập nhật')
      }
      
      console.log('Updating promotion with maKM:', updateId)
      console.log('Update data:', promotionData)
      
      await updatePromotion(updateId, promotionData)
    } else {
      console.log('Creating new promotion with data:', promotionData)
      await createPromotion(promotionData)
    }

    // Refresh data
    await fetchPromotions()
    closeModal()
    
    // Hiển thị thông báo thành công
    if (isEditing.value) {
      alert('Cập nhật khuyến mãi thành công!')
    } else {
      alert('Thêm khuyến mãi mới thành công!')
    }
    
  } catch (err) {
    console.error('Error saving promotion:', err)
    error.value = isEditing.value 
      ? `Không thể cập nhật khuyến mãi: ${err.message}` 
      : `Không thể tạo khuyến mãi mới: ${err.message}`
    
    // Hiển thị lỗi chi tiết hơn
    if (err.message.includes('HTTP error')) {
      error.value += ' - Lỗi kết nối API'
    }
  } finally {
    saving.value = false
  }
}

function deletePromotion(promo) {
  console.log('deletePromotion called with:', promo)
  
  // Kiểm tra dữ liệu đầu vào
  if (!promo || typeof promo !== 'object') {
    console.error('Invalid promo data:', promo)
    alert('Dữ liệu khuyến mãi không hợp lệ')
    return
  }
  
  // Sử dụng maKM để xóa, nếu không có thì dùng couponCode
  const idToDelete = promo.maKM || promo.couponCode
  console.log('ID to delete:', idToDelete)
  console.log('promo.maKM:', promo.maKM)
  console.log('promo.couponCode:', promo.couponCode)
  
  if (!idToDelete) {
    console.error('No valid ID found in promo:', promo)
    alert('Không tìm thấy mã khuyến mãi để xóa')
    return
  }
  
  // Kiểm tra kiểu dữ liệu của ID
  if (typeof idToDelete !== 'string') {
    console.error('ID is not a string:', idToDelete, typeof idToDelete)
    alert('Mã khuyến mãi không hợp lệ')
    return
  }
  
  console.log('Setting deleteId.value to:', idToDelete)
  deleteId.value = idToDelete
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteId.value = null
}

async function confirmDelete() {
  deleting.value = true
  try {
    // Sử dụng maKM để xóa
    const idToDelete = deleteId.value
    console.log('confirmDelete - deleteId.value:', deleteId.value)
    console.log('confirmDelete - idToDelete:', idToDelete)
    
    if (!idToDelete) {
      throw new Error('Không có ID để xóa')
    }
    
    // Kiểm tra kiểu dữ liệu
    if (typeof idToDelete !== 'string') {
      throw new Error(`ID không hợp lệ: ${idToDelete} (${typeof idToDelete})`)
    }
    
    console.log('Confirming delete for ID:', idToDelete)
    
    await deletePromotionAPI(idToDelete)
    await fetchPromotions() // Refresh data
    closeDeleteModal()
    alert('Xóa khuyến mãi thành công!')
  } catch (err) {
    console.error('Error in confirmDelete:', err)
    error.value = `Không thể xóa khuyến mãi: ${err.message}`
    
    // Hiển thị lỗi chi tiết hơn
    if (err.message.includes('HTTP error')) {
      error.value += ' - Lỗi kết nối API'
    }
  } finally {
    deleting.value = false
  }
}

function adjustDays(days) {
  if (currentPromo.value.ngayKetThuc) {
    const endDate = new Date(currentPromo.value.ngayKetThuc)
    endDate.setDate(endDate.getDate() + days)
    currentPromo.value.ngayKetThuc = endDate.toISOString().slice(0, 16)
  }
}

function calculateDuration(promo) {
  if (promo.ngayBatDau && promo.ngayKetThuc) {
    const start = new Date(promo.ngayBatDau)
    const end = new Date(promo.ngayKetThuc)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }
  return 0
}

function calculateCurrentPromoDuration() {
  if (currentPromo.value.ngayBatDau && currentPromo.value.ngayKetThuc) {
    const start = new Date(currentPromo.value.ngayBatDau)
    const end = new Date(currentPromo.value.ngayKetThuc)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }
  return 0
}

// Lifecycle
onMounted(() => {
  fetchPromotions()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.promotion-management-container {
   max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.header {
  margin-bottom: 36px;
  padding: 28px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header h2 {
  color: #1e293b;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 20px 0 0 0;
  text-align: center;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced Back Button */
.back-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 28px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.back-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.back-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
  transform: translateX(-4px);
}

.back-text {
  position: relative;
  z-index: 2;
  font-weight: 700;
}

.back-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.8s ease;
}

.back-btn:hover .back-shine {
  transform: translateX(100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 28px;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon.total {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon.active {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.upcoming {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.expired {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1;
}

.stat-info p {
  color: #64748b;
  font-weight: 600;
  margin: 6px 0 0 0;
  font-size: 0.95rem;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 24px;
  background: white;
  padding: 24px 28px;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.toolbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toolbar-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-filter-group {
  display: flex;
  gap: 20px;
  align-items: center;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 350px;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  color: #1e293b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  font-size: 0.95rem;
}

.filter-select:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.add-btn {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
}

.add-btn:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  margin-bottom: 32px;
  position: relative;
}

.table-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 5;
}

.promotion-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.promotion-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e293b;
  padding: 20px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: none;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid #e2e8f0;
}

.table-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  color: #1e293b !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

.promotion-table th:first-child {
  border-top-left-radius: 16px;
}

.promotion-table th:last-child {
  border-top-right-radius: 16px;
}

.promotion-table td {
  padding: 18px 16px;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
  font-weight: 500;
  color: #334155;
  line-height: 1.5;
  background: white;
  transition: all 0.2s ease;
  position: relative;
}

.promotion-table td:first-child {
  border-left: 3px solid transparent;
}

.promotion-row:hover td:first-child {
  border-left-color: #3b82f6;
}

.promotion-table tr:last-child td {
  border-bottom: none;
}

.promotion-row {
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border-left: 3px solid transparent;
}

.promotion-row:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left-color: #3b82f6;
}

.promotion-row:hover td {
  background: #f8fafc;
}

.promotion-id {
  font-weight: 700;
  color: #3b82f6;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  min-width: 140px;
  text-align: center;
  padding: 16px 20px;
}

.id-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.coupon-id {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 10px 16px;
  border-radius: 12px;
  border: 2px solid #bfdbfe;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #3b82f6;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.coupon-id:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  border-color: #93c5fd;
}

.promotion-info {
  min-width: 250px;
  max-width: 350px;
  padding: 16px 20px;
}

.promotion-info .promotion-name {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
}

.promotion-info .promotion-name::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(to right, transparent, white);
  pointer-events: none;
}

.promotion-info .promotion-description {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
  position: relative;
}

.promotion-info .promotion-description::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(to right, transparent, white);
  pointer-events: none;
}

.type-value-cell {
  min-width: 140px;
  text-align: center;
  padding: 16px 20px;
}

.type-badge {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #475569;
  padding: 8px 16px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 8px;
  border: 2px solid #e2e8f0;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.type-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.value-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.8rem;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  border: 2px solid #34d399;
  transition: all 0.3s ease;
}

.value-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.quantity-cell {
  font-weight: 600;
  color: #334155;
  min-width: 140px;
  text-align: center;
  font-size: 0.9rem;
  padding: 16px 20px;
}

.quantity-main {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
  font-size: 0.95rem;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: inline-block;
  transition: all 0.3s ease;
}

.quantity-main:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.quantity-cell .used-count {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  font-style: italic;
  margin-top: 4px;
  display: block;
}

.time-cell {
  min-width: 160px;
  font-weight: 500;
  font-size: 0.85rem;
  text-align: center;
  line-height: 1.5;
  padding: 16px 20px;
}

.time-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.time-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.time-item:last-child {
  margin-bottom: 0;
}

.time-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-cell {
  text-align: center;
  min-width: 140px;
  padding: 16px 20px;
}

.status-badge {
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.8rem;
  display: inline-block;
  min-width: 120px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.status-badge:hover::before {
  left: 100%;
}

.status-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.status-badge.active {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  border-color: #86efac;
}

.status-badge.upcoming {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border-color: #93c5fd;
}

.status-badge.expired {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
  border-color: #fcd34d;
}

.status-badge.paused {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  color: #dc2626;
  border-color: #fca5a5;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  padding: 16px 20px;
  height: 100%;
  position: relative;
}

.action-buttons::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  height: 60%;
  background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
  opacity: 0.5;
}

.view-btn, .edit-btn, .delete-btn {
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  position: relative;
  z-index: 2;
}

.view-btn {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0369a1;
  border-color: #7dd3fc;
}

.view-btn:hover {
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(3, 105, 161, 0.3);
}

.edit-btn {
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
  color: #059669;
  border-color: #86efac;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  color: #dc2626;
  border-color: #fca5a5;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
}

/* No Data State */
.no-data {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  margin: 20px 0;
}

.no-data-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.no-data p {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #475569;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-radius: 16px;
  margin: 20px 0;
  border: 2px solid #fca5a5;
}

.error-state p {
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.retry-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 24px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid #f1f5f9;
}

.detail-modal {
  animation: modalSlideIn 0.4s ease;
}

.confirm-modal {
  background: white;
  border-radius: 24px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
  padding: 36px;
  text-align: center;
  max-width: 480px;
  width: 90%;
  animation: modalSlideIn 0.4s ease;
  border: 1px solid #f1f5f9;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 36px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 24px 24px 0 0;
  position: relative;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #475569;
  transform: scale(1.1);
  border-color: #cbd5e1;
}

/* Modal Form */
.modal-form {
  padding: 36px;
}

.form-section {
  margin-bottom: 36px;
}

.form-section h4 {
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
  position: relative;
}

.form-section h4::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
  color: #374151;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1rem;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input.readonly {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #d1d5db;
}

.form-input.readonly:focus {
  border-color: #d1d5db;
  background: #f3f4f6;
  box-shadow: none;
}

.code-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.code-input-group .form-input {
  flex: 1;
}

.regenerate-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 14px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  min-width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.regenerate-btn:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.form-help {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 6px;
  display: block;
  font-style: italic;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

/* Enhanced Date Controls */
.date-controls {
  margin-top: 28px;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.date-controls::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.date-controls h5 {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
  text-align: center;
}

.date-adjustment {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.adjust-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.adjust-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.duration-display {
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  color: #1f2937;
  border: 2px solid #e5e7eb;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Enhanced Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  padding-top: 28px;
  border-top: 2px solid #e5e7eb;
  margin-top: 36px;
}

.cancel-btn {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  border: 2px solid transparent;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
  border-color: #94a3b8;
}

.save-btn {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
}

.save-btn:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
}

/* Enhanced Confirm Modal */
.confirm-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.confirm-modal h3 {
  color: #1e293b;
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.confirm-modal p {
  color: #64748b;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0 0 28px 0;
  font-weight: 500;
}

.confirm-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.confirm-actions .cancel-btn,
.confirm-actions .delete-btn {
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 120px;
}

.confirm-actions .cancel-btn {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
}

.confirm-actions .cancel-btn:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-2px);
}

.confirm-actions .delete-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.confirm-actions .delete-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}
</style>