// API Service
const API_BASE_URL = 'http://localhost:8080/api'

// Debug: Log API base URL
console.log('🌐 [API] Base URL:', API_BASE_URL)

// API Endpoints
const API_ENDPOINTS = {
  AUTH: {
    // Login/Logout chính
    LOGIN: '/auth/log-in',                    // POST - Đăng nhập thường (email/password)
    LOGOUT: '/auth/log-out',                  // POST - Đăng xuất (hỗ trợ tất cả loại tài khoản)
    
    // Token Management
    STATUS: '/auth/status',                   // GET - Kiểm tra trạng thái đăng nhập
    VALIDATE_TOKEN: '/auth/validate-token',   // POST - Validate JWT token
  }
}

// Helper function to extract data from ApiResponse wrapper
const extractApiResponseData = (apiResponse) => {
  // Kiểm tra xem response có phải là ApiResponse wrapper không
  if (apiResponse && typeof apiResponse === 'object' && 'result' in apiResponse) {
    // Nếu là ApiResponse wrapper, trả về result field
    if (apiResponse.success && Array.isArray(apiResponse.result)) {
      return apiResponse.result
    } else {
      console.warn('API returned error or invalid result:', apiResponse)
      return []
    }
  } else if (Array.isArray(apiResponse)) {
    // Nếu response trực tiếp là array (fallback)
    return apiResponse
  } else {
    console.warn('Unexpected API response format:', apiResponse)
    return []
  }
}

// 1. Get all images
export const getAllImages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/hinhanh`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const apiResponse = await response.json()
    return extractApiResponseData(apiResponse)
  } catch (error) {
    console.error('Error fetching all images:', error)
    throw error
  }
}

// 2. Get image by ID
export const getImageById = async (imageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hinhanh/${imageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Image not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const image = await response.json()
    return image
  } catch (error) {
    console.error('Error fetching image by ID:', error)
    throw error
  }
}

// 3. Create new image
export const createImage = async (imageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hinhanh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...imageData,
        isDeleted: false // Ensure it's not marked as deleted
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const newImage = await response.json()
    return newImage
  } catch (error) {
    console.error('Error creating image:', error)
    throw error
  }
}

// 4. Update image
export const updateImage = async (imageId, imageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hinhanh/${imageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...imageData,
        isDeleted: false // Ensure it's not marked as deleted
      })
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Image not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const updatedImage = await response.json()
    return updatedImage
  } catch (error) {
    console.error('Error updating image:', error)
    throw error
  }
}

// 5. Delete image (soft delete)
export const deleteImage = async (imageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/hinhanh/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Image not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

// 6. Get images by product ID (filtered from all images)
export const getImagesByProductId = async (productId) => {
  try {
    const allImages = await getAllImages()
    
    // Filter images by product ID
    const productImages = allImages.filter(image => 
      image.sanPham && image.sanPham.maSP === productId
    )
    
    // Sort images: main image first, then by display order
    productImages.sort((a, b) => {
      if (a.laChinh && !b.laChinh) return -1
      if (!a.laChinh && b.laChinh) return 1
      return (a.thuTuHienThi || 0) - (b.thuTuHienThi || 0)
    })
    
    return productImages
  } catch (error) {
    console.error('Error fetching images by product ID:', error)
    throw error
  }
}

// 7. Get main image for a product
export const getMainImageByProductId = async (productId) => {
  try {
    const productImages = await getImagesByProductId(productId)
    
    // Find main image
    const mainImage = productImages.find(image => image.laChinh === true)
    
    // Return main image or first image if no main image is set
    return mainImage || productImages[0] || null
  } catch (error) {
    console.error('Error fetching main image:', error)
    throw error
  }
}

// 8. Set main image for a product
export const setMainImage = async (imageId) => {
  try {
    // First, get the image to know which product it belongs to
    const image = await getImageById(imageId)
    if (!image) {
      throw new Error('Image not found')
    }
    
    const productId = image.sanPham.maSP
    
    // Get all images for this product
    const productImages = await getImagesByProductId(productId)
    
    // Update all images: remove main flag from others, set for the selected one
    const updatePromises = productImages.map(img => {
      const isMain = img.maHinh === imageId
      return updateImage(img.maHinh, {
        ...img,
        laChinh: isMain
      })
    })
    
    await Promise.all(updatePromises)
    return true
  } catch (error) {
    console.error('Error setting main image:', error)
    throw error
  }
}

// ===== ORDER MANAGEMENT API FUNCTIONS =====

// Get all orders (HoaDon)
export const getAllOrders = async () => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập danh sách đơn hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/hoadon`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const apiResponse = await response.json()
    return extractApiResponseData(apiResponse)
  } catch (error) {
    console.error('Error fetching all orders:', error)
    throw error
  }
}

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập thông tin đơn hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/hoadon/${orderId}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const order = await response.json()
    return order
  } catch (error) {
    console.error('Error fetching order by ID:', error)
    throw error
  }
}

