<template>
  <div class="grid grid-cols-2 gap-4 h-full">
    <div v-for="(quadrant, index) in quadrants" :key="index" class="border rounded-lg p-4">
      <h3 class="font-bold mb-4" :class="quadrant.titleClass">{{ quadrant.title }}</h3>
      <div class="space-y-2">
        <div
          v-for="task in getQuadrantTasks(quadrant.important, quadrant.urgent)"
          :key="task.id"
          class="p-3 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          :class="getTaskClass(task)"
          @click="handleTaskClick(task)"
        >
          <div class="flex justify-between items-start">
            <h4 class="font-medium" :class="{'line-through': task.completed}">
              {{ task.title }}
            </h4>
            <button
              @click.stop="toggleTaskStatus(task)"
              class="text-sm px-2 py-1 rounded"
              :class="task.completed ? 'bg-gray-200' : 'bg-green-100 text-green-800'"
            >
              {{ task.completed ? '已完成' : '未完成' }}
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ task.description }}</p>
          <div class="text-xs text-gray-500 mt-2">
            截止时间: {{ formatDate(task.deadline) }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 编辑对话框 -->
  <TaskEditDialog
    v-model:show="showEditDialog"
    :task="editingTask"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTaskStore } from '@/stores/task';
import { formatDate } from '@/utils/date';
import type { Task } from '@/types/task';
import TaskEditDialog from './TaskEditDialog.vue';

const taskStore = useTaskStore();

// 添加编辑对话框相关的状态
const showEditDialog = ref(false);
const editingTask = ref<Task | null>(null);

const quadrants = [
  {
    title: '重要且紧急',
    important: true,
    urgent: true,
    titleClass: 'text-red-600'
  },
  {
    title: '重要不紧急',
    important: true,
    urgent: false,
    titleClass: 'text-yellow-600'
  },
  {
    title: '紧急不重要',
    important: false,
    urgent: true,
    titleClass: 'text-blue-600'
  },
  {
    title: '不重要不紧急',
    important: false,
    urgent: false,
    titleClass: 'text-green-600'
  }
];

const getQuadrantTasks = (important: boolean, urgent: boolean) => {
  return taskStore.tasks.filter(
    task => task.important === important && task.urgent === urgent
  );
};

const getTaskClass = (task: Task) => {
  if (task.completed) return 'bg-gray-50';
  if (task.important && task.urgent) return 'bg-red-50';
  if (task.important) return 'bg-yellow-50';
  if (task.urgent) return 'bg-blue-50';
  return 'bg-green-50';
};

const toggleTaskStatus = async (task: Task) => {
  await taskStore.updateTask(task.id, { completed: !task.completed });
};

const handleTaskClick = (task: Task) => {
  editingTask.value = task;
  showEditDialog.value = true;
};
</script> 