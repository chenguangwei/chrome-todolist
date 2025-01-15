<template>
  <div class="space-y-2">
    <div
      v-for="task in tasks"
      :key="task.id"
      class="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      @click="handleTaskClick(task)"
    >
      <div class="flex justify-between items-start">
        <h4 class="font-medium" :class="{'line-through': task.completed}">
          {{ task.title }}
          <span v-if="isTaskExpired(task.deadline)" class="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">
            {{ $t('task.status.expired') }}
          </span>
        </h4>
        <button
          @click.stop="toggleTaskStatus(task)"
          class="text-sm px-2 py-1 rounded"
          :class="task.completed ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'"
        >
          {{ task.completed ? $t('task.status.completed') : $t('task.status.uncompleted') }}
        </button>
      </div>
      
      <p v-if="task.description" class="text-sm text-gray-600 mt-1">
        {{ task.description }}
      </p>
      
      <div class="text-xs text-gray-500 mt-2">
        {{ $t('task.input.deadline') }}: {{ formatDate(task.deadline) }}
      </div>
    </div>
  </div>

  <TaskEditDialog
    v-model:show="showEditDialog"
    :task="editingTask"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTaskStore } from '@/stores/task';
import { formatDate, isTaskExpired } from '@/utils/date';
import type { Task } from '@/types/task';
import TaskEditDialog from './TaskEditDialog.vue';

const props = defineProps<{
  tasks: Task[]
}>();

const taskStore = useTaskStore();
const showEditDialog = ref(false);
const editingTask = ref<Task | null>(null);

const toggleTaskStatus = async (task: Task) => {
  await taskStore.updateTask(task.id, { completed: !task.completed });
};

const handleTaskClick = (task: Task) => {
  editingTask.value = task;
  showEditDialog.value = true;
};
</script> 