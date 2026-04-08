<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('律师工作台AI应用启动成功')
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
