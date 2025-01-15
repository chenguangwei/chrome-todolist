<template>
  <div class="grid grid-cols-2 gap-6 p-6">
    <!-- 重要且紧急 -->
    <div class="bg-gradient-to-br from-red-50 to-white p-4 rounded-lg border border-red-100">
      <h3 class="text-lg font-bold mb-4 text-red-700 flex items-center">
        <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
        {{ $t('task.quadrant.importantUrgent') }}
      </h3>
      <TaskList :tasks="importantUrgentTasks" />
    </div>

    <!-- 重要不紧急 -->
    <div class="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-lg border border-yellow-100">
      <h3 class="text-lg font-bold mb-4 text-yellow-700 flex items-center">
        <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
        {{ $t('task.quadrant.importantNotUrgent') }}
      </h3>
      <TaskList :tasks="importantNotUrgentTasks" />
    </div>

    <!-- 紧急不重要 -->
    <div class="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100">
      <h3 class="text-lg font-bold mb-4 text-blue-700 flex items-center">
        <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        {{ $t('task.quadrant.notImportantUrgent') }}
      </h3>
      <TaskList :tasks="notImportantUrgentTasks" />
    </div>

    <!-- 不重要不紧急 -->
    <div class="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-100">
      <h3 class="text-lg font-bold mb-4 text-gray-700 flex items-center">
        <span class="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
        {{ $t('task.quadrant.notImportantNotUrgent') }}
      </h3>
      <TaskList :tasks="notImportantNotUrgentTasks" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTaskStore } from '@/stores/task';
import TaskList from './TaskList.vue';

const taskStore = useTaskStore();

const importantUrgentTasks = computed(() => 
  taskStore.tasks.filter(task => task.important && task.urgent)
);

const importantNotUrgentTasks = computed(() => 
  taskStore.tasks.filter(task => task.important && !task.urgent)
);

const notImportantUrgentTasks = computed(() => 
  taskStore.tasks.filter(task => !task.important && task.urgent)
);

const notImportantNotUrgentTasks = computed(() => 
  taskStore.tasks.filter(task => !task.important && !task.urgent)
);
</script> 