// Update order status
export const updateOrderStatus = async (orderId, orderData) => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền cập nhật trạng thái đơn hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/hoadon/${orderId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(orderData)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const updatedOrder = await response.json()
    return updatedOrder
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

// Delete order (soft delete)
export const deleteOrder = async (orderId) => {
  try {
    // Get auth headers with token
    const headers = await getAuthHeaders()
    
    const response = await fetch(`${API_BASE_URL}/hoadon/${orderId}`, {
      method: 'DELETE',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}

// ===== ORDER DETAILS API FUNCTIONS =====

// Get all order details (ChiTietHoaDon)
export const getAllOrderDetails = async () => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập chi tiết đơn hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/chitiethoadon`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const apiResponse = await response.json()
    return extractApiResponseData(apiResponse)
  } catch (error) {
    console.error('Error fetching all order details:', error)
    throw error
  }
}

// Get order details by order ID
export const getOrderDetailsByOrderId = async (orderId) => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập chi tiết đơn hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    const allDetails = await getAllOrderDetails()
    const orderDetails = allDetails.filter(detail => detail.hoaDon?.maHD === orderId)
    return orderDetails
  } catch (error) {
    console.error('Error fetching order details by order ID:', error)
    throw error
  }
}

// ===== CUSTOMER API FUNCTIONS =====

// Get all customers (KhachHang)
export const getAllCustomers = async () => {
  try {
    console.log('🔍 [API] getAllCustomers - Starting...')
    
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    console.log('🔍 [API] getAllCustomers - Checking EMPLOYEE role...')
    const hasEmployeeRole = hasRole('EMPLOYEE')
    console.log('🔍 [API] getAllCustomers - Has EMPLOYEE role:', hasEmployeeRole)
    
    console.log('🔍 [API] getAllCustomers - Checking MANAGER role...')
    const hasManagerRole = hasRole('MANAGER')
    console.log('🔍 [API] getAllCustomers - Has MANAGER role:', hasManagerRole)
    
    if (!hasEmployeeRole && !hasManagerRole) {
      throw new Error('Bạn không có quyền truy cập danh sách khách hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    console.log('🔍 [API] getAllCustomers - Headers:', headers)
    console.log('🔍 [API] getAllCustomers - Making request to:', `${API_BASE_URL}/khachhang`)
    
    const response = await fetch(`${API_BASE_URL}/khachhang`, {
      method: 'GET',
      headers,
    })
    
    console.log('🔍 [API] getAllCustomers - Response status:', response.status)
    console.log('🔍 [API] getAllCustomers - Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type')
      console.log('🔍 [API] getAllCustomers - Content-Type:', contentType)
      
      if (contentType && contentType.includes('text/html')) {
        // Get response text to see what HTML is returned
        const responseText = await response.text()
        console.log('🔍 [API] getAllCustomers - HTML Response:', responseText.substring(0, 1000))
        console.log('🔍 [API] getAllCustomers - HTML Response Length:', responseText.length)
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Server may be down or URL incorrect.`)
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const customers = await response.json()
    console.log('🔍 [API] getAllCustomers - Success! Customers count:', customers.length || 0)
    return customers
  } catch (error) {
    console.error('Error fetching all customers:', error)
    throw error
  }
}

// Get customer by ID
export const getCustomerById = async (customerId) => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập thông tin khách hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/khachhang/${customerId}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Customer not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const customer = await response.json()
    return customer
  } catch (error) {
    console.error('Error fetching customer by ID:', error)
    throw error
  }
}

// ===== PRODUCT API FUNCTIONS =====

// Get all products (SanPham)
export const getAllProducts = async () => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập danh sách sản phẩm. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/sanpham`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const apiResponse = await response.json()
    return extractApiResponseData(apiResponse)
  } catch (error) {
    console.error('Error fetching all products:', error)
    throw error
  }
}

// Get product by ID
export const getProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sanpham/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const product = await response.json()
    return product
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    throw error
  }
}

// Get optimized products (with less fields)
export const getOptimizedProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sanpham/optimized`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const products = await response.json()
    return products
  } catch (error) {
    console.error('Error fetching optimized products:', error)
    throw error
  }
}

