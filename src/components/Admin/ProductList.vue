<template>
  <div class="product-management-container">
    <AdminHeader /> 
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
      <h2>Quản lý sản phẩm</h2>
    </div>

    <!-- Search and Add Product -->
    <div class="toolbar">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm sản phẩm..." 
          class="search-input"
          @input="resetPagination"
        />
        <button @click="clearSearch" class="clear-btn" v-if="searchQuery">✕</button>
      </div>
      <button @click="openAddModal" class="add-btn">+ Thêm sản phẩm</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="retry-btn">Thử lại</button>
    </div>

    <!-- Products Table -->
    <div class="table-container" v-if="!loading && !error">
      <!-- Pagination Info -->
      <div class="pagination-info" v-if="filteredProducts.length > 0">
        <span>Hiển thị {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredProducts.length) }} trong tổng số {{ filteredProducts.length }} sản phẩm</span>
        <div class="page-size-selector">
          <label>Số sản phẩm/trang:</label>
          <select v-model="pageSize" @change="resetPagination" class="page-size-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <table class="product-table">
        <thead>
          <tr>
            <th>Mã SP</th>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá bán</th>
            <th>Loại sản phẩm</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in paginatedProducts" :key="product.maSP">
            <td>{{ product.maSP }}</td>
            <td class="product-image-cell">
              <div class="image-container">
                <div v-if="loadingImages[product.maSP]" class="image-loading">
                  <div class="image-spinner"></div>
                </div>
                <img 
                  v-else
                  :src="getProductMainImage(product.maSP)" 
                  :alt="product.tenSP"
                  class="product-image"
                  @error="handleImageError($event, product.maSP)"
                  @load="onImageLoad(product.maSP)"
                />
                <div class="image-overlay" @click="showImageGallery(product.maSP)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  <span v-if="productImages[product.maSP] && productImages[product.maSP].length > 1" 
                        class="image-count">
                    +{{ productImages[product.maSP].length - 1 }}
                  </span>
                </div>
              </div>
            </td>
            <td class="product-name">{{ product.tenSP }}</td>
            <td class="price">
              <div class="price-info">
                <span class="current-price">{{ formatPrice(product.giaHienTai || product.giaBan) }}</span>
                <span v-if="product.giaBan && product.giaBan > 0 && product.giaBan !== (product.giaHienTai || product.giaBan)" class="old-price">
                  {{ formatPrice(product.giaBan) }}
                </span>
              </div>
            </td>
            <td>{{ product.loaiSanPham && product.loaiSanPham.tenLoai ? product.loaiSanPham.tenLoai : 'N/A' }}</td>
            <td>
              <span :class="['status-badge', product.trangThai === 1 ? 'active' : 'inactive']">
                {{ product.trangThai === 1 ? 'Đang kinh doanh' : 'Ngừng kinh doanh' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="openEditModal(product)" class="edit-btn" title="Chỉnh sửa sản phẩm">
                  <span class="btn-icon">✏️</span>
                  <span class="btn-text">Sửa</span>
                </button>
                <button @click="manageImages(product)" class="image-btn" title="Quản lý hình ảnh">
                  <span class="btn-icon">🖼️</span>
                  <span class="btn-text">Hình ảnh</span>
                </button>
                <button @click="toggleStatus(product)" class="status-btn" :title="product.trangThai === 1 ? 'Ngừng kinh doanh' : 'Kích hoạt lại'">
                  <span class="btn-icon">{{ product.trangThai === 1 ? '⏸️' : '▶️' }}</span>
                  <span class="btn-text">{{ product.trangThai === 1 ? 'Ngừng KD' : 'Kích hoạt' }}</span>
                </button>
                <button @click="deleteProduct(product.maSP)" class="delete-btn" title="Xóa sản phẩm">
                  <span class="btn-icon">🗑️</span>
                  <span class="btn-text">Xóa</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination Controls -->
      <div class="pagination-controls" v-if="totalPages > 1">
        <button 
          @click="goToPage(1)" 
          :disabled="currentPage === 1"
          class="page-btn first-page-btn"
          title="Trang đầu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m11 17-5-5 5-5"/>
            <path d="m18 17-5-5 5-5"/>
          </svg>
        </button>
        
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn prev-btn"
          title="Trang trước"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['page-number-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn next-btn"
          title="Trang sau"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
        
        <button 
          @click="goToPage(totalPages)" 
          :disabled="currentPage === totalPages"
          class="page-btn last-page-btn"
          title="Trang cuối"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m13 17 5-5-5-5"/>
            <path d="m6 17 5-5-5-5"/>
          </svg>
        </button>

        <div class="page-jump">
          <span>Đến trang:</span>
          <input 
            v-model.number="jumpToPage" 
            @keyup.enter="handlePageJump"
            type="number" 
            :min="1" 
            :max="totalPages"
            class="page-jump-input"
          />
          <button @click="handlePageJump" class="jump-btn">Đi</button>
        </div>
      </div>
      
      <div v-if="filteredProducts.length === 0" class="no-data">
        <div class="no-data-icon">📦</div>
        <p>{{ searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào' }}</p>
        <button v-if="!searchQuery" @click="openAddModal" class="add-first-btn">Thêm sản phẩm đầu tiên</button>
      </div>
    </div>

    <!-- Image Gallery Modal -->
    <div v-if="showImageGalleryModal" class="modal-overlay" @click="closeImageGallery">
      <div class="gallery-modal" @click.stop>
        <div class="gallery-header">
          <h3>Hình ảnh sản phẩm: {{ getCurrentProductName() }}</h3>
          <button @click="closeImageGallery" class="close-btn">✕</button>
        </div>
        <div class="gallery-content">
          <div v-if="currentProductImages.length === 0" class="no-images">
            <p>Chưa có hình ảnh nào cho sản phẩm này</p>
          </div>
          <div v-else class="image-grid">
            <div v-for="image in currentProductImages" :key="image.maHinh" 
                 :class="['image-item', { 'main-image': image.laChinh }]">
              <img :src="getImageUrl(image.url)" :alt="image.moTa || 'Hình ảnh sản phẩm'" />
              <div class="image-info">
                <span v-if="image.laChinh" class="main-badge">Ảnh chính</span>
                <span class="order-badge">Thứ tự: {{ image.thuTuHienThi || 0 }}</span>
                <p v-if="image.moTa" class="image-desc">{{ image.moTa }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Management Modal -->
    <div v-if="showImageModal" class="modal-overlay" @click="closeImageModal">
      <div class="modal-content image-management-modal" @click.stop>
        <div class="modal-header">
          <h3>Quản lý hình ảnh - {{ currentImageProduct && currentImageProduct.tenSP ? currentImageProduct.tenSP : 'N/A' }}</h3>
          <button @click="closeImageModal" class="close-btn">✕</button>
        </div>
        
        <div class="image-management-content">
          <!-- Upload New Image -->
          <div class="upload-section">
            <h4>Thêm hình ảnh mới</h4>
            <form class="upload-form" enctype="multipart/form-data" @submit.prevent="uploadAndSaveImage">
              <div class="form-group">
                <label>Chọn file hình ảnh:</label>
                <input 
                  type="file" 
                  ref="imageFileRef"
                  accept="image/*" 
                  class="form-input" 
                  required
                />
              </div>
              <div class="form-group">
                <label>Mô tả:</label>
                <input v-model="newImage.moTa" type="text" placeholder="Mô tả hình ảnh" class="form-input" />
              </div>
              <div class="form-group">
                <label>Thứ tự hiển thị:</label>
                <input v-model.number="newImage.thuTuHienThi" type="number" min="0" class="form-input" />
              </div>
              <div class="form-group">
                <label>
                  <input v-model="newImage.laChinh" type="checkbox" />
                  Đặt làm ảnh chính
                </label>
              </div>
              <button type="submit" :disabled="addingImage" class="add-image-btn">
                {{ addingImage ? 'Đang thêm...' : 'Thêm hình ảnh' }}
              </button>
            </form>
          </div>

          <!-- Existing Images -->
          <div class="existing-images-section">
            <h4>Hình ảnh hiện có ({{ currentProductImages.length }})</h4>
            <div v-if="currentProductImages.length === 0" class="no-images">
              <p>Chưa có hình ảnh nào</p>
            </div>
            <div v-else class="images-list">
              <div v-for="image in currentProductImages" :key="image.maHinh" class="image-item-manage">
                <img :src="getImageUrl(image.url)" :alt="image.moTa || 'Hình ảnh sản phẩm'" class="thumbnail" />
                <div class="image-details">
                  <p><strong>ID:</strong> {{ image.maHinh }}</p>
                  <p><strong>Thứ tự:</strong> 
                    <input 
                      v-model.number="image.thuTuHienThi" 
                      type="number" 
                      min="0" 
                      class="order-input"
                      @change="updateImageOrder(image.maHinh, image.thuTuHienThi)"
                    />
                  </p>
                  <p v-if="image.moTa"><strong>Mô tả:</strong> {{ image.moTa }}</p>
                  <span v-if="image.laChinh" class="main-badge">Ảnh chính</span>
                </div>
                <div class="image-actions">
                  <button v-if="!image.laChinh" @click="setMainImage(image)" class="set-main-btn" title="Đặt làm ảnh chính">
                    ⭐
                  </button>
                  <button @click="deleteImage(image.maHinh)" class="delete-image-btn" title="Xóa hình ảnh">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h3>
          <button @click="closeModal" class="close-btn" title="Đóng">✕</button>
        </div>
        
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-group" v-if="!isEditing">
            <label for="product-id">Mã sản phẩm <span class="required">*</span></label>
            <input 
              id="product-id"
              v-model="currentProduct.maSP" 
              type="text" 
              required 
              class="form-input"
              placeholder="Nhập mã sản phẩm"
            />
          </div>

          <div class="form-group">
            <label for="product-name">Tên sản phẩm <span class="required">*</span></label>
            <input 
              id="product-name"
              v-model="currentProduct.tenSP" 
              type="text" 
              required 
              class="form-input"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div class="form-group">
            <label for="product-category">Loại sản phẩm <span class="required">*</span></label>
            <select 
              id="product-category"
              v-model="currentProduct.maLoaiSP" 
              class="form-select"
              required
            >
              <option value="">Chọn loại sản phẩm</option>
              <option v-for="category in categories" :key="category.maLoaiSP" :value="category.maLoaiSP">
                {{ category.tenLoai }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="product-price">Giá bán <span class="required">*</span></label>
            <input 
              id="product-price"
              v-model.number="currentProduct.giaBan" 
              type="number" 
              required 
              min="1000"
              step="1000"
              class="form-input"
              placeholder="Nhập giá bán (tối thiểu 1,000 VNĐ)"
            />
            <small class="form-help">Giá sẽ được lưu vào bảng GiaSanPham. Giá tối thiểu: 1,000 VNĐ</small>
          </div>

          <div class="form-group">
            <label for="product-unit">Đơn vị tính</label>
            <input 
              id="product-unit"
              v-model="currentProduct.donViTinh" 
              type="text" 
              class="form-input"
              placeholder="Nhập đơn vị tính (VD: Cái, Kg, Lít...)"
            />
          </div>

          <div class="form-group">
            <label for="product-weight">Trọng lượng</label>
            <input 
              id="product-weight"
              v-model.number="currentProduct.trongLuong" 
              type="number" 
              step="0.001"
              min="0"
              class="form-input"
              placeholder="Nhập trọng lượng (kg)"
            />
          </div>

          <div class="form-group">
            <label for="product-size">Kích thước</label>
            <input 
              id="product-size"
              v-model="currentProduct.kichThuoc" 
              type="text" 
              class="form-input"
              placeholder="Nhập kích thước (VD: 10x20x30 cm)"
            />
          </div>

          <div class="form-group">
            <label for="product-expiry">Hạn sử dụng (ngày)</label>
            <input 
              id="product-expiry"
              v-model.number="currentProduct.hanSuDung" 
              type="number" 
              min="0"
              class="form-input"
              placeholder="Nhập số ngày hạn sử dụng"
            />
          </div>

          <div class="form-group">
            <label for="product-description">Mô tả</label>
            <textarea 
              id="product-description"
              v-model="currentProduct.moTa" 
              class="form-textarea"
              rows="3"
              placeholder="Nhập mô tả sản phẩm"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="product-status">Trạng thái</label>
            <select id="product-status" v-model="currentProduct.trangThai" class="form-select">
              <option :value="1">Đang kinh doanh</option>
              <option :value="0">Ngừng kinh doanh</option>
            </select>
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
        <p>Bạn có chắc chắn muốn xóa sản phẩm này không?<br>Thao tác này không thể hoàn tác.</p>
        <div class="confirm-actions">
          <button @click="closeConfirm" class="cancel-btn">Hủy</button>
          <button @click="confirmDelete" class="delete-btn" :disabled="deleting">
            {{ deleting ? 'Đang xóa...' : 'Xóa' }}
          </button>
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
import axios from 'axios'

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api'

// Reactive data
const products = ref([])
const categories = ref([])
const productImages = ref({}) // Cache hình ảnh theo mã sản phẩm
const loadingImages = ref({}) // Trạng thái loading cho từng sản phẩm
const searchQuery = ref('')
const showModal = ref(false)
const showConfirm = ref(false)
const showImageModal = ref(false)
const showImageGalleryModal = ref(false)
const isEditing = ref(false)
const deleteProductId = ref(null)
const currentImageProduct = ref(null)
const currentGalleryProductId = ref(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const addingImage = ref(false)
const error = ref('')
const selectedProductId = ref(null)

// Pagination data
const currentPage = ref(1)
const pageSize = ref(10)
const jumpToPage = ref(1)

const currentProduct = reactive({
  maSP: '',
  tenSP: '',
  moTa: '',
  giaBan: 0,
  donViTinh: 'Cái',
  trongLuong: null,
  kichThuoc: '',
  hanSuDung: null,
  trangThai: 1,
  maLoaiSP: '' // Thay đổi từ loaiSanPham thành maLoaiSP để phù hợp với API
})

const newImage = reactive({
  url: '',
  moTa: '',
  thuTuHienThi: 0,
  laChinh: false
})

// Computed properties
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter(product =>
    product.tenSP.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    product.maSP.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const endIndex = computed(() => {
  return startIndex.value + pageSize.value
})

const paginatedProducts = computed(() => {
  return filteredProducts.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2 // Số trang hiển thị ở mỗi bên của trang hiện tại
  
  let pages = []
  
  if (total <= 7) {
    // Nếu tổng số trang <= 7, hiển thị tất cả
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Hiển thị trang đầu
    pages.push(1)
    
    if (current <= 4) {
      // Nếu trang hiện tại gần đầu
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      if (total > 6) pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // Nếu trang hiện tại gần cuối
      if (total > 6) pages.push('...')
      for (let i = total - 4; i <= total - 1; i++) {
        if (i > 1) pages.push(i)
      }
      pages.push(total)
    } else {
      // Trang hiện tại ở giữa
      pages.push('...')
      for (let i = current - delta; i <= current + delta; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const currentProductImages = computed(() => {
  if (!currentImageProduct.value && !currentGalleryProductId.value) return []
  const productId = currentImageProduct.value?.maSP || currentGalleryProductId.value
  return productImages.value[productId] || []
})

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    jumpToPage.value = page
  }
}

const resetPagination = () => {
  currentPage.value = 1
  jumpToPage.value = 1
}

const handlePageJump = () => {
  const page = parseInt(jumpToPage.value)
  if (page >= 1 && page <= totalPages.value) {
    goToPage(page)
  } else {
    jumpToPage.value = currentPage.value
  }
}

// API Methods for Categories
const fetchCategories = async () => {
  try {
    console.log('Fetching categories...')
    const response = await fetch(`${API_BASE_URL}/loaisanpham`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    categories.value = data
    console.log('Categories fetched:', data)
  } catch (err) {
    console.error('Error fetching categories:', err)
    error.value = 'Không thể tải danh sách loại sản phẩm. Vui lòng thử lại.'
  }
}

// API Methods for Images
// Sử dụng các endpoint mới từ ImageUploadController:
// - GET /api/upload/product-images/{maSP} - Lấy danh sách ảnh của sản phẩm
// - POST /api/upload/product-image - Upload ảnh mới
// - PUT /api/upload/product-image/{maHinh} - Cập nhật thông tin ảnh
// - DELETE /api/upload/product-image/{maHinh} - Xóa ảnh
// - GET /api/upload/serve-image/{fileName} - Serve ảnh theo tên file
const fetchProductImages = async (productId) => {
  try {
    loadingImages.value[productId] = true
    // Sử dụng endpoint mới để lấy ảnh theo sản phẩm
    const response = await fetch(`${API_BASE_URL}/upload/product-images/${productId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const apiResponse = await response.json()
    
    if (apiResponse.success && apiResponse.result) {
      // Cập nhật cache
      productImages.value[productId] = apiResponse.result
      return apiResponse.result
    } else {
      console.warn('API response indicates failure:', apiResponse.message)
      return []
    }
  } catch (err) {
    console.error('Error fetching product images:', err)
    return []
  } finally {
    loadingImages.value[productId] = false
  }
}

const fetchAllProductImages = async () => {
  try {
    console.log('Fetching all product images...')
    // Sử dụng endpoint mới để lấy ảnh theo từng sản phẩm
    const imagePromises = products.value.map(product => 
      fetchProductImages(product.maSP)
    )
    
    await Promise.all(imagePromises)
    console.log('All product images fetched successfully')
  } catch (err) {
    console.error('Error fetching all product images:', err)
  }
}

// API Methods for Products
const fetchProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    console.log('Fetching products...')
    const response = await fetch(`${API_BASE_URL}/sanpham`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    products.value = data
    console.log('Products fetched:', data)
    
    // Fetch images cho tất cả sản phẩm
    await fetchAllProductImages()
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

const saveProduct = async () => {
  saving.value = true
  try {
    const url = isEditing.value 
      ? `${API_BASE_URL}/sanpham/${currentProduct.maSP}`
      : `${API_BASE_URL}/sanpham`
    
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const productData = {
      maSP: currentProduct.maSP,
      tenSP: currentProduct.tenSP,
      moTa: currentProduct.moTa,
      giaBan: currentProduct.giaBan,
      donViTinh: currentProduct.donViTinh,
      trongLuong: currentProduct.trongLuong,
      kichThuoc: currentProduct.kichThuoc,
      hanSuDung: currentProduct.hanSuDung,
      trangThai: currentProduct.trangThai,
      loaiSanPham: { maLoaiSP: currentProduct.maLoaiSP }
    }
    
    console.log('Saving product:', productData)
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
    }
    
    // Sau khi lưu sản phẩm thành công, lưu giá vào bảng GiaSanPham
    if (currentProduct.giaBan && currentProduct.giaBan > 0) {
      try {
        const giaData = {
          sanPham: { maSP: currentProduct.maSP },
          gia: currentProduct.giaBan,
          ngayApDung: new Date().toISOString().split('T')[0], // Ngày hôm nay
          ngayKetThuc: null, // Không có ngày kết thúc
          moTa: 'Giá mặc định'
        }
        
        console.log('Saving price:', giaData)
        
        const giaResponse = await fetch(`${API_BASE_URL}/giasanpham`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(giaData)
        })
        
        if (!giaResponse.ok) {
          console.warn('Warning: Could not save price to GiaSanPham table')
        } else {
          console.log('Price saved successfully')
        }
      } catch (priceErr) {
        console.warn('Warning: Error saving price:', priceErr)
      }
    } else {
      console.log('No valid price to save to GiaSanPham table')
    }
    
    await fetchProducts() // Refresh danh sách
    closeModal()
    alert(isEditing.value ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!')
  } catch (err) {
    console.error('Error saving product:', err)
    alert('Có lỗi xảy ra khi lưu sản phẩm: ' + err.message)
  } finally {
    saving.value = false
  }
}

const deleteProductConfirmed = async () => {
  if (!deleteProductId.value) return
  
  deleting.value = true
  try {
    console.log('Deleting product:', deleteProductId.value)
    const response = await fetch(`${API_BASE_URL}/sanpham/${deleteProductId.value}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
    }
    
    await fetchProducts() // Refresh danh sách
    closeConfirm()
    alert('Xóa sản phẩm thành công!')
  } catch (err) {
    console.error('Error deleting product:', err)
    alert('Có lỗi xảy ra khi xóa sản phẩm: ' + err.message)
  } finally {
    deleting.value = false
  }
}

const toggleStatus = async (product) => {
  try {
    const newStatus = product.trangThai === 1 ? 0 : 1
    const productData = {
      ...product,
      trangThai: newStatus,
      loaiSanPham: { maLoaiSP: product.loaiSanPham?.maLoaiSP }
    }
    
    console.log('Toggling product status:', productData)
    
    const response = await fetch(`${API_BASE_URL}/sanpham/${product.maSP}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
    }
    
    // Cập nhật trạng thái local
    product.trangThai = newStatus
    alert(`${newStatus === 1 ? 'Kích hoạt' : 'Ngừng kinh doanh'} sản phẩm thành công!`)
  } catch (err) {
    console.error('Error toggling product status:', err)
    alert('Có lỗi xảy ra khi cập nhật trạng thái: ' + err.message)
  }
}

// Image Management Methods
const uploadAndSaveImage = async () => {
  if (!currentImageProduct.value) return
  
  const fileInput = document.querySelector('input[type="file"]')
  if (!fileInput || !fileInput.files[0]) {
    alert('Vui lòng chọn file hình ảnh')
    return
  }
  
  addingImage.value = true
  try {
    // Sử dụng endpoint upload mới
    const formData = new FormData()
    formData.append('file', fileInput.files[0])
    formData.append('maSP', currentImageProduct.value.maSP)
    formData.append('moTa', newImage.moTa || '')
    formData.append('laChinh', newImage.laChinh)
    formData.append('thuTuHienThi', newImage.thuTuHienThi || 0)
    
    console.log('Uploading image...')
    const uploadResponse = await fetch(`${API_BASE_URL}/upload/product-image`, {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text()
      throw new Error(`Upload failed: ${errorData}`)
    }
    
    const uploadResult = await uploadResponse.json()
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.message || 'Upload failed')
    }
    
    // Reset form và refresh images
    Object.assign(newImage, {
      url: '',
      moTa: '',
      thuTuHienThi: 0,
      laChinh: false
    })
    fileInput.value = ''
    
    // Refresh danh sách ảnh
    await fetchProductImages(currentImageProduct.value.maSP)
    
    // Cập nhật cache tổng thể
    if (productImages.value[currentImageProduct.value.maSP]) {
      productImages.value[currentImageProduct.value.maSP] = await fetchProductImages(currentImageProduct.value.maSP)
    }
    
    alert('Thêm hình ảnh thành công!')
  } catch (err) {
    console.error('Error adding image:', err)
    alert('Có lỗi xảy ra khi thêm hình ảnh: ' + err.message)
  } finally {
    addingImage.value = false
  }
}

const setMainImage = async (image) => {
  try {
    // Trước tiên, đặt tất cả ảnh khác thành không phải ảnh chính
    const otherImages = currentProductImages.value.filter(img => img.maHinh !== image.maHinh)
    
    for (const otherImage of otherImages) {
      const updateData = {
        laChinh: false,
        moTa: otherImage.moTa,
        thuTuHienThi: otherImage.thuTuHienThi
      }
      
      await fetch(`${API_BASE_URL}/upload/product-image/${otherImage.maHinh}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
    }
    
    // Sau đó đặt ảnh được chọn thành ảnh chính
    const updateData = {
      laChinh: true,
      moTa: image.moTa,
      thuTuHienThi: image.thuTuHienThi
    }
    
    console.log('Setting main image:', updateData)
    
    const response = await fetch(`${API_BASE_URL}/upload/product-image/${image.maHinh}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
    }
    
    await fetchProductImages(currentImageProduct.value.maSP)
    alert('Đặt ảnh chính thành công!')
  } catch (err) {
    console.error('Error setting main image:', err)
    alert('Có lỗi xảy ra khi đặt ảnh chính: ' + err.message)
  }
}

const deleteImage = async (imageId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) return
  
  try {
    console.log('Deleting image:', imageId)
    // Sử dụng endpoint delete mới
    const response = await fetch(`${API_BASE_URL}/upload/product-image/${imageId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`)
    }
    
    // Refresh danh sách ảnh
    await fetchProductImages(currentImageProduct.value.maSP)
    
    // Cập nhật cache tổng thể
    if (productImages.value[currentImageProduct.value.maSP]) {
      productImages.value[currentImageProduct.value.maSP] = await fetchProductImages(currentImageProduct.value.maSP)
    }
    
    alert('Xóa hình ảnh thành công!')
  } catch (err) {
    console.error('Error deleting image:', err)
    alert('Có lỗi xảy ra khi xóa hình ảnh: ' + err.message)
  }
}

const updateImageOrder = async (imageId, newOrder) => {
  try {
    const image = currentProductImages.value.find(img => img.maHinh === imageId)
    if (!image) return
    
    const updateData = {
      laChinh: image.laChinh,
      moTa: image.moTa,
      thuTuHienThi: newOrder
    }
    
    const response = await fetch(`${API_BASE_URL}/upload/product-image/${imageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Refresh danh sách ảnh
    await fetchProductImages(currentImageProduct.value.maSP)
  } catch (err) {
    console.error('Error updating image order:', err)
    alert('Có lỗi xảy ra khi cập nhật thứ tự ảnh: ' + err.message)
  }
}

// UI Methods
const openAddModal = () => {
  isEditing.value = false
  Object.assign(currentProduct, {
    maSP: '',
    tenSP: '',
    moTa: '',
    giaBan: 0,
    donViTinh: 'Cái',
    trongLuong: null,
    kichThuoc: '',
    hanSuDung: null,
    trangThai: 1,
    maLoaiSP: ''
  })
  showModal.value = true
}

const openEditModal = (product) => {
  isEditing.value = true
  Object.assign(currentProduct, {
    maSP: product.maSP,
    tenSP: product.tenSP,
    moTa: product.moTa || '',
    giaBan: product.giaHienTai || product.giaBan || 0,
    donViTinh: product.donViTinh || 'Cái',
    trongLuong: product.trongLuong,
    kichThuoc: product.kichThuoc || '',
    hanSuDung: product.hanSuDung,
    trangThai: product.trangThai,
    maLoaiSP: product.loaiSanPham?.maLoaiSP || ''
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const deleteProduct = (productId) => {
  deleteProductId.value = productId
  showConfirm.value = true
}

const closeConfirm = () => {
  showConfirm.value = false
  deleteProductId.value = null
}

const confirmDelete = () => {
  deleteProductConfirmed()
}

const manageImages = async (product) => {
  currentImageProduct.value = product
  showImageModal.value = true
  await fetchProductImages(product.maSP)
}

const closeImageModal = () => {
  showImageModal.value = false
  currentImageProduct.value = null
}

const showImageGallery = async (productId) => {
  currentGalleryProductId.value = productId
  showImageGalleryModal.value = true
  await fetchProductImages(productId)
}

const closeImageGallery = () => {
  showImageGalleryModal.value = false
  currentGalleryProductId.value = null
}

const clearSearch = () => {
  searchQuery.value = ''
  resetPagination()
}

// Utility Methods
const formatPrice = (price) => {
  if (!price || price === 0) {
    return 'Chưa có giá'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const getImageUrl = (url) => {
  if (!url) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzNUg3MFY2NUgzMFYzNVoiIGZpbGw9IiNEM0Q3RDEiLz4KPHBhdGggZD0iTTM1IDQwSDY1VjYwSDM1VjQwWiIgZmlsbD0iI0M3Q0FBNyIvPgo8L3N2Zz4K'
  if (url.startsWith('http')) return url
  
  // Nếu URL bắt đầu bằng /images/products/, sử dụng endpoint serve ảnh mới
  if (url.startsWith('/images/products/')) {
    const fileName = url.split('/').pop()
    return `${API_BASE_URL}/upload/serve-image/${fileName}`
  }
  
  // Nếu URL chứa tên file trực tiếp, sử dụng endpoint serve ảnh
  if (url.includes('.') && !url.includes('/')) {
    return `${API_BASE_URL}/upload/serve-image/${url}`
  }
  
  // Fallback: sử dụng endpoint serve ảnh theo ID nếu có
  return `${API_BASE_URL}/upload/serve-image/${url}`
}

const getProductMainImage = (productId) => {
  const images = productImages.value[productId]
  if (!images || images.length === 0) {
    // Trả về placeholder image nếu không có ảnh
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzNUg3MFY2NUgzMFYzNVoiIGZpbGw9IiNEM0Q3RDEiLz4KPHBhdGggZD0iTTM1IDQwSDY1VjYwSDM1VjQwWiIgZmlsbD0iI0M3Q0FBNyIvPgo8L3N2Zz4K'
  }
  
  // Tìm ảnh chính hoặc ảnh đầu tiên
  const mainImage = images.find(img => img.laChinh)
  const imageToUse = mainImage || images[0]
  
  if (!imageToUse || !imageToUse.url) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzNUg3MFY2NUgzMFYzNVoiIGZpbGw9IiNEM0Q3RDEiLz4KPHBhdGggZD0iTTM1IDQwSDY1VjYwSDM1VjQwWiIgZmlsbD0iI0M3Q0FBNyIvPgo8L3N2Zz4K'
  }
  
  return getImageUrl(imageToUse.url)
}

const handleImageError = (event, productId) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzNUg3MFY2NUgzMFYzNVoiIGZpbGw9IiNEM0Q3RDEiLz4KPHBhdGggZD0iTTM1IDQwSDY1VjYwSDM1VjQwWiIgZmlsbD0iI0M3Q0FBNyIvPgo8L3N2Zz4K'
  console.warn(`Failed to load image for product ${productId}`)
}

const onImageLoad = (productId) => {
  loadingImages.value[productId] = false
}

const getCurrentProductName = () => {
  if (currentGalleryProductId.value) {
    const product = products.value.find(p => p.maSP === currentGalleryProductId.value)
    return product?.tenSP || ''
  }
  return ''
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchProducts()
  ])
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.product-management-container {
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

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  background: #f8fafc;
  color: #475569;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.025em;
  border-bottom: 2px solid #e2e8f0;
}

.product-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-weight: 500;
  color: #334155;
}

.product-table tbody tr {
  transition: background-color 0.2s ease;
}

.product-table tbody tr:hover {
  background: #f8fafc;
}

.product-table tbody tr:last-child td {
  border-bottom: none;
}

/* Product Image Styles */
.product-image-cell {
  width: 80px;
  padding: 12px 20px !important;
}

.image-container {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.image-container:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.image-overlay svg {
  width: 24px;
  height: 24px;
  color: white;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
}

.price {
  font-weight: 700;
  color: #059669;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.current-price {
  font-weight: 700;
  color: #059669;
}

.old-price {
  font-size: 0.85rem;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
}

.stock {
  font-weight: 600;
  color: #0f172a;
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

.confirm-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.cancel-btn, .delete-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
  border-width: 1px; /* Sửa lại border dày 1px khi hover */
  transform: translateY(-1px);
}

.delete-btn {
  background: #ff4757;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
}

.delete-btn:hover {
  background: #ff3838;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
  transform: translateY(-1px);
}

.delete-btn:active, .cancel-btn:active {
  transform: translateY(0);
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

.product-form {
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

.form-input, .form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-help {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
}


/* Image Upload Styles */
.image-upload-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Phần còn thiếu cần thêm: */
.image-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-overlay svg {
  width: 32px;
  height: 32px;
}

/* Hiển thị overlay khi hover */
.image-container:hover .image-preview-overlay {
  opacity: 1;
}

/* Style cho nội dung bên trong overlay (nếu cần) */
.image-preview-overlay .preview-content {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90%;
}

/* Style cho nút đóng (nếu có) */
.image-preview-overlay .close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-overlay .close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}
/* Hoàn thiện phần CSS còn thiếu */

.image-upload-controls {
  flex: 1;
}

.image-help {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 8px;
  font-style: italic;
  line-height: 1.4;
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
  border-width: 1px; /* Sửa lại border dày 1px khi hover */
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

/* Responsive Design */
@media (max-width: 1200px) {
  .product-management-container {
    padding: 16px;
  }
  
  .header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .product-table {
    font-size: 0.9rem;
  }
  
  .product-table th,
  .product-table td {
    padding: 12px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .action-buttons button {
    min-width: auto;
    width: 100%;
    justify-content: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .image-upload-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  .header h2 {
    font-size: 1.75rem;
  }
  
  .back-btn {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .product-management-container {
    padding: 12px;
  }
  
  .header {
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .toolbar {
    padding: 16px;
  }
  
  .product-table th,
  .product-table td {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .product-image-cell {
    width: 60px;
    padding: 8px 12px !important;
  }
  
  .image-container {
    width: 50px;
    height: 50px;
  }
  
  .status-badge {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
  
  .btn-text {
    display: none;
  }
  
  .action-buttons button {
    padding: 8px;
    min-width: 40px;
  }
  
  .confirm-modal {
    padding: 20px;
    margin: 20px;
  }
  
  .confirm-icon {
    font-size: 2.5rem;
  }
  
  .confirm-modal h3 {
    font-size: 1.25rem;
  }
}  
  .btn-text {
    display: none;
  }
  
  .action-buttons button {
    padding: 8px;
    min-width: 40px;
  }
  
  .confirm-modal {
    padding: 20px;
    margin: 20px;
  }
  
  .confirm-icon {
    font-size: 2.5rem;
  }
  
  .confirm-modal h3 {
    font-size: 1.25rem;
  }

  .confirm-icon {
    font-size: 2.5rem;
  }
  
  .confirm-modal h3 {
    font-size: 1.25rem;
  }
  
  /* Pagination Info */
.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
  border-radius: 12px;
  border: 1px solid #e1e8f0;
  font-size: 14px;
  color: #5a6c7d;
}

.pagination-info span {
  font-weight: 500;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-size-selector label {
  font-weight: 500;
  color: #374151;
}

.page-size-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.page-size-select:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Page Navigation Buttons */
.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.page-btn svg {
  width: 18px;
  height: 18px;
}

.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
}

.page-btn:disabled {
  border-color: #f3f4f6;
  background: #f9fafb;
  color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

/* First/Last Page Buttons */
.first-page-btn, .last-page-btn {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
}

.first-page-btn:hover:not(:disabled), 
.last-page-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  border-color: #475569;
  color: white;
}

/* Page Numbers Container */
.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 10px;
}

/* Page Number Buttons */
.page-number-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.page-number-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.page-number-btn:hover::before {
  left: 100%;
}

.page-number-btn:hover:not(.active) {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.2);
}

.page-number-btn.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.page-number-btn.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

/* Page Jump Section */
.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}

.page-jump span {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
}

.page-jump-input {
  width: 60px;
  padding: 8px 10px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  text-align: center;
  color: #374151;
  transition: all 0.3s ease;
}

.page-jump-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.jump-btn {
  padding: 8px 16px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.jump-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.4s;
}

.jump-btn:hover::before {
  left: 100%;
}

.jump-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
}

.jump-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(37, 99, 235, 0.2);
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagination-controls {
  animation: fadeIn 0.5s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination-info {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    gap: 10px;
    padding: 15px;
  }
  
  .page-jump {
    margin-left: 0;
    margin-top: 10px;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
  
  .page-numbers {
    margin: 0 5px;
  }
  
  .page-btn, .page-number-btn {
    width: 36px;
    height: 36px;
  }
  
  .page-btn svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .pagination-info {
    font-size: 13px;
  }
  
  .page-size-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .pagination-controls {
    gap: 8px;
  }
  
  .page-btn, .page-number-btn {
    width: 32px;
    height: 32px;
  }
  
  .page-jump {
    padding: 10px 12px;
  }
  
  .page-jump span {
    font-size: 13px;
  }
  
  .page-jump-input {
    width: 50px;
    padding: 6px 8px;
  }
  
  .jump-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* Image Management Modal Styles */
.image-management-modal {
  max-width: 800px;
  max-height: 90vh;
}

.image-management-content {
  padding: 24px;
}

.upload-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.upload-section h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.add-image-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.add-image-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.add-image-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.existing-images-section h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.images-list {
  display: grid;
  gap: 16px;
}

.image-item-manage {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  align-items: center;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.image-details {
  flex: 1;
}

.image-details p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #475569;
}

.image-actions {
  display: flex;
  gap: 8px;
}

.set-main-btn, .delete-image-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.set-main-btn {
  background: #fbbf24;
  color: #92400e;
}

.set-main-btn:hover {
  background: #f59e0b;
  transform: translateY(-1px);
}

.delete-image-btn {
  background: #f87171;
  color: #991b1b;
}

.delete-image-btn:hover {
  background: #ef4444;
  transform: translateY(-1px);
}

.main-badge {
  display: inline-block;
  background: #fbbf24;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 8px;
}

.no-images {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.no-images p {
  font-size: 1rem;
  margin: 0;
}

/* Gallery Modal Styles */
.gallery-modal {
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.gallery-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
}

.gallery-content {
  padding: 24px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-info {
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.image-info .main-badge {
  background: #fbbf24;
  color: #92400e;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: inline-block;
}

.image-info .order-badge {
  background: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: inline-block;
}

.image-info .image-desc {
  margin: 8px 0 0 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.image-item.main-image {
  border-color: #fbbf24;
  box-shadow: 0 0 0 2px #fbbf24;
}

/* Loading Spinner */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.image-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Error Message */
.error-message {
  text-align: center;
  padding: 40px 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  margin-bottom: 24px;
}

.error-message p {
  margin: 0 0 16px 0;
  font-size: 1rem;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* Image Button */
.image-btn {
  background: #f0f9ff;
  color: #0369a1;
  border-color: #bae6fd;
}

.image-btn:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
  transform: translateY(-1px);
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
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .image-item-manage {
    flex-direction: column;
    text-align: center;
  }
  
  .thumbnail {
    width: 120px;
    height: 120px;
  }
  
  .image-actions {
    justify-content: center;
    margin-top: 12px;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .gallery-modal {
    width: 95%;
    margin: 20px;
  }
}

.order-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
  background: white;
  transition: all 0.2s ease;
}

.order-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.order-input:hover {
  border-color: #cbd5e1;
}
</style>
