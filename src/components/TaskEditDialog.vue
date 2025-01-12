<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-bold mb-4">编辑任务</h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          v-model="form.title"
          type="text"
          placeholder="任务标题"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <textarea
          v-model="form.description"
          placeholder="任务描述"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">截止日期</label>
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
              <span class="text-sm font-medium text-gray-700">重要</span>
            </label>
            
            <label class="flex items-center space-x-2">
              <input
                v-model="form.urgent"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">紧急</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            @click="handleDelete"
            class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            删除
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            取消
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            保存
          </button>
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
  (e: 'deleted'): void;
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
      description: newTask.description,
      deadline: dayjs(newTask.deadline).format('YYYY-MM-DDTHH:mm'),
      important: newTask.important,
      urgent: newTask.urgent
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (!props.task || !form.value.title || !form.value.deadline) {
    return;
  }

  await taskStore.updateTask(props.task.id, {
    ...form.value,
    deadline: new Date(form.value.deadline)
  });

  emit('update:show', false);
};

const handleCancel = () => {
  emit('update:show', false);
};

const handleDelete = async () => {
  if (!props.task) return;
  
  if (confirm('确定要删除这个任务吗？')) {
    await taskStore.deleteTask(props.task.id);
    emit('update:show', false);
    emit('deleted');
  }
};
</script> 