// ===== PRODUCT PRICE API FUNCTIONS =====

// Get all product prices (GiaSanPham)
export const getAllProductPrices = async () => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập giá sản phẩm. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    // Prepare headers with token
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/giasanpham`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const prices = await response.json()
    return prices
  } catch (error) {
    console.error('Error fetching all product prices:', error)
    throw error
  }
}

// Get current price for a product
export const getCurrentProductPrice = async (productId) => {
  try {
    const allPrices = await getAllProductPrices()
    const productPrices = allPrices.filter(price => price.sanPham?.maSP === productId)
    
    if (productPrices.length === 0) {
      return null
    }
    
    // Sort by date and get the most recent price
    productPrices.sort((a, b) => new Date(b.ngayApDung) - new Date(a.ngayApDung))
    return productPrices[0]
  } catch (error) {
    console.error('Error fetching current product price:', error)
    throw error
  }
}

// ===== USER API FUNCTIONS =====

// Get all users (NguoiDung)
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/nguoidung`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const users = await response.json()
    return users
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw error
  }
}

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/nguoidung/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const user = await response.json()
    return user
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
}

// ===== COMPOSITE ORDER DATA FUNCTIONS =====

// Get complete order data with customer, products, and prices
export const getCompleteOrderData = async () => {
  try {
    // Import tokenStorage functions
    const { getToken, hasRole } = await import('../utils/tokenStorage.js')
    
    // Check if user has EMPLOYEE or MANAGER role
    if (!hasRole('EMPLOYEE') && !hasRole('MANAGER')) {
      throw new Error('Bạn không có quyền truy cập dữ liệu đơn hàng. Chỉ EMPLOYEE và MANAGER mới được phép.')
    }
    
    // Get token from storage
    const token = getToken()
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
    }
    
    const [orders, orderDetails, customers, products, prices] = await Promise.all([
      getAllOrders(),
      getAllOrderDetails(),
      getAllCustomers(),
      getAllProducts(),
      getAllProductPrices()
    ])
    
    // Map orders to include complete information
    const completeOrders = orders.map(order => {
      // Find customer
      const customer = customers.find(c => c.maKH === order.khachHang?.maKH)
      
      // Find order details for this order
      const details = orderDetails.filter(d => d.hoaDon?.maHD === order.maHD)
      
      // Map order details to include product information
      const orderProducts = details.map(detail => {
        const product = products.find(p => p.maSP === detail.sanPham?.maSP)
        const price = prices.find(pr => pr.sanPham?.maSP === detail.sanPham?.maSP)
        
        return {
          id: detail.maCTHD,
          name: product?.tenSP || 'Unknown Product',
          variant: `${product?.loaiSanPham?.tenLoai || 'N/A'}`,
          quantity: detail.soLuong || 0,
          price: price?.gia || 0,
          totalPrice: (detail.soLuong || 0) * (price?.gia || 0)
        }
      })
      
      // Calculate totals
      const subtotal = orderProducts.reduce((sum, product) => sum + product.totalPrice, 0)
      const shipping = 50000 // Fixed shipping cost
      const total = subtotal + shipping
      
      return {
        id: order.maHD,
        customer: customer?.hoTen || 'Unknown Customer',
        phone: customer?.sdt || 'N/A',
        address: customer?.diaChi || 'N/A',
        date: order.ngayTao || order.ngayDat || new Date().toISOString(),
        total: total,
        subtotal: subtotal,
        shipping: shipping,
        status: mapOrderStatus(order.trangThai),
        products: orderProducts,
        originalOrder: order,
        customerData: customer
      }
    })
    
    return completeOrders
  } catch (error) {
    console.error('Error fetching complete order data:', error)
    throw error
  }
}

// Helper function to map order status
const mapOrderStatus = (status) => {
  if (!status) return 'pending'
  
  const statusMap = {
    'CHO_XU_LY': 'pending',
    'DANG_XU_LY': 'processing',
    'DANG_GIAO': 'processing',
    'DA_GIAO': 'completed',
    'DA_HUY': 'cancelled',
    'pending': 'pending',
    'processing': 'processing',
    'completed': 'completed',
    'cancelled': 'cancelled'
  }
  
  return statusMap[status] || 'pending'
}

