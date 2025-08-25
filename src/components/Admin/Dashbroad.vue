<template>
  <div class="dashboard-wrapper">
    <AdminHeader /> 
    <div class="dashboard-container">
      <!-- Page Header -->
      <div class="header">
        <router-link to="/home" class="back-btn">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5"/>
            <path d="m12 19-7-7 7-7"/>
          </svg>
          <span class="back-text">Trang chủ</span>
          <div class="back-shine"></div>
        </router-link>
        <h2>Dashboard - Tổng quan</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Lỗi khi tải dữ liệu</h3>
        <p>{{ error }}</p>
        <button @click="loadDashboardData" class="retry-btn">Thử lại</button>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Quick Stats -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card revenue">
              <div class="stat-card-content">
                <div class="stat-info">
                  <h3>Doanh thu</h3>
                  <div class="stat-value">{{ stats.revenue.value }}</div>
                  <div :class="['stat-change', stats.revenue.change >= 0 ? 'positive' : 'negative']">
                    {{ stats.revenue.change >= 0 ? '+' : '' }}{{ stats.revenue.change }}%
                  </div>
                </div>
                <div class="stat-icon">💰</div>
              </div>
            </div>
            <div class="stat-card orders">
              <div class="stat-card-content">
                <div class="stat-info">
                  <h3>Đơn hàng</h3>
                  <div class="stat-value">{{ stats.orders.value }}</div>
                  <div :class="['stat-change', stats.orders.change >= 0 ? 'positive' : 'negative']">
                    {{ stats.orders.change >= 0 ? '+' : '' }}{{ stats.orders.change }}%
                  </div>
                </div>
                <div class="stat-icon">📦</div>
              </div>
            </div>
            <div class="stat-card customers">
              <div class="stat-card-content">
                <div class="stat-info">
                  <h3>Khách hàng</h3>
                  <div class="stat-value">{{ stats.customers.value }}</div>
                  <div :class="['stat-change', stats.customers.change >= 0 ? 'positive' : 'negative']">
                    {{ stats.customers.change >= 0 ? '+' : '' }}{{ stats.customers.change }}%
                  </div>
                </div>
                <div class="stat-icon">👥</div>
              </div>
            </div>
            <div class="stat-card products">
              <div class="stat-card-content">
                <div class="stat-info">
                  <h3>Sản phẩm</h3>
                  <div class="stat-value">{{ stats.products.value }}</div>
                  <div :class="['stat-change', stats.products.change >= 0 ? 'positive' : 'negative']">
                    {{ stats.products.change >= 0 ? '+' : '' }}{{ stats.products.change }}%
                  </div>
                </div>
                <div class="stat-icon">🛍️</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Controls -->
        <div class="dashboard-header">
          <h3>Tổng quan hoạt động</h3>
          <div class="dashboard-controls">
            <select style="background: white; color: black;" v-model="selectedTimeFilter" class="time-filter" @change="onTimeFilterChange">
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm này</option>
            </select>
            <button @click="refreshData" class="refresh-btn" :disabled="loading">
              <span v-if="loading" class="loading-dots">⏳</span>
              <span v-else>🔄 Làm mới</span>
            </button>
          </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="dashboard-main">
          <!-- Recent Activities -->
          <div class="dashboard-card recent-activities">
            <div class="card-header">
              <h4>📋 Hoạt động gần đây</h4>
              <a href="#" class="view-all">Xem tất cả</a>
            </div>
            <div class="activities-list">
              <div v-if="recentActivities.length === 0" class="no-data">
                <p>Không có hoạt động nào gần đây</p>
              </div>
              <div v-else v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div :class="['activity-icon', activity.type]">{{ activity.icon }}</div>
                <div class="activity-content">
                  <h5>{{ activity.title }}</h5>
                  <p>{{ activity.description }}</p>
                  <span class="activity-value">{{ activity.value }}</span>
                </div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>

          <!-- Top Products -->
          <div class="dashboard-card top-products">
            <div class="card-header">
              <h4>🏆 Sản phẩm bán chạy</h4>
              <span class="period">{{ getTimeFilterLabel() }}</span>
            </div>
            <div class="products-ranking">
              <div v-if="topProducts.length === 0" class="no-data">
                <p>Không có dữ liệu sản phẩm bán chạy</p>
              </div>
              <div v-else v-for="(product, index) in topProducts" :key="product.id" 
                   :class="['product-item', `rank-${index + 1}`]">
                <div class="rank-badge">{{ index + 1 }}</div>
                <div class="product-info">
                  <h5>{{ product.name }}</h5>
                  <p>{{ product.category }}</p>
                </div>
                <div class="product-stats">
                  <span class="quantity">{{ product.sold }} bán</span>
                  <span class="revenue">{{ product.revenue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Biểu đồ Doanh thu -->
          <div class="dashboard-card sales-chart">
            <div class="card-header">
              <h4>📈 Biểu đồ doanh thu 7 ngày</h4>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="chart-bars">
                  <div v-for="(day, index) in revenueChart.data" :key="index"
                       :class="['bar', { active: index === revenueChart.data.length - 1 }]"
                       :style="{ height: day.percentage + '%' }"
                       @click="selectChartDay('revenue', index)">
                    <span>{{ day.value }}</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span v-for="label in chartLabels" :key="label">{{ label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Biểu đồ Đơn hàng -->
          <div class="dashboard-card orders-chart">
            <div class="card-header">
              <h4>📦 Biểu đồ đơn hàng 7 ngày</h4>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="chart-bars">
                  <div v-for="(day, index) in ordersChart.data" :key="index"
                       :class="['bar', 'orders-bar', { active: index === ordersChart.data.length - 1 }]"
                       :style="{ height: day.percentage + '%' }"
                       @click="selectChartDay('orders', index)">
                    <span>{{ day.value }}</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span v-for="label in chartLabels" :key="label">{{ label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Biểu đồ Khách hàng -->
          <div class="dashboard-card customers-chart">
            <div class="card-header">
              <h4>👥 Biểu đồ khách hàng 7 ngày</h4>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="chart-bars">
                  <div v-for="(day, index) in customersChart.data" :key="index"
                       :class="['bar', 'customers-bar', { active: index === customersChart.data.length - 1 }]"
                       :style="{ height: day.percentage + '%' }"
                       @click="selectChartDay('customers', index)">
                    <span>{{ day.value }}</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span v-for="label in chartLabels" :key="label">{{ label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AdminFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'
import { 
  getDashboardStats, 
  getRecentActivities, 
  getTopProducts, 
  getChartData 
} from '../api.js'

// Reactive data
const loading = ref(true)
const error = ref(null)
const selectedTimeFilter = ref('week')

// Dashboard data
const stats = ref({
  revenue: { value: '0 VNĐ', change: 0 },
  orders: { value: '0', change: 0 },
  customers: { value: '0', change: 0 },
  products: { value: '0', change: 0 }
})

const recentActivities = ref([])
const topProducts = ref([])
const chartLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

const revenueChart = ref({
  data: Array(7).fill({ value: '0', percentage: 0 })
})

const ordersChart = ref({
  data: Array(7).fill({ value: '0', percentage: 0 })
})

const customersChart = ref({
  data: Array(7).fill({ value: '0', percentage: 0 })
})

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Load all dashboard data in parallel
    const [statsData, activitiesData, productsData, chartData] = await Promise.all([
      getDashboardStats(),
      getRecentActivities(),
      getTopProducts(),
      getChartData(selectedTimeFilter.value)
    ])
    
    // Update reactive data
    stats.value = statsData
    recentActivities.value = activitiesData
    topProducts.value = productsData
    
    // Update charts
    revenueChart.value.data = chartData.revenue
    ordersChart.value.data = chartData.orders
    customersChart.value.data = chartData.customers
    
  } catch (err) {
    console.error('Error loading dashboard data:', err)
    error.value = 'Không thể tải dữ liệu dashboard. Vui lòng kiểm tra kết nối mạng và thử lại.'
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadDashboardData()
}

const onTimeFilterChange = async () => {
  await loadDashboardData()
}

const getTimeFilterLabel = () => {
  const labels = {
    today: 'Hôm nay',
    week: 'Tuần này',
    month: 'Tháng này',
    year: 'Năm này'
  }
  return labels[selectedTimeFilter.value] || 'Tuần này'
}

const selectChartDay = (chartType, dayIndex) => {
  // Handle chart day selection
  console.log(`Selected ${chartType} chart day ${dayIndex}`)
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})

// Watch for time filter changes
watch(selectedTimeFilter, () => {
  if (!loading.value) {
    loadDashboardData()
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-container {
  max-width: 95%;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  flex-grow: 1;
}

/* Page Header */
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
  font-style: normal;
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

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #666;
  font-size: 1.2rem;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #c62828;
  font-size: 1.2rem;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.error-container h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.error-container p {
  margin-bottom: 20px;
  color: #78909c;
}

.retry-btn {
  padding: 10px 25px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* Quick Stats Grid */
.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.stat-card.revenue::before { background: linear-gradient(90deg, #4facfe, #00f2fe); }
.stat-card.orders::before { background: linear-gradient(90deg, #43e97b, #38f9d7); }
.stat-card.customers::before { background: linear-gradient(90deg, #fa709a, #fee140); }
.stat-card.products::before { background: linear-gradient(90deg, #a8edea, #fed6e3); }

.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.stat-change.positive {
  background: #e8f5e8;
  color: #2d7d32;
}

.stat-change.negative {
  background: #ffebee;
  color: #c62828;
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.3;
}

/* Dashboard Controls */
.dashboard-header {
  background: white;
  border-radius: 16px;
  padding: 20px 25px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}

.dashboard-header h3 {
  font-size: 1.4rem;
  color: #333;
  font-weight: 600;
}

.dashboard-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.time-filter {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
 
  border-radius: 10px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-filter:focus {
  outline: none;
  
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.refresh-btn {
  padding: 10px 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #888;
}

.loading-dots {
  animation: spin 1s linear infinite;
}

/* Main Content Grid */
.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
}

.card-header {
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.view-all {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: #764ba2;
}

/* Recent Activities */
.activities-list {
  padding: 20px 25px;
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f8f8f8;
  transition: all 0.3s ease;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: #f8f9ff;
  margin: 0 -25px;
  padding: 15px 25px;
  border-radius: 8px;
}

.activity-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 15px;
}

.activity-icon.sale { background: linear-gradient(45deg, #4facfe, #00f2fe); color: white; }
.activity-icon.order { background: linear-gradient(45deg, #43e97b, #38f9d7); color: white; }
.activity-icon.customer { background: linear-gradient(45deg, #fa709a, #fee140); color: white; }

.activity-content {
  flex: 1;
}

.activity-content h5 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.activity-content p {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.activity-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
}

.activity-time {
  font-size: 0.8rem;
  color: #999;
}

/* Top Products */
.products-ranking {
  padding: 20px 25px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f8f8f8;
  transition: all 0.3s ease;
}

.product-item:last-child {
  border-bottom: none;
}

.product-item:hover {
  background: #f8f9ff;
  margin: 0 -25px;
  padding: 15px 25px;
  border-radius: 8px;
}

.rank-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 15px;
  font-size: 0.9rem;
}

.rank-1 .rank-badge { background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; }
.rank-2 .rank-badge { background: linear-gradient(45deg, #c0c0c0, #e8e8e8); color: #333; }
.rank-3 .rank-badge { background: linear-gradient(45deg, #cd7f32, #daa520); color: white; }
.product-item:not(.rank-1):not(.rank-2):not(.rank-3) .rank-badge { 
  background: #f0f0f0; 
  color: #666; 
}

.product-info {
  flex: 1;
}

.product-info h5 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.product-info p {
  font-size: 0.8rem;
  color: #666;
}

.product-stats {
  text-align: right;
}

.quantity {
  display: block;
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
}

.revenue {
  font-size: 0.8rem;
  color: #999;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  padding: 25px;
  height: 300px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 200px;
  gap: 8px;
}

.bar {
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 4px 4px 0 0;
  flex: 1;
  min-height: 20px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.bar:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.bar.active {
  background: linear-gradient(to top, #4facfe, #00f2fe);
}

.bar.orders-bar {
  background: linear-gradient(to top, #43e97b, #38f9d7);
}

.bar.orders-bar.active {
  background: linear-gradient(to top, #2ed573, #26de81);
}

.bar.customers-bar {
  background: linear-gradient(to top, #fa709a, #fee140);
}

.bar.customers-bar.active {
  background: linear-gradient(to top, #ff6b9d, #feca57);
}

.bar span {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  font-size: 0.8rem;
  color: #666;
}

/* No Data Message */
.no-data {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 1.1rem;
}

.no-data p {
  margin: 0;
  opacity: 0.7;
}

/* Loading and Error States */
.loading-container,
.error-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin: 20px 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  text-align: center;
}

.loading-container p {
  margin: 0;
  color: #666;
}

.error-container h3 {
  margin: 0 0 10px 0;
  color: #c62828;
}

.error-container p {
  margin: 0 0 20px 0;
  color: #78909c;
  max-width: 500px;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .dashboard-controls {
    width: 100%;
    justify-content: center;
  }
  
  .dashboard-main {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .chart-container {
    padding: 20px;
    height: 280px;
  }
  
  .chart-bars {
    height: 180px;
  }
  

}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .back-btn {
    padding: 12px 18px;
    font-size: 0.9rem;
  }
  
  .back-icon {
    width: 16px;
    height: 16px;
  }
  
  .header h2 {
    font-size: 1.75rem;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-card-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .stat-icon {
    font-size: 2.5rem;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
  
  .dashboard-header {
    padding: 15px 20px;
  }
  
  .card-header {
    padding: 15px 20px;
  }
  
  .activities-list,
  .products-ranking {
    padding: 15px 20px;
  }
  
  .activity-item:hover,
  .product-item:hover {
    margin: 0 -20px;
    padding: 15px 20px;
  }
  
  .chart-container {
    padding: 15px;
    height: 250px;
  }
  
  .chart-bars {
    height: 160px;
    gap: 6px;
  }
  
  .bar span {
    font-size: 0.7rem;
    top: -20px;
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

.stat-card,
.dashboard-card {
  animation: fadeInUp 0.6s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

/* Scrollbar styling */
.activities-list::-webkit-scrollbar {
  width: 6px;
}

.activities-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.activities-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.activities-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}







/* Accessibility improvements */
.refresh-btn:focus,
.time-filter:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.bar:focus {
  outline: 2px solid #667eea;
  outline-offset: 1px;
}

/* Print styles */
@media print {
  .header .back-btn {
    display: none !important;
  }
  
  body {
    background: white !important;
    color: black !important;
  }
  
  .dashboard-container {
    max-width: none;
    padding: 0;
  }
  
  .stat-card,
  .dashboard-card {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }
  
  .dashboard-controls {
    display: none;
  }
  
  .charts-section {
    grid-template-columns: 1fr 1fr;
  }
}
</style>