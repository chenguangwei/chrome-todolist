<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div v-if="isLoading" class="flex justify-center items-center h-32">
      <div class="text-gray-500">加载中...</div>
    </div>
    <div v-else>
      <TaskInput />
      <div class="mt-4 flex space-x-2">
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
          {{ view.name }}
        </button>
      </div>
      <div class="mt-4">
        <QuadrantView v-if="currentView === 'quadrant'" />
        <CalendarView v-else />
      </div>
    </div>
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
const isLoading = ref(true);

// 初始化时加载任务和视图状态
onMounted(async () => {
  try {
    console.log('App mounted, 开始初始化...');
    isLoading.value = true;
    
    // 重置 store 的初始化状态
    console.log('重置 store 状态...');
    taskStore.$reset();
    
    // 加载任务
    console.log('开始加载任务...');
    await taskStore.loadTasks();
    console.log('任务加载完成，当前任务数:', taskStore.tasks.length);
    
    // 加载上次的视图设置
    console.log('加载视图设置...');
    const viewData = await chrome.storage.local.get('currentView');
    if (viewData.currentView) {
      currentView.value = viewData.currentView;
      console.log('已恢复上次的视图设置:', currentView.value);
    }
    
    isLoading.value = false;
    console.log('初始化完成');
  } catch (error) {
    console.error('初始化失败:', error);
    isLoading.value = false;
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