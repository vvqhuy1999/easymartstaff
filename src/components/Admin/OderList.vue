<template>
  <div class="order-management-wrapper">
    <AdminHeader /> 
    <div class="order-management-container">
      <!-- Enhanced Header with Gradient Background -->
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
            <h1>Quản lý đơn hàng</h1>
            <p>Theo dõi và quản lý tất cả đơn hàng của hệ thống</p>
          </div>
        </div>
        <div class="header-decoration">
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
          <div class="decoration-circle"></div>
        </div>
      </div>

      <!-- Enhanced Stats Cards with Better Spacing -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card total-orders">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-.4-2.8-1.2C17.4 10.4 17 9 17 8s.4-2.4 1.2-3.2C19 4.4 20 4 21 4s2 .4 2.8 1.2C24.6 6 25 7 25 8s-.4 2.4-1.2 3.2C23 11.6 22 12 21 12z"/>
                <path d="M3 12c1 0 2-.4 2.8-1.2C6.6 10.4 7 9 7 8s-.4-2.4-1.2-3.2C5 4.4 4 4 3 4s-2 .4-2.8 1.2C-.6 6-1 7-1 8s.4 2.4 1.2 3.2C1 11.6 2 12 3 12z"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ orderStats.total }}</h3>
              <p>Tổng đơn hàng</p>
              <div class="stat-trend positive">+12% so với tháng trước</div>
            </div>
          </div>
          
          <div class="stat-card revenue">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ formatCurrency(orderStats.totalRevenue) }}</h3>
              <p>Tổng doanh thu</p>
              <div class="stat-trend positive">+8.5% so với tháng trước</div>
            </div>
          </div>
          
          <div class="stat-card average-order">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ formatCurrency(orderStats.averageOrder) }}</h3>
              <p>Đơn hàng trung bình</p>
              <div class="stat-trend neutral">Giữ nguyên</div>
            </div>
          </div>
          
          <div class="stat-card total-products">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <path d="M9 14l2 2 4-4"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ orderStats.totalProducts }}</h3>
              <p>Tổng sản phẩm</p>
              <div class="stat-trend positive">+15% so với tháng trước</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State with Better Animation -->
      <div v-if="loading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h3>Đang tải dữ liệu đơn hàng...</h3>
          <p>Vui lòng chờ trong giây lát</p>
        </div>
      </div>

      <!-- Error State with Better Design -->
      <div v-else-if="error" class="error-container">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>Không thể tải dữ liệu</h3>
          <p>{{ error }}</p>
          <button @click="loadOrders" class="retry-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Thử lại
          </button>
        </div>
      </div>

      <!-- Main Content with Enhanced Layout -->
      <div v-else class="main-content">
        <!-- Enhanced Toolbar -->
        <div class="toolbar-section">
          <div class="toolbar-content">
            <div class="search-filter-group">
              <div class="search-box">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  class="search-input"
                />
                <button @click="clearSearch" class="clear-btn" v-if="searchQuery">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div class="filter-group">
                <select v-model="sortBy" class="filter-select">
                  <option value="date-desc">Ngày mới nhất</option>
                  <option value="date-asc">Ngày cũ nhất</option>
                  <option value="total-desc">Giá cao nhất</option>
                  <option value="total-asc">Giá thấp nhất</option>
                </select>
                
                <button @click="exportOrders" class="export-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Orders Table -->
        <div class="table-section">
          <div class="table-header">
            <h3>Danh sách đơn hàng</h3>
            <span class="order-count">{{ filteredOrders.length }} đơn hàng</span>
          </div>
          
          <div class="table-container">
            <table class="order-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in filteredOrders" :key="order.id" class="order-row">
                  <td class="order-id">
                    <div class="id-badge">#{{ order.id }}</div>
                  </td>
                  <td class="customer-info">
                    <div class="customer-avatar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div class="customer-details">
                      <div class="customer-name">{{ order.customer }}</div>
                      <div class="customer-phone">{{ order.phone }}</div>
                    </div>
                  </td>
                  <td class="product-info">
                    <div class="product-summary">{{ order.products.length }} sản phẩm</div>
                    <div class="product-preview">{{ getProductPreview(order.products) }}</div>
                  </td>
                  <td class="order-date">
                    <div class="date-badge">
                      {{ formatDate(order.date) }}
                    </div>
                  </td>
                  <td class="order-total">
                    <div class="total-badge">{{ formatCurrency(order.total) }}</div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="viewOrderDetail(order)" class="action-btn view-btn" title="Xem chi tiết">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button @click="printOrder(order)" class="action-btn print-btn" title="In đơn hàng">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="6,9 6,2 18,2 18,9"/>
                          <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                          <polyline points="6,14 6,18 18,18 18,14"/>
                        </svg>
                      </button>
                      <button @click="deleteOrder(order.id)" class="action-btn delete-btn" title="Xóa đơn hàng">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="filteredOrders.length === 0" class="no-data">
              <div class="no-data-content">
                <div class="no-data-icon">📦</div>
                <h3>Không tìm thấy đơn hàng</h3>
                <p>{{ searchQuery ? 'Không có đơn hàng nào phù hợp với từ khóa tìm kiếm' : 'Chưa có đơn hàng nào trong hệ thống' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Order Detail Modal -->
      <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
        <div class="modal-content detail-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <h3>Chi tiết đơn hàng</h3>
              <div class="order-id-display">#{{ selectedOrder ? selectedOrder.id : '' }}</div>
            </div>
            <button @click="closeDetailModal" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="order-detail-content" v-if="selectedOrder">
            <div class="detail-section customer-section">
              <div class="section-header">
                <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <h4>Thông tin khách hàng</h4>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Họ tên</label>
                  <span>{{ selectedOrder.customer }}</span>
                </div>
                <div class="detail-item">
                  <label>Số điện thoại</label>
                  <span>{{ selectedOrder.phone }}</span>
                </div>
                <div class="detail-item">
                  <label>Địa chỉ</label>
                  <span>{{ selectedOrder.address }}</span>
                </div>
                <div class="detail-item">
                  <label>Ngày đặt</label>
                  <span>{{ formatDate(selectedOrder.date) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section products-section">
              <div class="section-header">
                <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  <path d="M9 14l2 2 4-4"/>
                </svg>
                <h4>Sản phẩm đã đặt</h4>
              </div>
              <div class="product-list">
                <div v-for="product in selectedOrder.products" :key="product.id" class="product-item">
                  <div class="product-info">
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-details">{{ product.variant }} - SL: {{ product.quantity }}</span>
                  </div>
                  <span class="product-price">{{ formatCurrency(product.price * product.quantity) }}</span>
                </div>
              </div>
              <div class="total-section">
                <div class="total-row">
                  <span>Tạm tính</span>
                  <span>{{ formatCurrency(selectedOrder.subtotal) }}</span>
                </div>
                <div class="total-row">
                  <span>Phí giao hàng</span>
                  <span>{{ formatCurrency(selectedOrder.shipping) }}</span>
                </div>
                <div class="total-row final-total">
                  <span>Tổng cộng</span>
                  <span>{{ formatCurrency(selectedOrder.total) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Confirmation Modal -->
      <div v-if="showConfirm" class="modal-overlay" @click="closeConfirm">
        <div class="confirm-modal" @click.stop>
          <div class="confirm-content">
            <div class="confirm-icon">⚠️</div>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa đơn hàng này không?<br>Thao tác này không thể hoàn tác.</p>
            <div class="confirm-actions">
              <button @click="closeConfirm" class="cancel-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Hủy
              </button>
              <button @click="confirmDelete" class="delete-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V2"/>
                </svg>
                Xóa
              </button>
            </div>
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
import { 
  getCompleteOrderData, 
  deleteOrder as deleteOrderAPI 
} from '../api.js'

// Reactive data
const orders = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const sortBy = ref('date-desc')
const showDetailModal = ref(false)
const showConfirm = ref(false)
const selectedOrder = ref(null)
const deleteOrderId = ref(null)

// Computed properties
const filteredOrders = computed(() => {
  let filtered = orders.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.id.toString().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.phone.includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'total-asc':
        return a.total - b.total
      case 'total-desc':
        return b.total - a.total
      default:
        return 0
    }
  })

  return filtered
})

const orderStats = computed(() => {
  const stats = {
    total: 0,
    totalRevenue: 0,
    averageOrder: 0,
    totalProducts: 0
  }

  orders.value.forEach(order => {
    stats.total++
    stats.totalRevenue += order.total
    stats.totalProducts += order.products.reduce((sum, p) => sum + p.quantity, 0)
  })

  stats.averageOrder = orders.value.length > 0 ? stats.totalRevenue / orders.value.length : 0

  return stats
})

// Methods
const loadOrders = async () => {
  try {
    loading.value = true
    error.value = null
    const orderData = await getCompleteOrderData()
    orders.value = orderData
  } catch (err) {
    console.error('Error loading orders:', err)
    error.value = 'Không thể tải dữ liệu đơn hàng: ' + err.message
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getProductPreview = (products) => {
  if (!products || products.length === 0) return 'Không có sản phẩm'
  if (products.length === 1) {
    return products[0].name
  }
  return `${products[0].name} + ${products.length - 1} sản phẩm khác`
}

const clearSearch = () => {
  searchQuery.value = ''
}

const viewOrderDetail = (order) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}

const printOrder = (order) => {
  // Simulate printing functionality
  alert(`Đang in đơn hàng #${order.id} của ${order.customer}`)
}

const deleteOrder = (orderId) => {
  deleteOrderId.value = orderId
  showConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await deleteOrderAPI(deleteOrderId.value)
    orders.value = orders.value.filter(o => o.id !== deleteOrderId.value)
    closeConfirm()
    alert('Xóa đơn hàng thành công!')
  } catch (err) {
    console.error('Error deleting order:', err)
    alert('Lỗi xóa đơn hàng: ' + err.message)
  }
}

const closeConfirm = () => {
  showConfirm.value = false
  deleteOrderId.value = null
}

const exportOrders = () => {
  // Simulate export functionality
  alert('Đang xuất file Excel...')
}

// Lifecycle
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.order-management-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.order-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Enhanced Header with Gradient Background */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px 32px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.header-title {
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header-title h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.03em;
}

.header-title p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.header-decoration {
  display: flex;
  gap: 10px;
  position: absolute;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
}

.decoration-circle {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.decoration-circle:nth-child(1) { animation-delay: -0.6s; }
.decoration-circle:nth-child(2) { animation-delay: -0.3s; }
.decoration-circle:nth-child(3) { animation-delay: 0s; }

@keyframes pulse {
  0% { transform: translateY(-50%) scale(0.8); opacity: 0.7; }
  50% { transform: translateY(-50%) scale(1.2); opacity: 1; }
  100% { transform: translateY(-50%) scale(0.8); opacity: 0.7; }
}

/* Enhanced Back Button */
.back-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 14px 24px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.back-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  background: rgba(255, 255, 255, 0.3);
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

/* Enhanced Stats Cards with Better Spacing */
.stats-section {
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #e0f2fe;
  color: #0369a1;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.stat-icon.processing {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon.total {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
}

.stat-icon.average {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.products {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-card.total-orders .stat-icon {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: white;
}

.stat-card.revenue .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.stat-card.average-order .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.stat-card.total-products .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
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

.stat-trend {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 600;
  margin-top: 8px;
}

.stat-trend.positive {
  color: #059669;
}

.stat-trend.negative {
  color: #dc2626;
}

.stat-trend.neutral {
  color: #64748b;
}

/* Loading State with Better Animation */
.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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

/* Error State with Better Design */
.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #dc2626;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.7;
}

.error-container h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.error-container p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

.retry-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

/* Enhanced Toolbar */
.toolbar-section {
  margin-bottom: 24px;
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
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
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 20px;
  height: 20px;
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

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
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

.export-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

/* Enhanced Orders Table */
.table-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 16px 16px 0 0;
}

.table-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
}

.order-count {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
}

.table-container {
  width: 100%;
  border-collapse: collapse;
}

.order-table th {
  background: #f8fafc;
  color: #475569;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #e2e8f0;
}

.order-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-weight: 500;
  color: #334155;
}

.order-row {
  transition: background-color 0.2s ease;
}

.order-row:hover {
  background: #f8fafc;
}

.order-id {
  font-weight: 700;
  color: #3b82f6;
  font-size: 1.05rem;
}

.id-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  min-width: 80px;
  text-align: center;
}

.customer-info {
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0369a1;
  flex-shrink: 0;
}

.customer-details {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

.customer-phone {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 2px;
}

.product-info {
  min-width: 200px;
}

.product-summary {
  font-weight: 600;
  color: #1e293b;
}

.product-preview {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 2px;
}

.order-date {
  color: #64748b;
  min-width: 140px;
}

.date-badge {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  min-width: 100px;
  text-align: center;
}

.order-total {
  font-weight: 700;
  color: #059669;
  font-size: 1.1rem;
}

.total-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  min-width: 100px;
  text-align: center;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.view-btn {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.view-btn:hover {
  background: #0369a1;
  color: white;
  transform: translateY(-1px);
}

.print-btn {
  background: #f3e8ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}

.print-btn:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.delete-btn:hover {
  background: #dc2626;
  color: white;
  transform: translateY(-1px);
}

/* No Data State */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-data p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* Enhanced Order Detail Modal */
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
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.detail-modal {
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 20px 20px 0 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
}

.order-id-display {
  background: #e0f2fe;
  color: #0369a1;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  min-width: 100px;
  text-align: center;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #475569;
  transform: scale(1.1);
}

/* Order Detail Content */
.order-detail-content {
  padding: 32px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.section-header h4 {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: #1e293b;
  font-weight: 500;
  font-size: 1rem;
}

/* Product List in Detail */
.product-list {
  margin-bottom: 24px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-name {
  display: block;
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 4px;
}

.product-details {
  display: block;
  color: #64748b;
  font-size: 0.9rem;
}

.product-price {
  font-weight: 700;
  color: #059669;
  font-size: 1rem;
}

/* Total Section */
.total-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: #475569;
  font-weight: 500;
}

.total-row.final-total {
  border-top: 2px solid #e2e8f0;
  margin-top: 12px;
  padding-top: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

/* Enhanced Confirmation Modal */
.confirm-modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  padding: 32px;
  text-align: center;
  max-width: 450px;
  width: 90%;
  animation: modalSlideIn 0.3s ease;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.confirm-modal h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.confirm-modal p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-actions .cancel-btn,
.confirm-actions .delete-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-actions .cancel-btn {
  background: #f1f5f9;
  color: #475569;
}

.confirm-actions .cancel-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.confirm-actions .delete-btn {
  background: #dc2626;
  color: white;
}

.confirm-actions .delete-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.confirm-actions .cancel-btn svg,
.confirm-actions .delete-btn svg {
  width: 20px;
  height: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .order-management-container {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    padding: 30px 20px;
    gap: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .header-title h1 {
    font-size: 2rem;
  }

  .header-title p {
    font-size: 1rem;
  }

  .header-decoration {
    position: static;
    transform: none;
    margin-top: 20px;
  }

  .stats-section {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-filter-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-box {
    max-width: none;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .table-section {
    overflow-x: auto;
  }
  
  .order-table {
    min-width: 800px;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .order-detail-content {
    padding: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .confirm-modal {
    width: 95%;
    padding: 24px;
  }
  
  .confirm-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .back-btn {
    padding: 12px 18px;
    font-size: 0.9rem;
  }
  
  .back-icon {
    width: 16px;
    height: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .view-btn, .print-btn, .delete-btn {
    width: 100%;
    min-width: auto;
  }
}
</style>