// Usage examples for order management:
/*
// Get all orders with complete data
const completeOrders = await getCompleteOrderData()
console.log('Complete orders:', completeOrders)

// Get specific order
const order = await getOrderById(1001)
console.log('Order:', order)

// Update order status
await updateOrderStatus(1001, {
  trangThai: 'DANG_GIAO'
})

// Delete order
await deleteOrder(1001)

// Get customers
const customers = await getAllCustomers()
console.log('Customers:', customers)

// Get products
const products = await getAllProducts()
console.log('Products:', products)

// Get product prices
const prices = await getAllProductPrices()
console.log('Prices:', prices)
*/

// ===== DASHBOARD API FUNCTIONS =====

// Get dashboard statistics (revenue, orders, customers, products)
export const getDashboardStats = async () => {
  try {
    const [orders, orderDetails, customers, products] = await Promise.all([
      getAllOrders(),
      getAllOrderDetails(),
      getAllCustomers(),
      getAllProducts()
    ])

    // Calculate total revenue from completed orders
    const completedOrders = orders.filter(order => 
      order.trangThai === 'DA_GIAO' || order.trangThai === 'completed'
    )
    
    let totalRevenue = 0
    completedOrders.forEach(order => {
      const orderProducts = orderDetails.filter(detail => detail.hoaDon?.maHD === order.maHD)
      orderProducts.forEach(detail => {
        // Get current product price
        const product = products.find(p => p.maSP === detail.sanPham?.maSP)
        if (product && product.giaHienTai) {
          totalRevenue += (detail.soLuong || 0) * product.giaHienTai
        }
      })
    })

    // Calculate stats
    const stats = {
      revenue: {
        value: formatCurrency(totalRevenue),
        change: calculatePercentageChange(orders, 'revenue')
      },
      orders: {
        value: orders.length.toString(),
        change: calculatePercentageChange(orders, 'orders')
      },
      customers: {
        value: customers.length.toString(),
        change: calculatePercentageChange(customers, 'customers')
      },
      products: {
        value: products.length.toString(),
        change: calculatePercentageChange(products, 'products')
      }
    }

    return stats
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

// Get recent activities for dashboard
export const getRecentActivities = async () => {
  try {
    const [orders, orderDetails, customers, products] = await Promise.all([
      getAllOrders(),
      getAllOrderDetails(),
      getAllCustomers(),
      getAllProducts()
    ])

    const activities = []

    // Add recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.ngayTao || b.ngayDat) - new Date(a.ngayTao || a.ngayDat))
      .slice(0, 3)

    recentOrders.forEach(order => {
      const customer = customers.find(c => c.maKH === order.khachHang?.maKH)
      const orderProducts = orderDetails.filter(d => d.hoaDon?.maHD === order.maHD)
      
      let orderTotal = 0
      orderProducts.forEach(detail => {
        const product = products.find(p => p.maSP === detail.sanPham?.maSP)
        if (product && product.giaHienTai) {
          orderTotal += (detail.soLuong || 0) * product.giaHienTai
        }
      })

      activities.push({
        id: `order-${order.maHD}`,
        type: 'order',
        icon: '📦',
        title: `Đơn hàng mới #${order.maHD}`,
        description: `Khách hàng: ${customer?.hoTen || 'Không xác định'}`,
        value: formatCurrency(orderTotal),
        time: formatTimeAgo(order.ngayTao || order.ngayDat)
      })
    })

    // Add recent customers
    const recentCustomers = customers
      .sort((a, b) => new Date(b.ngayDangKy) - new Date(a.ngayDangKy))
      .slice(0, 2)

    recentCustomers.forEach(customer => {
      activities.push({
        id: `customer-${customer.maKH}`,
        type: 'customer',
        icon: '👤',
        title: 'Khách hàng mới',
        description: `${customer.hoTen} đã đăng ký`,
        value: '+1 khách hàng',
        time: formatTimeAgo(customer.ngayDangKy)
      })
    })

    // Sort activities by time and return top 5
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    throw error
  }
}

// Get top selling products
export const getTopProducts = async () => {
  try {
    const [orders, orderDetails, products] = await Promise.all([
      getAllOrders(),
      getAllOrderDetails(),
      getAllProducts()
    ])

    // Filter completed orders
    const completedOrders = orders.filter(order => 
      order.trangThai === 'DA_GIAO' || order.trangThai === 'completed'
    )

    // Calculate product sales
    const productSales = {}
    
    completedOrders.forEach(order => {
      const orderProducts = orderDetails.filter(d => d.hoaDon?.maHD === order.maHD)
      
      orderProducts.forEach(detail => {
        const productId = detail.sanPham?.maSP
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              sold: 0,
              revenue: 0
            }
          }
          
          const product = products.find(p => p.maSP === productId)
          const price = product?.giaHienTai || 0
          const quantity = detail.soLuong || 0
          
          productSales[productId].sold += quantity
          productSales[productId].revenue += quantity * price
        }
      })
    })

    // Convert to array and sort by revenue
    const topProducts = Object.entries(productSales)
      .map(([productId, sales]) => {
        const product = products.find(p => p.maSP === productId)
        return {
          id: productId,
          name: product?.tenSP || 'Sản phẩm không xác định',
          category: product?.loaiSanPham?.tenLoai || 'Không phân loại',
          sold: sales.sold,
          revenue: formatCurrency(sales.revenue)
        }
      })
      .sort((a, b) => b.revenue.replace(/[^\d]/g, '') - a.revenue.replace(/[^\d]/g, ''))
      .slice(0, 5)

    return topProducts
  } catch (error) {
    console.error('Error fetching top products:', error)
    throw error
  }
}

