import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createAppI18n } from '@/i18n';
import '@/assets/tailwind.css';

const init = async () => {
  try {
    const app = createApp(App);
    const pinia = createPinia();
    const i18n = await createAppI18n();

    app.use(pinia);
    app.use(i18n);
    app.mount('#app');
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
};

init(); 