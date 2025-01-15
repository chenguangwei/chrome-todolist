<template>
  <div class="p-4 space-y-4">
    <!-- 顶部操作栏 -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold text-gray-800">Todo Matrix</h1>
      <div class="flex items-center space-x-4">
        <LanguageSelector />
        <button
          @click="showDonateDialog = true"
          class="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded hover:opacity-90 transition-opacity flex items-center space-x-1"
        >
          <span>❤️</span>
          <span>{{ $t('app.donate.button') }}</span>
        </button>
      </div>
    </div>

    <!-- 任务输入表单 -->
    <TaskInput @submit="showTabs = true" />

    <!-- 视图切换标签 -->
    <div v-show="showTabs" class="pt-2">
      <nav class="flex space-x-6">
        <button
          v-for="view in views"
          :key="view.id"
          @click="currentView = view.id"
          class="px-4 py-2 font-medium text-sm rounded-lg transition-colors"
          :class="[
            currentView === view.id
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          {{ $t(`app.views.${view.id}`) }}
        </button>
      </nav>
    </div>

    <!-- 主要内容区域 -->
    <div v-show="showTabs">
      <QuadrantView v-if="currentView === 'quadrant'" />
      <CalendarView v-else />
    </div>
  </div>

  <DonateDialog v-model:show="showDonateDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TaskInput from './components/TaskInput.vue';
import QuadrantView from './components/QuadrantView.vue';
import CalendarView from './components/CalendarView.vue';
import LanguageSelector from './components/LanguageSelector.vue';
import DonateDialog from './components/DonateDialog.vue';

const views = [
  { id: 'quadrant' },
  { id: 'calendar' }
];

const currentView = ref('quadrant');
const showDonateDialog = ref(false);
const showTabs = ref(false);
</script> 