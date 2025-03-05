<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-bold mb-4">{{ t('task.editTask') }}</h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          v-model="form.title"
          type="text"
          :placeholder="t('task.title')"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <textarea
          v-model="form.description"
          :placeholder="t('task.description')"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">{{ t('task.deadline') }}</label>
            <input
              v-model="form.deadline"
              type="datetime-local"
              class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div class="space-y-2">
            <label class="flex items-center space-x-2">
              <input
                v-model="form.important"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">{{ t('task.important') }}</span>
            </label>
            
            <label class="flex items-center space-x-2">
              <input
                v-model="form.urgent"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">{{ t('task.urgent') }}</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-between pt-4">
          <button
            type="button"
            @click="handleDelete"
            class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {{ t('common.delete') }}
          </button>
          
          <div class="space-x-2">
            <button
              type="button"
              @click="handleCancel"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {{ t('common.cancel') }}
            </button>
            
            <button
              type="submit"
              class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ t('common.save') }}
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
import { t } from '@/locales';

const props = defineProps<{
  show: boolean;
  task: Task | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const taskStore = useTaskStore();

const form = ref({
  title: '',
  description: '',
  deadline: '',
  important: false,
  urgent: false
});

// 监听任务变化，更新表单
watch(() => props.task, (newTask) => {
  if (newTask) {
    form.value = {
      title: newTask.title,
      description: newTask.description || '',
      deadline: formatDateTimeForInput(newTask.deadline),
      important: newTask.important,
      urgent: newTask.urgent
    };
  }
}, { immediate: true });

// 格式化日期时间为input元素可用的格式
function formatDateTimeForInput(date: Date | string): string {
  const d = new Date(date);
  
  // 获取本地时区的年、月、日、时、分
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  // 按照 yyyy-MM-ddThh:mm 格式返回
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const handleSubmit = async () => {
  if (!props.task || !form.value.title || !form.value.deadline) {
    alert(t('task.pleaseComplete'));
    return;
  }

  await taskStore.updateTask(props.task.id, {
    title: form.value.title,
    description: form.value.description,
    deadline: new Date(form.value.deadline),
    important: form.value.important,
    urgent: form.value.urgent
  });

  emit('update:show', false);
};

const handleCancel = () => {
  emit('update:show', false);
};

const handleDelete = async () => {
  if (!props.task) return;
  
  if (confirm(t('task.deleteConfirm'))) {
    await taskStore.deleteTask(props.task.id);
    emit('update:show', false);
  }
};
</script> 