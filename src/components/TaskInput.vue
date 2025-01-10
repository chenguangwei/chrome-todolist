<template>
  <div class="task-input bg-gray-100 rounded-lg p-4 mb-5">
    <input
      v-model="taskForm.title"
      type="text"
      placeholder="任务标题"
      class="w-full px-3 py-2 border rounded mb-2"
    />
    <textarea
      v-model="taskForm.description"
      placeholder="任务描述"
      class="w-full px-3 py-2 border rounded mb-2"
    />
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div>
        <label class="block text-sm mb-1">截止日期：</label>
        <input
          v-model="taskForm.deadline"
          type="datetime-local"
          class="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">重要性：</label>
        <input
          v-model="taskForm.important"
          type="checkbox"
          class="form-checkbox"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">紧急性：</label>
        <input
          v-model="taskForm.urgent"
          type="checkbox"
          class="form-checkbox"
        />
      </div>
    </div>
    <button
      @click="handleAddTask"
      class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
    >
      添加任务
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Task } from '@/types/task';
import { useTaskStore } from '@/stores/task';

const taskStore = useTaskStore();

const taskForm = reactive({
  title: '',
  description: '',
  deadline: '',
  important: false,
  urgent: false
});

const handleAddTask = async () => {
  if (!taskForm.title || !taskForm.deadline) {
    alert('请填写任务标题和截止时间！');
    return;
  }

  const task: Task = {
    id: Date.now(),
    ...taskForm,
    completed: false,
    createdAt: new Date()
  };

  await taskStore.addTask(task);
  
  // 重置表单
  taskForm.title = '';
  taskForm.description = '';
  taskForm.deadline = '';
  taskForm.important = false;
  taskForm.urgent = false;
};
</script> 