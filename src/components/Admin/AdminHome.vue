<template>
  <div class="admin-container">
    <!-- Header -->
    <AdminHeader
      :isDropdownOpen="isDropdownOpen"
      @toggleDropdown="toggleDropdown"
      @closeDropdown="closeDropdown"
      @logout="logout"
    />

    <!-- Menu Toggle Button (floating) -->
    <div class="menu-toggle-floating">
      <button class="menu-toggle-btn" @click="menuOpen = !menuOpen" :class="{ active: menuOpen }">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ open: menuOpen }">
      <div class="sidebar-header">
        <h3 class="sidebar-title-right">Quản lý</h3>
      </div>
      <nav class="sidebar-nav">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path" 
                     class="nav-item" @click="menuOpen = false">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.text }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="admin-main" :class="{ 'with-sidebar': menuOpen }">
      <div class="container">
        <!-- Page Header -->
        <header class="page-header">
          <div class="header-content">
            <div class="header-text">
              <h1>Hệ Thống Quản Lý EasyMart</h1>
              <p>Theo dõi và quản lý toàn bộ hoạt động kinh doanh</p>
            </div>
            <div class="header-stats">
              <div class="stats-header">
                <button class="refresh-btn" @click="refreshStats" :disabled="isLoadingStats" title="Làm mới thống kê">
                  <span v-if="isLoadingStats" class="loading-spinner">⏳</span>
                  <span v-else>🔄</span>
                </button>
              </div>
              <div class="stats-grid">
                <div class="stat-item" :class="{ loading: isLoadingStats }">
                  <span class="stat-number">
                    <span v-if="isLoadingStats" class="loading-spinner">⏳</span>
                    <span v-else>{{ formatNumber(stats.orders) }}</span>
                  </span>
                  <span class="stat-label">Đơn hàng</span>
                </div>
                <div class="stat-item" :class="{ loading: isLoadingStats }">
                  <span class="stat-number">
                    <span v-if="isLoadingStats" class="loading-spinner">⏳</span>
                    <span v-else>{{ formatNumber(stats.products) }}</span>
                  </span>
                  <span class="stat-label">Sản phẩm</span>
                </div>
                <div class="stat-item" :class="{ loading: isLoadingStats }">
                  <span class="stat-number">
                    <span v-if="isLoadingStats" class="loading-spinner">⏳</span>
                    <span v-else>{{ formatCurrency(stats.revenue) }}</span>
                  </span>
                  <span class="stat-label">Doanh thu</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Welcome Banner -->
        <section class="welcome-banner">
          <div class="banner-content">
            <div class="banner-icon">🎉</div>
            <div class="banner-text">
              <h2>Chào mừng trở lại!</h2>
              <p>Hôm nay là một ngày tuyệt vời để quản lý doanh nghiệp của bạn</p>
            </div>
          </div>
        </section>

        <!-- Quick Actions Section -->
        <section class="quick-actions-section">
          <h2 class="section-title">Thao tác nhanh</h2>
          <div class="quick-actions-grid">
            <button class="quick-action-card primary" @click="navigateTo('/product')">
              <div class="action-icon">📦</div>
              <div class="action-content">
                <h3>Sản phẩm</h3>
                <p>Quản lý sản phẩm</p>
              </div>
            </button>
            <button class="quick-action-card secondary" @click="navigateTo('/order')">
              <div class="action-icon">📋</div>
              <div class="action-content">
                <h3>Đơn hàng</h3>
                <p>Quản lý đơn hàng </p>
              </div>
            </button>
            <button class="quick-action-card accent" @click="navigateTo('/revenue')">
              <div class="action-icon">📊</div>
              <div class="action-content">
                <h3>Doanh thu</h3>
                <p>Thống kê doanh thu</p>
              </div>
            </button>
            <button class="quick-action-card info" @click="navigateTo('/shift')">
              <div class="action-icon">👥</div>
              <div class="action-content">
                <h3>Nhân viên</h3>
                <p>Quản lý ca làm việc</p>
              </div>
            </button>
          </div>
        </section>

        <!-- Dashboard Grid -->
        <section class="dashboard-section">
          <h2 class="section-title">Tổng quan hệ thống</h2>
          <div class="dashboard-grid">
            <div class="dashboard-card">
              <div class="card-header">
                <h3>Hoạt động gần đây</h3>
                <span class="card-badge">Mới</span>
              </div>
              <div class="activity-list">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                  <span class="activity-icon">{{ activity.icon }}</span>
                  <div class="activity-content">
                    <p>{{ activity.description }}</p>
                    <small>{{ activity.time }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-header">
                <h3>Thống kê nhanh</h3>
                <span class="card-badge success">Tăng trưởng</span>
              </div>
              <div class="stats-overview">
                <div v-for="stat in quickStats" :key="stat.label" class="overview-item">
                  <div class="overview-info">
                    <div class="overview-number">{{ stat.value }}</div>
                    <div class="overview-label">{{ stat.label }}</div>
                  </div>
                  <div class="overview-change" :class="stat.changeType">{{ stat.change }}</div>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-header">
                <h3>Thông báo</h3>
                <span class="card-badge warning">Quan trọng</span>
              </div>
              <div class="notification-list">
                <div v-for="notification in notifications" :key="notification.id" class="notification-item">
                  <span class="notification-icon">{{ notification.icon }}</span>
                  <div class="notification-content">
                    <p>{{ notification.message }}</p>
                    <small>{{ notification.time }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Router View -->
        <div class="content-area">
          <router-view />
        </div>
      </div>
    </main>

    <!-- Overlay for mobile -->
    <div class="overlay" :class="{ active: menuOpen }" @click="menuOpen = false"></div>

    <!-- Enhanced Footer -->
    <AdminFooter />
  </div>
</template>

<script setup>
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllOrders, getAllProducts, getAllOrderDetails, logout as logoutApi } from '../api.js'
import { removeToken } from '../../utils/tokenStorage.js'

// Router instance
const router = useRouter()

// Reactive data
const isDropdownOpen = ref(false)
const isLoading = ref(false)
const menuOpen = ref(false)
const isLoadingStats = ref(true)

// Stats data - Khởi tạo với giá trị mặc định
const stats = reactive({
  orders: 0,
  products: 0,
  revenue: 0
})

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    icon: '🛒',
    description: 'Đơn hàng #12345 đã được tạo',
    time: '5 phút trước'
  },
  {
    id: 2,
    icon: '📦',
    description: 'Sản phẩm ABC đã hết hàng',
    time: '10 phút trước'
  },
  {
    id: 3,
    icon: '👤',
    description: 'Khách hàng mới đăng ký',
    time: '15 phút trước'
  }
])

