<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-bold mb-4">{{ $t('task.edit.title') }}</h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <input
            v-model="formState.title"
            type="text"
            :placeholder="$t('task.input.title')"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <textarea
            v-model="formState.description"
            :placeholder="$t('task.input.description')"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          ></textarea>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <input
              v-model="formState.deadline"
              type="datetime-local"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div class="text-xs text-gray-500 mt-1">{{ $t('task.input.deadline') }}</div>
          </div>
          
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2">
              <input
                v-model="formState.important"
                type="checkbox"
                class="form-checkbox h-4 w-4 text-blue-500"
              />
              <span>{{ $t('task.input.important') }}</span>
            </label>
            
            <label class="flex items-center space-x-2">
              <input
                v-model="formState.urgent"
                type="checkbox"
                class="form-checkbox h-4 w-4 text-blue-500"
              />
              <span>{{ $t('task.input.urgent') }}</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-between pt-4">
          <button
            type="button"
            @click="handleDelete"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            {{ $t('task.edit.delete') }}
          </button>
          
          <div class="space-x-2">
            <button
              type="button"
              @click="$emit('update:show', false)"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {{ $t('task.edit.cancel') }}
            </button>
            
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {{ $t('task.edit.save') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTaskStore } from '@/stores/task';
import type { Task } from '@/types/task';
import dayjs from 'dayjs';

const props = defineProps<{
  show: boolean;
  task: Task | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const taskStore = useTaskStore();

interface FormState {
  title: string;
  description: string;
  deadline: string;
  important: boolean;
  urgent: boolean;
}

const formState = ref<FormState>({
  title: '',
  description: '',
  deadline: '',
  important: false,
  urgent: false
});

// 监听 task 变化，更新表单状态
watch(() => props.task, (newTask) => {
  if (newTask) {
    formState.value = {
      title: newTask.title,
      description: newTask.description,
      deadline: dayjs(newTask.deadline).format('YYYY-MM-DDTHH:mm'),
      important: newTask.important,
      urgent: newTask.urgent
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (!props.task) return;
  
  await taskStore.updateTask(props.task.id, {
    title: formState.value.title,
    description: formState.value.description,
    deadline: new Date(formState.value.deadline).getTime(),
    important: formState.value.important,
    urgent: formState.value.urgent
  });
  
  emit('update:show', false);
};

const handleDelete = async () => {
  if (!props.task || !confirm(t('task.edit.confirmDelete'))) return;
  
  await taskStore.deleteTask(props.task.id);
  emit('update:show', false);
};
</script> 