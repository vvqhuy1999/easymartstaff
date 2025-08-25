<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <h1>Đăng Nhập</h1>
        <p>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục</p>
        <div class="login-notice">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
            <line x1="12" y1="8" x2="12" y2="12"></line>
          </svg>
          <span>Bạn cần đăng nhập để truy cập hệ thống quản trị</span>
        </div>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Email hoặc Mã Người Dùng
          </label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            :disabled="isLoading"
            placeholder="Nhập email hoặc mã người dùng"
          />
          <div class="input-border"></div>
        </div>
        <div class="form-group">
          <label for="password">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Mật Khẩu
          </label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            :disabled="isLoading"
            placeholder="Nhập mật khẩu"
          />
          <div class="input-border"></div>
        </div>
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" class="forgot-password">Quên mật khẩu?</a>
        </div>
        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="!isLoading">Đăng Nhập</span>
          <span v-else>Đang xử lý...</span>
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
        
        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.44 0 2.8.34 4.01.94"></path>
          </svg>
          {{ successMessage }}
        </div>
        
        <!-- Error Message -->
        <p v-if="errorMessage" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ errorMessage }}
        </p>
        <div class="login-footer">
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { setToken, getToken, removeToken, hasValidRole } from '../../utils/tokenStorage.js';
import { login, checkAuthStatus, validateToken } from '../api.js';

// Vue Router
const router = useRouter();

// Reactive variables
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);



// API Configuration - Thử các URL khác nhau
const API_BASE_URL = 'http://localhost:8080/api/auth'; // URL chính
// Các URL backup để thử:
// const API_BASE_URL = 'http://localhost:8080'; 
// const API_BASE_URL = 'http://localhost:8081/api';



// Login function
const handleLogin = async () => {
  // Clear previous messages
  errorMessage.value = '';
  successMessage.value = '';

  // Basic validation
  if (!username.value.trim()) {
    errorMessage.value = 'Vui lòng nhập email hoặc mã người dùng!';
    return;
  }

  if (!password.value.trim()) {
    errorMessage.value = 'Vui lòng nhập mật khẩu!';
    return;
  }

  isLoading.value = true;

  try {
    const loginData = {
      email: username.value.includes('@') ? username.value : null,
      maNguoiDung: username.value.includes('@') ? null : username.value,
      matKhau: password.value
    };

    // Sử dụng function API mới
    const result = await login(loginData);
    
    // Lưu token và thông tin người dùng
    // Token nằm trong result.result.token theo API response
    const tokenToValidate = result.result?.token || result.token;
    const userRole = result.result?.role || result.role || result.user?.vaiTro;
    
    if (tokenToValidate) {
      // Token đã được server xác thực khi login thành công
      // Không cần validate riêng biệt
      
      // Kiểm tra role của người dùng
      // Chỉ cho phép đăng nhập với role MANAGER, EMPLOYEE, hoặc ADMIN
      const allowedRoles = ['MANAGER', 'EMPLOYEE', 'ADMIN'];
      
      if (userRole && allowedRoles.includes(userRole.toUpperCase())) {
        // Lưu token sử dụng tokenStorage (luôn lưu 1 ngày)
        setToken(tokenToValidate);
        
        // Lưu thông tin người dùng vào cookie (luôn lưu 1 ngày)
        if (result.result?.user || result.user) {
          const userInfo = result.result?.user || result.user;
          setCookie('user_info', JSON.stringify(userInfo), 1);
        }
        
        // Lưu role vào cookie để sử dụng sau này
        setCookie('user_role', userRole, 1);
        
        successMessage.value = result.message || 'Đăng nhập thành công!';
        
        // Test API connection sau khi login thành công để xác nhận token hoạt động
        try {
          await checkAuthStatus();
        } catch (error) {
          // Auth status check failed - có thể bỏ qua
        }
        
        // Chuyển hướng đến dashboard (trang home) ngay lập tức
        try {
          await router.push('/home');
        } catch (redirectError) {
          // Fallback: reload page hoặc chuyển hướng khác
          window.location.href = '/home';
        }
      } else {
        // Role không được phép
        errorMessage.value = 'Bạn không có quyền truy cập hệ thống quản trị. Chỉ MANAGER, EMPLOYEE, và ADMIN mới được phép.';
      }
    } else {
      errorMessage.value = 'Token không hợp lệ từ server! Vui lòng kiểm tra lại thông tin đăng nhập.';
    }
  } catch (error) {
    errorMessage.value = error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};





// Utility function to get stored token
const getStoredToken = () => {
  return getToken();
};

// Utility function to get stored user info from cookie
const getStoredUserInfo = () => {
  const userInfo = getCookie('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Function to set cookie (for user info)
const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Function to get cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Function to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Check if user is already logged in
const checkExistingLogin = async () => {
  // Skip validation if we're coming from logout
  if (sessionStorage.getItem('justLoggedOut') === 'true') {
    sessionStorage.removeItem('justLoggedOut');
    return;
  }
  
  const token = getStoredToken();
  if (token) {
    try {
      // Kiểm tra token có hợp lệ từ server không
      const tokenValidation = await validateToken(token);
      
      if (!tokenValidation.success) {
        // Clear invalid token
        removeToken();
        deleteCookie('user_info');
        deleteCookie('user_role');
        return;
      }
      
      // Sử dụng function API mới
      const result = await checkAuthStatus();
      if (result.success) {
        // Kiểm tra role trước khi cho phép truy cập
        if (hasValidRole()) {
          // Redirect to dashboard (home) if already logged in with valid role
          router.push('/home');
        } else {
          // Clear invalid session
          removeToken();
          deleteCookie('user_info');
          deleteCookie('user_role');
        }
      }
    } catch (error) {
      // Clear invalid token
      removeToken();
      deleteCookie('user_info');
      deleteCookie('user_role');
    }
  }
};

// Check existing login on component mount
checkExistingLogin();

// Không test API connection ngay khi mount vì chưa có token
// Chỉ test khi cần thiết (ví dụ: sau khi login thành công)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.login-container:hover {
  transform: translateY(-5px);
}

.login-header {
  padding: 30px;
  text-align: center;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-notice {
  display: flex;
  align-items: center;
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.login-notice svg {
  margin-right: 8px;
  color: #856404;
}

.login-form {
  padding: 30px;
}

.form-group {
  position: relative;
  margin-bottom: 25px;
}

.form-group label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-group label svg {
  margin-right: 10px;
  color: #6a11cb;
}

.form-group input {
  width: 100%;
  padding: 14px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group input:focus {
  border-color: #6a11cb;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
  outline: none;
}

.form-group input::placeholder {
  color: #aaa;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #6a11cb;
  transition: width 0.3s ease;
}

.form-group input:focus ~ .input-border {
  width: 100%;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 13px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  color: #6a11cb;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #2575fc;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button svg {
  margin-left: 10px;
  transition: transform 0.3s ease;
}

.login-button:hover:not(:disabled) svg {
  transform: translateX(5px);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #eefff0;
  color: #2d7a3d;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  animation: slideIn 0.5s ease;
}

.success-message svg {
  margin-right: 8px;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: #ffeeee;
  color: #ff4d4d;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  animation: shake 0.5s ease;
}

.error-message svg {
  margin-right: 8px;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #6a11cb;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-footer a:hover {
  color: #2575fc;
  text-decoration: underline;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 480px) {
  .login-container {
    border-radius: 12px;
  }
  
  .login-header, .login-form {
    padding: 20px;
  }
}
</style>