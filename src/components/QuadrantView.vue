<template>
  <div class="grid grid-cols-2 grid-rows-2 gap-4 h-[400px]">
    <div
      v-for="quadrant in quadrants"
      :key="quadrant.id"
      :class="[
        'p-4 rounded-lg',
        quadrant.bgClass
      ]"
    >
      <h3 class="text-lg font-semibold mb-3">{{ quadrant.title }}</h3>
      <div class="task-list">
        <TaskCard
          v-for="task in getTasksByQuadrant(quadrant.id)"
          :key="task.id"
          :task="task"
          @update="handleUpdateTask"
          @delete="handleDeleteTask"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { QuadrantType } from '@/types/task';
import { useTaskStore } from '@/stores/task';
import TaskCard from './TaskCard.vue';

const taskStore = useTaskStore();

const quadrants = [
  {
    id: QuadrantType.ImportantUrgent,
    title: '重要且紧急',
    bgClass: 'bg-red-50'
  },
  {
    id: QuadrantType.ImportantNotUrgent,
    title: '重要不紧急',
    bgClass: 'bg-yellow-50'
  },
  {
    id: QuadrantType.NotImportantUrgent,
    title: '紧急不重要',
    bgClass: 'bg-blue-50'
  },
  {
    id: QuadrantType.NotImportantNotUrgent,
    title: '不重要不紧急',
    bgClass: 'bg-green-50'
  }
];

const getTasksByQuadrant = (quadrant: QuadrantType) => {
  return taskStore.getTasksByQuadrant(quadrant);
};

const handleUpdateTask = async (task) => {
  await taskStore.updateTask(task);
};

const handleDeleteTask = async (taskId) => {
  await taskStore.deleteTask(taskId);
};

onMounted(async () => {
  await taskStore.loadTasks();
});
</script> 