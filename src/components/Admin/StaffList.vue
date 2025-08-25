<template>
  <div>
    <AdminHeader />
    <div class="staff-management-container">
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
        <h2>Quản lý nhân viên</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-container">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button @click="fetchStaffs" class="retry-btn">Thử lại</button>
      </div>

      <!-- Main Content -->
      <div v-if="!loading && !error">
        <!-- Search and Add Staff -->
        <div class="toolbar">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
              class="search-input"
            />
            <button @click="clearSearch" class="clear-btn" v-if="searchQuery">✕</button>
          </div>
          <div class="toolbar-actions">
            <select v-model="roleFilter" class="role-filter">
              <option value="">Tất cả chức vụ</option>
              <option value="Quản lý">Quản lý</option>
              <option value="Nhân viên">Nhân viên</option>
              <option value="Thực tập sinh">Thực tập sinh</option>
            </select>
            <button @click="openAddModal" class="add-btn">+ Thêm nhân viên</button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <span class="stat-number">{{ staffs.length }}</span>
              <span class="stat-label">Tổng nhân viên</span>
            </div>
          </div>
          <div class="stat-card active">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <span class="stat-number">{{ activeStaffs }}</span>
              <span class="stat-label">Đang hoạt động</span>
            </div>
          </div>
          <div class="stat-card inactive">
            <div class="stat-icon">⏸️</div>
            <div class="stat-info">
              <span class="stat-number">{{ inactiveStaffs }}</span>
              <span class="stat-label">Tạm nghỉ</span>
            </div>
          </div>
        </div>

        <!-- Staff Table -->
        <div class="table-container">
          <table class="staff-table" v-if="filteredStaffs.length > 0">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Avatar</th>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Chức vụ</th>
                <th>Ngày vào làm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in filteredStaffs" :key="staff.maNV">
                <td>{{ staff.maNV }}</td>
                <td class="avatar-cell">
                  <div class="avatar-container">
                    <img 
                      :src="getAvatarUrl(staff)" 
                      :alt="staff.hoTen"
                      class="staff-avatar"
                      @error="handleImageError"
                    />
                    <div class="avatar-overlay">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  </div>
                </td>
                <td class="name-cell">
                  <div class="name-info">
                    <span class="staff-name">{{ staff.hoTen }}</span>
                    <span class="staff-department">{{ staff.cuaHang ? staff.cuaHang.tenCuaHang : 'Chưa phân công' }}</span>
                  </div>
                </td>
                <td class="phone">{{ staff.sdt || 'Chưa cập nhật' }}</td>
                <td>
                  <span :class="['role-badge', getRoleClass(staff.chucVu)]">
                    {{ staff.chucVu || 'Nhân viên' }}
                  </span>
                </td>
                <td class="join-date">{{ formatDate(staff.ngayVaoLam) }}</td>
                <td>
                  <span :class="['status-badge', staff.trangThai === 1 ? 'active' : 'inactive']">
                    {{ staff.trangThai === 1 ? 'Hoạt động' : 'Tạm nghỉ' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button @click="viewStaffInfo(staff)" class="view-btn" title="Xem chi tiết">
                      <span class="btn-icon">👁️</span>
                      <span class="btn-text">Xem</span>
                    </button>
                    <button @click="openEditModal(staff)" class="edit-btn" title="Chỉnh sửa nhân viên">
                      <span class="btn-icon">✏️</span>
                      <span class="btn-text">Sửa</span>
                    </button>
                    <button @click="toggleStatus(staff)" class="status-btn" :title="staff.trangThai === 1 ? 'Tạm nghỉ' : 'Kích hoạt lại'">
                      <span class="btn-icon">{{ staff.trangThai === 1 ? '⏸️' : '▶️' }}</span>
                      <span class="btn-text">{{ staff.trangThai === 1 ? 'Tạm nghỉ' : 'Kích hoạt' }}</span>
                    </button>
                    <button @click="deleteStaff(staff.maNV)" class="delete-btn" title="Xóa nhân viên">
                      <span class="btn-icon">🗑️</span>
                      <span class="btn-text">Xóa</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredStaffs.length === 0" class="no-data">
            <div class="no-data-icon">👥</div>
            <p>{{ searchQuery ? 'Không tìm thấy nhân viên phù hợp' : 'Chưa có nhân viên nào' }}</p>
            <button v-if="!searchQuery" @click="openAddModal" class="add-first-btn">Thêm nhân viên đầu tiên</button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới' }}</h3>
            <button @click="closeModal" class="close-btn" title="Đóng">✕</button>
          </div>
          
          <form @submit.prevent="saveStaff" class="staff-form">
            <div class="form-group" v-if="!isEditing">
              <label for="staff-id">Mã nhân viên <span class="required">*</span></label>
              <div class="code-input-group">
                <input 
                  id="staff-id"
                  v-model="currentStaff.maNV" 
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
              <small class="form-help">Mã nhân viên được tự động sinh theo định dạng NV + 8 ký tự ngẫu nhiên</small>
            </div>

            <div class="form-group">
              <label for="staff-name">Họ tên <span class="required">*</span></label>
              <input 
                id="staff-name"
                v-model="currentStaff.hoTen" 
                type="text" 
                required 
                class="form-input"
                placeholder="Nhập họ tên nhân viên"
                maxlength="255"
              />
            </div>
            
            <div class="form-group">
              <label for="staff-phone">Số điện thoại</label>
              <input 
                id="staff-phone"
                v-model="currentStaff.sdt" 
                type="tel" 
                class="form-input"
                placeholder="Nhập số điện thoại"
                maxlength="15"
              />
            </div>

            <div class="form-group">
              <label for="staff-address">Địa chỉ</label>
              <textarea 
                id="staff-address"
                v-model="currentStaff.diaChi" 
                class="form-textarea"
                placeholder="Nhập địa chỉ"
                maxlength="255"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="staff-birth">Ngày sinh</label>
              <input 
                id="staff-birth"
                v-model="currentStaff.ngaySinh" 
                type="date" 
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="staff-role">Chức vụ</label>
              <input 
                id="staff-role"
                v-model="currentStaff.chucVu" 
                type="text" 
                class="form-input"
                placeholder="Nhập chức vụ"
                maxlength="100"
              />
            </div>
            
            <div class="form-group" v-if="!isEditing">
              <label for="staff-joinDate">Ngày vào làm</label>
              <input 
                id="staff-joinDate"
                v-model="currentStaff.ngayVaoLam" 
                type="date" 
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="staff-status">Trạng thái</label>
              <select id="staff-status" v-model="currentStaff.trangThai" class="form-select">
                <option :value="1">Hoạt động</option>
                <option :value="0">Tạm nghỉ</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn" :disabled="saving">Hủy</button>
              <button type="submit" class="save-btn" :disabled="saving">
                <span v-if="saving" class="loading-text">
                  <span class="spinner"></span>
                  {{ isEditing ? 'Đang cập nhật...' : 'Đang thêm...' }}
                </span>
                <span v-else>
                  {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
                </span>
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
          <p>Bạn có chắc chắn muốn xóa nhân viên này không?<br>Thao tác này không thể hoàn tác.</p>
          <div class="confirm-actions">
            <button @click="closeConfirm" class="cancel-btn" :disabled="deleting">Hủy</button>
            <button @click="confirmDelete" class="delete-btn" :disabled="deleting">
              <span v-if="deleting" class="loading-text">
                <span class="spinner"></span>
                Đang xóa...
              </span>
              <span v-else>Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <AdminFooter />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/nhanvien' // Thay đổi URL theo environment của bạn

// State
const staffs = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const showModal = ref(false)
const showConfirm = ref(false)
const isEditing = ref(false)
const deleteStaffId = ref(null)
const loading = ref(false)
const error = ref(null)
const saving = ref(false)
const deleting = ref(false)

const currentStaff = reactive({
  maNV: '',
  hoTen: '',
  sdt: '',
  diaChi: '',
  ngaySinh: '',
  ngayVaoLam: new Date().toISOString().split('T')[0],
  chucVu: '',
  trangThai: 1
})

// Code Generation Methods
const generateStaffCode = () => {
  // Tạo mã theo format NV + 8 ký tự ngẫu nhiên (giống CodeGenerator.java)
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

const generateNewCode = () => {
  currentStaff.maNV = generateStaffCode()
}

// API Methods
async function fetchStaffs() {
  loading.value = true
  error.value = null
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../../utils/tokenStorage.js')
    
    // Check if user has MANAGER role
    if (!hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập danh sách nhân viên. Chỉ MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Server may be down or URL incorrect.`)
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    staffs.value = data || []
  } catch (err) {
    error.value = 'Không thể tải danh sách nhân viên. Vui lòng thử lại sau.'
    console.error('Error fetching staffs:', err)
  } finally {
    loading.value = false
  }
}

async function createStaff(staffData) {
  // Import tokenStorage functions
  const { getToken, hasRole } = await import('../../utils/tokenStorage.js')
  
  // Check if user has MANAGER role
  if (!hasRole('MANAGER')) {
    throw new Error('Bạn không có quyền tạo nhân viên. Chỉ MANAGER mới được phép.')
  }
  
  // Get token from storage
  const token = getToken()
  if (!token) {
    throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
  }
  
  // Prepare headers with token
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(staffData)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create staff: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

async function updateStaff(staffId, staffData) {
  // Import tokenStorage functions
  const { getToken, hasRole } = await import('../../utils/tokenStorage.js')
  
  // Check if user has MANAGER role
  if (!hasRole('MANAGER')) {
    throw new Error('Bạn không có quyền cập nhật nhân viên. Chỉ MANAGER mới được phép.')
  }
  
  // Get token from storage
  const token = getToken()
  if (!token) {
    throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
  }
  
  // Prepare headers with token
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}/${staffId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(staffData)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to update staff: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

async function deleteStaffAPI(staffId) {
  // Import tokenStorage functions
  const { getToken, hasRole } = await import('../../utils/tokenStorage.js')
  
  // Check if user has MANAGER role
  if (!hasRole('MANAGER')) {
    throw new Error('Bạn không có quyền xóa nhân viên. Chỉ MANAGER mới được phép.')
  }
  
  // Get token from storage
  const token = getToken()
  if (!token) {
    throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
  }
  
  // Prepare headers with token
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}/${staffId}`, {
    method: 'DELETE',
    headers
  })
  
  if (!response.ok && response.status !== 404) {
    const errorText = await response.text()
    throw new Error(`Failed to delete staff: ${response.status} - ${errorText}`)
  }
  
  return response.status === 204 || response.status === 200
}

// Computed properties
const filteredStaffs = computed(() => {
  let filtered = staffs.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(staff =>
      staff.hoTen?.toLowerCase().includes(query) ||
      staff.maNV?.toLowerCase().includes(query) ||
      staff.sdt?.toLowerCase().includes(query)
    )
  }
  if (roleFilter.value) {
    filtered = filtered.filter(staff => staff.chucVu === roleFilter.value)
  }
  return filtered
})

const activeStaffs = computed(() => {
  return staffs.value.filter(staff => staff.trangThai === 1).length
})

const inactiveStaffs = computed(() => {
  return staffs.value.filter(staff => staff.trangThai === 0).length
})

// Utility Methods
function formatDate(dateString) {
  if (!dateString) return 'Chưa cập nhật'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

function handleImageError(event) {
  event.target.src = '/api/placeholder/60/60'
}

function getAvatarUrl(staff) {
  // Có thể tích hợp với avatar service hoặc sử dụng placeholder
  return staff.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.hoTen || 'NV')}&background=0ea5e9&color=fff&size=60`
}

function getRoleClass(role) {
  const roleClasses = {
    'Quản lý': 'manager',
    'Nhân viên': 'employee',
    'Thực tập sinh': 'intern'
  }
  return roleClasses[role] || 'employee'
}

function clearSearch() {
  searchQuery.value = ''
}

// Modal Methods
function openAddModal() {
  isEditing.value = false
  resetCurrentStaff()
  showModal.value = true
}

function openEditModal(staff) {
  isEditing.value = true
  Object.assign(currentStaff, {
    maNV: staff.maNV,
    hoTen: staff.hoTen || '',
    sdt: staff.sdt || '',
    diaChi: staff.diaChi || '',
    ngaySinh: staff.ngaySinh || '',
    ngayVaoLam: staff.ngayVaoLam || '',
    chucVu: staff.chucVu || '',
    trangThai: staff.trangThai
  })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetCurrentStaff()
}

function resetCurrentStaff() {
  Object.assign(currentStaff, {
    maNV: generateStaffCode(), // Tự động sinh mã mới
    hoTen: '',
    sdt: '',
    diaChi: '',
    ngaySinh: '',
    ngayVaoLam: new Date().toISOString().split('T')[0],
    chucVu: '',
    trangThai: 1
  })
}

// CRUD Operations
async function saveStaff() {
  saving.value = true
  try {
    // Validate required fields
    if (!currentStaff.hoTen.trim()) {
      throw new Error('Họ tên không được để trống')
    }
    
    if (!isEditing.value && !currentStaff.maNV.trim()) {
      throw new Error('Mã nhân viên không được để trống')
    }

    const staffData = {
      maNV: currentStaff.maNV,
      hoTen: currentStaff.hoTen.trim(),
      sdt: currentStaff.sdt?.trim() || null,
      diaChi: currentStaff.diaChi?.trim() || null,
      ngaySinh: currentStaff.ngaySinh || null,
      ngayVaoLam: currentStaff.ngayVaoLam || null,
      chucVu: currentStaff.chucVu?.trim() || null,
      trangThai: currentStaff.trangThai,
      isDeleted: false
    }

    if (isEditing.value) {
      await updateStaff(currentStaff.maNV, staffData)
    } else {
      await createStaff(staffData)
    }

    // Refresh the list
    await fetchStaffs()
    closeModal()
    
    // Show success message
    alert(isEditing.value ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!')
    
  } catch (err) {
    alert(`Lỗi: ${err.message}`)
    console.error('Error saving staff:', err)
  } finally {
    saving.value = false
  }
}

function viewStaffInfo(staff) {
  // Implement navigation to staff detail page
  alert(`Xem thông tin chi tiết của ${staff.hoTen}`)
  // this.$router.push({ name: 'StaffInfo', params: { id: staff.maNV } })
}

async function toggleStatus(staff) {
  try {
    const newStatus = staff.trangThai === 1 ? 0 : 1
    const staffData = {
      ...staff,
      trangThai: newStatus
    }
    
    await updateStaff(staff.maNV, staffData)
    await fetchStaffs() // Refresh list
    
    alert(`${staff.hoTen} đã được ${newStatus === 1 ? 'kích hoạt' : 'tạm nghỉ'}`)
  } catch (err) {
    alert(`Lỗi khi thay đổi trạng thái: ${err.message}`)
    console.error('Error toggling status:', err)
  }
}

function deleteStaff(staffId) {
  deleteStaffId.value = staffId
  showConfirm.value = true
}

async function confirmDelete() {
  if (!deleteStaffId.value) return
  
  deleting.value = true
  try {
    await deleteStaffAPI(deleteStaffId.value)
    await fetchStaffs() // Refresh list
    closeConfirm()
    alert('Xóa nhân viên thành công!')
  } catch (err) {
    alert(`Lỗi khi xóa nhân viên: ${err.message}`)
    console.error('Error deleting staff:', err)
  } finally {
    deleting.value = false
  }
}

function closeConfirm() {
  showConfirm.value = false
  deleteStaffId.value = null
}

// Lifecycle
onMounted(() => {
  fetchStaffs()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.staff-management-container {
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

.back-btn:active {
  transform: translateY(-1px) scale(0.98);
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

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 14px 45px 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #64748b;
  font-weight: 400;
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

.toolbar-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.role-filter {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
}

.role-filter:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
  white-space: nowrap;
}

.add-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
}

.stat-card.active .stat-icon {
  background: #dcfce7;
  color: #166534;
}

.stat-card.inactive .stat-icon {
  background: #fef2f2;
  color: #dc2626;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
}

.stat-card.active .stat-number {
  color: #059669;
}

.stat-card.inactive .stat-number {
  color: #dc2626;
}

.stat-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.staff-table {
  width: 100%;
  border-collapse: collapse;
}

.staff-table th {
  background: #f8fafc;
  color: #475569;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #e2e8f0;
}

.staff-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-weight: 500;
  color: #334155;
}

.staff-table tbody tr {
  transition: background-color 0.2s ease;
}

.staff-table tbody tr:hover {
  background: #f8fafc;
}

.staff-table tbody tr:last-child td {
  border-bottom: none;
}

/* Avatar Styles */
.avatar-cell {
  width: 80px;
  padding: 12px 20px !important;
}

.avatar-container {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.staff-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #e5e5e5;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.staff-avatar:hover {
  transform: scale(1.05);
  border-color: #007bff;
}

/* Avatar Overlay */
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.avatar-overlay svg {
  width: 24px;
  height: 24px;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

/* Name Cell */
.name-cell {
  min-width: 200px;
}

.name-info {
  display: flex;
  flex-direction: column;
}

.staff-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

.staff-department {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 2px;
}

/* Email */
.email {
  color: #3b82f6;
  font-weight: 500;
}

/* Role Badge */
.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  min-width: 90px;
}

.role-badge.manager {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.role-badge.employee {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #60a5fa;
}

.role-badge.intern {
  background: #e0e7ff;
  color: #6366f1;
  border: 1px solid #a5b4fc;
}

/* Join Date */
.join-date {
  color: #64748b;
  font-weight: 500;
}

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  min-width: 100px;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #22c55e;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #f87171;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 300px;
}

.action-buttons button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}


.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.875rem;
}

.view-btn {
   display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background-color: #fffbeb;
  color: rgb(210, 17, 17);
  text-decoration: none; /* Loại bỏ underline của link */
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: fit-content;
  justify-content: center;
}

.view-btn:hover {
  background-color: #ffe5e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.view-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.edit-btn {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.edit-btn:hover {
  background: #fef3c7;
  transform: translateY(-1px);
}

.status-btn {
  background: #f0fdf4;
  color: #059669;
  border: 1px solid #bbf7d0;
}

.status-btn:hover {
  background: #dcfce7;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.delete-btn:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}

/* No Data */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-data p {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 24px;
}

.add-first-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-first-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
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
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
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

/* Staff Form */
.staff-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.required {
  color: #ef4444;
}

.form-input, .form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Image Upload */
.image-upload-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-overlay svg {
  width: 32px;
  height: 32px;
}

.image-preview:hover .image-preview-overlay {
  opacity: 1;
}

.image-upload-controls {
  flex: 1;
}

.image-help {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 0;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.save-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Confirm Modal */
.confirm-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
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
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading Text */
.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .action-buttons {
    flex-direction: column;
    min-width: 200px;
  }
  
  .action-buttons button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .staff-management-container {
    padding: 16px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-box {
    max-width: none;
  }
  
  .toolbar-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .staff-table {
    min-width: 800px;
  }
  
  .image-upload-container {
    flex-direction: column;
    align-items: center;
  }
  
  .modal-content {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }

   .action-buttons .view-btn .btn-text {
    display: none;
  }
  
  .action-buttons .view-btn {
    padding: 8px;
    min-width: 36px;
  }
}

@media (max-width: 480px) {
  .header h2 {
    font-size: 1.75rem;
  }
  
  .back-btn {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
  
  .back-text {
    display: none;
  }
  
  .action-buttons {
    min-width: 150px;
  }
  
  .btn-text {
    display: none;
  }
}
</style>