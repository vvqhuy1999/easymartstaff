<template>
  <div class="chi-tiet-phieu-nhap-container">
    <div class="header">
      <h3>Chi tiết Phiếu Nhập #{{ phieuNhapId }}</h3>
      <button @click="showAddModal = true" class="btn-add">
        <i class="fas fa-plus"></i> Thêm Sản phẩm
      </button>
    </div>

    <!-- Products Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng nhập</th>
            <th>Đơn giá nhập</th>
            <th>Thành tiền</th>
            <th>Hạn sử dụng</th>
            <th>Số lô</th>
            <th>Ngày sản xuất</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ct in chiTietList" :key="ct.maCTPN" class="table-row">
            <td>{{ ct.sanPham ? ct.sanPham.tenSP : 'N/A' }}</td>
            <td>{{ ct.soLuongNhap }}</td>
            <td>{{ formatCurrency(ct.donGiaNhap) }}</td>
            <td>{{ formatCurrency(ct.thanhTien) }}</td>
            <td>{{ formatDate(ct.ngayHetHan) }}</td>
            <td>{{ ct.soLo || 'N/A' }}</td>
            <td>{{ formatDate(ct.ngaySanXuat) }}</td>
            <td class="actions">
              <button @click="editChiTiet(ct)" class="btn-edit" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteChiTiet(ct.maCTPN)" class="btn-delete" title="Xóa">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary -->
    <div class="summary">
      <div class="summary-item">
        <span class="label">Tổng số sản phẩm:</span>
        <span class="value">{{ chiTietList.length }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Tổng tiền:</span>
        <span class="value total-amount">{{ formatCurrency(totalAmount) }}</span>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Sửa Chi tiết' : 'Thêm Sản phẩm' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-group">
            <label>Sản phẩm *</label>
            <select v-model="formData.maSP" required class="form-input">
              <option value="">Chọn sản phẩm</option>
              <option v-for="sp in sanPhamList" :key="sp.maSP" :value="sp.maSP">
                {{ sp.tenSP }} - {{ formatCurrency(sp.giaHienTai) }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Số lượng nhập *</label>
              <input 
                v-model.number="formData.soLuongNhap" 
                type="number" 
                min="1"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Đơn giá nhập *</label>
              <input 
                v-model.number="formData.donGiaNhap" 
                type="number" 
                min="0"
                step="1000"
                required
                class="form-input"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Hạn sử dụng</label>
              <input 
                v-model="formData.ngayHetHan" 
                type="date" 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Số lô</label>
              <input 
                v-model="formData.soLo" 
                type="text" 
                class="form-input"
                placeholder="Nhập số lô sản xuất"
              />
            </div>
          </div>
          <div class="form-group">
            <label>Ngày sản xuất</label>
            <input 
              v-model="formData.ngaySanXuat" 
              type="date" 
              class="form-input"
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Hủy</button>
            <button type="submit" class="btn-submit">
              {{ showEditModal ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getAllChiTietPhieuNhap,
  createChiTietPhieuNhap,
  updateChiTietPhieuNhap,
  deleteChiTietPhieuNhap,
  getAllProducts
} from '../api.js'

export default {
  name: 'ChiTietPhieuNhap',
  props: {
    phieuNhapId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      chiTietList: [],
      sanPhamList: [],
      loading: false,
      showAddModal: false,
      showEditModal: false,
      selectedChiTiet: null,
      formData: {
        maSP: '',
        soLuongNhap: 1,
        donGiaNhap: 0,
        ngayHetHan: '',
        soLo: '',
        ngaySanXuat: ''
      }
    }
  },
  computed: {
    totalAmount() {
      return this.chiTietList.reduce((sum, ct) => {
        return sum + (ct.thanhTien || 0)
      }, 0)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [chiTietData, sanPhamData] = await Promise.all([
          getAllChiTietPhieuNhap(),
          getAllProducts()
        ])
        
        // Filter chi tiết theo phiếu nhập
        this.chiTietList = chiTietData.filter(ct => 
          ct.phieuNhapHang && ct.phieuNhapHang.maPN == this.phieuNhapId
        )
        
        // Load sản phẩm list từ API
        this.sanPhamList = sanPhamData
      } catch (error) {
        console.error('Error loading chi tiết:', error)
        this.showError('Không thể tải dữ liệu')
        // Fallback to mock data if API fails
        this.loadSanPhamList()
      } finally {
        this.loading = false
      }
    },
    
    loadSanPhamList() {
      // Mock data for sản phẩm
      this.sanPhamList = [
        { maSP: 1, tenSP: 'Sản phẩm A', giaHienTai: 50000 },
        { maSP: 2, tenSP: 'Sản phẩm B', giaHienTai: 75000 },
        { maSP: 3, tenSP: 'Sản phẩm C', giaHienTai: 120000 }
      ]
    },
    
    async submitForm() {
      try {
        const chiTietData = {
          maSP: this.formData.maSP,
          soLuongNhap: this.formData.soLuongNhap,
          donGiaNhap: this.formData.donGiaNhap,
          ngayHetHan: this.formData.ngayHetHan || null,
          soLo: this.formData.soLo || null,
          ngaySanXuat: this.formData.ngaySanXuat || null,
          phieuNhapHang: { maPN: this.phieuNhapId }
        }
        
        if (this.showEditModal) {
          await updateChiTietPhieuNhap(this.selectedChiTiet.maCTPN, chiTietData)
          this.showSuccess('Cập nhật chi tiết thành công')
        } else {
          await createChiTietPhieuNhap(chiTietData)
          this.showSuccess('Thêm chi tiết thành công')
        }
        
        this.closeModal()
        await this.loadData()
        this.$emit('chi-tiet-updated')
      } catch (error) {
        console.error('Error submitting form:', error)
        this.showError('Có lỗi xảy ra khi xử lý yêu cầu')
      }
    },
    
    editChiTiet(chiTiet) {
      this.selectedChiTiet = chiTiet
      this.formData = {
        maSP: chiTiet.sanPham ? chiTiet.sanPham.maSP : '',
        soLuongNhap: chiTiet.soLuongNhap || 1,
        donGiaNhap: chiTiet.donGiaNhap || 0,
        ngayHetHan: this.formatDateForInput(chiTiet.ngayHetHan),
        soLo: chiTiet.soLo || '',
        ngaySanXuat: this.formatDateForInput(chiTiet.ngaySanXuat)
      }
      this.showEditModal = true
    },
    
    async deleteChiTiet(id) {
      if (confirm('Bạn có chắc chắn muốn xóa chi tiết này?')) {
        try {
          await deleteChiTietPhieuNhap(id)
          this.showSuccess('Xóa chi tiết thành công')
          await this.loadData()
          this.$emit('chi-tiet-updated')
        } catch (error) {
          console.error('Error deleting chi tiet:', error)
          this.showError('Không thể xóa chi tiết')
        }
      }
    },
    
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.selectedChiTiet = null
      this.resetForm()
    },
    
    resetForm() {
      this.formData = {
        maSP: '',
        soLuongNhap: 1,
        donGiaNhap: 0,
        ngayHetHan: '',
        soLo: '',
        ngaySanXuat: ''
      }
    },
    
    formatCurrency(amount) {
      if (!amount) return '0 VNĐ'
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
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
    
    showSuccess(message) {
      alert(message)
    },
    
    showError(message) {
      alert(message)
    }
  }
}
</script>

<style scoped>
.chi-tiet-phieu-nhap-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  color: #2c3e50;
  margin: 0;
}

.btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e1e8ed;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e1e8ed;
  vertical-align: middle;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.actions {
  display: flex;
  gap: 6px;
}

.btn-edit, .btn-delete {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #f39c12;
  color: white;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-edit:hover, .btn-delete:hover {
  transform: scale(1.1);
}

.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-item .label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-item .total-amount {
  color: #27ae60;
  font-size: 20px;
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
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #95a5a6;
  padding: 4px;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-form {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
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
  margin-top: 20px;
}

.btn-cancel, .btn-submit {
  padding: 10px 20px;
  border-radius: 6px;
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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .summary {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-edit, .btn-delete {
    width: 28px;
    height: 28px;
  }
}
</style>
