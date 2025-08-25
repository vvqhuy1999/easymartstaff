<template>
  <AdminHeader /> 
  <div class="staff-info-container">
    <!-- Header with back button -->
    <div class="header">
              <router-link to="/home" class="back-btn">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"/>
          <path d="m12 19-7-7 7-7"/>
        </svg>
        <span class="back-text">Trang chủ</span>
        <div class="back-shine"></div>
      </router-link>
      <h2>Thông tin nhân viên</h2>
    </div>

    <!-- Staff Info Card -->
    <div class="staff-card" v-if="staffInfo">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <div class="avatar-container">
          <img 
            :src="staffInfo.avatar || '/api/placeholder/120/120'" 
            :alt="staffInfo.name"
            class="staff-avatar"
            @error="handleImageError"
          />
          <div class="avatar-overlay" v-if="!staffInfo.avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
        <div class="status-indicator">
          <span :class="['status-badge', staffInfo.status === 'active' ? 'active' : 'inactive']">
            {{ staffInfo.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ' }}
          </span>
        </div>
      </div>

      <!-- Basic Info Section -->
      <div class="info-section">
        <h3 class="section-title">Thông tin cơ bản</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID nhân viên:</span>
            <span class="value">{{ staffInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Họ và tên:</span>
            <span class="value">{{ staffInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value email-value">{{ staffInfo.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Chức vụ:</span>
            <span :class="['value', 'role-badge', getRoleClass(staffInfo.role)]">
              {{ staffInfo.role }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Phòng ban:</span>
            <span class="value">{{ staffInfo.department }}</span>
          </div>
          <div class="info-item">
            <span class="label">Ngày vào làm:</span>
            <span class="value">{{ formatDate(staffInfo.joinDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Thời gian làm việc:</span>
            <span class="value">{{ calculateWorkingTime(staffInfo.joinDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Trạng thái:</span>
            <span :class="['value', 'status-badge', staffInfo.status === 'active' ? 'active' : 'inactive']">
              {{ staffInfo.status === 'active' ? 'Đang hoạt động' : 'Tạm nghỉ' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="no-data">
      <div class="no-data-icon">👤</div>
      <h3>Không tìm thấy thông tin nhân viên</h3>
      <p>Nhân viên có thể đã bị xóa hoặc không tồn tại.</p>
                      <router-link to="/home" class="back-list-btn">Trang chủ</router-link>
    </div>
  </div>
  <AdminFooter />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'

const route = useRoute()

// Dữ liệu mẫu nhân viên
const sampleStaffs = [
  {
    id: 'NV001',
    name: 'Nguyễn Văn An',
    email: 'nguyen.van.an@company.com',
    role: 'Quản lý',
    department: 'Phòng Kinh doanh',
    joinDate: '2020-01-15',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'NV002',
    name: 'Trần Thị Bình',
    email: 'tran.thi.binh@company.com',
    role: 'Nhân viên',
    department: 'Phòng Kế toán',
    joinDate: '2021-03-20',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b75c?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'NV003',
    name: 'Lê Hoàng Cường',
    email: 'le.hoang.cuong@company.com',
    role: 'Thực tập sinh',
    department: 'Phòng IT',
    joinDate: '2024-07-01',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'NV004',
    name: 'Phạm Thị Dung',
    email: 'pham.thi.dung@company.com',
    role: 'Quản lý',
    department: 'Phòng Nhân sự',
    joinDate: '2019-11-10',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'NV005',
    name: 'Hoàng Minh Đức',
    email: 'hoang.minh.duc@company.com',
    role: 'Nhân viên',
    department: 'Phòng Marketing',
    joinDate: '2022-05-18',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
  }
]

// Reactive data
const staffInfo = ref(null)

// Computed
const staffId = computed(() => route.params.id || route.query.id)

// Tải thông tin nhân viên
const loadStaffInfo = () => {
  if (!staffId.value) return
  
  const staff = sampleStaffs.find(s => s.id.toString() === staffId.value.toString())
  if (staff) {
    staffInfo.value = { ...staff }
  }
}

// Format ngày tháng
const formatDate = (dateStr) => {
  if (!dateStr) return 'Chưa xác định'
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Tính thời gian làm việc
const calculateWorkingTime = (joinDate) => {
  if (!joinDate) return 'Chưa xác định'
  
  const start = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} ngày`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} tháng`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    return `${years} năm${remainingMonths > 0 ? ` ${remainingMonths} tháng` : ''}`
  }
}

// Class cho từng loại chức vụ
const getRoleClass = (role) => {
  switch(role) {
    case 'Quản lý': return 'manager'
    case 'Thực tập sinh': return 'intern'
    default: return 'staff'
  }
}

// Xử lý lỗi ảnh
const handleImageError = (event) => {
  event.target.src = '/api/placeholder/120/120'
}

// Khởi tạo khi component mount
onMounted(() => {
  loadStaffInfo()
})
</script>

<style scoped>
.staff-info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.back-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  overflow: hidden;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.back-icon {
  width: 20px;
  height: 20px;
}

.back-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.back-btn:hover .back-shine {
  left: 100%;
}

.header h2 {
  color: white;
  font-size: 2em;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.staff-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.staff-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #667eea;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-overlay svg {
  width: 48px;
  height: 48px;
}

.section-title {
  color: #2c3e50;
  font-size: 1.4em;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.label {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.1em;
}

.email-value {
  color: #667eea;
  text-decoration: none;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.role-badge.manager {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.role-badge.staff {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.role-badge.intern {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  color: white;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-badge.active {
  background: linear-gradient(135deg, #00b894, #00a085);
  color: white;
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
  color: white;
}

.actions-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.95em;
}

.edit-btn {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #0984e3, #74b9ff);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(116, 185, 255, 0.4);
}

.status-btn {
  color: white;
}

.status-btn.pause {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
}

.status-btn.pause:hover {
  background: linear-gradient(135deg, #e17055, #fdcb6e);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(253, 203, 110, 0.4);
}

.status-btn.resume {
  background: linear-gradient(135deg, #00b894, #00a085);
}

.status-btn.resume:hover {
  background: linear-gradient(135deg, #00a085, #00b894);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 184, 148, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #ff7675, #d63031);
  color: white;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #d63031, #ff7675);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 118, 117, 0.4);
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.no-data-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.no-data h3 {
  color: #2c3e50;
  font-size: 1.5em;
  margin-bottom: 12px;
}

.no-data p {
  color: #6c757d;
  font-size: 1.1em;
  margin-bottom: 24px;
}

.back-list-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-list-btn:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-modal {
  background: white;
  padding: 32px;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.confirm-icon {
  font-size: 3em;
  margin-bottom: 20px;
}

.confirm-modal h3 {
  color: #2c3e50;
  font-size: 1.4em;
  margin-bottom: 16px;
}

.confirm-modal p {
  color: #6c757d;
  font-size: 1.05em;
  line-height: 1.5;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-btn {
  padding: 12px 24px;
  background: #e9ecef;
  color: #6c757d;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #dee2e6;
}

.confirm-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.confirm-btn.delete {
  background: linear-gradient(135deg, #ff7675, #d63031);
}

.confirm-btn.delete:hover {
  background: linear-gradient(135deg, #d63031, #ff7675);
}

.confirm-btn.status {
  background: linear-gradient(135deg, #00b894, #00a085);
}

.confirm-btn.status:hover {
  background: linear-gradient(135deg, #00a085, #00b894);
}

/* Responsive */
@media (max-width: 768px) {
  .staff-info-container {
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header h2 {
    font-size: 1.6em;
  }
  
  .staff-card {
    padding: 24px 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-section {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
    width: 100%;
  }
}
</style>