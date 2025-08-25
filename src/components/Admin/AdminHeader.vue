<template>
  <header class="admin-header">
    <div class="header-content">
      <div class="logo">
        <h1>
          <span class="logo-icon">🏪</span>
          <span class="logo-text">EasyMart</span>
          <span class="logo-badge">Admin</span>
        </h1>
      </div>
      <nav class="header-nav">
        <div class="user-info">
          <span class="welcome-text">Xin chào, Admin</span>
          <div class="user-avatar" @click="$emit('toggleDropdown')">
            <span>👤</span>
            <div class="status-indicator"></div>
          </div>
          <div class="dropdown-menu" :class="{ show: isDropdownOpen }">
            <div class="dropdown-header">
              <div class="user-profile">
                <div class="profile-avatar">👤</div>
                <div class="profile-info">
                  <h4>Admin User</h4>
                  <p>Quản trị viên</p>
                </div>
              </div>
            </div>
            <router-link to="/info" class="dropdown-item" @click="$emit('closeDropdown')">
              <span>👤</span> Thông tin cá nhân
            </router-link>
            <a href="#" class="dropdown-item" @click="$emit('closeDropdown')">
              <span>⚙️</span> Cài đặt hệ thống
            </a>
            <a href="#" class="dropdown-item" @click="$emit('closeDropdown')">
              <span>🔔</span> Thông báo
            </a>
            <a href="#" class="dropdown-item" @click="$emit('logout')">
              <span>🚪</span> Đăng xuất
            </a>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isDropdownOpen: Boolean
})
defineEmits(['toggleDropdown', 'closeDropdown', 'logout'])
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #fafafa;
    min-height: 100vh;
    color: #1a1a1a;
}

.admin-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Header Styles - Minimal & Professional */
.admin-header {
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid #e5e7eb;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    height: 72px;
    max-width: 1400px;
    margin: 0 auto;
}

.logo h1 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #1f2937;
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.025em;
}

.logo-icon {
    font-size: 1.875rem;
    color: #3b82f6;
}

.logo-badge {
    background: #f3f4f6;
    color: #6b7280;
    padding: 0.375rem 0.875rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.025em;
    border: 1px solid #e5e7eb;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    position: relative;
}

.welcome-text {
    color: #6b7280;
    font-weight: 500;
    font-size: 0.875rem;
}

.user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.user-avatar:hover {
    background: #f1f5f9;
    border-color: #d1d5db;
    transform: translateY(-1px);
}

.user-avatar span {
    color: #6b7280;
    font-size: 1.125rem;
}

.status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 0 0 1px #e5e7eb;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: all 0.2s ease;
    z-index: 1001;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.dropdown-menu.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-header {
    padding: 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.profile-avatar {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #6b7280;
}

.profile-info h4 {
    color: #1f2937;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
}

.profile-info p {
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 500;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem 1.5rem;
    text-decoration: none;
    color: #374151;
    transition: all 0.2s ease;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.875rem;
    font-weight: 500;
}

.dropdown-item:last-child {
    border-bottom: none;
}

.dropdown-item:hover {
    background: #f8fafc;
    color: #1f2937;
    transform: translateX(4px);
}

.dropdown-item span {
    font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .header-content {
        padding: 0 1rem;
        height: 64px;
    }

    .logo h1 {
        font-size: 1.5rem;
    }

    .welcome-text {
        display: none;
    }

    .user-info {
        gap: 0.75rem;
    }

    .dropdown-menu {
        min-width: 280px;
        right: -12px;
    }
}

@media (max-width: 480px) {
    .header-content {
        padding: 0 0.75rem;
    }

    .logo h1 {
        font-size: 1.375rem;
        gap: 0.5rem;
    }

    .logo-badge {
        padding: 0.25rem 0.625rem;
        font-size: 0.6875rem;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
    }
}
</style>