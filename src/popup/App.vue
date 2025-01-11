<template>
  <div class="container mx-auto p-4">
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">时间管理助手</h1>
      <nav class="space-x-4">
        <button 
          @click="currentView = 'quadrant'"
          :class="['px-4 py-2 rounded', currentView === 'quadrant' ? 'bg-blue-500 text-white' : 'bg-gray-200']"
        >
          四象限视图
        </button>
        <button 
          @click="currentView = 'calendar'"
          :class="['px-4 py-2 rounded', currentView === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200']"
        >
          日历视图
        </button>
      </nav>
    </header>

    <TaskInput />
    
    <QuadrantView v-if="currentView === 'quadrant'" />
    <CalendarView v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TaskInput from '../components/TaskInput.vue';
import QuadrantView from '../components/QuadrantView.vue';
import CalendarView from '../components/CalendarView.vue';

const currentView = ref<'quadrant' | 'calendar'>('quadrant');
</script> 