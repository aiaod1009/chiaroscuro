<template>
  <div id="app">
    <NavigationBar />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
    <Uploading ref="uploadRef" />
  </div>
</template>

<script>
import { ref, provide } from 'vue'
import NavigationBar from './components/NavigationBar.vue';
import AppFooter from './components/AppFooter.vue';
import Uploading from './components/Uploading.vue';

export default {
  name: 'App',
  components: {
    NavigationBar,
    AppFooter,
    Uploading,
  },
  setup() {
    const uploadRef = ref(null)
    const openUpload = () => {
      if (uploadRef.value) uploadRef.value.isOpen = true
    }
    provide('openUpload', openUpload)
    return { uploadRef }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  /* 让路由内容撑满剩余空间 */
  padding-top: 5rem;
  /* 防止内容被固定导航栏遮挡 */
}
</style>
