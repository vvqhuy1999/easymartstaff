<template>
  <AdminHeader />
  <div class="revenue-management">
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
      <h2>Quản lý Doanh thu Siêu thị Mini</h2>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i> {{ tab.label }}
      </button>
    </div>

    <!-- Time Filter -->
    <div class="time-filter">
      <button 
        v-for="filter in timeFilters" 
        :key="filter.id"
        :class="['filter-btn', { active: timeFilter === filter.id }]"
        @click="timeFilter = filter.id"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Overview Tab -->
    <div v-show="activeTab === 'overview'" class="tab-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card revenue-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Doanh thu</p>
              <p class="stat-value">{{ formatCurrency(currentStats.total) }}</p>
            </div>
            <i class="fas fa-dollar-sign stat-icon"></i>
          </div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i>
            <span>+12% so với kỳ trước</span>
          </div>
        </div>

        <div class="stat-card orders-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Đơn hàng</p>
              <p class="stat-value">{{ currentStats.orders }}</p>
            </div>
            <i class="fas fa-shopping-cart stat-icon"></i>
          </div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i>
            <span>+8% so với kỳ trước</span>
          </div>
        </div>

        <div class="stat-card customers-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Khách hàng</p>
              <p class="stat-value">{{ currentStats.customers }}</p>
            </div>
            <i class="fas fa-users stat-icon"></i>
          </div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i>
            <span>+5% so với kỳ trước</span>
          </div>
        </div>

        <div class="stat-card avg-card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Đơn TB</p>
              <p class="stat-value">{{ formatCurrency(currentStats.avgOrder) }}</p>
            </div>
            <i class="fas fa-chart-line stat-icon"></i>
          </div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i>
            <span>+3% so với kỳ trước</span>
          </div>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="chart-container">
        <h3>Biểu đồ Doanh thu</h3>
        <canvas id="revenueChart"></canvas>
      </div>
    </div>

    <!-- Daily Tab -->
    <div v-show="activeTab === 'daily'" class="tab-content">
      <div class="daily-content">
        <div class="chart-container">
          <h3>Doanh thu theo Ngày</h3>
          <canvas id="dailyChart"></canvas>
        </div>

        <div class="daily-details">
          <div class="detail-card">
            <h3>Chi tiết theo Ngày</h3>
            <div class="detail-list">
              <div 
                v-for="day in dailyRevenueData" 
                :key="day.date"
                class="detail-item"
              >
                <span class="detail-date">{{ day.date }}</span>
                <div class="detail-info">
                  <div class="detail-revenue">{{ formatCurrency(day.revenue) }}</div>
                  <div class="detail-orders">{{ day.orders }} đơn hàng</div>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <h3>Số đơn hàng theo Ngày</h3>
            <canvas id="ordersChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Tab -->
    <div v-show="activeTab === 'products'" class="tab-content">
      <div class="products-content">
        <div class="chart-container">
          <h3>Top Sản phẩm Bán chạy</h3>
          <canvas id="productsChart"></canvas>
        </div>

        <div class="products-detail">
          <h3>Chi tiết Sản phẩm</h3>
          <div class="product-list">
            <div 
              v-for="(product, index) in topProductsData" 
              :key="index"
              class="product-item"
            >
              <div class="product-info">
                <div 
                  class="product-color"
                  :style="{ backgroundColor: product.color }"
                ></div>
                <div class="product-details">
                  <h4>{{ product.name }}</h4>
                  <p>Số lượng: {{ product.quantity }}</p>
                </div>
              </div>
              <div class="product-revenue">
                {{ formatCurrency(product.revenue) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Tab -->
    <div v-show="activeTab === 'analytics'" class="tab-content">
      <div class="analytics-content">
        <div class="analytics-charts">
          <div class="chart-container">
            <h3>Doanh thu theo Tuần</h3>
            <canvas id="weeklyChart"></canvas>
          </div>

          <div class="chart-container">
            <h3>Doanh thu theo Tháng</h3>
            <canvas id="monthlyChart"></canvas>
          </div>
        </div>

        <div class="analytics-summary">
          <h3>Báo cáo Tổng hợp</h3>
          <div class="summary-grid">
            <div class="summary-card week-growth">
              <h4>Tăng trưởng Tuần</h4>
              <p class="summary-value">+12.5%</p>
              <p class="summary-desc">So với tuần trước</p>
            </div>
            <div class="summary-card month-growth">
              <h4>Tăng trưởng Tháng</h4>
              <p class="summary-value">+8.3%</p>
              <p class="summary-desc">So với tháng trước</p>
            </div>
            <div class="summary-card new-customers">
              <h4>Khách hàng Mới</h4>
              <p class="summary-value">45</p>
              <p class="summary-desc">Trong tháng này</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AdminFooter />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'

// State
const activeTab = ref('overview')
const timeFilter = ref('today')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const charts = ref({})

const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: 'fas fa-tachometer-alt' },
  { id: 'daily', label: 'Theo ngày', icon: 'fas fa-calendar-day' },
  { id: 'products', label: 'Sản phẩm', icon: 'fas fa-box' },
  { id: 'analytics', label: 'Phân tích', icon: 'fas fa-chart-bar' }
]