// Get chart data for dashboard
export const getChartData = async (timeFilter = 'week') => {
  try {
    const [orders, orderDetails, customers, products] = await Promise.all([
      getAllOrders(),
      getAllOrderDetails(),
      getAllCustomers(),
      getAllProducts()
    ])

    // Get date range based on filter
    const { startDate, endDate } = getDateRange(timeFilter)
    
    // Filter data by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.ngayTao || order.ngayDat)
      return orderDate >= startDate && orderDate <= endDate
    })

    const filteredCustomers = customers.filter(customer => {
      const registerDate = new Date(customer.ngayDangKy)
      return registerDate >= startDate && registerDate <= endDate
    })

    // Generate daily data for the last 7 days
    const dailyData = generateDailyData(startDate, endDate, filteredOrders, orderDetails, products, filteredCustomers)

    return {
      revenue: dailyData.revenue,
      orders: dailyData.orders,
      customers: dailyData.customers
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    throw error
  }
}

// Helper functions
const formatCurrency = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M VNĐ`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K VNĐ`
  }
  return `${amount.toLocaleString()} VNĐ`
}

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
  return `${Math.floor(diffInMinutes / 1440)} ngày trước`
}

const calculatePercentageChange = (data, type) => {
  // This is a simplified calculation - in a real app you'd compare with previous period
  const randomChange = Math.random() * 20 - 5
  return parseFloat(randomChange.toFixed(1))
}

const getDateRange = (filter) => {
  const now = new Date()
  const startDate = new Date()
  
  switch (filter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 7)
  }
  
  return { startDate, endDate: now }
}

const generateDailyData = (startDate, endDate, orders, orderDetails, products, customers) => {
  const dailyData = {
    revenue: [],
    orders: [],
    customers: []
  }
  
  const days = 7
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Calculate daily revenue
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.ngayTao || order.ngayDat)
      return orderDate.toDateString() === date.toDateString() &&
             (order.trangThai === 'DA_GIAO' || order.trangThai === 'completed')
    })
    
    let dayRevenue = 0
    dayOrders.forEach(order => {
      const orderProducts = orderDetails.filter(d => d.hoaDon?.maHD === order.maHD)
      orderProducts.forEach(detail => {
        const product = products.find(p => p.maSP === detail.sanPham?.maSP)
        if (product && product.giaHienTai) {
          dayRevenue += (detail.soLuong || 0) * product.giaHienTai
        }
      })
    })
    
    // Calculate daily orders
    const dayOrderCount = orders.filter(order => {
      const orderDate = new Date(order.ngayTao || order.ngayDat)
      return orderDate.toDateString() === date.toDateString()
    }).length
    
    // Calculate daily customers
    const dayCustomers = customers.filter(customer => {
      const registerDate = new Date(customer.ngayDangKy)
      return registerDate.toDateString() === date.toDateString()
    }).length
    
    // Find max values for percentage calculation
    const maxRevenue = Math.max(...dailyData.revenue.map(d => d.value), dayRevenue)
    const maxOrders = Math.max(...dailyData.orders.map(d => d.value), dayOrderCount)
    const maxCustomers = Math.max(...dailyData.customers.map(d => d.value), dayCustomers)
    
    dailyData.revenue.push({
      value: formatCurrency(dayRevenue),
      percentage: maxRevenue > 0 ? (dayRevenue / maxRevenue) * 100 : 0
    })
    
    dailyData.orders.push({
      value: dayOrderCount.toString(),
      percentage: maxOrders > 0 ? (dayOrderCount / maxOrders) * 100 : 0
    })
    
    dailyData.customers.push({
      value: dayCustomers.toString(),
      percentage: maxCustomers > 0 ? (dayCustomers / maxCustomers) * 100 : 0
    })
  }
  
  return dailyData
}