// Quick stats
const quickStats = ref([
  {
    value: '₫2.5M',
    label: 'Doanh thu hôm nay',
    change: '+12%',
    changeType: 'positive'
  },
  {
    value: '156',
    label: 'Đơn hàng mới',
    change: '+8%',
    changeType: 'positive'
  },
  {
    value: '23',
    label: 'Sản phẩm sắp hết',
    change: '-5%',
    changeType: 'warning'
  }
])

// Notifications
const notifications = ref([
  {
    id: 1,
    icon: '⚠️',
    message: 'Cần kiểm tra tồn kho sản phẩm A',
    time: '1 giờ trước'
  },
  {
    id: 2,
    icon: '📢',
    message: 'Khuyến mãi mới sẽ bắt đầu vào ngày mai',
    time: '2 giờ trước'
  },
  {
    id: 3,
    icon: '✅',
    message: 'Báo cáo tháng đã được tạo thành công',
    time: '3 giờ trước'
  }
])

// Menu items - Đã thay đổi icon khách hàng từ 💹 thành 👨‍👩‍👧‍👦
const menuItems = ref([
  { path: '/dashbroad', icon: '📊', text: 'Dashbroad' },
  { path: '/staff', icon: '👥', text: 'Nhân viên' },
  { path: '/shift', icon: '⏰', text: 'Ca làm việc' },
  { path: '/bangluong', icon: '💰', text: 'Bảng lương' },
  { path: '/product', icon: '📦', text: 'Sản phẩm' },
  { path: '/order', icon: '🛒', text: 'Đơn hàng' },
  { path: '/category', icon: '📂', text: 'Danh mục' },
  { path: '/promotion', icon: '🎯', text: 'Khuyến mãi' },
  { path: '/warehouse', icon: '🏪', text: 'Kho hàng' },
  { path: '/phieu-nhap-hang', icon: '📋', text: 'Phiếu nhập hàng' },
  { path: '/phieu-xuat-hang', icon: '📤', text: 'Phiếu xuất hàng' },
  { path: '/supplierList', icon: '🏢', text: 'Nhà cung cấp' },
  { path: '/revenue', icon: '💹', text: 'Doanh thu' },
  { path: '/customer', icon: '👨‍👩‍👧‍👦', text: 'Khách hàng' }
])

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const navigateTo = (path) => {
  router.push(path)
}