const timeFilters = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' }
]

const revenueData = {
  today: {
    total: 2500000,
    orders: 45,
    customers: 38,
    avgOrder: 55556
  },
  week: {
    total: 18500000,
    orders: 312,
    customers: 265,
    avgOrder: 59295
  },
  month: {
    total: 75000000,
    orders: 1250,
    customers: 980,
    avgOrder: 60000
  }
}

const dailyRevenueData = [
  { date: '18/07', revenue: 2200000, orders: 42 },
  { date: '19/07', revenue: 2800000, orders: 51 },
  { date: '20/07', revenue: 2100000, orders: 38 },
  { date: '21/07', revenue: 3200000, orders: 58 },
  { date: '22/07', revenue: 2900000, orders: 52 },
  { date: '23/07', revenue: 2700000, orders: 47 },
  { date: '24/07', revenue: 2500000, orders: 45 }
]

const weeklyRevenueData = [
  { week: 'Tuần 1', revenue: 16500000, orders: 280 },
  { week: 'Tuần 2', revenue: 18200000, orders: 315 },
  { week: 'Tuần 3', revenue: 17800000, orders: 298 },
  { week: 'Tuần 4', revenue: 18500000, orders: 312 }
]

const monthlyRevenueData = [
  { month: 'T2', revenue: 68000000, orders: 1180 },
  { month: 'T3', revenue: 72000000, orders: 1250 },
  { month: 'T4', revenue: 69500000, orders: 1205 },
  { month: 'T5', revenue: 74000000, orders: 1280 },
  { month: 'T6', revenue: 71500000, orders: 1225 },
  { month: 'T7', revenue: 75000000, orders: 1250 }
]

const topProductsData = [
  { name: 'Nước suối', revenue: 450000, quantity: 180, color: '#3b82f6' },
  { name: 'Bánh mì', revenue: 380000, quantity: 95, color: '#10b981' },
  { name: 'Sữa tươi', revenue: 320000, quantity: 40, color: '#f59e0b' },
  { name: 'Snack', revenue: 290000, quantity: 58, color: '#ef4444' },
  { name: 'Nước ngọt', revenue: 260000, quantity: 52, color: '#8b5cf6' }
]

// Computed
const currentStats = computed(() => {
  return revenueData[timeFilter.value] || revenueData.today
})

// Watchers
watch([activeTab, timeFilter], () => {
  nextTick(() => {
    renderCharts()
  })
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    renderCharts()
  })
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

function renderCharts() {
  // Destroy existing charts
  Object.values(charts.value).forEach(chart => {
    if (chart) chart.destroy()
  })
  charts.value = {}

  if (activeTab.value === 'overview') {
    renderRevenueChart()
  } else if (activeTab.value === 'daily') {
    renderDailyChart()
    renderOrdersChart()
  } else if (activeTab.value === 'products') {
    renderProductsChart()
  } else if (activeTab.value === 'analytics') {
    renderWeeklyChart()
    renderMonthlyChart()
  }
}

function renderRevenueChart() {
  const ctx = document.getElementById('revenueChart')
  if (!ctx) return

  let data
  if (timeFilter.value === 'week') {
    data = weeklyRevenueData
  } else if (timeFilter.value === 'month') {
    data = monthlyRevenueData
  } else {
    data = dailyRevenueData
  }

  charts.value.revenue = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(item => item.date || item.week || item.month),
      datasets: [{
        label: 'Doanh thu',
        data: data.map(item => item.revenue),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return (value / 1000000).toFixed(1) + 'M'
            }
          }
        }
      }
    }
  })
}

function renderDailyChart() {
  const ctx = document.getElementById('dailyChart')
  if (!ctx) return

  charts.value.daily = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: dailyRevenueData.map(item => item.date),
      datasets: [{
        label: 'Doanh thu',
        data: dailyRevenueData.map(item => item.revenue),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return (value / 1000000).toFixed(1) + 'M'
            }
          }
        }
      }
    }
  })
}