// ===== PHIEU NHAP HANG API FUNCTIONS =====

// Get all phiếu nhập hàng
export const getAllPhieuNhapHang = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieunhaphang`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const phieuNhapHangs = await response.json()
    return phieuNhapHangs
  } catch (error) {
    console.error('Error fetching all phiếu nhập hàng:', error)
    throw error
  }
}

// Get phiếu nhập hàng by ID
export const getPhieuNhapHangById = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieunhaphang/${id}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Phiếu nhập hàng not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const phieuNhapHang = await response.json()
    return phieuNhapHang
  } catch (error) {
    console.error('Error fetching phiếu nhập hàng by ID:', error)
    throw error
  }
}

// Create new phiếu nhập hàng
export const createPhieuNhapHang = async (phieuNhapHangData) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieunhaphang`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...phieuNhapHangData,
        isDeleted: false
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const newPhieuNhapHang = await response.json()
    return newPhieuNhapHang
  } catch (error) {
    console.error('Error creating phiếu nhập hàng:', error)
    throw error
  }
}

// Update phiếu nhập hàng
export const updatePhieuNhapHang = async (id, phieuNhapHangData) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieunhaphang/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...phieuNhapHangData,
        isDeleted: false
      })
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Phiếu nhập hàng not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const updatedPhieuNhapHang = await response.json()
    return updatedPhieuNhapHang
  } catch (error) {
    console.error('Error updating phiếu nhập hàng:', error)
    throw error
  }
}

// Delete phiếu nhập hàng (soft delete)
export const deletePhieuNhapHang = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieunhaphang/${id}`, {
      method: 'DELETE',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Phiếu nhập hàng not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting phiếu nhập hàng:', error)
    throw error
  }
}

// ===== CHI TIET PHIEU NHAP API FUNCTIONS =====

// Get all chi tiết phiếu nhập
export const getAllChiTietPhieuNhap = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieunhap`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const chiTietPhieuNhaps = await response.json()
    return chiTietPhieuNhaps
  } catch (error) {
    console.error('Error fetching all chi tiết phiếu nhập:', error)
    throw error
  }
}

// Get chi tiết phiếu nhập by ID
export const getChiTietPhieuNhapById = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieunhap/${id}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Chi tiết phiếu nhập not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const chiTietPhieuNhap = await response.json()
    return chiTietPhieuNhap
  } catch (error) {
    console.error('Error fetching chi tiết phiếu nhập by ID:', error)
    throw error
  }
}

