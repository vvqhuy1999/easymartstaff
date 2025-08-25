<template>
    <div class="bang-luong-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="icon-wallet"></i>
          Quản lý Bảng Lương
        </h1>
        <div class="header-actions">
          <div class="search-box">
            <i class="icon-search"></i>
            <input 
              v-model="searchQuery" 
              placeholder="Tìm kiếm theo tên nhân viên..." 
              class="search-input"
            />
          </div>
          <button @click="openAddModal" class="btn btn-primary">
            <i class="icon-plus"></i>
            Thêm Bảng Lương
          </button>
        </div>
      </div>
  
      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Tháng:</label>
          <select v-model="filterMonth" class="filter-select">
            <option value="">Tất cả</option>
            <option v-for="month in 12" :key="month" :value="month">Tháng {{ month }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Năm:</label>
          <select v-model="filterYear" class="filter-select">
            <option value="">Tất cả</option>
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select v-model="filterStatus" class="filter-select">
            <option value="">Tất cả</option>
            <option value="0">Chưa thanh toán</option>
            <option value="1">Đã thanh toán</option>
          </select>
        </div>
      </div>
  
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue">
            <i class="icon-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalEmployees }}</h3>
            <p>Tổng nhân viên</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green">
            <i class="icon-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ paidSalaries }}</h3>
            <p>Đã thanh toán</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange">
            <i class="icon-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ unpaidSalaries }}</h3>
            <p>Chưa thanh toán</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple">
            <i class="icon-money"></i>
          </div>
          <div class="stat-content">
            <h3>{{ formatCurrency(totalAmount) }}</h3>
            <p>Tổng tiền lương</p>
          </div>
        </div>
      </div>
  
      <!-- Table -->
      <div class="table-card">
        <div class="table-header">
          <h3>Danh sách bảng lương</h3>
          <div class="table-actions">
            <select v-model="pageSize" class="page-size-select">
              <option value="10">10 dòng</option>
              <option value="25">25 dòng</option>
              <option value="50">50 dòng</option>
            </select>
          </div>
        </div>
  
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nhân viên</th>
                <th>Tháng/Năm</th>
                <th>Lương cơ bản</th>
                <th>Phụ cấp</th>
                <th>Thưởng</th>
                <th>Khấu trừ</th>
                <th>Tổng lương</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(luong, index) in paginatedLuongs" :key="luong.maLuong">
                <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td>
                  <div class="employee-info">
                    <div class="employee-avatar">{{ getInitials(luong.nhanVien?.hoTen) }}</div>
                    <div>
                      <div class="employee-name">{{ luong.nhanVien?.hoTen || 'N/A' }}</div>
                      <div class="employee-id">ID: {{ luong.nhanVien?.maNV || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="month-year">{{ luong.thangLuong }}/{{ luong.namLuong }}</span>
                </td>
                <td>{{ formatCurrency(luong.luongCoBan) }}</td>
                <td>{{ formatCurrency(luong.phuCap) }}</td>
                <td>{{ formatCurrency(luong.thuong) }}</td>
                <td>{{ formatCurrency(luong.khauTru) }}</td>
                <td class="total-salary">{{ formatCurrency(luong.tongLuong) }}</td>
                <td>
                  <span :class="['status-badge', luong.trangThai === 1 ? 'status-paid' : 'status-unpaid']">
                    {{ luong.trangThai === 1 ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="openEditModal(luong)" 
                      class="btn-icon btn-edit" 
                      title="Chỉnh sửa"
                    >
                      <i class="icon-edit"></i>
                    </button>
                    <button 
                      @click="togglePaymentStatus(luong)" 
                      :class="['btn-icon', luong.trangThai === 1 ? 'btn-unpay' : 'btn-pay']"
                      :title="luong.trangThai === 1 ? 'Đánh dấu chưa thanh toán' : 'Đánh dấu đã thanh toán'"
                    >
                      <i :class="luong.trangThai === 1 ? 'icon-x' : 'icon-check'"></i>
                    </button>
                    <button 
                      @click="confirmDelete(luong.maLuong)" 
                      class="btn-icon btn-delete" 
                      title="Xóa"
                    >
                      <i class="icon-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedLuongs.length === 0">
                <td colspan="10" class="no-data">
                  <div class="empty-state">
                    <i class="icon-folder"></i>
                    <p>Không có dữ liệu bảng lương</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            Hiển thị {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredLuongs.length) }} 
            của {{ filteredLuongs.length }} bản ghi
          </div>
          <div class="pagination">
            <button 
              @click="goToPage(1)" 
              :disabled="currentPage === 1"
              class="page-btn"
            >
              <i class="icon-chevrons-left"></i>
            </button>
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="page-btn"
            >
              <i class="icon-chevron-left"></i>
            </button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="page-btn"
            >
              <i class="icon-chevron-right"></i>
            </button>
            <button 
              @click="goToPage(totalPages)" 
              :disabled="currentPage === totalPages"
              class="page-btn"
            >
              <i class="icon-chevrons-right"></i>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Modal Form -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ isEditing ? 'Chỉnh sửa bảng lương' : 'Thêm bảng lương mới' }}</h3>
            <button @click="closeModal" class="btn-close">
              <i class="icon-x"></i>
            </button>
          </div>
  
          <form @submit.prevent="saveLuong" class="modal-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Nhân viên <span class="required">*</span></label>
                <select v-model="currentLuong.nhanVien.maNV" required class="form-select">
                  <option value="">Chọn nhân viên</option>
                  <option v-for="nv in employees" :key="nv.maNV" :value="nv.maNV">
                    {{ nv.hoTen }} (ID: {{ nv.maNV }})
                  </option>
                </select>
              </div>
  
              <div class="form-group">
                <label class="form-label">Tháng <span class="required">*</span></label>
                <select v-model="currentLuong.thangLuong" required class="form-select">
                  <option value="">Chọn tháng</option>
                  <option v-for="month in 12" :key="month" :value="month">Tháng {{ month }}</option>
                </select>
              </div>
  
              <div class="form-group">
                <label class="form-label">Năm <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="currentLuong.namLuong" 
                  required 
                  class="form-input"
                  :min="2020"
                  :max="2030"
                />
              </div>
  
              <div class="form-group">
                <label class="form-label">Lương cơ bản <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="currentLuong.luongCoBan" 
                  required 
                  class="form-input"
                  min="0"
                  step="1000"
                />
              </div>
  
              <div class="form-group">
                <label class="form-label">Phụ cấp</label>
                <input 
                  type="number" 
                  v-model="currentLuong.phuCap" 
                  class="form-input"
                  min="0"
                  step="1000"
                />
              </div>
  
              <div class="form-group">
                <label class="form-label">Thưởng</label>
                <input 
                  type="number" 
                  v-model="currentLuong.thuong" 
                  class="form-input"
                  min="0"
                  step="1000"
                />
              </div>
  
              <div class="form-group">
                <label class="form-label">Khấu trừ</label>
                <input 
                  type="number" 
                  v-model="currentLuong.khauTru" 
                  class="form-input"
                  min="0"
                  step="1000"
                />
              </div>
  
              <div class="form-group">
                <label class="form-label">Số ngày làm</label>
                <input 
                  type="number" 
                  v-model="currentLuong.soNgayLam" 
                  class="form-input"
                  min="0"
                  max="31"
                />
              </div>
  
              <div class="form-group">
                <label class="form-label">Số giờ làm</label>
                <input 
                  type="number" 
                  v-model="currentLuong.soGioLam" 
                  class="form-input"
                  min="0"
                  step="0.5"
                />
              </div>
  
              <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select v-model="currentLuong.trangThai" class="form-select">
                  <option value="0">Chưa thanh toán</option>
                  <option value="1">Đã thanh toán</option>
                </select>
              </div>
            </div>
  
            <div class="form-group full-width">
              <label class="form-label">Ghi chú</label>
              <textarea 
                v-model="currentLuong.ghiChu" 
                class="form-textarea"
                rows="3"
                placeholder="Nhập ghi chú (không bắt buộc)"
              ></textarea>
            </div>
  
            <div class="total-preview">
              <strong>Tổng lương: {{ formatCurrency(calculateTotal()) }}</strong>
            </div>
  
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Hủy bỏ
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="icon-save"></i>
                {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showConfirm" class="modal-overlay" @click="closeConfirm">
        <div class="modal-content confirm-modal" @click.stop>
          <div class="confirm-icon">
            <i class="icon-alert-triangle"></i>
          </div>
          <h3>Xác nhận xóa</h3>
          <p>Bạn có chắc chắn muốn xóa bảng lương này không? Hành động này không thể hoàn tác.</p>
          <div class="confirm-actions">
            <button @click="closeConfirm" class="btn btn-secondary">
              Hủy bỏ
            </button>
            <button @click="deleteLuongConfirmed" class="btn btn-danger">
              <i class="icon-trash"></i>
              Xóa
            </button>
          </div>
        </div>
      </div>
  
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Đang xử lý...</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import axios from 'axios'
  
  // API Configuration
const API_BASE_URL = 'http://localhost:8080/api/bangluong'
const EMPLOYEES_API_URL = 'http://localhost:8080/api/nhanvien'

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
  
  // Reactive Data
  const luongs = ref([])
  const employees = ref([])
  const searchQuery = ref('')
  const filterMonth = ref('')
  const filterYear = ref('')
  const filterStatus = ref('')
  const showModal = ref(false)
  const showConfirm = ref(false)
  const isEditing = ref(false)
  const loading = ref(false)
  const deleteLuongId = ref(null)
  
  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(10)
  
  // Form Data
  const currentLuong = reactive({
    maLuong: null,
    nhanVien: { maNV: '' },
    thangLuong: '',
    namLuong: new Date().getFullYear(),
    luongCoBan: 0,
    phuCap: 0,
    thuong: 0,
    khauTru: 0,
    soNgayLam: 0,
    soGioLam: 0,
    trangThai: 0,
    ghiChu: ''
  })
  
  // Computed Properties
  const years = computed(() => {
    const currentYear = new Date().getFullYear()
    const uniqueYears = [...new Set(luongs.value.map(l => l.namLuong))]
    const allYears = [...uniqueYears, currentYear - 1, currentYear, currentYear + 1]
    return [...new Set(allYears)].sort((a, b) => b - a)
  })
  
  const filteredLuongs = computed(() => {
    let filtered = luongs.value
  
    // Search by employee name
    if (searchQuery.value) {
      filtered = filtered.filter(l => 
        l.nhanVien?.hoTen?.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
  
    // Filter by month
    if (filterMonth.value) {
      filtered = filtered.filter(l => l.thangLuong === parseInt(filterMonth.value))
    }
  
    // Filter by year
    if (filterYear.value) {
      filtered = filtered.filter(l => l.namLuong === parseInt(filterYear.value))
    }
  
    // Filter by status
    if (filterStatus.value !== '') {
      filtered = filtered.filter(l => l.trangThai === parseInt(filterStatus.value))
    }
  
    return filtered
  })
  
  const totalPages = computed(() => Math.ceil(filteredLuongs.value.length / pageSize.value) || 1)
  
  const paginatedLuongs = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredLuongs.value.slice(start, end)
  })
  
  // Stats
  const totalEmployees = computed(() => new Set(luongs.value.map(l => l.nhanVien?.maNV)).size)
  const paidSalaries = computed(() => luongs.value.filter(l => l.trangThai === 1).length)
  const unpaidSalaries = computed(() => luongs.value.filter(l => l.trangThai === 0).length)
  const totalAmount = computed(() => 
    luongs.value.reduce((sum, l) => sum + (parseFloat(l.tongLuong) || 0), 0)
  )
  
  // Methods
  const fetchLuongs = async () => {
  try {
    loading.value = true
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_BASE_URL, { headers })
    luongs.value = response.data || []
  } catch (error) {
    console.error('Error fetching salaries:', error)
    luongs.value = []
  } finally {
    loading.value = false
  }
}
  
  const fetchEmployees = async () => {
  try {
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(EMPLOYEES_API_URL, { headers })
    employees.value = response.data || []
  } catch (error) {
    console.error('Error fetching employees:', error)
    employees.value = []
  }
}
  
  const saveLuong = async () => {
    try {
      loading.value = true
      
      // Prepare data
      const luongData = {
        ...currentLuong,
        luongCoBan: parseFloat(currentLuong.luongCoBan) || 0,
        phuCap: parseFloat(currentLuong.phuCap) || 0,
        thuong: parseFloat(currentLuong.thuong) || 0,
        khauTru: parseFloat(currentLuong.khauTru) || 0,
        soGioLam: parseFloat(currentLuong.soGioLam) || 0,
        tongLuong: calculateTotal(),
        isDeleted: false
      }
  
      const headers = await getAuthenticatedHeaders()
      
      if (isEditing.value) {
        await axios.put(`${API_BASE_URL}/${currentLuong.maLuong}`, luongData, { headers })
      } else {
        await axios.post(API_BASE_URL, luongData, { headers })
      }
      
      closeModal()
      fetchLuongs()
    } catch (error) {
      console.error('Error saving salary:', error)
      alert('Có lỗi xảy ra khi lưu dữ liệu!')
    } finally {
      loading.value = false
    }
  }
  
  const deleteLuongConfirmed = async () => {
  try {
    loading.value = true
    const headers = await getAuthenticatedHeaders()
    await axios.delete(`${API_BASE_URL}/${deleteLuongId.value}`, { headers })
    closeConfirm()
    fetchLuongs()
  } catch (error) {
    console.error('Error deleting salary:', error)
    alert('Có lỗi xảy ra khi xóa dữ liệu!')
  } finally {
    loading.value = false
  }
}
  
  const togglePaymentStatus = async (luong) => {
    try {
      loading.value = true
      const updatedLuong = {
        ...luong,
        trangThai: luong.trangThai === 1 ? 0 : 1,
        ngayThanhToan: luong.trangThai === 0 ? new Date().toISOString() : null
      }
      const headers = await getAuthenticatedHeaders()
      await axios.put(`${API_BASE_URL}/${luong.maLuong}`, updatedLuong, { headers })
      fetchLuongs()
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Có lỗi xảy ra khi cập nhật trạng thái!')
    } finally {
      loading.value = false
    }
  }
  
  const openAddModal = () => {
    isEditing.value = false
    Object.assign(currentLuong, {
      maLuong: null,
      nhanVien: { maNV: '' },
      thangLuong: '',
      namLuong: new Date().getFullYear(),
      luongCoBan: 0,
      phuCap: 0,
      thuong: 0,
      khauTru: 0,
      soNgayLam: 0,
      soGioLam: 0,
      trangThai: 0,
      ghiChu: ''
    })
    showModal.value = true
  }
  
  const openEditModal = (luong) => {
    isEditing.value = true
    Object.assign(currentLuong, {
      ...luong,
      nhanVien: { maNV: luong.nhanVien?.maNV || '' }
    })
    showModal.value = true
  }
  
  const closeModal = () => {
    showModal.value = false
  }
  
  const confirmDelete = (maLuong) => {
    deleteLuongId.value = maLuong
    showConfirm.value = true
  }
  
  const closeConfirm = () => {
    showConfirm.value = false
  }
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  const calculateTotal = () => {
    const basic = parseFloat(currentLuong.luongCoBan) || 0
    const allowance = parseFloat(currentLuong.phuCap) || 0
    const bonus = parseFloat(currentLuong.thuong) || 0
    const deduction = parseFloat(currentLuong.khauTru) || 0
    return basic + allowance + bonus - deduction
  }
  
  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }
  
  const getInitials = (name) => {
    if (!name) return 'N/A'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }
  
  // Watch for filter changes to reset pagination
  watch([filterMonth, filterYear, filterStatus, searchQuery], () => {
    currentPage.value = 1
  })
  
  // Initialize
  onMounted(() => {
    fetchLuongs()
    fetchEmployees()
  })
  </script>
  
  <style scoped>
  /* Icons (Simple CSS Icons) */
  .icon-wallet::before { content: '💼'; }
  .icon-search::before { content: '🔍'; }
  .icon-plus::before { content: '+'; }
  .icon-users::before { content: '👥'; }
  .icon-check::before { content: '✓'; }
  .icon-clock::before { content: '🕒'; }
  .icon-money::before { content: '💰'; }
  .icon-edit::before { content: '✏️'; }
  .icon-trash::before { content: '🗑️'; }
  .icon-x::before { content: '×'; }
  .icon-folder::before { content: '📁'; }
  .icon-chevron-left::before { content: '‹'; }
  .icon-chevron-right::before { content: '›'; }
  .icon-chevrons-left::before { content: '«'; }
  .icon-chevrons-right::before { content: '»'; }
  .icon-save::before { content: '💾'; }
  .icon-alert-triangle::before { content: '⚠️'; }
  
  /* Base Styles */
  * {
    box-sizing: border-box;
  }
  
  .bang-luong-container {
    padding: 2rem;
    background: #f8fafc;
    min-height: 100vh;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  }
  
  /* Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .search-box {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-box i {
    position: absolute;
    left: 12px;
    color: #64748b;
    z-index: 1;
  }
  
  .search-input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    width: 300px;
    transition: all 0.3s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  /* Buttons */
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
  }
  
  .btn-primary:hover {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    transform: translateY(-1px);
  }
  
  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }
  
  .btn-secondary:hover {
    background: #e2e8f0;
  }
  
  .btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }
  
  .btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
  }
  
  .btn-icon {
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-edit {
    background: #fef3c7;
    color: #d97706;
  }
  
  .btn-edit:hover {
    background: #fde68a;
  }
  
  .btn-delete {
    background: #fee2e2;
    color: #dc2626;
  }
  
  .btn-delete:hover {
    background: #fecaca;
  }
  
  .btn-pay {
    background: #dcfce7;
    color: #16a34a;
  }
  
  .btn-pay:hover {
    background: #bbf7d0;
  }
  
  .btn-unpay {
    background: #fed7d7;
    color: #e53e3e;
  }
  
  .btn-unpay:hover {
    background: #fbb6ce;
  }
  
  .btn-close {
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-close:hover {
    background: #e2e8f0;
  }
  
  /* Filters */
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 150px;
  }
  
  .filter-group label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }
  
  .filter-select {
    padding: 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }
  
  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  /* Stats Cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }
  
  .stat-icon.bg-blue {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1d4ed8;
  }
  
  .stat-icon.bg-green {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #16a34a;
  }
  
  .stat-icon.bg-orange {
    background: linear-gradient(135deg, #fed7aa, #fdba74);
    color: #ea580c;
  }
  
  .stat-icon.bg-purple {
    background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
    color: #9333ea;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #1e293b;
  }
  
  .stat-content p {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }
  
  /* Table */
  .table-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .table-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
  }
  
  .table-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .page-size-select {
    padding: 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.875rem;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th {
    background: #f8fafc;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
    white-space: nowrap;
  }
  
  .data-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    color: #4b5563;
    vertical-align: middle;
  }
  
  .data-table tbody tr:hover {
    background: #f9fafb;
  }
  
  .employee-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .employee-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .employee-name {
    font-weight: 600;
    color: #1e293b;
  }
  
  .employee-id {
    font-size: 0.75rem;
    color: #64748b;
  }
  
  .month-year {
    display: inline-block;
    background: #f1f5f9;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
  }
  
  .total-salary {
    font-weight: 700;
    color: #059669;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .status-paid {
    background: #dcfce7;
    color: #16a34a;
  }
  
  .status-unpaid {
    background: #fef3c7;
    color: #d97706;
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .no-data {
    text-align: center;
    padding: 3rem 1rem;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: #64748b;
  }
  
  .empty-state i {
    font-size: 3rem;
    opacity: 0.5;
  }
  
  /* Pagination */
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .pagination-info {
    font-size: 0.875rem;
    color: #64748b;
  }
  
  .pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .page-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .page-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-info {
    padding: 0 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  /* Modal */
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
    padding: 1rem;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }
  
  .modal-form {
    padding: 1.5rem;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }
  
  .required {
    color: #dc2626;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }
  
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .total-preview {
    background: #f0f9ff;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 1.125rem;
    color: #0c4a6e;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  /* Confirm Modal */
  .confirm-modal {
    max-width: 400px;
    text-align: center;
  }
  
  .confirm-icon {
    width: 64px;
    height: 64px;
    background: #fef3c7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1.5rem auto;
    font-size: 2rem;
    color: #d97706;
  }
  
  .confirm-modal h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }
  
  .confirm-modal p {
    color: #64748b;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .confirm-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  /* Loading */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  .loading-spinner {
    text-align: center;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-spinner p {
    color: #64748b;
    font-weight: 500;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .bang-luong-container {
      padding: 1rem;
    }
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
    
    .header-actions {
      flex-direction: column;
      gap: 1rem;
    }
    
    .search-input {
      width: 100%;
    }
    
    .filters {
      flex-direction: column;
      gap: 1rem;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .pagination-container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .modal-actions {
      flex-direction: column;
    }
    
    .confirm-actions {
      flex-direction: column;
    }
    
    .table-container {
      font-size: 0.875rem;
    }
    
    .data-table th,
    .data-table td {
      padding: 0.75rem 0.5rem;
    }
  }
  
  @media (max-width: 480px) {
    .page-title {
      font-size: 1.5rem;
    }
    
    .employee-info {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .modal-content {
      margin: 0.5rem;
    }
  }
  </style>