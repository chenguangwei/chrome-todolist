<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">时间管理助手</h1>
      <div class="flex space-x-4">
        <button
          v-for="view in views"
          :key="view.id"
          @click="currentView = view.id"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            currentView === view.id
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          ]"
        >
          {{ view.name }}
        </button>
      </div>
    </header>

    <TaskInput class="mb-6" />

    <main class="bg-white rounded-lg shadow p-4 min-h-[400px]">
      <QuadrantView v-if="currentView === 'quadrant'" />
      <CalendarView v-else-if="currentView === 'calendar'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTaskStore } from '@/stores/task';
import TaskInput from '../components/TaskInput.vue';
import QuadrantView from '../components/QuadrantView.vue';
import CalendarView from '../components/CalendarView.vue';

const views = [
  { id: 'quadrant', name: '四象限视图' },
  { id: 'calendar', name: '日历视图' }
];

const currentView = ref('quadrant');
const taskStore = useTaskStore();

// 初始化时加载任务和视图状态
onMounted(async () => {
  // 加载任务
  await taskStore.loadTasks();
  
  // 加载上次的视图设置
  try {
    const data = await chrome.storage.local.get('currentView');
    if (data.currentView) {
      currentView.value = data.currentView;
    }
  } catch (error) {
    console.error('加载视图设置失败:', error);
  }
});

// 监听视图变化并保存
watch(currentView, async (newView) => {
  try {
    await chrome.storage.local.set({ currentView: newView });
  } catch (error) {
    console.error('保存视图设置失败:', error);
  }
});
</script>

<style>
.sticky {
  position: sticky;
  backdrop-filter: blur(8px);
}
</style> 