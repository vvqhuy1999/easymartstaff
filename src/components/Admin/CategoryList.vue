<template>
  <div>
    <AdminHeader /> 
    <div class="category-management-container">
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
        <h2>Quản lý danh mục sản phẩm</h2>
      </div>

      <!-- Search and Add Category -->
      <div class="toolbar">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            class="search-input"
          />
          <button @click="clearSearch" class="clear-btn" v-if="searchQuery">✕</button>
        </div>
        <button @click="openAddModal" class="add-btn">+ Thêm danh mục</button>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải...</p>
      </div>

      <!-- Categories Table -->
      <div v-else class="table-container">
        <table class="category-table" v-if="filteredCategories.length > 0">
          <thead>
            <tr>
              <th>Mã danh mục</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Danh mục cha</th>
              <th>Thứ tự hiển thị</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in filteredCategories" :key="category.maLoaiSP">
              <td class="category-id">{{ category.maLoaiSP }}</td>
              <td class="category-name">{{ category.tenLoai }}</td>
              <td class="category-description">{{ category.moTa || 'Chưa có mô tả' }}</td>
              <td class="parent-category">{{ category.loaiCha && category.loaiCha.tenLoai ? category.loaiCha.tenLoai : 'Danh mục gốc' }}</td>
              <td class="display-order">{{ category.thuTuHienThi || 0 }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="openEditModal(category)" class="edit-btn" title="Chỉnh sửa danh mục">
                    <span class="btn-icon">✏️</span>
                    <span class="btn-text">Sửa</span>
                  </button>
                  <button @click="deleteCategory(category.maLoaiSP)" class="delete-btn" title="Xóa danh mục">
                    <span class="btn-icon">🗑️</span>
                    <span class="btn-text">Xóa</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredCategories.length === 0" class="no-data">
          <div class="no-data-icon">📂</div>
          <p>{{ searchQuery ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào' }}</p>
          <button v-if="!searchQuery" @click="openAddModal" class="add-first-btn">Thêm danh mục đầu tiên</button>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}</h3>
            <button @click="closeModal" class="close-btn" title="Đóng">✕</button>
          </div>
          
          <form @submit.prevent="saveCategory" class="category-form">
            <div class="form-group" v-if="!isEditing">
              <label for="category-id">Mã danh mục <span class="required">*</span></label>
              <div class="code-input-group">
                <input 
                  id="category-id"
                  v-model="currentCategory.maLoaiSP" 
                  type="text" 
                  required 
                  class="form-input"
                  placeholder="Mã sẽ được tự động sinh"
                  readonly
                />
                <button 
                  type="button" 
                  @click="generateNewCode" 
                  class="regenerate-btn"
                  title="Sinh lại mã mới"
                >
                  🔄
                </button>
              </div>
              <small class="form-help">Mã danh mục được tự động sinh theo định dạng DM + 8 ký tự ngẫu nhiên</small>
            </div>

            <div class="form-group" v-if="isEditing">
              <label for="category-id-edit">Mã danh mục</label>
              <input 
                id="category-id-edit"
                v-model="currentCategory.maLoaiSP" 
                type="text" 
                class="form-input"
                readonly
                disabled
              />
            </div>

            <div class="form-group">
              <label for="category-name">Tên danh mục <span class="required">*</span></label>
              <input 
                id="category-name"
                v-model="currentCategory.tenLoai" 
                type="text" 
                required 
                class="form-input"
                placeholder="Nhập tên danh mục"
              />
            </div>
            
            <div class="form-group">
              <label for="category-description">Mô tả danh mục</label>
              <textarea 
                id="category-description"
                v-model="currentCategory.moTa" 
                class="form-textarea"
                placeholder="Nhập mô tả cho danh mục (tùy chọn)"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="parent-category">Danh mục cha</label>
              <select id="parent-category" v-model="currentCategory.loaiCha" class="form-select">
                <option :value="null">Danh mục gốc</option>
                <option 
                  v-for="category in categories" 
                  :key="category.maLoaiSP" 
                  :value="category"
                  :disabled="isEditing && category.maLoaiSP === currentCategory.maLoaiSP"
                >
                  {{ category.tenLoai }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="display-order">Thứ tự hiển thị</label>
              <input 
                id="display-order"
                v-model.number="currentCategory.thuTuHienThi" 
                type="number" 
                min="0"
                class="form-input"
                placeholder="0"
              />
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn">Hủy</button>
              <button type="submit" class="save-btn" :disabled="saving">
                {{ saving ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirm" class="modal-overlay" @click="closeConfirm">
        <div class="confirm-modal" @click.stop>
          <div class="confirm-icon">⚠️</div>
          <h3>Xác nhận xóa</h3>
          <p>Bạn có chắc chắn muốn xóa danh mục này không?<br>Thao tác này sẽ xóa mềm danh mục (đánh dấu isDeleted = true).</p>
          <div class="confirm-actions">
            <button @click="closeConfirm" class="cancel-btn">Hủy</button>
            <button @click="confirmDelete" class="delete-btn" :disabled="deleting">
              {{ deleting ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">
        <span>❌ {{ error }}</span>
        <button @click="error = ''" class="close-error">✕</button>
      </div>

      <!-- Success message -->
      <div v-if="success" class="success-message">
        <span>✅ {{ success }}</span>
        <button @click="success = ''" class="close-success">✕</button>
      </div>
    </div>
    
    <AdminFooter />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'

// API configuration
const API_BASE_URL = 'http://localhost:8080/api/loaisanpham'

// Reactive data
const categories = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const showConfirm = ref(false)
const isEditing = ref(false)
const deleteCategoryId = ref(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')

const currentCategory = reactive({
  maLoaiSP: '',
  tenLoai: '',
  moTa: '',
  loaiCha: null,
  thuTuHienThi: 0
})

// Code Generation Methods
const generateCategoryCode = () => {
  // Tạo mã theo format DM + 8 ký tự ngẫu nhiên (giống CodeGenerator.java)
  const prefix = 'LSP'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  // Đảm bảo có ít nhất 1 chữ cái và 1 số
  result += chars.charAt(Math.floor(Math.random() * 26)) // Chữ cái đầu tiên
  result += chars.charAt(26 + Math.floor(Math.random() * 10)) // Số
  
  // Generate 6 ký tự còn lại
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return prefix + result
}

const generateNewCode = () => {
  currentCategory.maLoaiSP = generateCategoryCode()
}

// API Service functions
const apiService = {
  // Lấy tất cả loại sản phẩm
  async getAllCategories() {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (err) {
      console.error('Error fetching categories:', err)
      throw new Error('Không thể tải danh sách danh mục')
    }
  },

  // Lấy loại sản phẩm theo ID
  async getCategoryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy danh mục')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (err) {
      console.error('Error fetching category:', err)
      throw err
    }
  },

  // Thêm loại sản phẩm mới
  async createCategory(categoryData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (err) {
      console.error('Error creating category:', err)
      throw new Error('Không thể thêm danh mục mới')
    }
  },

  // Cập nhật loại sản phẩm
  async updateCategory(id, categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData)
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy danh mục cần cập nhật')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (err) {
      console.error('Error updating category:', err)
      throw err
    }
  },

  // Xóa mềm loại sản phẩm
  async deleteCategory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy danh mục cần xóa')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return true
    } catch (err) {
      console.error('Error deleting category:', err)
      throw err
    }
  }
}

// Computed properties
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value

  return categories.value.filter(category =>
    category.tenLoai.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (category.moTa && category.moTa.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    category.maLoaiSP.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const loadCategories = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await apiService.getAllCategories()
    categories.value = data || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const openAddModal = () => {
  isEditing.value = false
  resetCurrentCategory()
  showModal.value = true
}

const openEditModal = (category) => {
  isEditing.value = true
  Object.assign(currentCategory, {
    maLoaiSP: category.maLoaiSP,
    tenLoai: category.tenLoai,
    moTa: category.moTa || '',
    loaiCha: category.loaiCha,
    thuTuHienThi: category.thuTuHienThi || 0
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetCurrentCategory()
}

const resetCurrentCategory = () => {
  Object.assign(currentCategory, {
    maLoaiSP: generateCategoryCode(), // Tự động sinh mã mới
    tenLoai: '',
    moTa: '',
    loaiCha: null,
    thuTuHienThi: 0
  })
}

const saveCategory = async () => {
  saving.value = true
  error.value = ''
  success.value = ''
  
  try {
    // Chuẩn bị dữ liệu để gửi
    const categoryData = {
      maLoaiSP: currentCategory.maLoaiSP,
      tenLoai: currentCategory.tenLoai,
      moTa: currentCategory.moTa || null,
      loaiCha: currentCategory.loaiCha,
      thuTuHienThi: currentCategory.thuTuHienThi || 0
    }
    
    if (isEditing.value) {
      // Cập nhật danh mục
      const updatedCategory = await apiService.updateCategory(currentCategory.maLoaiSP, categoryData)
      const index = categories.value.findIndex(c => c.maLoaiSP === currentCategory.maLoaiSP)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      success.value = 'Cập nhật danh mục thành công!'
    } else {
      // Thêm danh mục mới
      const newCategory = await apiService.createCategory(categoryData)
      categories.value.push(newCategory)
      success.value = 'Thêm danh mục thành công!'
    }
    
    closeModal()
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      success.value = ''
    }, 3000)
    
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

const deleteCategory = (categoryId) => {
  deleteCategoryId.value = categoryId
  showConfirm.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  error.value = ''
  success.value = ''
  
  try {
    await apiService.deleteCategory(deleteCategoryId.value)
    
    // Xóa danh mục khỏi danh sách hiển thị
    categories.value = categories.value.filter(c => c.maLoaiSP !== deleteCategoryId.value)
    
    success.value = 'Xóa danh mục thành công!'
    closeConfirm()
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      success.value = ''
    }, 3000)
    
  } catch (err) {
    error.value = err.message
  } finally {
    deleting.value = false
  }
}

const closeConfirm = () => {
  showConfirm.value = false
  deleteCategoryId.value = null
}

// Lifecycle hooks
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.category-management-container {
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
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
}

.add-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
}

.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
}

.category-table th {
  background: #f8fafc;
  color: #475569;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #e2e8f0;
}

.category-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-weight: 500;
  color: #334155;
}

.category-table tbody tr {
  transition: background-color 0.2s ease;
}

.category-table tbody tr:hover {
  background: #f8fafc;
}

.category-table tbody tr:last-child td {
  border-bottom: none;
}

.category-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1.05rem;
}