const logout = async () => {
  try {
    isLoading.value = true
    
    // Set meta flag to indicate logout in progress
    router.currentRoute.value.meta.isLoggingOut = true
    
    // Set session flag to skip validation in Login.vue
    sessionStorage.setItem('justLoggedOut', 'true')
    
    // Gọi API logout
    try {
      await logoutApi()
      console.log('Logout API call successful')
    } catch (apiError) {
      console.warn('Logout API call failed, but continuing with local cleanup:', apiError)
    }
    
    // Xóa token sử dụng tokenStorage
    removeToken()
    
    // Xóa thông tin người dùng từ cookie
    deleteCookie('user_info')
    deleteCookie('user_role')
    
    // Xóa các thông tin khác nếu có
    deleteCookie('userToken')
    deleteCookie('userPreferences')
    
    // Chuyển hướng về trang login
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoading.value = false
    closeDropdown()
  }
}

// Function to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// API Methods để lấy thống kê
const fetchDashboardStats = async () => {
  try {
    isLoadingStats.value = true
    
    // Gọi API để lấy dữ liệu
    let ordersResponse, productsResponse, orderDetailsResponse
    
    try {
      [ordersResponse, productsResponse, orderDetailsResponse] = await Promise.all([
        getAllOrders(),
        getAllProducts(),
        getAllOrderDetails()
      ])
    } catch (apiError) {
      console.error('API call failed:', apiError)
      // Nếu API call thất bại, sử dụng mảng rỗng
      ordersResponse = []
      productsResponse = []
      orderDetailsResponse = []
    }
    
    // Đảm bảo dữ liệu trả về là array
    const orders = Array.isArray(ordersResponse) ? ordersResponse : []
    const products = Array.isArray(productsResponse) ? productsResponse : []
    const orderDetails = Array.isArray(orderDetailsResponse) ? orderDetailsResponse : []
    
    // Log để debug
    console.log('API responses:', {
      ordersResponse,
      productsResponse,
      orderDetailsResponse
    })
    console.log('Processed data:', {
      orders,
      products,
      orderDetails
    })
    
    // Tính toán thống kê
    const totalOrders = orders.length
    const totalProducts = products.length
    
    // Tính tổng doanh thu từ chi tiết hóa đơn
    let totalRevenue = 0
    if (orderDetails && orderDetails.length > 0) {
      totalRevenue = orderDetails.reduce((sum, detail) => {
        // Lấy giá hiện tại của sản phẩm
        const product = products.find(p => p.maSP === detail.sanPham?.maSP)
        const currentPrice = product?.giaHienTai || 0
        return sum + (detail.soLuong * currentPrice)
      }, 0)
    }
    
    // Cập nhật stats
    stats.orders = totalOrders
    stats.products = totalProducts
    stats.revenue = totalRevenue
    
    // Cập nhật recent activities với dữ liệu thực tế
    console.log('Calling updateRecentActivities with:', { orders, products })
    
    // Đảm bảo orders và products là array trước khi gọi
    if (Array.isArray(orders) && Array.isArray(products)) {
      updateRecentActivities(orders, products)
    } else {
      console.warn('Orders or products is not an array, skipping updateRecentActivities')
      recentActivities.value = []
    }
    
    console.log('Dashboard stats updated:', {
      orders: totalOrders,
      products: totalProducts,
      revenue: totalRevenue
    })
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    
    // Log chi tiết lỗi để debug
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    // Giữ nguyên giá trị mặc định nếu có lỗi
    stats.orders = 0
    stats.products = 0
    stats.revenue = 0
    
    // Không gọi updateRecentActivities khi có lỗi
    recentActivities.value = []
  } finally {
    isLoadingStats.value = false
  }
}

