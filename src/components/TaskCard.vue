<template>
  <div class="bg-white p-3 rounded shadow-sm mb-2">
    <div class="flex justify-between items-start">
      <h4 class="font-medium">{{ task.title }}</h4>
      <div class="flex gap-2">
        <button
          @click="handleEdit"
          class="text-gray-500 hover:text-blue-500"
        >
          <i class="ri-edit-line"></i>
        </button>
        <button
          @click="handleDelete"
          class="text-gray-500 hover:text-red-500"
        >
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    </div>
    <p class="text-sm text-gray-600 mt-1">{{ task.description }}</p>
    <div class="mt-2 text-sm text-gray-500">
      <time>{{ formatDate(task.deadline) }}</time>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Task } from '@/types/task';
import { formatDate } from '@/utils/date';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'update', task: Task): void;
  (e: 'delete', taskId: number): void;
}>();

const handleEdit = () => {
  emit('update', props.task);
};

const handleDelete = () => {
  emit('delete', props.task.id);
};
</script> 