.category-description {
  color: #64748b;
  font-style: italic;
  max-width: 250px;
  word-wrap: break-word;
}



.created-date {
  color: #64748b;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.action-buttons button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-icon {
  font-size: 0.9rem;
}

.btn-text {
  font-size: 0.85rem;
}

.edit-btn {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.edit-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.status-btn {
  background: #fef3c7;
  color: #d97706;
  border-color: #fde68a;
}

.status-btn:hover {
  background: #fde68a;
  border-color: #f59e0b;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: translateY(-1px);
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.no-data p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 20px 0;
}

.add-first-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-first-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

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
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease;
}

.confirm-modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideIn 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
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
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
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

.category-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.required {
  color: #ef4444;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  margin-top: 32px;
}

.save-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
  min-width: 100px;
}

.save-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
  transform: translateY(-1px);
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  color: #f59e0b;
}

.confirm-modal h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.confirm-modal p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.confirm-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.confirm-actions .cancel-btn, .confirm-actions .delete-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.confirm-actions .cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.confirm-actions .cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.confirm-actions .delete-btn {
  background: #dc2626;
  color: white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.confirm-actions .delete-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.confirm-actions .delete-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

/* Code Input Group */
.code-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.code-input-group .form-input {
  flex: 1;
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.regenerate-btn {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  font-size: 1rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.regenerate-btn:hover {
  background: #e2e8f0;
  color: #475569;
  border-color: #cbd5e1;
  transform: scale(1.05);
}

.form-help {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 4px;
  font-style: italic;
}

/* Form Textarea */
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-management-container {
    padding: 16px;
  }
  
  .header {
    padding: 20px 16px;
    margin-bottom: 24px;
  }
  
  .header h2 {
    font-size: 1.875rem;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }
  
  .search-box {
    max-width: none;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .category-table {
    min-width: 800px;
  }
  
  .category-table th,
  .category-table td {
    padding: 12px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .action-buttons button {
    min-width: auto;
    justify-content: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 20px 16px 16px 16px;
  }
  
  .category-form {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  .confirm-modal {
    width: 95%;
    padding: 24px 16px;
  }
  
  .confirm-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .confirm-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header h2 {
    font-size: 1.5rem;
  }
  
  .back-btn {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
  
  .back-icon {
    width: 16px;
    height: 16px;
  }
  
  .category-table th,
  .category-table td {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  
  .category-name {
    font-size: 1rem;
  }
  
  .no-data {
    padding: 40px 16px;
  }
  
  .no-data-icon {
    font-size: 3rem;
  }
}
</style>