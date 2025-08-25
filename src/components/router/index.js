// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { hasToken, hasValidRole, getToken } from '../../utils/tokenStorage.js';
import { validateToken } from '../api.js';
import AdminHome from '../Admin/AdminHome.vue';
import CategoryList from '../Admin/CategoryList.vue';
import info from '../Admin/info.vue';
import OderList from '../Admin/OderList.vue';
import ProductList from '../Admin/ProductList.vue';
import Revenue from '../Admin/Revenue.vue';
import ReviewList from '../Admin/ReviewList.vue';
import StaffList from '../Admin/StaffList.vue';
import Promotion from '../Admin/Promotion.vue';
import Warehouse from '../Admin/Warehouse.vue';
import SupplierList from '../Admin/SupplierList.vue';
import Shift from '../Admin/Shift.vue';  
import Dashbroad from '../Admin/Dashbroad.vue';
import Login from '../Admin/Login.vue';
import Customer from '../Admin/CustomerManagement.vue'; // Import the new Customer component
import PhieuNhapHang from '../Admin/PhieuNhapHang.vue'; // Import the new PhieuNhapHang component
import PhieuXuatHang from '../Admin/PhieuXuatHang.vue'; // Import the new PhieuXuatHang component
import Bangluong from '../Admin/Bangluong.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'AdminHome',
    component: AdminHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/info',
    name: 'info',
    component: info,
    meta: { requiresAuth: true }
  },
  {
    path: '/category',
    name: 'CategoryList',
    component: CategoryList,
    meta: { requiresAuth: true }
  },
  {
    path: '/order',
    name: 'OderList',
    component: OderList,
    meta: { requiresAuth: true }
  },
  {
    path: '/product',
    name: 'ProductList',
    component: ProductList,
    meta: { requiresAuth: true }
  },
  {
    path: '/revenue',
    name: 'Revenue',
    component: Revenue,
    meta: { requiresAuth: true }
  },
  {
    path: '/review',
    name: 'ReviewList',
    component: ReviewList,
    meta: { requiresAuth: true }
  },
  {
    path: '/staff',
    name: 'StaffList',
    component: StaffList,
    meta: { requiresAuth: true }
  },
  {
    path: '/promotion',
    name: 'Promotion',
    component: Promotion,
    meta: { requiresAuth: true }
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    component: Warehouse,
    meta: { requiresAuth: true }
  },
  {
    path: '/supplierList',
    name: 'SupplierList',
    component: SupplierList,
    meta: { requiresAuth: true }
  },
  {
    path: '/shift',
    name: 'Shift',
    component: Shift,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashbroad',
    name: 'Dashbroad',
    component: Dashbroad,
    meta: { requiresAuth: true }
  },

  {
    path: '/customer',
    name: 'customer',
    component: Customer,
    meta: { requiresAuth: true }
  },
  {
    path: '/phieu-nhap-hang',
    name: 'PhieuNhapHang',
    component: PhieuNhapHang,
    meta: { requiresAuth: true }
  },
  {
    path: '/phieu-xuat-hang',
    name: 'PhieuXuatHang',
    component: PhieuXuatHang,
    meta: { requiresAuth: true }
  },
  {
    path: '/bangluong',
    name: 'bangluong',
    component: Bangluong,
    meta: { requiresAuth: true }
  },
  // Redirect all unknown routes to login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  try {
    // Skip auth check for login page to avoid infinite redirect
    if (to.name === 'Login') {
      next();
      return;
    }
    
    const isAuthenticated = await checkAuthStatus(from);
    
    // If route requires authentication and user is not authenticated
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/');
      return;
    }
    
    next();
  } catch (error) {
    console.error('🔍 [ROUTER] Navigation guard error:', error);
    // Nếu có lỗi, chuyển hướng về login để đảm bảo an toàn
    next('/');
  }
});

// Function to check if user is authenticated and has valid role
async function checkAuthStatus(fromRoute) {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  if (!hasValidRole()) {
    return false;
  }
  
  // Skip server validation if we're coming from logout
  // This prevents unnecessary API calls after logout
  if (fromRoute && fromRoute.name === 'AdminHome' && fromRoute.meta?.isLoggingOut) {
    return false;
  }
  
  try {
    // Kiểm tra token có hợp lệ từ server không
    const tokenValidation = await validateToken(token);
    
    // Server trả về {success: true} thay vì {valid: true}
    if (tokenValidation.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('🔍 [ROUTER] Token validation error in router:', error);
    return false;
  }
}

export default router;
