<template>
  <div class="h-full flex flex-col">
    <header class="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
      <h1 class="text-2xl font-bold">时间管理助手</h1>
      <nav class="space-x-4">
        <button 
          @click="currentView = 'quadrant'"
          :class="['px-4 py-2 rounded transition-colors', 
            currentView === 'quadrant' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          四象限视图
        </button>
        <button 
          @click="currentView = 'calendar'"
          :class="['px-4 py-2 rounded transition-colors', 
            currentView === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          日历视图
        </button>
      </nav>
      <button 
        @click="openInNewWindow"
        class="ml-4 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
      >
        打开新窗口
      </button>
    </header>

    <div class="flex-1 overflow-auto p-4">
      <TaskInput class="mb-4 sticky top-0 bg-white z-10 pb-4" />
      
      <div class="h-[calc(100%-80px)]">
        <QuadrantView v-if="currentView === 'quadrant'" />
        <CalendarView v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TaskInput from '../components/TaskInput.vue';
import QuadrantView from '../components/QuadrantView.vue';
import CalendarView from '../components/CalendarView.vue';

const currentView = ref<'quadrant' | 'calendar'>('quadrant');

const openInNewWindow = () => {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 800,
    height: 600
  });
};
</script>

<style>
.sticky {
  position: sticky;
  backdrop-filter: blur(8px);
}
</style> 