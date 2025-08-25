<template>
  <AdminHeader />
  <div class="shift-management-container">
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
      <h2><i class="fas fa-calendar-alt"></i> Quản lý Lịch Làm Việc</h2>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div>
            <div class="stat-label">Tổng Lịch Làm Việc</div>
            <div class="stat-value">{{ lichLamViecs.length }}</div>
          </div>
          <i class="fas fa-calendar-day stat-icon" style="color: #3b82f6;"></i>
        </div>
        <div class="stat-trend">
          <i class="fas fa-info-circle"></i>
          <span>Tất cả lịch đang hoạt động</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div>
            <div class="stat-label">Lịch Đã Duyệt</div>
            <div class="stat-value">{{ approvedSchedules }}</div>
          </div>
          <i class="fas fa-check-circle stat-icon" style="color: #10b981;"></i>
        </div>
        <div class="stat-trend">
          <i class="fas fa-arrow-up"></i>
          <span>Đã được phê duyệt</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div>
            <div class="stat-label">Chờ Duyệt</div>
            <div class="stat-value">{{ pendingSchedules }}</div>
          </div>
          <i class="fas fa-clock stat-icon" style="color: #f59e0b;"></i>
        </div>
        <div class="stat-trend">
          <i class="fas fa-hourglass-half"></i>
          <span>Cần xử lý</span>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Tìm kiếm theo nhân viên hoặc ghi chú..."
          v-model="searchQuery"
        >
        <button class="clear-btn" @click="clearSearch" v-if="searchQuery">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="filter-group">
        <select class="filter-select" v-model="selectedStatus">
          <option value="">Tất cả trạng thái</option>
          <option value="0">Chờ duyệt</option>
          <option value="1">Đã duyệt</option>
          <option value="2">Từ chối</option>
          <option value="3">Hủy</option>
          <option value="4">Đã hoàn thành</option>
        </select>

        <input 
          type="date" 
          class="filter-select" 
          v-model="selectedDate"
          placeholder="Chọn ngày"
        >
      </div>

      <button class="add-btn" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm Lịch Mới
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải dữ liệu...</p>
      </div>
    </div>

    <!-- Schedule Table -->
    <div class="table-container" v-else>
      <table class="shift-table">
        <thead>
          <tr>
            <th>Mã Lịch</th>
            <th>Nhân Viên</th>
            <th>Ca Làm Việc</th>
            <th>Ngày Làm</th>
            <th>Giờ Làm</th>
            <th>Giờ Vào/Ra Thực Tế</th>
            <th>Trạng Thái</th>
            <th>Người Duyệt</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lich in filteredLichLamViecs" :key="lich.maLich">
            <td>
              <span class="lich-id">LLV{{ String(lich.maLich).padStart(3, '0') }}</span>
            </td>
            <td>
              <div class="employee-info">
                <div class="employee-id">{{ lich.nhanVien?.maNV || 'N/A' }}</div>
              </div>
            </td>
            <td>
              <div class="shift-info">
                <div class="shift-name">{{ lich.caLamViec?.tenCa || 'N/A' }}</div>
                <div class="shift-time">{{ formatShiftTime(lich.caLamViec) }}</div>
              </div>
            </td>
            <td class="date-cell">{{ formatDate(lich.ngayLam) }}</td>
            <td class="time-cell">
              {{ formatTime(lich.caLamViec?.gioBatDau) }} - {{ formatTime(lich.caLamViec?.gioKetThuc) }}
            </td>
            <td class="actual-time-cell">
              <div v-if="lich.gioVao || lich.gioRa">
                <span>Vào: {{ formatTime(lich.gioVao) || '--:--' }}</span><br>
                <span>Ra: {{ formatTime(lich.gioRa) || '--:--' }}</span>
              </div>
              <span v-else class="no-data">Chưa có dữ liệu</span>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(lich.trangThai)">
                {{ getStatusText(lich.trangThai) }}
              </span>
            </td>
            <td>
              <div class="manager-info">
                {{ lich.nhanVienQuanLy?.tenNV || 'Chưa duyệt' }}
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button class="edit-btn" @click="editLich(lich)" :disabled="actionLoading">
                  <i class="fas fa-edit btn-icon"></i>
                  <span class="btn-text">Sửa</span>
                </button>
                <button 
                  v-if="lich.trangThai === 0" 
                  class="approve-btn" 
                  @click="approveSchedule(lich)" 
                  :disabled="actionLoading"
                >
                  <i class="fas fa-check btn-icon"></i>
                  <span class="btn-text">Duyệt</span>
                </button>
                <button class="delete-btn" @click="confirmDelete(lich)" :disabled="actionLoading">
                  <i class="fas fa-trash btn-icon"></i>
                  <span class="btn-text">Xóa</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- No Data State -->
      <div v-if="filteredLichLamViecs.length === 0" class="no-data">
        <div class="no-data-icon">📅</div>
        <p>Không tìm thấy lịch làm việc nào</p>
        <button class="add-first-btn" @click="openAddModal">Thêm Lịch Đầu Tiên</button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Chỉnh Sửa Lịch Làm Việc' : 'Thêm Lịch Làm Việc Mới' }}</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form class="shift-form" @submit.prevent="saveLich">
          <div class="form-row">
            <div class="form-group">
              <label>Nhân viên <span class="required">*</span></label>
              <select 
                class="form-select" 
                v-model="lichForm.maNhanVien" 
                required
                :disabled="formLoading"
              >
                <option value="">Chọn nhân viên</option>
                <option v-for="nv in nhanViens" :key="nv.maNV" :value="nv.maNV">
                  {{ nv.tenNV }} - {{ nv.maNV }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Ca làm việc <span class="required">*</span></label>
              <select 
                class="form-select" 
                v-model="lichForm.maCa" 
                required
                :disabled="formLoading"
              >
                <option value="">Chọn ca làm việc</option>
                <option v-for="ca in caLamViecs" :key="ca.maCa" :value="ca.maCa">
                  {{ ca.tenCa }} ({{ formatTime(ca.gioBatDau) }} - {{ formatTime(ca.gioKetThuc) }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Ngày làm <span class="required">*</span></label>
              <input 
                type="date" 
                class="form-input" 
                v-model="lichForm.ngayLam" 
                required
                :disabled="formLoading"
              >
            </div>
            
            <div class="form-group">
              <label>Người quản lý</label>
              <select 
                class="form-select" 
                v-model="lichForm.maNhanVienQuanLy" 
                :disabled="formLoading"
              >
                <option value="">Chọn người quản lý</option>
                <option v-for="nv in quanLyList" :key="nv.maNV" :value="nv.maNV">
                  {{ nv.tenNV }} - {{ nv.maNV }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Giờ vào thực tế</label>
              <input 
                type="time" 
                class="form-input" 
                v-model="lichForm.gioVao" 
                :disabled="formLoading"
              >
            </div>
            
            <div class="form-group">
              <label>Giờ ra thực tế</label>
              <input 
                type="time" 
                class="form-input" 
                v-model="lichForm.gioRa" 
                :disabled="formLoading"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Trạng thái</label>
              <select class="form-select" v-model="lichForm.trangThai" :disabled="formLoading">
                <option :value="0">Chờ duyệt</option>
                <option :value="1">Đã duyệt</option>
                <option :value="2">Từ chối</option>
                <option :value="3">Hủy</option>
                <option :value="4">Đã hoàn thành</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label>Ghi chú</label>
              <textarea 
                class="form-textarea" 
                v-model="lichForm.ghiChu" 
                placeholder="Nhập ghi chú (tùy chọn)"
                rows="3"
                :disabled="formLoading"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal" :disabled="formLoading">
              Hủy
            </button>
            <button type="submit" class="save-btn" :disabled="formLoading">
              <i v-if="formLoading" class="fas fa-spinner fa-spin"></i>
              {{ formLoading ? 'Đang xử lý...' : (isEditing ? 'Cập Nhật' : 'Thêm Mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="confirm-modal" @click.stop>
        <div class="confirm-icon">⚠️</div>
        <h3>Xác nhận xóa</h3>
        <p>Bạn có chắc chắn muốn xóa lịch làm việc của <strong>{{ lichToDelete?.nhanVien?.tenNV }}</strong> ngày <strong>{{ formatDate(lichToDelete?.ngayLam) }}</strong> không?</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="closeConfirmModal" :disabled="formLoading">Hủy</button>
          <button class="delete-btn" @click="deleteLich" :disabled="formLoading">
            <i v-if="formLoading" class="fas fa-spinner fa-spin"></i>
            {{ formLoading ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="notification.show" class="toast" :class="notification.type">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>
  </div>
  <AdminFooter />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'

// API Base URL - Cập nhật URL cho phù hợp với server của bạn
const API_BASE_URL = 'http://localhost:8080/api/lichlamviec'
const NHANVIEN_API_URL = 'http://localhost:8080/api/nhanvien'
const CALAMVIEC_API_URL = 'http://localhost:8080/api/calamviec'

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

// State
const lichLamViecs = ref([])
const nhanViens = ref([])
const caLamViecs = ref([])
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedDate = ref('')
const showModal = ref(false)
const showConfirmModal = ref(false)
const isEditing = ref(false)
const lichToDelete = ref(null)
const loading = ref(false)
const actionLoading = ref(false)
const formLoading = ref(false)

// Notification
const notification = ref({
  show: false,
  type: 'success',
  message: '',
  icon: 'fas fa-check-circle'
})

// Form data
const lichForm = ref({
  maLich: null,
  maNhanVien: '',
  maCa: '',
  ngayLam: '',
  maNhanVienQuanLy: '',
  trangThai: 0,
  ghiChu: '',
  gioVao: '',
  gioRa: ''
})

// Computed properties
const filteredLichLamViecs = computed(() => {
  let filtered = lichLamViecs.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(lich =>
      lich.nhanVien?.tenNV?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      lich.ghiChu?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      lich.caLamViec?.tenCa?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (selectedStatus.value !== '') {
    filtered = filtered.filter(lich => lich.trangThai === parseInt(selectedStatus.value))
  }

  if (selectedDate.value) {
    filtered = filtered.filter(lich => lich.ngayLam === selectedDate.value)
  }
  
  return filtered
})

const approvedSchedules = computed(() => {
  return lichLamViecs.value.filter(lich => lich.trangThai === 1).length
})

const pendingSchedules = computed(() => {
  return lichLamViecs.value.filter(lich => lich.trangThai === 0).length
})

const quanLyList = computed(() => {
  // Giả sử nhân viên quản lý có chức vụ đặc biệt hoặc bạn có thể filter theo điều kiện nào đó
  return nhanViens.value.filter(nv => nv.chucVu?.includes('Quản lý') || nv.vaiTro === 'MANAGER')
})

// Methods
async function fetchLichLamViecs() {
  loading.value = true
  try {
    console.log('Đang gọi API:', API_BASE_URL)
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_BASE_URL, { headers })
    console.log('Response data:', response.data)
    lichLamViecs.value = response.data || []
    showNotification(`Đã tải ${lichLamViecs.value.length} lịch làm việc`, 'success')
  } catch (error) {
    console.error('Lỗi khi tải danh sách lịch làm việc:', error)
    showNotification(`Lỗi khi tải dữ liệu: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

async function fetchNhanViens() {
  try {
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(NHANVIEN_API_URL, { headers })
    nhanViens.value = response.data || []
  } catch (error) {
    console.error('Lỗi khi tải danh sách nhân viên:', error)
  }
}

async function fetchCaLamViecs() {
  try {
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(CALAMVIEC_API_URL, { headers })
    caLamViecs.value = response.data || []
  } catch (error) {
    console.error('Lỗi khi tải danh sách ca làm việc:', error)
  }
}

async function saveLich() {
  formLoading.value = true
  try {
    const payload = {
      nhanVien: { maNV: lichForm.value.maNhanVien },
      caLamViec: { maCa: lichForm.value.maCa },
      ngayLam: lichForm.value.ngayLam,
      nhanVienQuanLy: lichForm.value.maNhanVienQuanLy ? { maNV: lichForm.value.maNhanVienQuanLy } : null,
      trangThai: lichForm.value.trangThai,
      ghiChu: lichForm.value.ghiChu,
      gioVao: lichForm.value.gioVao || null,
      gioRa: lichForm.value.gioRa || null
    }

    const headers = await getAuthenticatedHeaders()
    
    if (isEditing.value) {
      await axios.put(`${API_BASE_URL}/${lichForm.value.maLich}`, payload, { headers })
      showNotification('Cập nhật lịch làm việc thành công', 'success')
    } else {
      await axios.post(API_BASE_URL, payload, { headers })
      showNotification('Thêm lịch làm việc thành công', 'success')
    }
    
    await fetchLichLamViecs()
    closeModal()
  } catch (error) {
    console.error('Lỗi khi lưu lịch làm việc:', error)
    showNotification(`Lỗi khi lưu lịch làm việc: ${error.response?.data?.message || error.message}`, 'error')
  } finally {
    formLoading.value = false
  }
}

async function deleteLich() {
  formLoading.value = true
  try {
    const headers = await getAuthenticatedHeaders()
    await axios.delete(`${API_BASE_URL}/${lichToDelete.value.maLich}`, { headers })
    showNotification('Xóa lịch làm việc thành công', 'success')
    await fetchLichLamViecs()
    closeConfirmModal()
  } catch (error) {
    console.error('Lỗi khi xóa lịch làm việc:', error)
    showNotification('Lỗi khi xóa lịch làm việc', 'error')
  } finally {
    formLoading.value = false
  }
}

async function approveSchedule(lich) {
  actionLoading.value = true
  try {
    const payload = {
      ...lich,
      trangThai: 1,
      ngayDuyet: new Date().toISOString(),
      nhanVienQuanLy: { maNV: 'ADMIN' } // Có thể thay đổi theo user hiện tại
    }
    
    const headers = await getAuthenticatedHeaders()
    await axios.put(`${API_BASE_URL}/${lich.maLich}`, payload, { headers })
    showNotification('Duyệt lịch làm việc thành công', 'success')
    await fetchLichLamViecs()
  } catch (error) {
    console.error('Lỗi khi duyệt lịch làm việc:', error)
    showNotification('Lỗi khi duyệt lịch làm việc', 'error')
  } finally {
    actionLoading.value = false
  }
}

function clearSearch() {
  searchQuery.value = ''
}

function openAddModal() {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

function editLich(lich) {
  isEditing.value = true
  lichForm.value = {
    maLich: lich.maLich,
    maNhanVien: lich.nhanVien?.maNV || '',
    maCa: lich.caLamViec?.maCa || '',
    ngayLam: lich.ngayLam,
    maNhanVienQuanLy: lich.nhanVienQuanLy?.maNV || '',
    trangThai: lich.trangThai,
    ghiChu: lich.ghiChu || '',
    gioVao: lich.gioVao || '',
    gioRa: lich.gioRa || ''
  }
  showModal.value = true
}

function confirmDelete(lich) {
  lichToDelete.value = lich
  showConfirmModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function closeConfirmModal() {
  showConfirmModal.value = false
  lichToDelete.value = null
}

function resetForm() {
  lichForm.value = {
    maLich: null,
    maNhanVien: '',
    maCa: '',
    ngayLam: '',
    maNhanVienQuanLy: '',
    trangThai: 0,
    ghiChu: '',
    gioVao: '',
    gioRa: ''
  }
}

function formatTime(timeString) {
  if (!timeString) return '--:--'
  return timeString.substring(0, 5) // Format HH:MM
}

function formatDate(dateString) {
  if (!dateString) return '--/--/----'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

function formatShiftTime(caLamViec) {
  if (!caLamViec) return '--:-- - --:--'
  return `${formatTime(caLamViec.gioBatDau)} - ${formatTime(caLamViec.gioKetThuc)}`
}

function getStatusText(status) {
  const statusMap = {
    0: 'Chờ duyệt',
    1: 'Đã duyệt', 
    2: 'Từ chối',
    3: 'Hủy',
    4: 'Đã hoàn thành'
  }
  return statusMap[status] || 'Không xác định'
}

function getStatusClass(status) {
  const classMap = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
    3: 'cancelled',
    4: 'completed'
  }
  return classMap[status] || 'unknown'
}

function showNotification(message, type = 'success') {
  notification.value = {
    show: true,
    type: type,
    message: message,
    icon: type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
  }
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchLichLamViecs(),
    fetchNhanViens(),
    fetchCaLamViecs()
  ])
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.shift-management-container {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stat-label {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.3;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 600;
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

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 150px;
}

.filter-select:focus {
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
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
}

.add-btn:active {
  transform: translateY(0);
}

/* Table Styles */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.shift-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.shift-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.shift-table th {
  background: #f8fafc;
  color: #475569;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #e2e8f0;
}

.shift-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.shift-table tbody tr:hover {
  background: #f8fafc;
}

.shift-table tbody tr:last-child td {
  border-bottom: none;
}

/* Employee Info */
.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.employee-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.employee-position {
  font-size: 0.85rem;
  color: #64748b;
}

/* Shift Info */
.shift-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.shift-time {
  font-size: 0.85rem;
  color: #64748b;
}

.shift-duration {
  font-weight: 600;
  color: #1e293b;
}

/* Department Badges */
.department-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.department-badge.sale {
  background: #dbeafe;
  color: #1d4ed8;
}

.department-badge.kitchen {
  background: #dcfce7;
  color: #166534;
}

.department-badge.service {
  background: #fef3c7;
  color: #92400e;
}

.department-badge.cashier {
  background: #e0e7ff;
  color: #5b21b6;
}

/* Status Badges */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.scheduled {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.in-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.absent {
  background: #fecaca;
  color: #dc2626;
}

/* Check Times */
.check-time {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: #1e293b;
}

.shift-notes {
  color: #64748b;
  font-style: italic;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.edit-btn:hover {
  background: #bfdbfe;
  transform: translateY(-1px);
}

.status-btn {
  background: #fef3c7;
  color: #92400e;
}

.status-btn:hover {
  background: #fde68a;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fecaca;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fca5a5;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 0.8rem;
}

.btn-text {
  font-size: 0.85rem;
}

/* No Data State */
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
  font-size: 1.1rem;
  margin-bottom: 24px;
  font-weight: 500;
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
  transform: translateY(-2px);
}

/* Modal Styles */
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
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
  font-size: 1.2rem;
  cursor: pointer;
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

/* Form Styles */
.shift-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.required {
  color: #dc2626;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
  font-weight: 500;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.save-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

/* Confirm Modal */
.confirm-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.confirm-modal h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.confirm-modal p {
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.confirm-actions .delete-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-actions .delete-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .shift-management-container {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .shift-table {
    font-size: 0.85rem;
  }
  
  .shift-table th,
  .shift-table td {
    padding: 12px 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons button {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .header h2 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .shift-management-container {
    padding: 12px;
  }
  
  .header {
    padding: 16px;
  }
  
  .header h2 {
    font-size: 1.5rem;
  }
  
  .back-btn {
    padding: 10px 18px;
    font-size: 0.9rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .shift-form {
    padding: 20px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .confirm-modal {
    padding: 24px;
  }
}
</style>