<template>
  <div class="phieu-xuat-hang-container">
    <!-- Enhanced Header with White Background -->
    <div class="header-section">
      <div class="header-content">
        <router-link to="/home" class="back-btn">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/>
            <path d="m12 19-7-7 7-7"/>
          </svg>
          <span class="back-text">Trang chủ</span>
          <div class="back-shine"></div>
        </router-link>
        <div class="header-title">
          <h1>Quản lý Phiếu Xuất Hàng</h1>
          <p>Theo dõi và quản lý tất cả phiếu xuất hàng của hệ thống</p>
        </div>
      </div>
      <div class="header-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
        <div class="decoration-circle"></div>
      </div>
    </div>

    <!-- Create Button Section -->
    <div class="create-button-section">
      <button @click="showCreateModal = true" class="btn-create">
        <i class="fas fa-plus"></i> Tạo Phiếu Xuất Mới
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="search-filter">
      <div class="search-box">
        <input 
          v-model="searchTerm" 
          @input="filterPhieuXuat" 
          type="text" 
          placeholder="Tìm kiếm phiếu xuất..."
          class="search-input"
        />
        <i class="fas fa-search search-icon"></i>
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="filterPhieuXuat" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="0">Chờ xử lý</option>
          <option value="1">Đã xuất kho</option>
          <option value="2">Từ chối</option>
          <option value="3">Hủy</option>
        </select>
        <select v-model="dateFilter" @change="filterPhieuXuat" class="filter-select">
          <option value="">Tất cả ngày</option>
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalPhieuXuat }}</h3>
          <p>Tổng phiếu xuất</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ pendingPhieuXuat }}</h3>
          <p>Chờ xử lý</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon processing">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ processingPhieuXuat }}</h3>
          <p>Đã xuất kho</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <i class="fas fa-check-double"></i>
        </div>
        <div class="stat-content">
          <h3>{{ completedPhieuXuat }}</h3>
          <p>Hoàn thành</p>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã PXK</th>
            <th>Ngày xuất</th>
            <th>Kho xuất</th>
            <th>Nhân viên lập</th>
            <th>Số sản phẩm</th>
            <th>Tổng số lượng</th>
            <th>Tổng giá trị</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="phieu in filteredPhieuXuat" :key="phieu.maPXK" class="table-row">
            <td>{{ phieu.maPXK }}</td>
            <td>{{ formatDate(phieu.ngayXuat) }}</td>
            <td>{{ phieu.kho ? phieu.kho.tenKho : 'N/A' }}</td>
            <td>{{ phieu.nhanVienLap ? phieu.nhanVienLap.hoTen : 'N/A' }}</td>
            <td>{{ getPhieuProductCount(phieu.maPXK) }}</td>
            <td>{{ getPhieuTotalQuantity(phieu.maPXK) }}</td>
            <td>{{ formatCurrency(getPhieuTotalValue(phieu.maPXK)) }}</td>
            <td>
              <span :class="getStatusClass(phieu.trangThai)">
                {{ getStatusText(phieu.trangThai) }}
              </span>
            </td>
            <td>{{ phieu.ghiChu || 'Không có' }}</td>
            <td class="actions">
              <button @click="viewPhieuXuat(phieu)" class="btn-view" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editPhieuXuat(phieu)" class="btn-edit" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deletePhieuXuat(phieu.maPXK)" class="btn-delete" title="Xóa">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Sửa Phiếu Xuất' : 'Tạo Phiếu Xuất Mới' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Kho xuất *</label>
              <select v-model="formData.maKho" required class="form-input">
                <option value="">Chọn kho</option>
                <option v-for="kho in khoList" :key="kho.maKho" :value="kho.maKho">
                  {{ kho.tenKho }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Nhân viên lập *</label>
              <select v-model="formData.maNVLap" required class="form-input">
                <option value="">Chọn nhân viên</option>
                <option v-for="nv in nhanVienList" :key="nv.maNV" :value="nv.maNV">
                  {{ nv.hoTen }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Ngày xuất *</label>
              <input 
                v-model="formData.ngayXuat" 
                type="date" 
                class="form-input"
                :max="getCurrentDate()"
                required
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="formData.trangThai" class="form-input">
                <option value="0">Chờ xử lý</option>
                <option value="1">Đã xuất kho</option>
                <option value="2">Từ chối</option>
                <option value="3">Hủy</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ghi chú</label>
              <textarea v-model="formData.ghiChu" class="form-input" rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Hủy</button>
            <button type="submit" class="btn-submit">
              {{ showEditModal ? 'Cập nhật' : 'Tạo mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết Phiếu Xuất #{{ selectedPhieuXuat ? selectedPhieuXuat.maPXK : '' }}</h3>
          <button @click="closeDetailModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="detail-content">
          <div class="detail-section">
            <h4>Thông tin chung</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Mã phiếu:</span>
                <span class="value">{{ selectedPhieuXuat ? selectedPhieuXuat.maPXK : '' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Ngày xuất:</span>
                <span class="value">{{ formatDate(selectedPhieuXuat ? selectedPhieuXuat.ngayXuat : null) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Kho xuất:</span>
                <span class="value">{{ selectedPhieuXuat && selectedPhieuXuat.kho ? selectedPhieuXuat.kho.tenKho : '' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Nhân viên lập:</span>
                <span class="value">{{ selectedPhieuXuat && selectedPhieuXuat.nhanVienLap ? selectedPhieuXuat.nhanVienLap.hoTen : '' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Trạng thái:</span>
                <span class="value" :class="getStatusClass(selectedPhieuXuat ? selectedPhieuXuat.trangThai : null)">
                  {{ getStatusText(selectedPhieuXuat ? selectedPhieuXuat.trangThai : null) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Số sản phẩm:</span>
                <span class="value">{{ getPhieuProductCount(selectedPhieuXuat ? selectedPhieuXuat.maPXK : null) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Tổng số lượng:</span>
                <span class="value">{{ getPhieuTotalQuantity(selectedPhieuXuat ? selectedPhieuXuat.maPXK : null) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Tổng giá trị:</span>
                <span class="value">{{ formatCurrency(getPhieuTotalValue(selectedPhieuXuat ? selectedPhieuXuat.maPXK : null)) }}</span>
              </div>
            </div>
            <div class="detail-item full-width">
              <span class="label">Ghi chú:</span>
              <span class="value">{{ selectedPhieuXuat && selectedPhieuXuat.ghiChu ? selectedPhieuXuat.ghiChu : 'Không có' }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Danh sách sản phẩm xuất</h4>
            <div class="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Mã SP</th>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng xuất</th>
                    <th>Đơn giá xuất</th>
                    <th>Thành tiền</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ct in getPhieuChiTiet(selectedPhieuXuat ? selectedPhieuXuat.maPXK : null)" :key="ct.maCTPXK">
                    <td>{{ ct && ct.sanPham ? ct.sanPham.maSP : 'N/A' }}</td>
                    <td>{{ ct && ct.sanPham ? ct.sanPham.tenSP : 'N/A' }}</td>
                    <td>{{ ct ? ct.soLuongXuat : 0 }}</td>
                    <td>{{ formatCurrency(ct ? ct.donGiaXuat : 0) }}</td>
                    <td>{{ formatCurrency(ct ? ct.thanhTien : 0) }}</td>
                    <td>{{ ct && ct.ghiChu ? ct.ghiChu : 'Không có' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ChiTietPhieuXuat 
              :phieu-xuat-id="selectedPhieuXuat ? selectedPhieuXuat.maPXK : null"
              :tong-tien-xuat="getPhieuTotalValue(selectedPhieuXuat ? selectedPhieuXuat.maPXK : null)"
              @chi-tiet-updated="onChiTietUpdated"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getAllPhieuXuatKho, 
  createPhieuXuatKho, 
  updatePhieuXuatKho, 
  deletePhieuXuatKho,
  getAllChiTietPhieuXuat,
  getAllKho,
  getAllNhanVien,
  getAllSanPham
} from '../api.js'
import ChiTietPhieuXuat from './ChiTietPhieuXuat.vue'

export default {
  name: 'PhieuXuatHang',
  components: {
    ChiTietPhieuXuat
  },
  data() {
    return {
      phieuXuatList: [],
      filteredPhieuXuat: [],
      chiTietList: [],
      sanPhamList: [],
      khoList: [],
      nhanVienList: [],
      loading: false,
      searchTerm: '',
      statusFilter: '',
      dateFilter: '',
      showCreateModal: false,
      showEditModal: false,
      showDetailModal: false,
      selectedPhieuXuat: null,
      currentPage: 1,
      itemsPerPage: 10,
      formData: {
        maKho: '',
        maNVLap: '',
        ngayXuat: '',
        trangThai: '0',
        ghiChu: ''
      }
    }
  },
  computed: {
    totalPhieuXuat() {
      return this.phieuXuatList.length
    },
    pendingPhieuXuat() {
      return this.phieuXuatList.filter(p => p.trangThai === 0).length
    },
    processingPhieuXuat() {
      return this.phieuXuatList.filter(p => p.trangThai === 1).length
    },
    completedPhieuXuat() {
      return this.phieuXuatList.filter(p => p.trangThai === 1).length
    },
    totalPages() {
      return Math.ceil(this.filteredPhieuXuat.length / this.itemsPerPage)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [phieuXuatData, chiTietData, sanPhamData, khoData, nhanVienData] = await Promise.all([
          getAllPhieuXuatKho(),
          getAllChiTietPhieuXuat(),
          getAllSanPham(),
          getAllKho(),
          getAllNhanVien()
        ])
        
        this.phieuXuatList = phieuXuatData
        this.filteredPhieuXuat = [...phieuXuatData]
        this.chiTietList = chiTietData
        this.sanPhamList = sanPhamData
        this.khoList = khoData
        this.nhanVienList = nhanVienData
        
        // Enrich chi tiết data with sản phẩm information
        this.enrichChiTietData()
      } catch (error) {
        console.error('Error loading data:', error)
        this.showError('Không thể tải dữ liệu')
        // Fallback to mock data if API fails
        this.loadMockData()
      } finally {
        this.loading = false
      }
    },
    
    enrichChiTietData() {
      // Enrich chi tiết data with sản phẩm information
      this.chiTietList.forEach(chiTiet => {
        if (chiTiet.maSP && this.sanPhamList.length > 0) {
          const sanPham = this.sanPhamList.find(sp => sp.maSP === chiTiet.maSP)
          if (sanPham) {
            chiTiet.sanPham = sanPham
          }
        }
      })
    },
    
    loadMockData() {
      // Mock data for kho and nhân viên
      this.khoList = [
        { maKho: 1, tenKho: 'Kho A' },
        { maKho: 2, tenKho: 'Kho B' },
        { maKho: 3, tenKho: 'Kho C' }
      ]
      
      this.nhanVienList = [
        { maNV: 1, hoTen: 'Nguyễn Văn A' },
        { maNV: 2, hoTen: 'Trần Thị B' },
        { maNV: 3, hoTen: 'Lê Văn C' }
      ]
      
      // Mock data for sản phẩm
      this.sanPhamList = [
        { maSP: 'SP001', tenSP: 'Sản phẩm 1' },
        { maSP: 'SP002', tenSP: 'Sản phẩm 2' },
        { maSP: 'SP003', tenSP: 'Sản phẩm 3' }
      ]
    },
    
    // Helper methods for calculating statistics
    getPhieuProductCount(maPXK) {
      if (!maPXK) return 0
      return this.chiTietList.filter(ct => ct.phieuXuatKho && ct.phieuXuatKho.maPXK === maPXK).length
    },
    
    getPhieuTotalQuantity(maPXK) {
      if (!maPXK) return 0
      return this.chiTietList
        .filter(ct => ct.phieuXuatKho && ct.phieuXuatKho.maPXK === maPXK)
        .reduce((total, ct) => total + (ct.soLuongXuat || 0), 0)
    },
    
    getPhieuTotalValue(maPXK) {
      if (!maPXK) return 0
      return this.chiTietList
        .filter(ct => ct.phieuXuatKho && ct.phieuXuatKho.maPXK === maPXK)
        .reduce((total, ct) => total + (ct.thanhTien || 0), 0)
    },
    
    getPhieuChiTiet(maPXK) {
      if (!maPXK) return []
      return this.chiTietList.filter(ct => ct.phieuXuatKho && ct.phieuXuatKho.maPXK === maPXK)
    },
    
    filterPhieuXuat() {
      let filtered = [...this.phieuXuatList]
      
      // Search filter
      if (this.searchTerm) {
        filtered = filtered.filter(p => 
          p.maPXK.toString().includes(this.searchTerm) ||
          (p.kho ? p.kho.tenKho : '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          (p.nhanVienLap ? p.nhanVienLap.hoTen : '').toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }
      
      // Status filter
      if (this.statusFilter !== '') {
        filtered = filtered.filter(p => p.trangThai.toString() === this.statusFilter)
      }
      
      // Date filter
      if (this.dateFilter) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        filtered = filtered.filter(p => {
          if (!p.ngayXuat) return false
          const phieuDate = new Date(p.ngayXuat)
          
          switch (this.dateFilter) {
            case 'today':
              return phieuDate >= today
            case 'week':
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              return phieuDate >= weekAgo
            case 'month':
              const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
              return phieuDate >= monthAgo
            default:
              return true
          }
        })
      }
      
      this.filteredPhieuXuat = filtered
      this.currentPage = 1
    },
    
    async submitForm() {
      try {
        // Map form data to backend entity structure
        const mappedData = {
          kho: { maKho: this.formData.maKho },
          nhanVienLap: { maNV: this.formData.maNVLap },
          ngayXuat: this.formData.ngayXuat,
          trangThai: parseInt(this.formData.trangThai),
          ghiChu: this.formData.ghiChu || '',
          isDeleted: false
        }
        
        if (this.showEditModal) {
          await updatePhieuXuatKho(this.selectedPhieuXuat.maPXK, mappedData)
          this.showSuccess('Cập nhật phiếu xuất thành công')
        } else {
          await createPhieuXuatKho(mappedData)
          this.showSuccess('Tạo phiếu xuất thành công')
        }
        
        this.closeModal()
        await this.loadData()
      } catch (error) {
        console.error('Error submitting form:', error)
        this.showError('Có lỗi xảy ra khi xử lý yêu cầu')
      }
    },
    
    editPhieuXuat(phieu) {
      this.selectedPhieuXuat = phieu
      this.formData = {
        maKho: phieu.kho ? phieu.kho.maKho : '',
        maNVLap: phieu.nhanVienLap ? phieu.nhanVienLap.maNV : '',
        ngayXuat: this.formatDateForInput(phieu.ngayXuat),
        trangThai: phieu.trangThai ? phieu.trangThai.toString() : '0',
        ghiChu: phieu.ghiChu || ''
      }
      this.showEditModal = true
    },
    
    viewPhieuXuat(phieu) {
      this.selectedPhieuXuat = phieu
      this.showDetailModal = true
    },
    
    async deletePhieuXuat(id) {
      if (confirm('Bạn có chắc chắn muốn xóa phiếu xuất này?')) {
        try {
          await deletePhieuXuatKho(id)
          this.showSuccess('Xóa phiếu xuất thành công')
          await this.loadData()
        } catch (error) {
          console.error('Error deleting phieu xuat:', error)
          this.showError('Không thể xóa phiếu xuất')
        }
      }
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.selectedPhieuXuat = null
      this.resetForm()
    },
    
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedPhieuXuat = null
    },
    
    resetForm() {
      this.formData = {
        maKho: '',
        maNVLap: '',
        ngayXuat: '',
        trangThai: '0',
        ghiChu: ''
      }
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    },
    
    formatDateForInput(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    },
    
    formatCurrency(amount) {
      if (!amount) return '0 VNĐ'
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    },
    
    getStatusText(status) {
      const statusMap = {
        '0': 'Chờ xử lý',
        '1': 'Đã xuất kho',
        '2': 'Từ chối',
        '3': 'Hủy'
      }
      return statusMap[status] || 'Không xác định'
    },
    
    getStatusClass(status) {
      const classMap = {
        '0': 'status-pending',
        '1': 'status-processing',
        '2': 'status-rejected',
        '3': 'status-cancelled'
      }
      return classMap[status] || 'status-unknown'
    },
    
    getCurrentDate() {
      return new Date().toISOString().split('T')[0]
    },
    
    showSuccess(message) {
      // Có thể thay thế bằng toast notification sau này
      alert(message)
    },
    
    showError(message) {
      // Có thể thay thế bằng toast notification sau này
      alert(message)
    },
    
    onChiTietUpdated() {
      this.loadData() // Reload data to update the detail modal
    }
  }
}
</script>

<style scoped>
.phieu-xuat-hang-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  background: white;
  padding: 40px 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  border: 2px solid #e1e8ed;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-5px);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.back-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-icon {
  transform: translateX(-5px);
}

.back-text {
  position: relative;
  z-index: 1;
}

.back-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.6) 60%, rgba(255, 255, 255, 0) 100%);
  transform: skewX(-20deg);
  animation: shine 2s infinite linear;
}

@keyframes shine {
  from {
    transform: translateX(-100%) skewX(-20deg);
  }
  to {
    transform: translateX(100%) skewX(-20deg);
  }
}

.header-title {
  color: #2c3e50;
  text-shadow: none;
}

.header-title h1 {
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 800;
  color: #2c3e50;
}

.header-title p {
  margin: 0;
  font-size: 18px;
  color: #7f8c8d;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(50px);
  opacity: 0.5;
}

.decoration-circle:nth-child(1) {
  top: -50px;
  left: -50px;
}

.decoration-circle:nth-child(2) {
  bottom: 100px;
  right: 200px;
}

.decoration-circle:nth-child(3) {
  top: 200px;
  left: 300px;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
}

.create-button-section {
  text-align: right;
  margin-bottom: 20px;
}

.btn-create {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.search-filter {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 80%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 24px;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.processing {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e1e8ed;
  font-size: 13px;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e1e8ed;
  vertical-align: middle;
  font-size: 13px;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-view, .btn-edit, .btn-delete {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-view {
  background: #3498db;
  color: white;
}

.btn-edit {
  background: #f39c12;
  color: white;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-view:hover, .btn-edit:hover, .btn-delete:hover {
  transform: scale(1.1);
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-completed {
  background: #d4edda;
  color: #155724;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-cancelled {
  background: #e2e3e5;
  color: #383d41;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-unknown {
  background: #f8f9fa;
  color: #6c757d;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 2px solid #e1e8ed;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #2c3e50;
}

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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.detail-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #95a5a6;
  padding: 4px;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-form {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel, .btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
  border: none;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-cancel:hover, .btn-submit:hover {
  transform: translateY(-2px);
}

.detail-content {
  padding: 24px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section h4 {
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e1e8ed;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 4px;
  font-size: 14px;
}

.detail-item .value {
  color: #2c3e50;
  font-size: 16px;
}

.products-table {
  overflow-x: auto;
  margin-bottom: 20px;
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.products-table th,
.products-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
  white-space: nowrap;
}

.products-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
}

.products-table td {
  font-size: 13px;
}

.products-table tr:hover {
  background-color: #f8f9fa;
}

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
  color: #667eea;
}

.loading-spinner i {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-spinner p {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
    padding: 30px 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }

  .header-title {
    text-align: center;
  }

  .header-title h1 {
    font-size: 28px;
  }

  .header-title p {
    font-size: 14px;
  }

  .header-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .decoration-circle {
    width: 150px;
    height: 150px;
    opacity: 0.3;
  }

  .decoration-circle:nth-child(1) {
    top: -30px;
    left: -30px;
  }

  .decoration-circle:nth-child(2) {
    bottom: 70px;
    right: 150px;
  }

  .decoration-circle:nth-child(3) {
    top: 150px;
    left: 200px;
  }

  .create-button-section {
    text-align: center;
  }

  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-view, .btn-edit, .btn-delete {
    width: 32px;
    height: 32px;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    min-width: 800px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 6px;
    font-size: 12px;
  }
}
</style>
