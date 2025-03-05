<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div v-if="isLoading" class="flex justify-center items-center h-32">
      <div class="text-gray-500">{{ t('common.loading') }}</div>
    </div>
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <div class="flex space-x-2">
          <button
            v-for="view in views"
            :key="view.id"
            @click="currentView = view.id"
            :class="[
              'px-3 py-1 rounded',
              currentView === view.id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ t(view.nameKey) }}
          </button>
        </div>
        
        <div class="flex items-center space-x-2">
          <LanguageSwitcher />
          <button
            @click="showDonateDialog = true"
            class="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded hover:opacity-90 transition-opacity flex items-center space-x-1"
          >
            <span>❤️</span>
            <span>{{ t('donate.supportAuthor') }}</span>
          </button>
        </div>
      </div>

      <TaskInput />
      <div class="mt-4">
        <QuadrantView v-if="currentView === 'quadrant'" />
        <CalendarView v-else />
      </div>
    </div>
  </div>

  <!-- 捐赠对话框 -->
  <DonateDialog v-model:show="showDonateDialog" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTaskStore } from '@/stores/task';
import TaskInput from '../components/TaskInput.vue';
import QuadrantView from '../components/QuadrantView.vue';
import CalendarView from '../components/CalendarView.vue';
import DonateDialog from '../components/DonateDialog.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { t, initLocale } from '@/locales';

const views = [
  { id: 'quadrant', nameKey: 'views.quadrant' },
  { id: 'calendar', nameKey: 'views.calendar' }
];

const currentView = ref('quadrant');
const taskStore = useTaskStore();
const isLoading = ref(true);
const showDonateDialog = ref(false);

// 初始化时加载任务和视图状态
onMounted(async () => {
  try {
    isLoading.value = true;
    
    // 初始化语言
    await initLocale();
    
    taskStore.$reset();
    await taskStore.loadTasks();
    
    // 加载上次的视图设置
    const viewData = await chrome.storage.local.get('currentView');
    if (viewData.currentView) {
      currentView.value = viewData.currentView;
    }
    
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
});

// 监听视图变化并保存
watch(currentView, async (newView) => {
  try {
    await chrome.storage.local.set({ currentView: newView });
  } catch (error) {
    // 静默处理错误
  }
});
</script>

<style>
.sticky {
  position: sticky;
  backdrop-filter: blur(8px);
}
</style> 