function renderOrdersChart() {
  const ctx = document.getElementById('ordersChart')
  if (!ctx) return

  charts.value.orders = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyRevenueData.map(item => item.date),
      datasets: [{
        label: 'Số đơn hàng',
        data: dailyRevenueData.map(item => item.orders),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

function renderProductsChart() {
  const ctx = document.getElementById('productsChart')
  if (!ctx) return

  charts.value.products = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: topProductsData.map(item => item.name),
      datasets: [{
        data: topProductsData.map(item => item.revenue),
        backgroundColor: topProductsData.map(item => item.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  })
}

function renderWeeklyChart() {
  const ctx = document.getElementById('weeklyChart')
  if (!ctx) return

  charts.value.weekly = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeklyRevenueData.map(item => item.week),
      datasets: [{
        label: 'Doanh thu',
        data: weeklyRevenueData.map(item => item.revenue),
        backgroundColor: '#8b5cf6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return (value / 1000000).toFixed(0) + 'M'
            }
          }
        }
      }
    }
  })
}

function renderMonthlyChart() {
  const ctx = document.getElementById('monthlyChart')
  if (!ctx) return

  charts.value.monthly = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyRevenueData.map(item => item.month),
      datasets: [{
        label: 'Doanh thu',
        data: monthlyRevenueData.map(item => item.revenue),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return (value / 1000000).toFixed(0) + 'M'
            }
          }
        }
      }
    }
  })
}
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
}

.revenue-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
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

/* Navigation Tabs */
.nav-tabs {
  background: white;
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab-btn {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #7f8c8d;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

/* Time Filter */
.time-filter {
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #e9ecef;
}

.filter-btn.active {
  background: #667eea;
  color: white;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.revenue-card::before { background: linear-gradient(135deg, #667eea, #764ba2); }
.orders-card::before { background: linear-gradient(135deg, #10b981, #059669); }
.customers-card::before { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.avg-card::before { background: linear-gradient(135deg, #f59e0b, #d97706); }

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.95em;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8em;
  font-weight: 700;
  color: #2c3e50;
}

.stat-icon {
  font-size: 2em;
  opacity: 0.3;
}

.revenue-card .stat-icon { color: #667eea; }
.orders-card .stat-icon { color: #10b981; }
.customers-card .stat-icon { color: #8b5cf6; }
.avg-card .stat-icon { color: #f59e0b; }

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
  color: #10b981;
}

.stat-trend i {
  font-size: 0.8em;
}

/* Chart Container */
.chart-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.chart-container h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4em;
}

.chart-container canvas {
  max-height: 400px;
}

/* Tab Content */
.tab-content {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Daily Content */
.daily-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.daily-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.detail-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.detail-card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2em;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.detail-date {
  font-weight: 600;
  color: #495057;
}

.detail-info {
  text-align: right;
}

.detail-revenue {
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.detail-orders {
  font-size: 0.9em;
  color: #7f8c8d;
}

/* Products Content */
.products-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.products-detail {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.products-detail:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.products-detail h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2em;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.product-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.product-details h4 {
  color: #2c3e50;
  margin-bottom: 4px;
}

.product-details p {
  font-size: 0.9em;
  color: #7f8c8d;
}

.product-revenue {
  font-weight: 700;
  color: #667eea;
}

/* Analytics Content */
.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.analytics-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.analytics-summary {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.analytics-summary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.analytics-summary h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4em;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  text-align: center;
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.week-growth::before {
  background: linear-gradient(135deg, #10b981, #059669);
}

.month-growth::before {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.new-customers::before {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.summary-card h4 {
  color: #495057;
  margin-bottom: 12px;
  font-size: 1em;
}

.summary-value {
  font-size: 2em;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.summary-desc {
  color: #7f8c8d;
  font-size: 0.9em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .revenue-management {
    padding: 15px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .nav-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .daily-details,
  .analytics-charts {
    grid-template-columns: 1fr;
  }
  
  .products-content {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
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
  
  .header h2 {
    font-size: 1.75rem;
  }
  
  .chart-container {
    padding: 20px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 1.5em;
  }
}

/* Loading Animation */
.chart-container canvas {
  animation: chartLoad 0.8s ease-out;
}

@keyframes chartLoad {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Print styles */
@media print {
  .header .back-btn {
    display: none !important;
  }
  
  .revenue-management {
    background: white;
    padding: 0;
  }
  
  .chart-container,
  .header {
    box-shadow: none;
    border: 1px solid #f9f7f7;
  }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5a67d8;
}
</style>