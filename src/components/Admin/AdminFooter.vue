<template>
  <footer class="admin-footer">
    <div class="footer-waves">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-section">
          <h4>EasyMart</h4>
          <ul>
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Dịch vụ</h4>
          <ul>
            <li><a href="#">Quản lý đơn hàng</a></li>
            <li><a href="#">Quản lý kho</a></li>
            <li><a href="#">Báo cáo doanh thu</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Trung tâm trợ giúp</a></li>
            <li><a href="#">Liên hệ hỗ trợ</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Liên hệ</h4>
          <ul>
            <li><a href="mailto:support@easymart.vn">support@easymart.vn</a></li>
            <li><a href="tel:0123456789">0123 456 789</a></li>
            <li><a href="#">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-social">
        <h4>Kết nối với chúng tôi</h4>
        <div class="social-links">
          <a class="social-link" href="#" aria-label="Facebook">
            <svg width="24" height="24" fill="currentColor"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5.019 3.676 9.163 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.261c-1.243 0-1.631.771-1.631 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.324 21.163 22 17.019 22 12"></path></svg>
          </a>
          <a class="social-link" href="#" aria-label="Instagram">
            <svg width="24" height="24" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm6.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path></svg>
          </a>
          <a class="social-link" href="#" aria-label="LinkedIn">
            <svg width="24" height="24" fill="currentColor"><path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-9.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-1.25 2.75v5.25h2.5v-5.25h-2.5zm5.25 0v5.25h2.5v-2.75c0-.75.5-1.25 1.25-1.25s1.25.5 1.25 1.25v2.75h2.5v-3.25c0-2-1.5-3.25-3.25-3.25s-3.25 1.25-3.25 3.25z"></path></svg>
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p>&copy; 2025 EasyMart Management System. Tất cả quyền được bảo lưu.</p>
        <div class="footer-links">
          <a href="#">Điều khoản sử dụng</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Footer Styles */
.admin-footer {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.footer-waves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  opacity: 0.1;
}

.wave {
  position: absolute;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: wave 3s linear infinite;
}
.wave1 { animation-delay: 0s; }
.wave2 { animation-delay: -1s; }
.wave3 { animation-delay: -2s; }
@keyframes wave {
  0% { transform: translateX(-100%);}
  100% { transform: translateX(100%);}
}

.footer-content {
  position: relative;
  z-index: 1;
  padding: 3rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  margin-bottom: 1rem;
  color: #f1f5f9;
  font-size: 1.2rem;
  font-weight: 700;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #cbd5e1;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #4f46e5;
}

.footer-social {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #4f46e5;
  transform: translateY(-3px);
}

.footer-bottom {
  border-top: 1px solid #334155;
  padding-top: 2rem;
  text-align: center;
  color: #94a3b8;
}

.footer-bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.footer-links a {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #4f46e5;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .footer-content {
    padding: 2rem 1rem 1rem;
  }
}
</style>