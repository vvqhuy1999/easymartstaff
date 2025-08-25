<template>
  <div>
    <AdminHeader />
    <div class="warehouse-container">
      <div class="header">
        <router-link to="/home" class="back-btn">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/>
            <path d="m12 19-7-7 7-7"/>
          </svg>
          <span class="back-text">Trang chủ</span>
          <div class="back-shine"></div>
        </router-link>
        <h2>Quản lý tồn kho</h2>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card" v-for="stat in stats" :key="stat.id">
          <div class="stat-card-header">
            <span class="stat-card-title">{{ stat.title }}</span>
            <div class="stat-card-icon" :class="stat.type">{{ stat.icon }}</div>
          </div>
          <div class="stat-card-value">{{ stat.value }}</div>
          <div class="stat-card-change" :class="stat.changeType">
            <span>{{ stat.changeIcon }}</span>
            <span>{{ stat.changeText }}</span>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="search-filter-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..."
            v-model="searchQuery"
            @input="onSearch"
          >
        </div>
        <div class="filter-dropdown" :class="{ active: showFilters }">
          <div class="filter-btn" @click="toggleFilters">
            <span>Bộ lọc</span>
            <span>⏷</span>
          </div>
          <div class="filter-dropdown-content">
            <div class="filter-group">
              <label>Kho</label>
              <div class="filter-options">
                <div 
                  class="filter-option" 
                  v-for="warehouse in warehouses" 
                  :key="warehouse.maKho"
                  :class="{ active: selectedWarehouses.includes(warehouse.maKho) }"
                  @click="toggleWarehouse(warehouse.maKho)"
                >
                  <input 
                    type="checkbox" 
                    :id="'warehouse' + warehouse.maKho"
                    :checked="selectedWarehouses.includes(warehouse.maKho)"
                    @change="toggleWarehouse(warehouse.maKho)"
                  >
                  <label :for="'warehouse' + warehouse.maKho">{{ warehouse.tenKho }}</label>
                </div>
              </div>
            </div>
            <div class="filter-group">
              <label>Trạng thái tồn kho</label>
              <div class="filter-options">
                <div 
                  class="filter-option" 
                  v-for="status in stockStatuses" 
                  :key="status.id"
                  :class="{ active: selectedStatuses.includes(status.id) }"
                  @click="toggleStatus(status.id)"
                >
                  <input 
                    type="checkbox" 
                    :id="'stock' + status.id"
                    :checked="selectedStatuses.includes(status.id)"
                    @change="toggleStatus(status.id)"
                  >
                  <label :for="'stock' + status.id">{{ status.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-import" @click="openImportModal">
          <span>📥</span>
          <span>Phiếu nhập</span>
        </button>
        <button class="btn-export" @click="openExportModal">
          <span>📤</span>
          <span>Phiếu xuất</span>
        </button>
        <button class="btn-add" @click="openAddModal">
          <span>+</span>
          <span>Thêm tồn kho</span>
        </button>
      </div>

      <!-- Main Content -->
      <div class="table-container">
        <div class="bulk-actions">
          <div class="bulk-select">
            <input 
              type="checkbox" 
              id="selectAll"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            >
            <label for="selectAll">Chọn tất cả</label>
          </div>
          <div class="bulk-buttons">
            <button class="btn-bulk-export" @click="exportSelected">Xuất Excel</button>
            <button class="btn-bulk-delete" @click="deleteSelected">Xóa đã chọn</button>
          </div>
        </div>
        
        <!-- Loading spinner -->
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
        
        <table class="products-table" v-else>
          <thead>
            <tr>
              <th></th>
              <th>Mã TKCT</th>
              <th>Sản phẩm</th>
              <th>Kho</th>
              <th>Số lượng tồn</th>
              <th>Tối thiểu</th>
              <th>Tối đa</th>
              <th>Ngày cập nhật</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredInventory.length === 0">
              <td colspan="10" class="no-data">
                {{ searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu tồn kho' }}
              </td>
            </tr>
            <tr v-for="item in paginatedInventory" :key="item.maTKCT">
              <td>
                <input 
                  type="checkbox" 
                  :checked="selectedItems.includes(item.maTKCT)"
                  @change="toggleItem(item.maTKCT)"
                >
              </td>
              <td><span class="product-code">{{ item.maTKCT }}</span></td>
              <td>
                <div class="product-name">
                  <div class="product-avatar">{{ getProductInitials(item.sanPham?.tenSP || 'SP') }}</div>
                  <div class="product-info">
                    <span class="name">{{ item.sanPham?.tenSP || 'N/A' }}</span>
                    <span class="code">{{ item.sanPham?.maSP || 'N/A' }}</span>
                  </div>
                </div>
              </td>
              <td><span class="warehouse-badge">{{ item.kho?.tenKho || 'N/A' }}</span></td>
              <td class="quantity-cell">
                <div class="quantity-info">
                  <span class="quantity-number">{{ item.soLuongTon || 0 }}</span>
                  <span class="quantity-unit">{{ item.sanPham?.donViTinh || 'cái' }}</span>
                </div>
              </td>
              <td class="min-quantity-cell">
                <span class="min-quantity">{{ item.soLuongToiThieu || 0 }}</span>
              </td>
              <td class="max-quantity-cell">
                <span class="max-quantity">{{ item.soLuongToiDa || 'N/A' }}</span>
              </td>
              <td><span class="update-date">{{ formatDateTime(item.ngayCapNhat) }}</span></td>
              <td>
                <span 
                  class="status-badge" 
                  :class="getStockStatusClass(item)"
                >
                  {{ getStockStatusText(item) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-edit" @click="editItem(item)" title="Chỉnh sửa">
                    ✏️
                  </button>
                  <button class="btn-delete" @click="deleteItem(item)" title="Xóa">
                    🗑️
                  </button>
                  <button class="btn-history" @click="viewHistory(item)" title="Lịch sử">
                    📊
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ←
        </button>
        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="pagination-btn" 
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span class="pagination-info">Trang {{ currentPage }} của {{ totalPages }}</span>
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          →
        </button>
      </div>

      <!-- Toast Notification -->
      <div class="toast-container">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="toast" 
          :class="toast.type"
        >
          <div class="toast-header">
            <span class="toast-title">{{ toast.title }}</span>
            <button class="toast-close" @click="removeToast(toast.id)">×</button>
          </div>
          <div class="toast-body">
            {{ toast.message }}
          </div>
        </div>
      </div>

      <!-- Modal for Add/Edit inventory item -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ editingItem.maTKCT ? 'Chỉnh sửa tồn kho' : 'Thêm tồn kho mới' }}</h3>
            <button class="modal-close" @click="closeEditModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-group">
                <label>Sản phẩm <span class="required">*</span></label>
                <select v-model="editingItem.sanPham" required>
                  <option value="">Chọn sản phẩm</option>
                  <option v-for="product in products" :key="product.maSP" :value="product">
                    {{ product.tenSP }} ({{ product.maSP }})
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>Kho <span class="required">*</span></label>
                <select v-model="editingItem.kho" required>
                  <option value="">Chọn kho</option>
                  <option v-for="warehouse in warehouses" :key="warehouse.maKho" :value="warehouse">
                    {{ warehouse.tenKho }}
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>Số lượng tồn <span class="required">*</span></label>
                <input 
                  type="number" 
                  v-model="editingItem.soLuongTon"
                  min="0"
                  required
                >
              </div>
              <div class="input-group">
                <label>Số lượng tối thiểu</label>
                <input 
                  type="number" 
                  v-model="editingItem.soLuongToiThieu"
                  min="0"
                >
              </div>
              <div class="input-group">
                <label>Số lượng tối đa</label>
                <input 
                  type="number" 
                  v-model="editingItem.soLuongToiDa"
                  min="0"
                >
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeEditModal">Hủy</button>
            <button class="btn-confirm" @click="saveItem" :disabled="!isValidForm">
              {{ editingItem.maTKCT ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal for Import Order -->
      <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
        <div class="modal-content import-modal" @click.stop>
          <div class="modal-header">
            <h3>Phiếu nhập hàng mới</h3>
            <button class="modal-close" @click="closeImportModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-group">
                <label>Kho nhập <span class="required">*</span></label>
                <select v-model="importOrder.kho" required>
                  <option value="">Chọn kho</option>
                  <option v-for="warehouse in warehouses" :key="warehouse.maKho" :value="warehouse">
                    {{ warehouse.tenKho }}
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>Nhà cung cấp <span class="required">*</span></label>
                <select v-model="importOrder.nhaCungCap" required>
                  <option value="">Chọn nhà cung cấp</option>
                  <option v-for="ncc in nhaCungCaps" :key="ncc.maNCC" :value="ncc">
                    {{ ncc.tenNCC }} ({{ ncc.maNCC }})
                  </option>
                </select>
                <small v-if="importOrder.nhaCungCap" class="supplier-info">
                  📞 {{ importOrder.nhaCungCap.soDienThoai || 'Chưa có số điện thoại' }} | 
                  📧 {{ importOrder.nhaCungCap.email || 'Chưa có email' }}
                </small>
              </div>
              <div class="input-group">
                <label>Ghi chú</label>
                <textarea 
                  v-model="importOrder.ghiChu"
                  placeholder="Ghi chú về phiếu nhập"
                ></textarea>
              </div>
            </div>
            
            <!-- Hiển thị thông tin đã chọn -->
            <div v-if="importOrder.kho || importOrder.nhaCungCap" class="selected-info">
              <h4>Thông tin đã chọn</h4>
              <div class="selected-info-grid">
                <div v-if="importOrder.kho" class="selected-item">
                  <span class="selected-label">Kho nhập:</span>
                  <span class="selected-value">{{ importOrder.kho.tenKho }}</span>
                </div>
                <div v-if="importOrder.nhaCungCap" class="selected-item">
                  <span class="selected-label">Nhà cung cấp:</span>
                  <span class="selected-value">{{ importOrder.nhaCungCap.tenNCC }}</span>
                </div>
              </div>
            </div>

            <div class="import-summary">
              <h4>Chi tiết sản phẩm nhập</h4>
              <div v-if="!importOrder.nhaCungCap" class="warning-message">
                ⚠️ Vui lòng chọn nhà cung cấp trước khi thêm sản phẩm
              </div>
              <div class="form-grid">
                <div class="input-group">
                  <label>Sản phẩm <span class="required">*</span></label>
                  <select v-model="importDetail.sanPham" required>
                    <option value="">Chọn sản phẩm</option>
                    <option v-for="product in products" :key="product.maSP" :value="product">
                      {{ product.tenSP }} ({{ product.maSP }})
                    </option>
                  </select>
                </div>
                <div class="input-group">
                  <label>Số lượng <span class="required">*</span></label>
                  <input 
                    type="number" 
                    v-model="importDetail.soLuong"
                    min="1"
                    required
                  >
                </div>
                <div class="input-group">
                  <label>Đơn giá</label>
                  <input 
                    type="number" 
                    v-model="importDetail.donGia"
                    min="0"
                    step="1000"
                  >
                </div>
              </div>
              <button class="btn-add-item" @click="addImportDetail">
                <span>+</span>
                <span>Thêm sản phẩm</span>
              </button>
            </div>

            <div v-if="importDetailsList.length > 0" class="import-details-list">
              <h4>Thông tin phiếu nhập</h4>
              <div class="import-summary-info">
                <div class="summary-row">
                  <span class="summary-label">Kho nhập:</span>
                  <span class="summary-value">{{ importOrder.kho?.tenKho || 'Chưa chọn' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Nhà cung cấp:</span>
                  <span class="summary-value">{{ importOrder.nhaCungCap?.tenNCC || 'Chưa chọn' }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Ghi chú:</span>
                  <span class="summary-value">{{ importOrder.ghiChu || 'Không có' }}</span>
                </div>
              </div>
              
              <h4>Danh sách sản phẩm nhập</h4>
              <div class="details-table">
                <table>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(detail, index) in importDetailsList" :key="index">
                      <td>{{ detail.sanPham?.tenSP }}</td>
                      <td>{{ detail.soLuong }}</td>
                      <td>{{ formatCurrency(detail.donGia) }}</td>
                      <td>{{ formatCurrency(detail.soLuong * detail.donGia) }}</td>
                      <td>
                        <button class="btn-remove" @click="removeImportDetail(index)">🗑️</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="total-summary">
                <span class="total-label">Tổng tiền:</span>
                <span class="total-value">{{ formatCurrency(importTotal) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeImportModal">Hủy</button>
            <button class="btn-confirm" @click="createImportOrder" :disabled="!isValidImportForm">
              Tạo phiếu nhập
            </button>
          </div>
        </div>
      </div>

      <!-- Modal for Export Order -->
      <div v-if="showExportModal" class="modal-overlay" @click="closeExportModal">
        <div class="modal-content export-modal" @click.stop>
          <div class="modal-header">
            <h3>Phiếu xuất kho mới</h3>
            <button class="modal-close" @click="closeExportModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-group">
                <label>Kho xuất <span class="required">*</span></label>
                <select v-model="exportOrder.kho" required>
                  <option value="">Chọn kho</option>
                  <option v-for="warehouse in warehouses" :key="warehouse.maKho" :value="warehouse">
                    {{ warehouse.tenKho }}
                  </option>
                </select>
              </div>
              <div class="input-group">
                <label>Người nhận</label>
                <input 
                  type="text" 
                  v-model="exportOrder.nguoiNhan"
                  placeholder="Tên người nhận"
                >
              </div>
              <div class="input-group">
                <label>Lý do xuất</label>
                <textarea 
                  v-model="exportOrder.lyDoXuat"
                  placeholder="Lý do xuất kho"
                ></textarea>
              </div>
            </div>

            <div class="export-summary">
              <h4>Chi tiết sản phẩm xuất</h4>
              <div class="form-grid">
                <div class="input-group">
                  <label>Sản phẩm <span class="required">*</span></label>
                  <select v-model="exportDetail.sanPham" required>
                    <option value="">Chọn sản phẩm</option>
                    <option v-for="product in products" :key="product.maSP" :value="product">
                      {{ product.tenSP }} ({{ product.maSP }}) - Tồn: {{ getProductStock(product.maSP) }}
                    </option>
                  </select>
                </div>
                <div class="input-group">
                  <label>Số lượng <span class="required">*</span></label>
                  <input 
                    type="number" 
                    v-model="exportDetail.soLuong"
                    min="1"
                    :max="getProductStock(exportDetail.sanPham?.maSP)"
                    required
                  >
                  <small class="stock-info">Tồn kho: {{ getProductStock(exportDetail.sanPham?.maSP) }}</small>
                </div>
              </div>
              <button class="btn-add-item" @click="addExportDetail">
                <span>+</span>
                <span>Thêm sản phẩm</span>
              </button>
            </div>

            <div v-if="exportDetailsList.length > 0" class="export-details-list">
              <h4>Danh sách sản phẩm xuất</h4>
              <div class="details-table">
                <table>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Tồn kho</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(detail, index) in exportDetailsList" :key="index">
                      <td>{{ detail.sanPham?.tenSP }}</td>
                      <td>{{ detail.soLuong }}</td>
                      <td>{{ getProductStock(detail.sanPham?.maSP) }}</td>
                      <td>
                        <button class="btn-remove" @click="removeExportDetail(index)">🗑️</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeExportModal">Hủy</button>
            <button class="btn-confirm" @click="createExportOrder" :disabled="!isValidExportForm">
              Tạo phiếu xuất
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
        <div class="modal-content confirm-modal" @click.stop>
          <div class="modal-header">
            <h3>{{ confirmModal.title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ confirmModal.message }}</p>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeConfirmModal">Hủy</button>
            <button class="btn-confirm btn-danger" @click="confirmAction">
              {{ confirmModal.confirmText }}
            </button>
          </div>
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
import axios from 'axios'

// ===== CÁC API ENDPOINTS =====
// API cơ sở cho tồn kho chi tiết
const API_BASE_URL = 'http://localhost:8080/api/tonkhochitiet'
// API cho sản phẩm
const API_SANPHAM = 'http://localhost:8080/api/sanpham'
// API cho kho
const API_KHO = 'http://localhost:8080/api/kho'
// API cho nhà cung cấp
const API_NHA_CUNG_CAP = 'http://localhost:8080/api/nhacungcap'
// API cho phiếu nhập hàng
const API_PHIEU_NHAP = 'http://localhost:8080/api/phieunhaphang'
// API cho phiếu xuất kho
const API_PHIEU_XUAT = 'http://localhost:8080/api/phieuxuatkho'
// API cho chi tiết phiếu nhập
const API_CHI_TIET_NHAP = 'http://localhost:8080/api/chitietphieunhap'
// API cho chi tiết phiếu xuất
const API_CHI_TIET_XUAT = 'http://localhost:8080/api/chitietphieuxuat'

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

// ===== DỮ LIỆU PHẢN ỨNG =====
const searchQuery = ref('')
const showFilters = ref(false)
const selectedWarehouses = ref([])
const selectedStatuses = ref([])
const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showEditModal = ref(false)
const showImportModal = ref(false)
const showExportModal = ref(false)
const showConfirmModal = ref(false)
const editingItem = ref({})
const confirmModal = ref({})
const toasts = ref([])
const loading = ref(false)

// ===== STATE CHO PHIẾU NHẬP =====
const importOrder = ref({
  kho: null,
  nhaCungCap: null,
  ghiChu: ''
})

const importDetail = ref({
  sanPham: null,
  soLuong: 1,
  donGia: 0
})

const importDetailsList = ref([])

// ===== STATE CHO PHIẾU XUẤT =====
const exportOrder = ref({
  kho: null,
  nguoiNhan: '',
  lyDoXuat: ''
})

const exportDetail = ref({
  sanPham: null,
  soLuong: 1
})

const exportDetailsList = ref([])

// ===== DỮ LIỆU TỪ API =====
const inventory = ref([]) // Danh sách tồn kho chi tiết
const products = ref([]) // Danh sách sản phẩm
const warehouses = ref([]) // Danh sách kho
const nhaCungCaps = ref([]) // Danh sách nhà cung cấp
const importOrders = ref([]) // Danh sách phiếu nhập hàng
const exportOrders = ref([]) // Danh sách phiếu xuất kho
const importDetails = ref([]) // Chi tiết phiếu nhập
const exportDetails = ref([]) // Chi tiết phiếu xuất

// ===== DỮ LIỆU TĨNH =====
const stats = ref([
  {
    id: 1,
    title: 'Tổng mặt hàng',
    value: '0',
    icon: '📦',
    type: 'products',
    changeType: 'neutral',
    changeIcon: '→',
    changeText: 'Tổng quan'
  },
  {
    id: 2,
    title: 'Cảnh báo hết hàng',
    value: '0',
    icon: '⚠️',
    type: 'alerts',
    changeType: 'negative',
    changeIcon: '!',
    changeText: 'Cần nhập thêm'
  },
  {
    id: 3,
    title: 'Tồn kho thấp',
    value: '0',
    icon: '📉',
    type: 'low-stock',
    changeType: 'warning',
    changeIcon: '↓',
    changeText: 'Dưới mức tối thiểu'
  },
  {
    id: 4,
    title: 'Nhà cung cấp',
    value: '0',
    icon: '🏢',
    type: 'suppliers',
    changeType: 'positive',
    changeIcon: '✓',
    changeText: 'Đang hoạt động'
  }
])

const stockStatuses = ref([
  { id: 1, name: 'Còn hàng', filter: 'in-stock' },
  { id: 2, name: 'Sắp hết', filter: 'low-stock' },
  { id: 3, name: 'Hết hàng', filter: 'out-of-stock' },
  { id: 4, name: 'Vượt mức', filter: 'over-stock' }
])

// ===== CÁC HÀM GỌI API =====

// Lấy dữ liệu tồn kho chi tiết từ TonKhoChiTietRestController
const fetchInventory = async () => {
  try {
    loading.value = true
    console.log('Đang tải dữ liệu tồn kho...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_BASE_URL, { headers })
    
    inventory.value = response.data || []
    console.log('Dữ liệu tồn kho đã được tải:', inventory.value.length, 'mục')
    
    updateStats()
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu tồn kho:', error)
    showToast('Lỗi khi tải dữ liệu tồn kho', 'error')
    inventory.value = []
  } finally {
    loading.value = false
  }
}

// Lấy danh sách sản phẩm từ SanPhamRestController
const fetchProducts = async () => {
  try {
    console.log('Đang tải danh sách sản phẩm...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_SANPHAM, { headers })
    
    products.value = response.data || []
    console.log('Danh sách sản phẩm đã được tải:', products.value.length, 'sản phẩm')
    
  } catch (error) {
    console.error('Lỗi khi tải danh sách sản phẩm:', error)
    showToast('Lỗi khi tải danh sách sản phẩm', 'error')
    products.value = []
  }
}

// Lấy danh sách kho từ KhoRestController (cần tạo endpoint)
const fetchWarehouses = async () => {
  try {
    console.log('Đang tải danh sách kho...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_KHO, { headers })
    
    warehouses.value = response.data || []
    console.log('Danh sách kho đã được tải:', warehouses.value.length, 'kho')
    
  } catch (error) {
    console.error('Lỗi khi tải danh sách kho:', error)
    showToast('Lỗi khi tải danh sách kho', 'error')
    warehouses.value = []
  }
}

// Lấy danh sách nhà cung cấp từ NhaCungCapRestController
const fetchNhaCungCaps = async () => {
  try {
    console.log('Đang tải danh sách nhà cung cấp...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_NHA_CUNG_CAP, { headers })
    
    nhaCungCaps.value = response.data || []
    console.log('Danh sách nhà cung cấp đã được tải:', nhaCungCaps.value.length, 'nhà cung cấp')
    
  } catch (error) {
    console.error('Lỗi khi tải danh sách nhà cung cấp:', error)
    showToast('Lỗi khi tải danh sách nhà cung cấp', 'error')
    nhaCungCaps.value = []
  }
}

// Lấy danh sách phiếu nhập hàng từ PhieuNhapHangRestController
const fetchImportOrders = async () => {
  try {
    console.log('Đang tải danh sách phiếu nhập hàng...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_PHIEU_NHAP, { headers })
    
    importOrders.value = response.data || []
    console.log('Danh sách phiếu nhập hàng đã được tải:', importOrders.value.length, 'phiếu')
    
  } catch (error) {
    console.error('Lỗi khi tải danh sách phiếu nhập hàng:', error)
    importOrders.value = []
  }
}

// Lấy danh sách phiếu xuất kho từ PhieuXuatKhoRestController
const fetchExportOrders = async () => {
  try {
    console.log('Đang tải danh sách phiếu xuất kho...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_PHIEU_XUAT, { headers })
    
    exportOrders.value = response.data || []
    console.log('Danh sách phiếu xuất kho đã được tải:', exportOrders.value.length, 'phiếu')
    
  } catch (error) {
    console.error('Lỗi khi tải danh sách phiếu xuất kho:', error)
    exportOrders.value = []
  }
}

// Lấy chi tiết phiếu nhập từ ChiTietPhieuNhapRestController
const fetchImportDetails = async () => {
  try {
    console.log('Đang tải chi tiết phiếu nhập...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_CHI_TIET_NHAP, { headers })
    importDetails.value = response.data || []
    console.log('Chi tiết phiếu nhập đã được tải:', importDetails.value.length, 'mục')
    
  } catch (error) {
    console.error('Lỗi khi tải chi tiết phiếu nhập:', error)
    importDetails.value = []
  }
}

// Lấy chi tiết phiếu xuất từ ChiTietPhieuXuatRestController
const fetchExportDetails = async () => {
  try {
    console.log('Đang tải chi tiết phiếu xuất...')
    
    const headers = await getAuthenticatedHeaders()
    const response = await axios.get(API_CHI_TIET_XUAT, { headers })
    exportDetails.value = response.data || []
    console.log('Chi tiết phiếu xuất đã được tải:', exportDetails.value.length, 'mục')
    
  } catch (error) {
    console.error('Lỗi khi tải chi tiết phiếu xuất:', error)
    exportDetails.value = []
  }
}

// Tạo tồn kho chi tiết mới thông qua TonKhoChiTietRestController
const createInventoryItem = async (item) => {
  try {
    console.log('Đang tạo tồn kho mới:', item)
    
    const response = await axios.post(API_BASE_URL, item, {
      timeout: 30000
    })
    
    console.log('Tồn kho mới đã được tạo:', response.data)
    
    return response.data
  } catch (error) {
    console.error('Lỗi khi tạo tồn kho:', error)
    throw error
  }
}

// ===== CÁC HÀM XỬ LÝ PHIẾU NHẬP =====

// Tạo phiếu nhập hàng mới
const createImportOrder = async () => {
  try {
    loading.value = true
    console.log('=== BẮT ĐẦU TẠO PHIẾU NHẬP HÀNG ===')
    
    // Validate dữ liệu cơ bản
    if (!importOrder.value.kho || !importOrder.value.nhaCungCap) {
      throw new Error('Vui lòng chọn kho và nhà cung cấp')
    }
    
    if (importDetailsList.value.length === 0) {
      throw new Error('Vui lòng thêm ít nhất một sản phẩm vào danh sách nhập')
    }
    
    // Validate chi tiết sản phẩm
    for (const detail of importDetailsList.value) {
      if (!detail.sanPham || !detail.sanPham?.maSP || !detail.sanPham?.tenSP) {
        throw new Error(`Sản phẩm không hợp lệ: ${detail.sanPham?.tenSP || 'Không xác định'}`)
      }
      if (!detail.soLuong || detail.soLuong <= 0) {
        throw new Error(`Số lượng không hợp lệ cho sản phẩm ${detail.sanPham?.tenSP}: ${detail.soLuong}`)
      }
      if (detail.donGia < 0) {
        throw new Error(`Đơn giá không hợp lệ cho sản phẩm ${detail.sanPham?.tenSP}: ${detail.donGia}`)
      }
    }
    
    // Tạo dữ liệu phiếu nhập đơn giản hơn
    const importOrderData = {
      maKho: importOrder.value.kho.maKho,
      maNCC: importOrder.value.nhaCungCap.maNCC,
      ghiChu: importOrder.value.ghiChu || '',
      ngayNhap: new Date().toISOString(),
      trangThai: 1,
      tongTien: importTotal.value
    }
    
    console.log('Dữ liệu gửi lên API phiếu nhập:', importOrderData)
    
    // Gọi API tạo phiếu nhập hàng
    const importResponse = await axios.post(API_PHIEU_NHAP, importOrderData, {
      timeout: 30000
    })
    
    if (!importResponse.data) {
      throw new Error('API không trả về dữ liệu phiếu nhập hàng')
    }
    
    const createdImportOrder = importResponse.data
    console.log('✅ Phiếu nhập hàng đã được tạo thành công:', createdImportOrder)
    
    // Lấy ID phiếu nhập
    const phieuNhapId = createdImportOrder.maPNH || createdImportOrder.id
    if (!phieuNhapId) {
      throw new Error('API không trả về ID phiếu nhập hàng hợp lệ')
    }
    
    // Tạo chi tiết phiếu nhập
    console.log('Đang tạo chi tiết phiếu nhập...')
    for (const detail of importDetailsList.value) {
      try {
        const importDetailData = {
          maPNH: phieuNhapId,
          maSP: detail.sanPham.maSP,
          soLuong: detail.soLuong,
          donGia: detail.donGia || 0
        }
        
        console.log('Tạo chi tiết cho sản phẩm:', detail.sanPham.tenSP, 'với dữ liệu:', importDetailData)
        
        const detailResponse = await axios.post(API_CHI_TIET_NHAP, importDetailData, {
          timeout: 30000
        })
        
        if (!detailResponse.data) {
          throw new Error(`API không trả về dữ liệu chi tiết cho sản phẩm ${detail.sanPham.tenSP}`)
        }
        
        console.log('✅ Chi tiết phiếu nhập đã được tạo:', detailResponse.data)
        
      } catch (detailError) {
        console.error('❌ Lỗi khi tạo chi tiết phiếu nhập cho sản phẩm:', detail.sanPham?.tenSP, detailError)
        throw new Error(`Không thể tạo chi tiết cho sản phẩm ${detail.sanPham?.tenSP}: ${detailError.message}`)
      }
    }
    
    // Cập nhật tồn kho
    console.log('Đang cập nhật tồn kho...')
    await updateInventoryAfterImport()
    
    showToast('Tạo phiếu nhập hàng thành công!', 'success')
    closeImportModal()
    
    // Làm mới dữ liệu tồn kho
    await fetchInventory()
    
    console.log('=== HOÀN THÀNH TẠO PHIẾU NHẬP HÀNG ===')
    
  } catch (error) {
    console.error('❌ LỖI KHI TẠO PHIẾU NHẬP HÀNG:', error)
    
    let errorMessage = 'Có lỗi xảy ra khi tạo phiếu nhập hàng'
    
    if (error.response) {
      // Lỗi từ server
      console.error('Response data:', error.response.data)
      console.error('Response status:', error.response.status)
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error
      } else {
        errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`
      }
    } else if (error.request) {
      // Lỗi network
      errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    } else {
      // Lỗi khác
      errorMessage = error.message || 'Có lỗi xảy ra'
    }
    
    showToast(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

// Cập nhật tồn kho sau khi nhập hàng
const updateInventoryAfterImport = async () => {
  try {
    console.log('=== BẮT ĐẦU CẬP NHẬT TỒN KHO SAU NHẬP HÀNG ===')
    
    const importDetails = importDetailsList.value
    console.log('Chi tiết phiếu nhập từ danh sách:', importDetails)
    
    if (!importDetails || importDetails.length === 0) {
      throw new Error('Không có dữ liệu chi tiết để cập nhật tồn kho')
    }
    
    if (!importOrder.value.kho || !importOrder.value.kho?.maKho) {
      throw new Error('Thông tin kho không hợp lệ để cập nhật tồn kho')
    }
    
    for (const detail of importDetails) {
      try {
        console.log('Xử lý sản phẩm:', detail.sanPham?.tenSP, 'số lượng:', detail.soLuong)
        
        // Validate dữ liệu sản phẩm
        if (!detail.sanPham || !detail.sanPham?.maSP || !detail.sanPham?.tenSP) {
          throw new Error(`Thông tin sản phẩm không hợp lệ: ${detail.sanPham?.tenSP || 'Không xác định'}`)
        }
        
        if (!detail.soLuong || detail.soLuong <= 0) {
          throw new Error(`Số lượng không hợp lệ cho sản phẩm ${detail.sanPham?.tenSP}: ${detail.soLuong}`)
        }
        
        // Kiểm tra xem đã có tồn kho cho sản phẩm này trong kho chưa
        const existingInventory = inventory.value.find(item => 
          item.sanPham?.maSP === detail.sanPham?.maSP && 
          item.kho?.maKho === importOrder.value.kho?.maKho
        )
        
        if (existingInventory) {
          // Cập nhật số lượng tồn
          console.log('Cập nhật tồn kho hiện có:', existingInventory.maTKCT)
          const updatedQuantity = existingInventory.soLuongTon + detail.soLuong
          
          const updatedInventory = await updateInventoryItem(existingInventory.maTKCT, {
            ...existingInventory,
            soLuongTon: updatedQuantity,
            ngayCapNhat: new Date().toISOString()
          })
          
          console.log('✅ Đã cập nhật tồn kho:', updatedInventory)
          
          // Cập nhật trong danh sách local
          const index = inventory.value.findIndex(item => item.maTKCT === existingInventory.maTKCT)
          if (index > -1) {
            inventory.value[index] = updatedInventory
          }
          
        } else {
          // Tạo mới tồn kho
          console.log('Tạo mới tồn kho cho sản phẩm:', detail.sanPham?.tenSP)
          
          const newInventoryItem = {
            sanPham: detail.sanPham,
            kho: importOrder.value.kho,
            soLuongTon: detail.soLuong,
            soLuongToiThieu: 0,
            soLuongToiDa: null,
            ngayCapNhat: new Date().toISOString()
          }
          
          console.log('Dữ liệu tồn kho mới:', newInventoryItem)
          
          const createdInventory = await createInventoryItem(newInventoryItem)
          console.log('✅ Đã tạo tồn kho mới:', createdInventory)
          
          // Thêm vào danh sách local
          inventory.value.unshift(createdInventory)
        }
        
      } catch (detailError) {
        console.error('❌ Lỗi khi xử lý sản phẩm:', detail.sanPham?.tenSP, detailError)
        throw new Error(`Không thể cập nhật tồn kho cho sản phẩm ${detail.sanPham?.tenSP}: ${detailError.message}`)
      }
    }
    
    console.log('✅ Tồn kho đã được cập nhật thành công sau khi nhập hàng')
    console.log('=== HOÀN THÀNH CẬP NHẬT TỒN KHO ===')
    
  } catch (error) {
    console.error('❌ LỖI KHI CẬP NHẬT TỒN KHO SAU NHẬP HÀNG:', error)
    throw error
  }
}

// ===== CÁC HÀM XỬ LÝ PHIẾU XUẤT =====

// Tạo phiếu xuất kho mới
const createExportOrder = async () => {
  try {
    loading.value = true
    console.log('Đang tạo phiếu xuất kho...')
    
    // Tạo phiếu xuất kho
    const exportOrderData = {
      maKho: exportOrder.value.kho.maKho,
      nguoiNhan: exportOrder.value.nguoiNhan,
      lyDoXuat: exportOrder.value.lyDoXuat,
      ngayXuat: new Date().toISOString(),
      trangThai: 1
    }
    
    console.log('Dữ liệu phiếu xuất:', exportOrderData)
    
    const exportResponse = await axios.post(API_PHIEU_XUAT, exportOrderData)
    const createdExportOrder = exportResponse.data
    
    console.log('Phiếu xuất kho đã được tạo:', createdExportOrder)
    
    // Tạo chi tiết phiếu xuất
    for (const detail of exportDetailsList.value) {
      const exportDetailData = {
        maPXK: createdExportOrder.maPXK || createdExportOrder.id,
        maSP: detail.sanPham.maSP,
        soLuong: detail.soLuong
      }
      
      console.log('Tạo chi tiết cho sản phẩm:', detail.sanPham.tenSP, 'với dữ liệu:', exportDetailData)
      
      await axios.post(API_CHI_TIET_XUAT, exportDetailData)
      console.log('Chi tiết phiếu xuất đã được tạo cho sản phẩm:', detail.sanPham.tenSP)
    }
    
    // Cập nhật tồn kho
    await updateInventoryAfterExport(createdExportOrder.maPXK || createdExportOrder.id)
    
    showToast('Tạo phiếu xuất kho thành công', 'success')
    closeExportModal()
    await fetchInventory() // Làm mới dữ liệu tồn kho
    
  } catch (error) {
    console.error('Lỗi khi tạo phiếu xuất kho:', error)
    showToast('Có lỗi xảy ra khi tạo phiếu xuất kho', 'error')
  } finally {
    loading.value = false
  }
}

// Cập nhật tồn kho sau khi xuất kho
const updateInventoryAfterExport = async (exportOrderId) => {
  try {
    console.log('Bắt đầu cập nhật tồn kho sau xuất:', exportOrderId)
    
    // Lấy chi tiết phiếu xuất
    const exportDetailsResponse = await axios.get(`${API_CHI_TIET_XUAT}/phieu/${exportOrderId}`)
    const exportDetails = exportDetailsResponse.data
    
    console.log('Chi tiết phiếu xuất:', exportDetails)
    
    for (const detail of exportDetails) {
      console.log('Xử lý chi tiết xuất:', detail.sanPham?.tenSP, 'số lượng:', detail.soLuong)
      
      // Tìm tồn kho hiện tại
      const existingInventory = inventory.value.find(item => 
        item.sanPham?.maSP === detail.sanPham?.maSP && 
        item.kho?.maKho === detail.phieuXuatKho?.kho?.maKho
      )
      
      if (existingInventory) {
        console.log('Cập nhật tồn kho hiện có:', existingInventory.maTKCT)
        
        // Cập nhật số lượng tồn
        const updatedQuantity = Math.max(0, existingInventory.soLuongTon - detail.soLuong)
        console.log('Số lượng mới:', updatedQuantity)
        
        await updateInventoryItem(existingInventory.maTKCT, {
          ...existingInventory,
          soLuongTon: updatedQuantity,
          ngayCapNhat: new Date().toISOString()
        })
        
        console.log('Đã cập nhật tồn kho thành công')
      } else {
        console.log('Không tìm thấy tồn kho để cập nhật')
      }
    }
    
    console.log('Tồn kho đã được cập nhật sau khi xuất kho')
    
  } catch (error) {
    console.error('Lỗi khi cập nhật tồn kho sau xuất kho:', error)
    throw error
  }
}

// Cập nhật tồn kho chi tiết thông qua TonKhoChiTietRestController
const updateInventoryItem = async (id, item) => {
  try {
    console.log('Đang cập nhật tồn kho ID:', id, 'với dữ liệu:', item)
    
    const response = await axios.put(`${API_BASE_URL}/${id}`, item, {
      timeout: 30000
    })
    
    console.log('Tồn kho đã được cập nhật:', response.data)
    
    return response.data
  } catch (error) {
    console.error('Lỗi khi cập nhật tồn kho:', error)
    throw error
  }
}

// Xóa tồn kho chi tiết thông qua TonKhoChiTietRestController (xóa mềm)
const deleteInventoryItem = async (id) => {
  try {
    console.log('Đang xóa tồn kho ID:', id)
    
    await axios.delete(`${API_BASE_URL}/${id}`)
    console.log('Tồn kho đã được xóa thành công')
    
  } catch (error) {
    console.error('Lỗi khi xóa tồn kho:', error)
    throw error
  }
}

// ===== THUỘC TÍNH TÍNH TOÁN =====
const filteredInventory = computed(() => {
  let filtered = inventory.value

  // Lọc theo từ khóa tìm kiếm
  if (searchQuery.value) {
    filtered = filtered.filter(item => 
      item.sanPham?.tenSP?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.sanPham?.maSP?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.kho?.tenKho?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.maTKCT?.toString().includes(searchQuery.value)
    )
  }

  // Lọc theo kho được chọn
  if (selectedWarehouses.value.length > 0) {
    filtered = filtered.filter(item => 
      selectedWarehouses.value.includes(item.kho?.maKho)
    )
  }

  // Lọc theo trạng thái tồn kho
  if (selectedStatuses.value.length > 0) {
    filtered = filtered.filter(item => {
      const statusClass = getStockStatusClass(item)
      return selectedStatuses.value.some(statusId => {
        const status = stockStatuses.value.find(s => s.id === statusId)
        return status && statusClass.includes(status.filter)
      })
    })
  }

  return filtered
})

const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredInventory.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredInventory.value.length / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const isAllSelected = computed(() => {
  return paginatedInventory.value.length > 0 && 
         selectedItems.value.length === paginatedInventory.value.length
})

const isValidForm = computed(() => {
  return editingItem.value.sanPham && 
         editingItem.value.kho && 
         editingItem.value.soLuongTon !== null && 
         editingItem.value.soLuongTon !== undefined &&
         editingItem.value.soLuongTon >= 0
})

const isValidImportForm = computed(() => {
  // Debug log để kiểm tra trạng thái form
  const debugInfo = {
    kho: importOrder.value.kho,
    nhaCungCap: importOrder.value.nhaCungCap,
    importDetailsListLength: importDetailsList.value.length,
    importDetailsList: importDetailsList.value
  }
  
  console.log('🔍 DEBUG - Kiểm tra trạng thái form nhập hàng:', debugInfo)
  
  // Kiểm tra kho và nhà cung cấp đã được chọn
  if (!importOrder.value.kho || !importOrder.value.nhaCungCap) {
    console.log('🔍 DEBUG - Form không hợp lệ: thiếu kho hoặc nhà cung cấp')
    return false
  }
  
  // Kiểm tra có ít nhất một sản phẩm trong danh sách
  if (importDetailsList.value.length === 0) {
    console.log('🔍 DEBUG - Form không hợp lệ: không có sản phẩm nào')
    return false
  }
  
  // Kiểm tra tất cả sản phẩm trong danh sách đều hợp lệ
  const isValid = importDetailsList.value.every(detail => {
    const detailValid = detail.sanPham && 
           detail.sanPham?.maSP && 
           detail.sanPham?.tenSP &&
           detail.soLuong > 0 &&
           detail.donGia >= 0
    
    if (!detailValid) {
      console.log('🔍 DEBUG - Sản phẩm không hợp lệ:', detail)
    }
    
    return detailValid
  })
  
  console.log('🔍 DEBUG - Kết quả validation form:', isValid)
  return isValid
})

const isValidExportForm = computed(() => {
  return exportOrder.value.kho && 
         exportDetailsList.value.length > 0 &&
         exportDetailsList.value.every(detail => detail.sanPham && detail.soLuong > 0)
})

const importTotal = computed(() => {
  const total = importDetailsList.value.reduce((total, detail) => {
    return total + (detail.soLuong * detail.donGia)
  }, 0)
  
  console.log('🔍 DEBUG - Tính tổng tiền nhập hàng:', {
    importDetailsList: importDetailsList.value,
    total: total
  })
  
  return total
})

// ===== CÁC PHƯƠNG THỨC =====

// Cập nhật thống kê dựa trên dữ liệu tồn kho
const updateStats = () => {
  const total = inventory.value.length
  const outOfStock = inventory.value.filter(item => (item.soLuongTon || 0) === 0).length
  const lowStock = inventory.value.filter(item => {
    const qty = item.soLuongTon || 0
    const min = item.soLuongToiThieu || 0
    return qty > 0 && qty <= min
  }).length
  const activeSuppliers = nhaCungCaps.value.length

  // Cập nhật thống kê
  stats.value[0].value = total.toString()
  stats.value[1].value = outOfStock.toString()
  stats.value[2].value = lowStock.toString()
  stats.value[3].value = activeSuppliers.toString()
  
  console.log('Thống kê đã được cập nhật:', { total, outOfStock, lowStock, activeSuppliers })
}

// Xử lý tìm kiếm
const onSearch = () => {
  currentPage.value = 1
}

// Chuyển đổi hiển thị bộ lọc
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Chuyển đổi lựa chọn kho
const toggleWarehouse = (warehouseId) => {
  const index = selectedWarehouses.value.indexOf(warehouseId)
  if (index > -1) {
    selectedWarehouses.value.splice(index, 1)
  } else {
    selectedWarehouses.value.push(warehouseId)
  }
  currentPage.value = 1
}

// Chuyển đổi lựa chọn trạng thái
const toggleStatus = (statusId) => {
  const index = selectedStatuses.value.indexOf(statusId)
  if (index > -1) {
    selectedStatuses.value.splice(index, 1)
  } else {
    selectedStatuses.value.push(statusId)
  }
  currentPage.value = 1
}

// Chuyển đổi lựa chọn mục
const toggleItem = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

// Chuyển đổi chọn tất cả
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = paginatedInventory.value.map(item => item.maTKCT)
  }
}

// Mở modal thêm mới
const openAddModal = () => {
  editingItem.value = {
    sanPham: null,
    kho: null,
    soLuongTon: 0,
    soLuongToiThieu: 0,
    soLuongToiDa: null
  }
  showEditModal.value = true
}

// ===== CÁC HÀM XỬ LÝ MODAL PHIẾU NHẬP =====

// Mở modal phiếu nhập
const openImportModal = () => {
  importOrder.value = {
    kho: null,
    nhaCungCap: null,
    ghiChu: ''
  }
  importDetail.value = {
    sanPham: null,
    soLuong: 1,
    donGia: 0
  }
  importDetailsList.value = []
  showImportModal.value = true
}

// Đóng modal phiếu nhập
const closeImportModal = () => {
  showImportModal.value = false
  importOrder.value = {
    kho: null,
    nhaCungCap: null,
    ghiChu: ''
  }
  importDetail.value = {
    sanPham: null,
    soLuong: 1,
    donGia: 0
  }
  importDetailsList.value = []
}

// Thêm chi tiết sản phẩm nhập
const addImportDetail = () => {
  console.log('=== THÊM CHI TIẾT SẢN PHẨM NHẬP ===')
  console.log('Dữ liệu chi tiết:', importDetail.value)
  
  // Validate dữ liệu
  if (!importDetail.value.sanPham) {
    showToast('Vui lòng chọn sản phẩm', 'warning')
    return
  }
  
  if (!importDetail.value.soLuong || importDetail.value.soLuong <= 0) {
    showToast('Số lượng phải lớn hơn 0', 'warning')
    return
  }
  
  if (importDetail.value.donGia < 0) {
    showToast('Đơn giá không được âm', 'warning')
    return
  }
  
  // Kiểm tra xem sản phẩm đã được thêm chưa
  const existingIndex = importDetailsList.value.findIndex(
    item => item.sanPham?.maSP === importDetail.value.sanPham?.maSP
  )
  
  if (existingIndex >= 0) {
    // Cập nhật số lượng nếu sản phẩm đã tồn tại
    const oldQuantity = importDetailsList.value[existingIndex].soLuong
    const newQuantity = oldQuantity + importDetail.value.soLuong
    
    console.log(`Sản phẩm ${importDetail.value.sanPham.tenSP} đã tồn tại. Cập nhật số lượng: ${oldQuantity} + ${importDetail.value.soLuong} = ${newQuantity}`)
    
    importDetailsList.value[existingIndex].soLuong = newQuantity
    
    // Cập nhật đơn giá nếu có
    if (importDetail.value.donGia > 0) {
      importDetailsList.value[existingIndex].donGia = importDetail.value.donGia
    }
    
    showToast(`Đã cập nhật số lượng sản phẩm ${importDetail.value.sanPham.tenSP}`, 'success')
  } else {
    // Thêm sản phẩm mới
    const newDetail = {
      sanPham: { ...importDetail.value.sanPham },
      soLuong: importDetail.value.soLuong,
      donGia: importDetail.value.donGia || 0
    }
    
    console.log('Thêm sản phẩm mới vào danh sách:', newDetail)
    importDetailsList.value.push(newDetail)
    
    showToast(`Đã thêm sản phẩm ${importDetail.value.sanPham.tenSP} vào danh sách nhập`, 'success')
  }
  
  // Reset form chi tiết
  importDetail.value = {
    sanPham: null,
    soLuong: 1,
    donGia: 0
  }
  
  console.log('Danh sách chi tiết sau khi thêm:', importDetailsList.value)
  console.log('=== HOÀN THÀNH THÊM CHI TIẾT ===')
}

// Xóa chi tiết sản phẩm nhập
const removeImportDetail = (index) => {
  importDetailsList.value.splice(index, 1)
  showToast('Đã xóa sản phẩm khỏi danh sách nhập', 'info')
}

// ===== CÁC HÀM XỬ LÝ MODAL PHIẾU XUẤT =====

// Mở modal phiếu xuất
const openExportModal = () => {
  exportOrder.value = {
    kho: null,
    nguoiNhan: '',
    lyDoXuat: ''
  }
  exportDetail.value = {
    sanPham: null,
    soLuong: 1
  }
  exportDetailsList.value = []
  showExportModal.value = true
}

// Đóng modal phiếu xuất
const closeExportModal = () => {
  console.log('🔍 DEBUG - Đóng modal phiếu xuất')
  
  showExportModal.value = false
  exportOrder.value = {
    kho: null,
    nguoiNhan: '',
    lyDoXuat: ''
  }
  exportDetail.value = {
    sanPham: null,
    soLuong: 1
  }
  exportDetailsList.value = []
  
  console.log('🔍 DEBUG - Đã đóng modal phiếu xuất và reset dữ liệu')
}

// Thêm chi tiết sản phẩm xuất
const addExportDetail = () => {
  console.log('🔍 DEBUG - Thêm chi tiết sản phẩm xuất:', {
    exportDetail: exportDetail.value,
    sanPham: exportDetail.value.sanPham,
    soLuong: exportDetail.value.soLuong
  })
  
  if (!exportDetail.value.sanPham || exportDetail.value.soLuong <= 0) {
    showToast('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ', 'warning')
    return
  }
  
  const currentStock = getProductStock(exportDetail.value.sanPham.maSP)
  console.log('🔍 DEBUG - Kiểm tra tồn kho:', {
    currentStock: currentStock,
    soLuongXuat: exportDetail.value.soLuong
  })
  
  if (exportDetail.value.soLuong > currentStock) {
    showToast(`Số lượng xuất không được vượt quá tồn kho (${currentStock})`, 'warning')
    return
  }
  
  // Kiểm tra xem sản phẩm đã được thêm chưa
  const existingIndex = exportDetailsList.value.findIndex(
    item => item.sanPham?.maSP === exportDetail.value.sanPham?.maSP
  )
  
  if (existingIndex >= 0) {
    // Cập nhật số lượng nếu sản phẩm đã tồn tại
    const newTotal = exportDetailsList.value[existingIndex].soLuong + exportDetail.value.soLuong
    if (newTotal > currentStock) {
      showToast(`Tổng số lượng xuất không được vượt quá tồn kho (${currentStock})`, 'warning')
      return
    }
    exportDetailsList.value[existingIndex].soLuong = newTotal
  } else {
    // Thêm sản phẩm mới
    exportDetailsList.value.push({
      sanPham: { ...exportDetail.value.sanPham },
      soLuong: exportDetail.value.soLuong
    })
  }
  
  // Reset form chi tiết
  exportDetail.value = {
    sanPham: null,
    soLuong: 1
  }
  
  console.log('🔍 DEBUG - Đã thêm sản phẩm xuất và reset form')
  showToast('Đã thêm sản phẩm vào danh sách xuất', 'success')
}

// Xóa chi tiết sản phẩm xuất
const removeExportDetail = (index) => {
  console.log('🔍 DEBUG - Xóa chi tiết sản phẩm xuất:', {
    index: index,
    exportDetailsListLength: exportDetailsList.value.length
  })
  
  exportDetailsList.value.splice(index, 1)
  showToast('Đã xóa sản phẩm khỏi danh sách xuất', 'info')
}

// Mở modal chỉnh sửa
const editItem = (item) => {
  console.log('🔍 DEBUG - Mở modal chỉnh sửa:', {
    item: item,
    maTKCT: item.maTKCT,
    sanPham: item.sanPham?.tenSP,
    kho: item.kho?.tenKho
  })
  
  editingItem.value = { ...item }
  showEditModal.value = true
  
  console.log('🔍 DEBUG - Đã mở modal chỉnh sửa')
}

// Đóng modal chỉnh sửa
const closeEditModal = () => {
  console.log('🔍 DEBUG - Đóng modal chỉnh sửa')
  
  showEditModal.value = false
  editingItem.value = {}
  
  console.log('🔍 DEBUG - Đã đóng modal chỉnh sửa và reset dữ liệu')
}

// Lưu mục (thêm mới hoặc cập nhật)
const saveItem = async () => {
  console.log('🔍 DEBUG - Bắt đầu lưu mục:', {
    editingItem: editingItem.value,
    isValidForm: isValidForm.value,
    hasMaTKCT: !!editingItem.value.maTKCT
  })
  
  if (!isValidForm.value) {
    console.log('🔍 DEBUG - Form không hợp lệ, không thể lưu')
    return
  }

  try {
    loading.value = true
    
    if (editingItem.value.maTKCT) {
      // Cập nhật tồn kho chi tiết đã tồn tại
      console.log('🔍 DEBUG - Cập nhật tồn kho hiện có:', editingItem.value.maTKCT)
      const updated = await updateInventoryItem(editingItem.value.maTKCT, editingItem.value)
      const index = inventory.value.findIndex(item => item.maTKCT === editingItem.value.maTKCT)
      if (index > -1) {
        inventory.value[index] = updated
      }
      console.log('🔍 DEBUG - Đã cập nhật tồn kho thành công')
      showToast('Cập nhật tồn kho thành công', 'success')
    } else {
      // Tạo tồn kho chi tiết mới
      console.log('🔍 DEBUG - Tạo tồn kho mới')
      const created = await createInventoryItem(editingItem.value)
      inventory.value.unshift(created)
      console.log('🔍 DEBUG - Đã tạo tồn kho mới thành công')
      showToast('Thêm tồn kho thành công', 'success')
    }
    
    updateStats()
    closeEditModal()
    console.log('🔍 DEBUG - Hoàn thành lưu mục')
  } catch (error) {
    console.error('🔍 DEBUG - Lỗi khi lưu mục:', error)
    showToast('Có lỗi xảy ra khi lưu dữ liệu', 'error')
  } finally {
    loading.value = false
  }
}

// Xóa mục đơn lẻ
const deleteItem = (item) => {
  console.log('🔍 DEBUG - Xác nhận xóa mục:', {
    item: item,
    maTKCT: item.maTKCT,
    sanPham: item.sanPham?.tenSP,
    kho: item.kho?.tenKho
  })
  
  confirmModal.value = {
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa tồn kho "${item.sanPham?.tenSP}" tại kho "${item.kho?.tenKho}" không?`,
    confirmText: 'Xóa',
    action: () => performDelete(item.maTKCT)
  }
  showConfirmModal.value = true
}

// Thực hiện xóa
const performDelete = async (id) => {
  console.log('🔍 DEBUG - Bắt đầu xóa mục:', id)
  
  try {
    loading.value = true
    await deleteInventoryItem(id)
    inventory.value = inventory.value.filter(item => item.maTKCT !== id)
    selectedItems.value = selectedItems.value.filter(itemId => itemId !== id)
    updateStats()
    console.log('🔍 DEBUG - Đã xóa mục thành công:', id)
    showToast('Xóa tồn kho thành công', 'success')
  } catch (error) {
    console.error('🔍 DEBUG - Lỗi khi xóa mục:', error)
    showToast('Có lỗi xảy ra khi xóa dữ liệu', 'error')
  } finally {
    loading.value = false
  }
}

// Xóa hàng loạt
const deleteSelected = () => {
  console.log('🔍 DEBUG - Xác nhận xóa hàng loạt:', {
    selectedItems: selectedItems.value,
    selectedCount: selectedItems.value.length
  })
  
  if (selectedItems.value.length === 0) {
    showToast('Vui lòng chọn ít nhất một mục để xóa', 'warning')
    return
  }

  confirmModal.value = {
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa ${selectedItems.value.length} mục đã chọn không?`,
    confirmText: 'Xóa tất cả',
    action: performBulkDelete
  }
  showConfirmModal.value = true
}

// Thực hiện xóa hàng loạt
const performBulkDelete = async () => {
  console.log('🔍 DEBUG - Bắt đầu xóa hàng loạt:', {
    selectedItems: selectedItems.value,
    selectedCount: selectedItems.value.length
  })
  
  try {
    loading.value = true
    
    for (const id of selectedItems.value) {
      console.log('🔍 DEBUG - Đang xóa mục:', id)
      await deleteInventoryItem(id)
    }
    
    inventory.value = inventory.value.filter(item => !selectedItems.value.includes(item.maTKCT))
    selectedItems.value = []
    updateStats()
    console.log('🔍 DEBUG - Đã xóa hàng loạt thành công')
    showToast('Xóa tồn kho thành công', 'success')
  } catch (error) {
    console.error('🔍 DEBUG - Lỗi khi xóa hàng loạt:', error)
    showToast('Có lỗi xảy ra khi xóa dữ liệu', 'error')
  } finally {
    loading.value = false
  }
}

// Xuất dữ liệu đã chọn
const exportSelected = () => {
  if (selectedItems.value.length === 0) {
    showToast('Vui lòng chọn ít nhất một mục để xuất', 'warning')
    return
  }
  
  const selectedData = inventory.value.filter(item => selectedItems.value.includes(item.maTKCT))
  
  // Tạo nội dung CSV
  const headers = ['Mã TKCT', 'Sản phẩm', 'Mã sản phẩm', 'Kho', 'Số lượng tồn', 'Tối thiểu', 'Tối đa', 'Ngày cập nhật']
  const csvContent = [
    headers.join(','),
    ...selectedData.map(item => [
      item.maTKCT,
      `"${item.sanPham?.tenSP || 'N/A'}"`,
      item.sanPham?.maSP || 'N/A',
      `"${item.kho?.tenKho || 'N/A'}"`,
      item.soLuongTon || 0,
      item.soLuongToiThieu || 0,
      item.soLuongToiDa || 'N/A',
      formatDateTime(item.ngayCapNhat)
    ].join(','))
  ].join('\n')

  // Tải xuống file CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `ton-kho-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showToast('Xuất dữ liệu thành công', 'success')
}

// Xem lịch sử (chức năng đang phát triển)
const viewHistory = (item) => {
  showToast('Chức năng xem lịch sử đang được phát triển', 'info')
}

// Đóng modal xác nhận
const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmModal.value = {}
}

// Xác nhận hành động
const confirmAction = () => {
  if (confirmModal.value.action) {
    confirmModal.value.action()
  }
  closeConfirmModal()
}

// Chuyển trang
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Lấy chữ cái đầu của tên sản phẩm
const getProductInitials = (name) => {
  return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
}

// Xác định class CSS cho trạng thái tồn kho
const getStockStatusClass = (item) => {
  const qty = item.soLuongTon || 0
  const min = item.soLuongToiThieu || 0
  const max = item.soLuongToiDa

  const status = qty === 0 ? 'out-of-stock' : 
                 qty <= min ? 'low-stock' : 
                 max && qty > max ? 'over-stock' : 
                 'in-stock'

  console.log('🔍 DEBUG - Xác định trạng thái tồn kho:', {
    item: item,
    qty: qty,
    min: min,
    max: max,
    status: status
  })

  return status
}

// Lấy text hiển thị trạng thái tồn kho
const getStockStatusText = (item) => {
  const qty = item.soLuongTon || 0
  const min = item.soLuongToiThieu || 0
  const max = item.soLuongToiDa

  const text = qty === 0 ? 'Hết hàng' : 
               qty <= min ? 'Tồn kho thấp' : 
               max && qty > max ? 'Vượt mức' : 
               'Còn hàng'

  console.log('🔍 DEBUG - Xác định text trạng thái tồn kho:', {
    item: item,
    qty: qty,
    min: min,
    max: max,
    text: text
  })

  return text
}

// Format ngày giờ theo định dạng Việt Nam
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'N/A'
  }
}

// Format tiền tệ
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 VNĐ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Lấy số lượng tồn kho của sản phẩm
const getProductStock = (productCode) => {
  console.log('🔍 DEBUG - Lấy số lượng tồn kho:', {
    productCode: productCode,
    inventoryLength: inventory.value.length
  })
  
  if (!productCode) return 0
  
  const inventoryItem = inventory.value.find(item => 
    item.sanPham?.maSP === productCode
  )
  
  console.log('🔍 DEBUG - Kết quả tìm kiếm tồn kho:', {
    inventoryItem: inventoryItem,
    found: !!inventoryItem,
    soLuongTon: inventoryItem ? inventoryItem.soLuongTon : 0
  })
  
  return inventoryItem ? inventoryItem.soLuongTon : 0
}

// Hiển thị thông báo toast
const showToast = (message, type = 'info', title = '') => {
  console.log('🔍 DEBUG - Hiển thị toast:', {
    message: message,
    type: type,
    title: title,
    currentToastsCount: toasts.value.length
  })
  
  const toastId = Date.now()
  const toastTitle = title || {
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    info: 'Thông tin'
  }[type] || 'Thông báo'

  const toast = {
    id: toastId,
    title: toastTitle,
    message,
    type
  }

  toasts.value.push(toast)

  // Tự động ẩn toast sau 5 giây
  setTimeout(() => {
    removeToast(toastId)
  }, 5000)
}

// Xóa toast theo ID
const removeToast = (toastId) => {
  console.log('🔍 DEBUG - Xóa toast:', {
    toastId: toastId,
    currentToastsCount: toasts.value.length
  })
  
  const index = toasts.value.findIndex(toast => toast.id === toastId)
  if (index > -1) {
    toasts.value.splice(index, 1)
    console.log('🔍 DEBUG - Đã xóa toast thành công')
  } else {
    console.log('🔍 DEBUG - Không tìm thấy toast để xóa')
  }
}

// ===== KHỞI TẠO DỮ LIỆU KHI COMPONENT ĐƯỢC MOUNT =====
onMounted(async () => {
  try {
    console.log('Bắt đầu khởi tạo dữ liệu...')
    
    // Tải tất cả dữ liệu cần thiết song song
    await Promise.all([
      fetchInventory(),      // Tải dữ liệu tồn kho
      fetchProducts(),       // Tải danh sách sản phẩm
      fetchWarehouses(),     // Tải danh sách kho
      fetchNhaCungCaps(),    // Tải danh sách nhà cung cấp
      fetchImportOrders(),   // Tải phiếu nhập hàng
      fetchExportOrders(),   // Tải phiếu xuất kho
      fetchImportDetails(),  // Tải chi tiết phiếu nhập
      fetchExportDetails()   // Tải chi tiết phiếu xuất
    ])
    
    console.log('Tất cả dữ liệu đã được khởi tạo thành công')
  } catch (error) {
    console.error('Lỗi khi khởi tạo dữ liệu:', error)
    showToast('Có lỗi xảy ra khi khởi tạo dữ liệu', 'error')
  }
})

// ===== CÁC HÀM TIỆN ÍCH BỔ SUNG =====

// Kiểm tra kết nối API
const testApiConnection = async () => {
  try {
    console.log('=== KIỂM TRA KẾT NỐI API ===')
    
    // Test các API endpoints
    const endpoints = [
      { name: 'Tồn kho', url: API_BASE_URL },
      { name: 'Sản phẩm', url: API_SANPHAM },
      { name: 'Kho', url: API_KHO },
      { name: 'Nhà cung cấp', url: API_NHA_CUNG_CAP },
      { name: 'Phiếu nhập', url: API_PHIEU_NHAP },
      { name: 'Chi tiết phiếu nhập', url: API_CHI_TIET_NHAP }
    ]
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 DEBUG - Đang kiểm tra ${endpoint.name}...`)
        const response = await axios.get(endpoint.url)
        console.log(`✅ ${endpoint.name}: OK (${response.status})`)
        console.log(`🔍 DEBUG - Response từ ${endpoint.name}:`, {
          status: response.status,
          statusText: response.statusText,
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
        })
      } catch (error) {
        console.error(`❌ ${endpoint.name}: Lỗi -`, error.message)
        if (error.response) {
          console.error(`  Status: ${error.response.status}`)
          console.error(`  Data:`, error.response.data)
        }
      }
    }
    
    console.log('=== HOÀN THÀNH KIỂM TRA API ===')
    
  } catch (error) {
    console.error('Lỗi khi kiểm tra API:', error)
  }
}

// Làm mới dữ liệu
const refreshData = async () => {
  console.log('🔍 DEBUG - Bắt đầu làm mới dữ liệu')
  await fetchInventory()
  console.log('🔍 DEBUG - Hoàn thành làm mới dữ liệu')
  showToast('Dữ liệu đã được cập nhật', 'success')
}

// Xóa tất cả bộ lọc
const clearFilters = () => {
  console.log('🔍 DEBUG - Xóa tất cả bộ lọc')
  searchQuery.value = ''
  selectedWarehouses.value = []
  selectedStatuses.value = []
  currentPage.value = 1
  showFilters.value = false
  console.log('🔍 DEBUG - Đã xóa tất cả bộ lọc')
}

// Validate dữ liệu tồn kho trước khi lưu
const validateInventoryItem = (item) => {
  console.log('🔍 DEBUG - Validate dữ liệu tồn kho:', item)
  
  const errors = []
  
  if (!item.sanPham) {
    errors.push('Vui lòng chọn sản phẩm')
  }
  
  if (!item.kho) {
    errors.push('Vui lòng chọn kho')
  }
  
  if (item.soLuongTon === null || item.soLuongTon === undefined || item.soLuongTon < 0) {
    errors.push('Số lượng tồn phải là số không âm')
  }
  
  if (item.soLuongToiThieu !== null && item.soLuongToiThieu !== undefined && item.soLuongToiThieu < 0) {
    errors.push('Số lượng tối thiểu phải là số không âm')
  }
  
  if (item.soLuongToiDa !== null && item.soLuongToiDa !== undefined && item.soLuongToiDa < 0) {
    errors.push('Số lượng tối đa phải là số không âm')
  }
  
  if (item.soLuongToiThieu && item.soLuongToiDa && item.soLuongToiThieu > item.soLuongToiDa) {
    errors.push('Số lượng tối thiểu không được lớn hơn số lượng tối đa')
  }
  
  return errors
}

// Xử lý submit form với validation
const handleFormSubmit = async () => {
  console.log('🔍 DEBUG - Bắt đầu xử lý submit form')
  const errors = validateInventoryItem(editingItem.value)
  
  console.log('🔍 DEBUG - Kết quả validation:', {
    errors: errors,
    hasErrors: errors.length > 0
  })
  
  if (errors.length > 0) {
    showToast(errors.join(', '), 'error')
    return
  }
  
  console.log('🔍 DEBUG - Form hợp lệ, tiến hành lưu')
  await saveItem()
}
</script>


<style scoped>
* {
  box-sizing: border-box;
}

.warehouse-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.header {
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
}

.header h2 {
  color: #1e293b;
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
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

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-card-title {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

.stat-card-icon {
  font-size: 2rem;
  opacity: 0.3;
}

.stat-card-icon.revenue { color: #ef4444; }
.stat-card-icon.products { color: #10b981; }
.stat-card-icon.orders { color: #3b82f6; }
.stat-card-icon.alerts { color: #f59e0b; }
.stat-card-icon.suppliers { color: #8b5cf6; }

.stat-card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.stat-card-change {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-card-change.positive {
  color: #10b981;
}

.stat-card-change.negative {
  color: #ef4444;
}

/* Search and Filter Section */
.search-filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
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

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #64748b;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
  font-weight: 500;
}

.search-box input:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.filter-btn:hover,
.filter-dropdown.active .filter-btn {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.filter-dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  padding: 20px;
  margin-top: 8px;
  display: none;
}

.filter-dropdown.active .filter-dropdown-content {
  display: block;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filter-option:hover {
  background: #f8fafc;
}

.filter-option.active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.filter-option input {
  margin: 0;
}

.filter-option label {
  cursor: pointer;
  margin: 0;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  margin-bottom: 24px;
  position: relative;
}

.table-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  opacity: 0.8;
}

/* Table scrollbar styling */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.bulk-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-select input {
  margin: 0;
}

.bulk-select label {
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  font-size: 0.95rem;
}

.bulk-buttons {
  display: flex;
  gap: 12px;
}

.btn-bulk-export,
.btn-bulk-delete {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-bulk-export {
  background: #10b981;
  color: white;
}

.btn-bulk-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-bulk-delete {
  background: #ef4444;
  color: white;
}

.btn-bulk-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Products Table */
.products-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  table-layout: fixed;
  min-width: 1200px;
}

/* Column widths */
.products-table th:nth-child(1), .products-table td:nth-child(1) { width: 50px; } /* Checkbox */
.products-table th:nth-child(2), .products-table td:nth-child(2) { width: 120px; } /* Mã TKCT */
.products-table th:nth-child(3), .products-table td:nth-child(3) { width: 200px; } /* Sản phẩm */
.products-table th:nth-child(4), .products-table td:nth-child(4) { width: 120px; } /* Kho */
.products-table th:nth-child(5), .products-table td:nth-child(5) { width: 140px; } /* Số lượng tồn */
.products-table th:nth-child(6), .products-table td:nth-child(6) { width: 120px; } /* Tối thiểu */
.products-table th:nth-child(7), .products-table td:nth-child(7) { width: 120px; } /* Tối đa */
.products-table th:nth-child(8), .products-table td:nth-child(8) { width: 140px; } /* Ngày cập nhật */
.products-table th:nth-child(9), .products-table td:nth-child(9) { width: 150px; } /* Trạng thái - tăng width */
.products-table th:nth-child(10), .products-table td:nth-child(10) { width: 140px; } /* Thao tác */

.products-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.products-table th {
  padding: 18px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  white-space: nowrap;
}

.products-table th:first-child {
  padding-left: 24px;
}

.products-table th:last-child {
  padding-right: 24px;
}

.products-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.products-table tbody tr:last-child {
  border-bottom: none;
}

.products-table tbody tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.products-table tbody tr:nth-child(even) {
  background: #fafbfc;
}

.products-table tbody tr:nth-child(even):hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.products-table td {
  padding: 16px 12px;
  border: none;
  font-size: 0.9rem;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.products-table td:first-child {
  padding-left: 24px;
}

.products-table td:last-child {
  padding-right: 24px;
}

.product-code {
  font-family: 'JetBrains Mono', monospace;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #3b82f6;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  border: 1px solid #dbeafe;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
}

.product-name {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.product-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-info .name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.2;
}

.product-info .code {
  font-weight: 500;
  color: #64748b;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
}

.category-badge {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #a5b4fc;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
}

.quantity-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-width: 100px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.quantity-number {
  font-weight: 800;
  color: #1e293b;
  font-size: 1.1rem;
  line-height: 1;
}

.quantity-unit {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.price-info,
.total-value {
  font-weight: 700;
  color: #059669;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(5, 150, 105, 0.1);
}

.status-badge {
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  display: inline-block;
  min-width: 120px;
  text-align: center;
  line-height: 1.2;
}

.status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.status-badge:hover::before {
  left: 100%;
}

.status-badge.in-stock {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  border-color: #86efac;
}

.status-badge.low-stock {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-color: #fbbf24;
}

.status-badge.out-of-stock {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border-color: #f87171;
}

.status-badge.over-stock {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  border-color: #60a5fa;
}

/* Ensure status column has proper spacing */
.products-table td:nth-child(9) {
  padding: 16px 8px;
  text-align: center;
  vertical-align: middle;
}

.products-table th:nth-child(9) {
  text-align: center;
  padding: 18px 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-import,
.btn-export,
.btn-edit,
.btn-delete,
.btn-history {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 36px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-import {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-import:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-export {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.btn-export:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-edit {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-delete:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-history {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.btn-history:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  justify-content: center;
}

.pagination-btn {
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.pagination-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 16px;
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  min-width: 320px;
  overflow: hidden;
  animation: slideIn 0.3s ease;
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

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
}

.toast.info {
  border-left: 4px solid #3b82f6;
}

.toast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 0 20px;
}

.toast-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.toast-close:hover {
  background: #f1f5f9;
}

.toast-body {
  padding: 8px 20px 16px 20px;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.import-modal,
.modal-content.export-modal {
  max-width: 900px;
}

.modal-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Current Product Info */
.current-product-info {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.current-product-info h4 {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.product-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

.detail-item span {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.95rem;
}

.detail-item span.highlight {
  color: #3b82f6;
  font-weight: 700;
  font-size: 1.1rem;
}

.modal-body {
  padding: 24px;
}

.modal-body h4 {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

.input-group label {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
  font-weight: 500;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-group textarea {
  resize: vertical;
  min-height: 80px;
}

.supplier-info {
  color: #64748b;
  font-size: 0.8rem;
  font-style: italic;
  margin-top: 4px;
  display: block;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Summary Sections */
.import-summary,
.export-summary {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

/* Import Summary Info */
.import-summary-info {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
}

.summary-value {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

/* Selected Info */
.selected-info {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #0ea5e9;
  margin-bottom: 20px;
}

.selected-info h4 {
  color: #0369a1;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.selected-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.selected-label {
  font-weight: 600;
  color: #0369a1;
  font-size: 0.85rem;
}

.selected-value {
  font-weight: 700;
  color: #0c4a6e;
  font-size: 0.9rem;
}

.import-summary h4,
.export-summary h4 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.summary-value {
  font-weight: 700;
  color: #1e293b;
}

.summary-value.highlight {
  color: #3b82f6;
}

.summary-value.total {
  color: #059669;
  font-size: 1.1rem;
}

/* Nút thêm sản phẩm */
.btn-add-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.btn-add-item:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
}

.btn-add-item span:first-child {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Bảng chi tiết sản phẩm */
.import-details-list,
.export-details-list {
  margin-top: 20px;
}

.import-details-list h4,
.export-details-list h4 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.details-table {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 16px;
}

.details-table table {
  width: 100%;
  border-collapse: collapse;
}

.details-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
  border-bottom: 1px solid #e2e8f0;
}

.details-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.details-table tr:last-child td {
  border-bottom: none;
}

.details-table tr:hover {
  background: #f8fafc;
}

/* Tổng tiền */
.total-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-radius: 12px;
  border: 1px solid #86efac;
  margin-top: 16px;
}

.total-label {
  font-weight: 600;
  color: #166534;
  font-size: 1rem;
}

.total-value {
  font-weight: 700;
  color: #059669;
  font-size: 1.2rem;
}

/* Nút xóa sản phẩm */
.btn-remove {
  padding: 6px 10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* Thông tin tồn kho */
.stock-info {
  color: #64748b;
  font-size: 0.8rem;
  font-style: italic;
  margin-top: 4px;
  display: block;
}

.warning-message {
  background: #fef3c7;
  color: #92400e;
  padding: 16px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 16px;
  border: 1px solid #fbbf24;
}

.modal-actions {
  padding: 16px 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}

.btn-confirm {
  background: #3b82f6;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.btn-confirm.btn-danger {
  background: #ef4444;
}

.btn-confirm.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

/* Nút thêm tồn kho */
.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669, #047857);
}

.btn-add:active {
  transform: translateY(-1px);
}

.btn-add span:first-child {
  font-size: 1.2rem;
  font-weight: 700;
}

/* Nút phiếu nhập và xuất */
.btn-import,
.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-import {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.btn-export {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
  background: linear-gradient(135deg, #d97706, #b45309);
}

.btn-import:active,
.btn-export:active {
  transform: translateY(-1px);
}

.btn-import span:first-child,
.btn-export span:first-child {
  font-size: 1.2rem;
  font-weight: 700;
}

/* Loading spinner */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

/* Nút xóa và lịch sử */
.btn-delete,
.btn-history {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-history {
  background: #8b5cf6;
  color: white;
}

.btn-history:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

/* Custom Checkbox Styling */
.products-table input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.products-table input[type="checkbox"]:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.products-table input[type="checkbox"]:checked {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.products-table input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

/* Bulk actions checkbox */
.bulk-select input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

/* Table row selection effect */
.products-table tbody tr.selected {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe) !important;
  border-left: 4px solid #3b82f6;
}

.products-table tbody tr.selected:hover {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe) !important;
}

/* Empty state styling */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  font-style: italic;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  margin: 20px;
  border: 2px dashed #cbd5e1;
}

.no-data::before {
  content: '📦';
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Warehouse badge */
.warehouse-badge {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #a5b4fc;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
  text-align: center;
  min-width: 80px;
  display: inline-block;
}

/* Quantity cells spacing */
.quantity-cell,
.min-quantity-cell,
.max-quantity-cell {
  padding: 16px 12px !important;
  text-align: center;
  min-width: 120px;
}

/* Min/Max quantity */
.min-quantity,
.max-quantity {
  font-weight: 700;
  color: #1e293b;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  min-width: 70px;
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.min-quantity {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border: 1px solid #fbbf24;
}

.max-quantity {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  border: 1px solid #86efac;
}

/* Update date */
.update-date {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  text-align: center;
  min-width: 120px;
  display: inline-block;
}

/* No data message */
.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  font-style: italic;
}

/* Modal close button */
.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .warehouse-container {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 20px 16px;
  }
  
  .header h2 {
    font-size: 1.875rem;
  }
  
  .back-btn {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
  
  .back-icon {
    width: 16px;
    height: 16px;
  }
  
  .search-filter-section {
    flex-direction: column;
    padding: 16px;
  }
  
  .btn-import,
  .btn-export {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .products-table {
    font-size: 0.8rem;
  }
  
  .products-table th,
  .products-table td {
    padding: 12px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-import,
  .btn-export,
  .btn-edit {
    font-size: 0.75rem;
    padding: 6px 10px;
  }
  
  .modal-content {
    margin: 10px;
    max-width: none;
    width: calc(100% - 20px);
  }
  
  .details-table {
    overflow-x: auto;
  }
  
  .details-table table {
    min-width: 600px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .product-details-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .toast-container {
    top: 16px;
    right: 16px;
    left: 16px;
  }
  
  .toast {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .header h2 {
    font-size: 1.5rem;
  }
  
  .stat-card-value {
    font-size: 1.5rem;
  }
  
  .pagination {
    padding: 16px;
  }
  
  .pagination-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
    min-width: 36px;
  }
  
  .modal-header {
    padding: 20px 16px 12px 16px;
  }
  
  .modal-header h3 {
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .current-product-info {
    padding: 16px;
  }
  
  .modal-actions {
    padding: 12px 16px 20px 16px;
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}

/* Nút test API */
.btn-test-api {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.btn-test-api:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

.btn-test-api:active {
  transform: translateY(-1px);
}

.btn-test-api span:first-child {
  font-size: 1.2rem;
  font-weight: 700;
}
</style>