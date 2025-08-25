<template>
  <div>
    <AdminHeader />
    <div class="supplier-management-container">
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
        <h2>Quản lý nhà cung cấp</h2>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="loading">
        <div class="loader"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" v-if="!loading">
        <div class="stat-card">
          <div class="stat-icon active">🏢</div>
          <div class="stat-info">
            <h3>{{ supplierStats.active }}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon inactive">⏸️</div>
          <div class="stat-info">
            <h3>{{ supplierStats.inactive }}</h3>
            <p>Tạm dừng</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">📊</div>
          <div class="stat-info">
            <h3>{{ suppliers.length }}</h3>
            <p>Tổng nhà cung cấp</p>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar" v-if="!loading">
        <div class="search-filter-group">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm kiếm theo tên, email, điện thoại..." 
              class="search-input"
            />
            <button @click="clearSearch" class="clear-btn" v-if="searchQuery">✕</button>
          </div>
          <select v-model="statusFilter" class="filter-select">
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hợp tác</option>
            <option value="0">Ngừng hợp tác</option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
            <option value="date-desc">Tham gia mới nhất</option>
          </select>
        </div>
        <div class="action-buttons">
          <button @click="loadSuppliers" class="refresh-btn">🔄 Làm mới</button>
          <button @click="showAddModal = true" class="add-btn">➕ Thêm nhà cung cấp</button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="loadSuppliers" class="retry-btn">Thử lại</button>
      </div>

      <!-- Suppliers Table -->
      <div class="table-container" v-if="!loading && !error">
        <table class="supplier-table">
          <thead>
            <tr>
              <th>Mã NCC</th>
              <th>Nhà cung cấp</th>
              <th>Liên hệ</th>
              <th>Ngày hợp tác</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in filteredSuppliers" :key="supplier.maNCC" class="supplier-row">
              <td class="supplier-id">#{{ supplier.maNCC }}</td>
              <td class="supplier-info">
                <div class="supplier-name">{{ supplier.tenNCC }}</div>
                <div class="supplier-address">{{ supplier.diaChi }}</div>
              </td>
              <td class="contact-info">
                <div class="contact-email">{{ supplier.email }}</div>
                <div class="contact-phone">{{ supplier.sdt }}</div>
              </td>
              <td class="join-date">{{ formatDate(supplier.ngayHopTac) }}</td>
              <td>
                <span :class="['status-badge', supplier.trangThai === 1 ? 'active' : 'inactive']">
                  {{ supplier.trangThai === 1 ? 'Đang hợp tác' : 'Ngừng hợp tác' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewSupplierDetail(supplier)" class="view-btn" title="Xem chi tiết">
                    👁️
                  </button>
                  <button @click="editSupplier(supplier)" class="edit-btn" title="Chỉnh sửa">
                    ✏️
                  </button>
                  <button @click="deleteSupplier(supplier.maNCC)" class="delete-btn" title="Xóa nhà cung cấp">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredSuppliers.length === 0" class="no-data">
          <div class="no-data-icon">🏢</div>
          <p>{{ searchQuery || statusFilter ? 'Không tìm thấy nhà cung cấp phù hợp' : 'Chưa có nhà cung cấp nào' }}</p>
        </div>
      </div>

      <!-- Supplier Detail Modal -->
      <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
        <div class="modal-content detail-modal" @click.stop>
          <div class="modal-header">
            <h3>Chi tiết nhà cung cấp #{{ selectedSupplier ? selectedSupplier.maNCC : '' }}</h3>
            <button @click="closeDetailModal" class="close-btn">✕</button>
          </div>
          
          <div class="supplier-detail-content" v-if="selectedSupplier">
            <div class="detail-section">
              <h4>Thông tin cơ bản</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Mã nhà cung cấp:</label>
                  <span>{{ selectedSupplier.maNCC }}</span>
                </div>
                <div class="detail-item">
                  <label>Tên công ty:</label>
                  <span>{{ selectedSupplier.tenNCC }}</span>
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span>{{ selectedSupplier.email || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <label>Số điện thoại:</label>
                  <span>{{ selectedSupplier.sdt || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <label>Địa chỉ:</label>
                  <span>{{ selectedSupplier.diaChi || 'Chưa cập nhật' }}</span>
                </div>
                <div class="detail-item">
                  <label>Ngày hợp tác:</label>
                  <span>{{ formatDate(selectedSupplier.ngayHopTac) }}</span>
                </div>
                <div class="detail-item">
                  <label>Trạng thái:</label>
                  <span :class="['status-badge', selectedSupplier.trangThai === 1 ? 'active' : 'inactive']">
                    {{ selectedSupplier.trangThai === 1 ? 'Đang hợp tác' : 'Ngừng hợp tác' }}
                  </span>
                </div>
                <div class="detail-item" v-if="selectedSupplier.thongTinHopDong">
                  <label>Thông tin hợp đồng:</label>
                  <span>{{ selectedSupplier.thongTinHopDong }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Supplier Modal -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeAddEditModal">
        <div class="modal-content add-edit-modal" @click.stop>
          <div class="modal-header">
            <h3>{{ showEditModal ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới' }}</h3>
            <button @click="closeAddEditModal" class="close-btn">✕</button>
          </div>
          
          <form @submit.prevent="saveSupplier" class="supplier-form">
            <div class="form-section">
              <h4>Thông tin cơ bản</h4>
              <div class="form-grid">
                <div class="form-group" v-if="!showEditModal">
                  <label>Mã nhà cung cấp *</label>
                  <div class="code-input-group">
                    <input 
                      v-model="supplierForm.maNCC" 
                      type="text" 
                      required 
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
                  <small class="form-help">Mã nhà cung cấp được tự động sinh theo định dạng NCC + 7 ký tự ngẫu nhiên</small>
                </div>
                <div class="form-group">
                  <label>Tên công ty *</label>
                  <input 
                    v-model="supplierForm.tenNCC" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="Nhập tên công ty"
                  />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input 
                    v-model="supplierForm.email" 
                    type="email" 
                    class="form-input"
                    placeholder="Nhập email"
                  />
                </div>
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input 
                    v-model="supplierForm.sdt" 
                    type="tel" 
                    class="form-input"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div class="form-group full-width">
                  <label>Địa chỉ</label>
                  <input 
                    v-model="supplierForm.diaChi" 
                    type="text" 
                    class="form-input"
                    placeholder="Nhập địa chỉ công ty"
                  />
                </div>
                <div class="form-group">
                  <label>Ngày hợp tác</label>
                  <input 
                    v-model="supplierForm.ngayHopTac" 
                    type="date" 
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Trạng thái</label>
                  <select v-model="supplierForm.trangThai" class="form-select">
                    <option value="1">Đang hợp tác</option>
                    <option value="0">Ngừng hợp tác</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Thông tin hợp đồng</label>
                  <textarea 
                    v-model="supplierForm.thongTinHopDong" 
                    class="form-textarea"
                    rows="3"
                    placeholder="Nhập thông tin hợp đồng (tùy chọn)"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeAddEditModal" class="cancel-btn" :disabled="saving">Hủy</button>
              <button type="submit" class="save-btn" :disabled="saving">
                {{ saving ? 'Đang lưu...' : (showEditModal ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirm" class="modal-overlay" @click="closeConfirm">
        <div class="confirm-modal" @click.stop>
          <div class="confirm-icon">⚠️</div>
          <h3>Xác nhận xóa</h3>
          <p>Bạn có chắc chắn muốn xóa nhà cung cấp này không?<br>Thao tác này không thể hoàn tác.</p>
          <div class="confirm-actions">
            <button @click="closeConfirm" class="cancel-btn" :disabled="deleting">Hủy</button>
            <button @click="confirmDelete" class="delete-btn" :disabled="deleting">
              {{ deleting ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success/Error Toast -->
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.message }}
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
const API_BASE_URL = 'http://localhost:8080/api/nhacungcap'

// Helper to get authenticated headers
const getAuthenticatedHeaders = async () => {
  try {
    const { getAuthHeaders } = await import('../api.js')
    return await getAuthHeaders()
  } catch (error) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
}

// Reactive data
const suppliers = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('name-asc')
const showDetailModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showConfirm = ref(false)
const selectedSupplier = ref(null)
const deleteId = ref(null)
const editId = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const supplierForm = ref({
  maNCC: '',
  tenNCC: '',
  email: '',
  sdt: '',
  diaChi: '',
  ngayHopTac: new Date().toISOString().split('T')[0],
  trangThai: 1,
  thongTinHopDong: ''
})

// Computed properties
const filteredSuppliers = computed(() => {
  let filtered = suppliers.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(supplier =>
      supplier.tenNCC.toLowerCase().includes(query) ||
      (supplier.email && supplier.email.toLowerCase().includes(query)) ||
      (supplier.sdt && supplier.sdt.includes(query))
    )
  }

  // Status filter
  if (statusFilter.value !== '') {
    filtered = filtered.filter(supplier => supplier.trangThai.toString() === statusFilter.value)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name-asc':
        return a.tenNCC.localeCompare(b.tenNCC, 'vi')
      case 'name-desc':
        return b.tenNCC.localeCompare(a.tenNCC, 'vi')
      case 'date-desc':
        const dateA = new Date(a.ngayHopTac || '1970-01-01')
        const dateB = new Date(b.ngayHopTac || '1970-01-01')
        return dateB - dateA
      default:
        return 0
    }
  })

  return filtered
})

const supplierStats = computed(() => {
  const stats = {
    active: 0,
    inactive: 0
  }

  suppliers.value.forEach(supplier => {
    if (supplier.trangThai === 1) {
      stats.active++
    } else {
      stats.inactive++
    }
  })

  return stats
})

// Code Generation Methods
const generateSupplierCode = () => {
  // Tạo mã theo format NCC + 7 ký tự ngẫu nhiên (giống CodeGenerator.java)
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

const generateNewCode = () => {
  supplierForm.value.maNCC = generateSupplierCode()
}

// API Methods
const loadSuppliers = async () => {
  try {
    loading.value = true
    error.value = ''
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_BASE_URL, { headers })
    suppliers.value = response.data || []
  } catch (err) {
    error.value = 'Không thể tải danh sách nhà cung cấp. Vui lòng thử lại.'
    console.error('Error loading suppliers:', err)
  } finally {
    loading.value = false
  }
}

const createSupplier = async (supplierData) => {
  try {
    const headers = await getAuthenticatedHeaders()
    const response = await axios.post(API_BASE_URL, supplierData, { headers })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Không thể tạo nhà cung cấp')
  }
}

const updateSupplier = async (id, supplierData) => {
  try {
    const headers = await getAuthenticatedHeaders()
    const response = await axios.put(`${API_BASE_URL}/${id}`, supplierData, { headers })
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Không thể cập nhật nhà cung cấp')
  }
}

const deleteSupplierById = async (id) => {
  try {
    const headers = await getAuthenticatedHeaders()
    await axios.delete(`${API_BASE_URL}/${id}`, { headers })
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Không thể xóa nhà cung cấp')
  }
}

// Utility Methods
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const clearSearch = () => {
  searchQuery.value = ''
}

// Modal Methods
const viewSupplierDetail = (supplier) => {
  selectedSupplier.value = supplier
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedSupplier.value = null
}

const editSupplier = (supplier) => {
  editId.value = supplier.maNCC
  supplierForm.value = {
    maNCC: supplier.maNCC,
    tenNCC: supplier.tenNCC,
    email: supplier.email || '',
    sdt: supplier.sdt || '',
    diaChi: supplier.diaChi || '',
    ngayHopTac: supplier.ngayHopTac || '',
    trangThai: supplier.trangThai,
    thongTinHopDong: supplier.thongTinHopDong || ''
  }
  showEditModal.value = true
}

const resetForm = () => {
  supplierForm.value = {
    maNCC: generateSupplierCode(), // Tự động sinh mã mới
    tenNCC: '',
    email: '',
    sdt: '',
    diaChi: '',
    ngayHopTac: new Date().toISOString().split('T')[0],
    trangThai: 1,
    thongTinHopDong: ''
  }
  editId.value = null
}

const closeAddEditModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const saveSupplier = async () => {
  try {
    saving.value = true
    
    if (showEditModal.value) {
      // Edit existing supplier
      await updateSupplier(editId.value, supplierForm.value)
      showToast('Cập nhật nhà cung cấp thành công!')
    } else {
      // Add new supplier
      await createSupplier(supplierForm.value)
      showToast('Thêm nhà cung cấp thành công!')
    }
    
    await loadSuppliers() // Reload the list
    closeAddEditModal()
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    saving.value = false
  }
}

const deleteSupplier = (supplierId) => {
  deleteId.value = supplierId
  showConfirm.value = true
}

const confirmDelete = async () => {
  try {
    deleting.value = true
    await deleteSupplierById(deleteId.value)
    showToast('Xóa nhà cung cấp thành công!')
    await loadSuppliers() // Reload the list
    closeConfirm()
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    deleting.value = false
  }
}

const closeConfirm = () => {
  showConfirm.value = false
  deleteId.value = null
}

// Initialize
onMounted(() => {
  loadSuppliers()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.supplier-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.header {
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.header h2 {
  color: #1e293b;
  font-size: 2.25rem;
  font-weight: 700;
  margin: 16px 0 0 0;
  text-align: center;
  letter-spacing: -0.025em;
}

/* Enhanced Back Button */
.back-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px 24px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.back-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.back-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
  transform: translateX(-3px);
}

.back-text {
  position: relative;
  z-index: 2;
  font-weight: 600;
}

.back-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.back-btn:hover .back-shine {
  transform: translateX(100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.active {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.inactive {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-info h3 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.stat-info p {
  color: #64748b;
  font-weight: 500;
  margin: 4px 0 0 0;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.search-filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 350px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #e2e8f0;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1rem;
  padding: 6px;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #cbd5e1;
  color: #475569;
}

.filter-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #1e293b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.export-btn, .add-btn {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.export-btn {
  background: #059669;
  color: white;
}

.export-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

.add-btn {
  background: #3b82f6;
  color: white;
}

.add-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.supplier-table {
  width: 100%;
  border-collapse: collapse;
}

.supplier-table thead {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
}

.supplier-table th {
  background: #f8fafc;
  color: #475569;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #e2e8f0;
}

.supplier-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.supplier-row {
  transition: background-color 0.2s ease;
}

.supplier-row:hover {
  background-color: #f8fafc;
}

.supplier-id {
  font-weight: 600;
  color: #6366f1;
  font-size: 0.875rem;
}

.supplier-info .supplier-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.supplier-info .supplier-address {
  color: #64748b;
  font-size: 0.875rem;
}

.contact-info .contact-email {
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 4px;
}

.contact-info .contact-phone {
  color: #64748b;
  font-size: 0.875rem;
}

.product-info .product-summary {
  font-weight: 600;
  color: #059669;
  margin-bottom: 4px;
}

.product-info .product-preview {
  color: #64748b;
  font-size: 0.875rem;
}

.join-date {
  color: #64748b;
  font-size: 0.875rem;
}

.order-count {
  font-weight: 600;
  color: #8b5cf6;
}

.total-value {
  font-weight: 600;
  color: #059669;
}

.status-select {
  padding: 6px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-select.active {
  background: #dcfce7;
  color: #059669;
  border-color: #bbf7d0;
}

.status-select.inactive {
  background: #fef3c7;
  color: #d97706;
  border-color: #fde68a;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.view-btn, .edit-btn, .delete-btn {
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background: #e0f2fe;
  color: #0369a1;
}

.view-btn:hover {
  background: #bae6fd;
  transform: scale(1.05);
}

.edit-btn {
  background: #fef3c7;
  color: #d97706;
}

.edit-btn:hover {
  background: #fde68a;
  transform: scale(1.05);
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
  transform: scale(1.05);
}

/* No Data State */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-data p {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 8px;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

/* Detail Modal */
.detail-modal {
  width: 800px;
}

.supplier-detail-content {
  padding: 24px 32px 32px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item label {
  font-weight: 500;
  color: #64748b;
  min-width: 120px;
}

.detail-item span {
  color: #1e293b;
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #059669;
}

.status-badge.inactive {
  background: #fef3c7;
  color: #d97706;
}

.stats-row {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
  flex: 1;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.product-item {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
}

.product-category {
  color: #64748b;
  font-size: 0.875rem;
}

/* Add/Edit Modal */
.add-edit-modal {
  width: 700px;
}

.supplier-form {
  padding: 24px 32px 32px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
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

/* Form Textarea */
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loader {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  text-align: center;
  color: #dc2626;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* Toast */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 2000;
  animation: slideIn 0.3s ease;
  max-width: 400px;
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
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

/* Refresh Button */
.refresh-btn {
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: #059669;
  color: white;
}

.refresh-btn:hover {
  background: #047857;
  transform: translateY(-1px);
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
  margin: 0 0 12px 0;
}

.confirm-modal p {
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-actions .cancel-btn {
  background: #f1f5f9;
  color: #64748b;
}

.confirm-actions .delete-btn {
  background: #dc2626;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
}

.confirm-actions .delete-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .supplier-management-container {
    padding: 16px;
  }

  .header h2 {
    font-size: 1.75rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-filter-group {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    justify-content: stretch;
  }

  .export-btn, .add-btn {
    flex: 1;
    justify-content: center;
  }

  .supplier-table {
    font-size: 0.875rem;
  }

  .supplier-table th,
  .supplier-table td {
    padding: 12px 8px;
  }

  .modal-content {
    margin: 16px;
    max-width: calc(100% - 32px);
  }

  .detail-modal,
  .add-edit-modal {
    width: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    flex-direction: column;
    gap: 16px;
  }

  .product-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .supplier-table th,
  .supplier-table td {
    padding: 8px 6px;
    font-size: 0.8rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .view-btn, .edit-btn, .delete-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
