<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <div class="space-y-4">
      <input
        v-model="title"
        type="text"
        placeholder="任务标题"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <textarea
        v-model="description"
        placeholder="任务描述"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
      ></textarea>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">截止日期</label>
          <input
            v-model="deadline"
            type="datetime-local"
            class="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div class="space-y-2">
          <label class="flex items-center space-x-2">
            <input
              v-model="important"
              type="checkbox"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">重要</span>
          </label>
          
          <label class="flex items-center space-x-2">
            <input
              v-model="urgent"
              type="checkbox"
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">紧急</span>
          </label>
        </div>
      </div>
      
      <button
        @click="handleSubmit"
        class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        添加任务
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTaskStore } from '@/stores/task';

const taskStore = useTaskStore();

const title = ref('');
const description = ref('');
const deadline = ref('');
const important = ref(false);
const urgent = ref(false);

const handleSubmit = async () => {
  if (!title.value || !deadline.value) {
    alert('请填写任务标题和截止时间！');
    return;
  }

  await taskStore.addTask({
    title: title.value,
    description: description.value,
    deadline: new Date(deadline.value),
    important: important.value,
    urgent: urgent.value
  });

  // 清空表单
  title.value = '';
  description.value = '';
  deadline.value = '';
  important.value = false;
  urgent.value = false;
};
</script> 