// Create new chi tiết phiếu nhập
export const createChiTietPhieuNhap = async (chiTietPhieuNhapData) => {
  try {
    // Map frontend field names to backend field names
    const mappedData = {
      phieuNhapHang: chiTietPhieuNhapData.phieuNhapHang,
      sanPham: { maSP: chiTietPhieuNhapData.maSP },
      soLuongNhap: chiTietPhieuNhapData.soLuongNhap,
      donGiaNhap: chiTietPhieuNhapData.donGiaNhap,
      ngayHetHan: chiTietPhieuNhapData.ngayHetHan || null,
      soLo: chiTietPhieuNhapData.soLo || null,
      ngaySanXuat: chiTietPhieuNhapData.ngaySanXuat || null,
      isDeleted: false
    }
    
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieunhap`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mappedData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const newChiTietPhieuNhap = await response.json()
    return newChiTietPhieuNhap
  } catch (error) {
    console.error('Error creating chi tiết phiếu nhập:', error)
    throw error
  }
}

// Update chi tiết phiếu nhập
export const updateChiTietPhieuNhap = async (id, chiTietPhieuNhapData) => {
  try {
    // Map frontend field names to backend field names
    const mappedData = {
      phieuNhapHang: chiTietPhieuNhapData.phieuNhapHang,
      sanPham: { maSP: chiTietPhieuNhapData.maSP },
      soLuongNhap: chiTietPhieuNhapData.soLuongNhap,
      donGiaNhap: chiTietPhieuNhapData.donGiaNhap,
      ngayHetHan: chiTietPhieuNhapData.ngayHetHan || null,
      soLo: chiTietPhieuNhapData.soLo || null,
      ngaySanXuat: chiTietPhieuNhapData.ngaySanXuat || null,
      isDeleted: false
    }
    
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieunhap/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(mappedData)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Chi tiết phiếu nhập not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const updatedChiTietPhieuNhap = await response.json()
    return updatedChiTietPhieuNhap
  } catch (error) {
    console.error('Error updating chi tiết phiếu nhập:', error)
    throw error
  }
}

// Delete chi tiết phiếu nhập (soft delete)
export const deleteChiTietPhieuNhap = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieunhap/${id}`, {
      method: 'DELETE',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Chi tiết phiếu nhập not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting chi tiết phiếu nhập:', error)
    throw error
  }
}

// ===== NHA CUNG CAP API FUNCTIONS =====

// Get all nhà cung cấp
export const getAllNhaCungCap = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/nhacungcap`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const nhaCungCapList = await response.json()
    return nhaCungCapList
  } catch (error) {
    console.error('Error fetching all nhà cung cấp:', error)
    throw error
  }
}

// ===== NHAN VIEN API FUNCTIONS =====

// Get all nhân viên
export const getAllNhanVien = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/nhanvien`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const nhanVienList = await response.json()
    return nhanVienList
  } catch (error) {
    console.error('Error fetching all nhân viên:', error)
    throw error
  }
}

// ===== SAN PHAM API FUNCTIONS =====

// Get all sản phẩm
export const getAllSanPham = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sanpham`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const sanPhamList = await response.json()
    return sanPhamList
  } catch (error) {
    console.error('Error fetching all sản phẩm:', error)
    throw error
  }
}

// ===== KHO API FUNCTIONS =====

// Get all kho
export const getAllKho = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/kho`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const khoList = await response.json()
    return khoList
  } catch (error) {
    console.error('Error fetching all kho:', error)
    throw error
  }
}

// ===== PHIEU XUAT KHO API FUNCTIONS =====

// Get all phiếu xuất kho
export const getAllPhieuXuatKho = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieuxuatkho`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const phieuXuatList = await response.json()
    return phieuXuatList
  } catch (error) {
    console.error('Error fetching all phiếu xuất kho:', error)
    throw error
  }
}

// Create new phiếu xuất kho
export const createPhieuXuatKho = async (phieuXuatData) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieuxuatkho`, {
      method: 'POST',
      headers,
      body: JSON.stringify(phieuXuatData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const newPhieuXuat = await response.json()
    return newPhieuXuat
  } catch (error) {
    console.error('Error creating phiếu xuất kho:', error)
    throw error
  }
}

// Update phiếu xuất kho
export const updatePhieuXuatKho = async (phieuXuatId, phieuXuatData) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieuxuatkho/${phieuXuatId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(phieuXuatData)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Phiếu xuất kho not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const updatedPhieuXuat = await response.json()
    return updatedPhieuXuat
  } catch (error) {
    console.error('Error updating phiếu xuất kho:', error)
    throw error
  }
}

// Delete phiếu xuất kho
export const deletePhieuXuatKho = async (phieuXuatId) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/phieuxuatkho/${phieuXuatId}`, {
      method: 'DELETE',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Phiếu xuất kho not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting phiếu xuất kho:', error)
    throw error
  }
}

// ===== CHI TIET PHIEU XUAT KHO API FUNCTIONS =====

// Get all chi tiết phiếu xuất kho
export const getAllChiTietPhieuXuat = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieuxuat`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const chiTietList = await response.json()
    return chiTietList
  } catch (error) {
    console.error('Error fetching all chi tiết phiếu xuất kho:', error)
    throw error
  }
}

// Get chi tiết phiếu xuất kho by ID
export const getChiTietPhieuXuatById = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieuxuat/${id}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Chi tiết phiếu xuất kho not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const chiTiet = await response.json()
    return chiTiet
  } catch (error) {
    console.error('Error fetching chi tiết phiếu xuất kho by ID:', error)
    throw error
  }
}

