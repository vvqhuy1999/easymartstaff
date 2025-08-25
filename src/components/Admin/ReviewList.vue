<template>
  <AdminHeader />
  <div class="review-list-container">
            <router-link to="/home" class="back-btn">← Quay lại trang Home</router-link>
    <h2>Quản lý đánh giá sản phẩm</h2>
    <table class="review-table">
      <thead>
        <tr>
          <th>ID</th><th>Khách hàng</th><th>Sản phẩm</th><th>Đánh giá</th><th>Sao</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="review in reviews" :key="review.id">
          <td>{{ review.id }}</td>
          <td>{{ review.customer }}</td>
          <td>{{ review.product }}</td>
          <td>{{ review.comment }}</td>
          <td>{{ review.rating }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <AdminFooter />
</template>
<script setup>
import { ref } from 'vue'
import AdminHeader from './AdminHeader.vue'
import AdminFooter from './AdminFooter.vue'
const reviews = ref([
  { id: 1, customer: "Nguyễn Văn E", product: "Áo thun", comment: "Rất tốt", rating: 5 },
  { id: 2, customer: "Trần Thị F", product: "Quần jean", comment: "Vừa ý", rating: 4 }
])
</script>
<style scoped>
.review-list-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 0;
}
.review-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}
th {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 12px;
  font-weight: 700;
  font-size: 1.05em;
}
td {
  border-top: 1px solid #f0f0f0;
  padding: 12px;
  font-size: 1em;
}
tr:hover td {
  background: #f5faff;
  transition: background 0.2s;
}
.back-btn {
  display: inline-block;
  margin-bottom: 16px;
  background: #1976d2;
  color: #fff;
  padding: 6px 16px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}
.back-btn:hover {
  background: #1565c0;
}
</style>
