<template>
  <div class="min-w-[800px] min-h-[600px] bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm">
      <div class="flex justify-between items-center px-4 py-2">
        <div class="flex space-x-2">
          <button
            v-for="view in views"
            :key="view.id"
            @click="currentView = view.id"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="currentView === view.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'"
          >
            {{ $t(`app.views.${view.id}`) }}
          </button>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="showDonateDialog = true"
            class="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded hover:opacity-90 transition-opacity flex items-center space-x-1"
          >
            <span>❤️</span>
            <span>{{ $t('app.donate.button') }}</span>
          </button>

          <LanguageSelector />
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <div class="p-4 space-y-4">
      <!-- 任务输入表单 -->
      <TaskInput />

      <!-- 视图内容 -->
      <div class="bg-white rounded-lg shadow">
        <component :is="currentView === 'quadrant' ? QuadrantView : CalendarView" />
      </div>
    </div>
  </div>

  <!-- 捐赠对话框 -->
  <DonateDialog v-model:show="showDonateDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TaskInput from '@/components/TaskInput.vue';
import QuadrantView from '@/components/QuadrantView.vue';
import CalendarView from '@/components/CalendarView.vue';
import LanguageSelector from '@/components/LanguageSelector.vue';
import DonateDialog from '@/components/DonateDialog.vue';

const views = [
  { id: 'quadrant' },
  { id: 'calendar' }
];

const currentView = ref('quadrant');
const showDonateDialog = ref(false);
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style> 