// Get chi tiết by phiếu xuất kho
export const getChiTietByPhieuXuatKho = async (maPXK) => {
  try {
    // Get all chi tiết and filter by maPXK
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieuxuat`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const allChiTietList = await response.json()
    // Filter by phieuXuatKho.maPXK
    const filteredList = allChiTietList.filter(ct => 
      ct.phieuXuatKho && ct.phieuXuatKho.maPXK == maPXK
    )
    return filteredList
  } catch (error) {
    console.error('Error fetching chi tiết by phiếu xuất kho:', error)
    throw error
  }
}

// Create new chi tiết phiếu xuất kho
export const createChiTietPhieuXuat = async (chiTietData) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieuxuat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(chiTietData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const newChiTiet = await response.json()
    return newChiTiet
  } catch (error) {
    console.error('Error creating chi tiết phiếu xuất kho:', error)
    throw error
  }
}

// Update chi tiết phiếu xuất kho
export const updateChiTietPhieuXuat = async (id, chiTietData) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieuxuat/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(chiTietData)
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Chi tiết phiếu xuất kho not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const updatedChiTiet = await response.json()
    return updatedChiTiet
  } catch (error) {
    console.error('Error updating chi tiết phiếu xuất kho:', error)
    throw error
  }
}

// Delete chi tiết phiếu xuất kho
export const deleteChiTietPhieuXuat = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/chitietphieuxuat/${id}`, {
      method: 'DELETE',
      headers,
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Chi tiết phiếu xuất kho not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Error deleting chi tiết phiếu xuất kho:', error)
    throw error
  }
}

// ===== AUTHENTICATION API FUNCTIONS =====

// Login function
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/log-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    })
    
    if (!response.ok) {
      let friendlyMessage = 'Đăng nhập không thành công. Vui lòng thử lại.'
      try {
        const errJson = await response.json()
        if (errJson?.message) friendlyMessage = errJson.message
        else if (errJson?.result?.message) friendlyMessage = errJson.result.message
      } catch (_) {
        // ignore parse error; keep friendly default
      }
      throw new Error(friendlyMessage)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error during login:', error)
    throw error
  }
}

// Logout function
export const logout = async () => {
  try {
    // Import tokenStorage functions
    const { getToken, removeToken } = await import('../utils/tokenStorage.js')
    
    // Get token from storage
    const token = getToken()
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    console.log('🔍 [LOGOUT] Headers:', headers)
    
    const response = await fetch(`${API_BASE_URL}/auth/log-out`, {
      method: 'POST',
      headers,
      credentials: 'include'
    })
    
    console.log('🔍 [LOGOUT] Response status:', response.status)
    console.log('🔍 [LOGOUT] Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('🔍 [LOGOUT] Error response:', errorText)
      throw new Error(`Logout failed: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('🔍 [LOGOUT] Success response:', result)
    
    // Clear token immediately after successful logout
    removeToken()
    console.log('🔍 [LOGOUT] Token cleared from storage')
    
    return result
  } catch (error) {
    console.error('Error during logout:', error)
    throw error
  }
}

// Check authentication status
export const checkAuthStatus = async () => {
  try {
    // Import tokenStorage functions
    const { getToken } = await import('../utils/tokenStorage.js')
    
    // Get token from storage
    const token = getToken()
    
    // Prepare headers
    const headers = {
      'Accept': 'application/json'
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: 'GET',
      headers,
      credentials: 'include'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Status check failed: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error checking auth status:', error)
    throw error
  }
}

// Validate JWT token
export const validateToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({ token })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token validation failed: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error validating token:', error)
    throw error
  }
}

// Helper function to get auth headers with token
export const getAuthHeaders = async () => {
  try {
    // Import tokenStorage functions
    const { getToken } = await import('../utils/tokenStorage.js')
    
    const token = getToken()
    
    // Debug: Log token status
    if (token) {
      console.log('🔑 [API] Token found, length:', token.length)
    } else {
      console.warn('⚠️ [API] No token found in storage')
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  } catch (error) {
    console.error('Error getting auth headers:', error)
    // Return basic headers if token storage fails
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
}

// Helper function to make authenticated requests
export const authenticatedRequest = async (url, options = {}) => {
  const headers = await getAuthHeaders()
  
  const requestOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    },
    credentials: 'include'
  }
  
  try {
    const response = await fetch(url, requestOptions)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Request failed: ${response.status} - ${errorText}`)
    }
    
    return response
  } catch (error) {
    console.error('Error making authenticated request:', error)
    throw error
  }
}