// Function để cập nhật hoạt động gần đây với dữ liệu thực tế
const updateRecentActivities = (orders, products) => {
  // Kiểm tra xem orders và products có phải là array không
  if (!Array.isArray(orders) || !Array.isArray(products)) {
    console.warn('updateRecentActivities: orders or products is not an array', { orders, products })
    return
  }
  
  const newActivities = []
  
  // Lấy 3 đơn hàng gần nhất
  const recentOrders = orders.slice(0, 3)
  recentOrders.forEach((order, index) => {
    if (order && order.maHD) {
      newActivities.push({
        id: index + 1,
        icon: '🛒',
        description: `Đơn hàng #${order.maHD} đã được tạo`,
        time: formatTimeAgo(order.ngayTao || order.ngayDat)
      })
    }
  })
  
  // Nếu không đủ 3 đơn hàng, thêm thông tin sản phẩm
  if (newActivities.length < 3) {
    const lowStockProducts = products
      .filter(p => p && p.soLuongTon !== undefined && p.soLuongTon !== null && p.soLuongTon < 10)
      .slice(0, 3 - newActivities.length)
    
    lowStockProducts.forEach((product, index) => {
      if (product && product.tenSP) {
        newActivities.push({
          id: newActivities.length + index + 1,
          icon: '📦',
          description: `Sản phẩm ${product.tenSP} sắp hết hàng (${product.soLuongTon} còn lại)`,
          time: 'Gần đây'
        })
      }
    })
  }
  
  // Cập nhật recent activities
  if (newActivities.length > 0) {
    recentActivities.value = newActivities
  }
}

// Function để format thời gian
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Gần đây'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
  return `${Math.floor(diffInMinutes / 1440)} ngày trước`
}

// Function để refresh thống kê (có thể gọi từ bên ngoài)
const refreshStats = async () => {
  await fetchDashboardStats()
}

// Function để lấy thống kê theo thời gian thực
const startRealTimeStats = () => {
  // Refresh stats mỗi 5 phút
  setInterval(async () => {
    await fetchDashboardStats()
  }, 5 * 60 * 1000)
}

