<template>
  <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-4">
    <div class="space-y-4">
      <div>
        <input
          v-model="formState.title"
          type="text"
          :placeholder="$t('task.input.title')"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div class="flex items-center gap-8">
        <div class="w-2/5">
          <input
            v-model="formState.deadline"
            type="datetime-local"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div class="text-xs text-gray-500 mt-1">{{ $t('task.input.deadline') }}</div>
        </div>

        <div class="flex-1 flex items-center justify-around">
          <label class="relative flex items-center group">
            <input
              v-model="formState.important"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            <span class="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
              {{ $t('task.input.important') }}
            </span>
          </label>
          
          <label class="relative flex items-center group">
            <input
              v-model="formState.urgent"
              type="checkbox"
              class="sr-only peer"
            />
            <div class="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            <span class="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
              {{ $t('task.input.urgent') }}
            </span>
          </label>
        </div>
      </div>
      
      <div>
        <textarea
          v-model="formState.description"
          :placeholder="$t('task.input.description')"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
        ></textarea>
      </div>
      
      <div class="flex justify-end">
        <button
          type="submit"
          class="w-full px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
        >
          {{ $t('task.input.addButton') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useTaskStore } from '@/stores/task';
import dayjs from 'dayjs';

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
  deadline: dayjs().format('YYYY-MM-DDTHH:mm'),
  important: false,
  urgent: false
});

const emit = defineEmits(['submit']);

const handleSubmit = async () => {
  await taskStore.addTask({
    title: formState.value.title,
    description: formState.value.description,
    deadline: new Date(formState.value.deadline).getTime(),
    important: formState.value.important,
    urgent: formState.value.urgent,
    completed: false
  });

  // 重置表单
  formState.value = {
    title: '',
    description: '',
    deadline: dayjs().format('YYYY-MM-DDTHH:mm'),
    important: false,
    urgent: false
  };

  // 发出提交事件
  emit('submit');
};

// 加载上次未完成的表单数据
onMounted(async () => {
  try {
    const result = await chrome.storage.local.get('taskForm');
    if (result.taskForm) {
      formState.value = {
        ...formState.value,
        ...result.taskForm
      };
    }
  } catch (error) {
    console.error('加载表单数据失败:', error);
  }
});

// 自动保存表单数据
const saveFormState = async () => {
  try {
    await chrome.storage.local.set({ taskForm: formState.value });
  } catch (error) {
    console.error('保存表单数据失败:', error);
  }
};

// 监听表单变化并保存
watch(formState, saveFormState, { deep: true });
</script> 