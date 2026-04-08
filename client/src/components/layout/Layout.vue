<template>
  <div class="layout">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Header from './Header.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.main-content {
  margin-top: 60px;
  min-height: calc(100vh - 60px);
  padding: 24px;
}
</style>