// Helper methods để format số liệu
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('vi-VN')
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₫0'
  if (amount >= 1000000) {
    return `₫${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `₫${(amount / 1000).toFixed(0)}K`
  } else {
    return `₫${amount.toLocaleString('vi-VN')}`
  }
}

// Handle click outside dropdown
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-info')) {
    isDropdownOpen.value = false
  }
}

// Handle keyboard shortcuts
const handleKeyboardShortcuts = (event) => {
  if (event.key === 'Escape') {
    isDropdownOpen.value = false
    menuOpen.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyboardShortcuts)
  
  // Lấy thống kê dashboard khi component được mount
  await fetchDashboardStats()
  startRealTimeStats() // Bắt đầu lấy thống kê theo thời gian thực
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #333;
  line-height: 1.6;
}

.admin-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Floating Menu Toggle */
.menu-toggle-floating {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1200;
}

.menu-toggle-btn {
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4a90e2 0%, #67b5d4 100%);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.menu-toggle-btn:hover {
  background: linear-gradient(135deg, #67b5d4 0%, #4a90e2 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.hamburger-line {
  width: 18px;
  height: 2px;
  background: #fff;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.menu-toggle-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.menu-toggle-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.menu-toggle-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100vh;
  background: linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%);
  border-right: 1px solid #e0e0e0;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
  transition: left 0.3s ease;
  z-index: 1100;
  overflow-y: auto;
}

.sidebar.open {
  left: 0;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #4a90e2 0%, #67b5d4 100%);
  color: #fff;
  text-align: center;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  text-decoration: none;
  color: #666;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f0f0f0;
  color: #333;
  border-left-color: #4a90e2;
}

.nav-item.router-link-active {
  background: #f0f0f0;
  color: #333;
  border-left-color: #4a90e2;
  font-weight: 500;
}

.nav-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.nav-text {
  font-weight: 400;
}

/* Main Content */
.admin-main {
  flex: 1;
  padding: 5rem 1.5rem 1.5rem;
  transition: margin-left 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-text h1 {
  font-size: 2.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  background: linear-gradient(135deg, #4a90e2 0%, #333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  font-size: 1rem;
  color: #666;
}

.header-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.refresh-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4a90e2 0%, #67b5d4 100%);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #67b5d4 0%, #4a90e2 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #ccc;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.stat-item {
  text-align: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  min-width: 120px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.banner-icon {
  font-size: 3rem;
  background: #fff;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.banner-text h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.banner-text p {
  color: #666;
  font-size: 1rem;
}

/* Section Titles */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(135deg, #4a90e2 0%, #67b5d4 100%);
  border-radius: 2px;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 2.5rem;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.quick-action-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
}

.quick-action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(135deg, #4a90e2 0%, #67b5d4 100%);
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #4a90e2;
}

.action-icon {
  font-size: 2rem;
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
  color: #333;
}

.action-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.action-content p {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Dashboard Section */
.dashboard-section {
  margin-bottom: 2.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.card-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  color: #333;
  border: 1px solid #e0e0e0;
}

.card-badge.success {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
  color: #2d5a2d;
  border-color: #c8e6c8;
}

.card-badge.warning {
  background: linear-gradient(135deg, #fff8e1 0%, #ffeaa7 100%);
  color: #8b5a00;
  border-color: #ffeaa7;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.activity-item:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border-color: #4a90e2;
}

.activity-icon {
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
  color: #555;
}

.activity-content p {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.125rem;
  font-size: 0.9rem;
}

.activity-content small {
  color: #666;
  font-size: 0.8rem;
}

/* Stats Overview */
.stats-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.overview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.overview-info {
  display: flex;
  flex-direction: column;
}

.overview-number {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.overview-label {
  font-size: 0.875rem;
  color: #666;
}

.overview-change {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.overview-change.positive {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
  color: #2d5a2d;
}

.overview-change.warning {
  background: linear-gradient(135deg, #fff8e1 0%, #ffeaa7 100%);
  color: #8b5a00;
}

/* Loading States */
.stat-item.loading {
  opacity: 0.7;
  position: relative;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  font-size: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Notification List */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.notification-item:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border-color: #4a90e2;
}

.notification-icon {
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
  color: #555;
}

.notification-content p {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.125rem;
  font-size: 0.9rem;
}

.notification-content small {
  color: #666;
  font-size: 0.8rem;
}

/* Content Area */
.content-area {
  margin-top: 1.5rem;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .header-stats {
    width: 100%;
    align-items: center;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-main {
    padding: 4.5rem 1rem 1rem;
  }

  .page-header {
    padding: 1.75rem;
    margin-bottom: 1.5rem;
  }

  .header-text h1 {
    font-size: 1.875rem;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .stat-item {
    padding: 1rem;
    min-width: 80px;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .quick-action-card {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.375rem;
  }
}

@media (max-width: 480px) {
  .menu-toggle-floating {
    top: 0.75rem;
    left: 0.75rem;
  }

  .menu-toggle-btn {
    width: 48px;
    height: 48px;
  }

  .sidebar {
    width: 280px;
    left: -280px;
  }

  .admin-main {
    padding: 4rem 0.75rem 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .header-text h1 {
    font-size: 1.625rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-item {
    padding: 0.875rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .action-icon {
    width: 60px;
    height: 60px;
    font-size: 1.75rem;
  }

  .quick-action-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Animation enhancements */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.dashboard-card,
.quick-action-card {
  animation: fadeInUp 0.5s ease-out forwards;
}

.dashboard-card:nth-child(2),
.quick-action-card:nth-child(2) {
  animation-delay: 0.1s;
}

.quick-action-card:nth-child(3) {
  animation-delay: 0.2s;
}

.quick-action-card:nth-child(4) {
  animation-delay: 0.3s;
}

/* Scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #4a90e2;
}
</style>