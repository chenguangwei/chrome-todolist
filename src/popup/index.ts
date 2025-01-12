import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import '../assets/tailwind.css';

// 创建 pinia 实例
const pinia = createPinia();

// 创建 Vue 应用
const app = createApp(App);

// 使用 pinia
app.use(pinia);

// 挂载应用
app.mount('#app'); 