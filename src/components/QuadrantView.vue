<template>
  <div class="grid grid-cols-2 gap-6 h-full p-6">
    <div v-for="(quadrant, index) in quadrants" :key="index" 
      class="rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 class="text-base font-medium mb-4 flex items-center" :class="quadrant.titleClass">
        <span class="w-2.5 h-2.5 rounded-full mr-2" :class="quadrant.dotClass"></span>
        {{ t(quadrant.titleKey) }}
        <span class="ml-auto text-xs text-gray-400 font-normal">{{ getQuadrantTasks(quadrant.important, quadrant.urgent).length }}{{ t('quadrant.tasks') }}</span>
      </h3>
      <div class="space-y-3 max-h-[calc(100%-3rem)] overflow-y-auto custom-scrollbar">
        <div
          v-for="task in getQuadrantTasks(quadrant.important, quadrant.urgent)"
          :key="task.id"
          class="group p-3 rounded-lg cursor-pointer transform transition-all duration-200 hover:-translate-y-0.5"
          :class="getTaskClass(task)"
          @click="handleTaskClick(task)"
        >
          <div class="flex justify-between items-start gap-3">
            <h4 class="text-sm flex-1" :class="{'line-through text-gray-400': task.completed}">
              {{ task.title }}
              <span v-if="isTaskExpired(task.deadline)" class="expired-tag">{{ t('common.expired') }}</span>
            </h4>
            <button
              @click.stop="toggleTaskStatus(task)"
              class="text-xs px-2 py-1 rounded-full transition-colors duration-200"
              :class="task.completed ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-600 hover:bg-green-100'"
            >
              {{ task.completed ? t('common.completed') : t('common.uncompleted') }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2 line-clamp-2" v-if="task.description">{{ task.description }}</p>
          <div class="text-xs text-gray-400 mt-2 flex items-center">
            <i class="ri-time-line mr-1"></i>
            {{ formatDate(task.deadline) }}
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
import { ref } from 'vue';
import { useTaskStore } from '@/stores/task';
import { formatDate, isTaskExpired } from '@/utils/date';
import type { Task } from '@/types/task';
import TaskEditDialog from './TaskEditDialog.vue';
import { t } from '@/locales';

const taskStore = useTaskStore();

// 添加编辑对话框相关的状态
const showEditDialog = ref(false);
const editingTask = ref<Task | null>(null);

const quadrants = [
  {
    titleKey: 'quadrant.importantUrgent',
    important: true,
    urgent: true,
    titleClass: 'text-red-600',
    dotClass: 'bg-red-600'
  },
  {
    titleKey: 'quadrant.importantNotUrgent',
    important: true,
    urgent: false,
    titleClass: 'text-yellow-600',
    dotClass: 'bg-yellow-600'
  },
  {
    titleKey: 'quadrant.urgentNotImportant',
    important: false,
    urgent: true,
    titleClass: 'text-blue-600',
    dotClass: 'bg-blue-600'
  },
  {
    titleKey: 'quadrant.notImportantNotUrgent',
    important: false,
    urgent: false,
    titleClass: 'text-green-600',
    dotClass: 'bg-green-600'
  }
];

const getQuadrantTasks = (important: boolean, urgent: boolean) => {
  return taskStore.tasks.filter(
    task => task.important === important && task.urgent === urgent
  );
};

const getTaskClass = (task: Task) => {
  if (task.completed) return 'bg-gray-50/80 border border-gray-100';
  if (task.important && task.urgent) return 'bg-red-50/60 hover:bg-red-50 border-l-[3px] border border-red-200 border-l-red-500';
  if (task.important) return 'bg-yellow-50/60 hover:bg-yellow-50 border-l-[3px] border border-yellow-200 border-l-yellow-500';
  if (task.urgent) return 'bg-blue-50/60 hover:bg-blue-50 border-l-[3px] border border-blue-200 border-l-blue-500';
  return 'bg-green-50/60 hover:bg-green-50 border-l-[3px] border border-green-200 border-l-green-500';
};

const toggleTaskStatus = async (task: Task) => {
  await taskStore.updateTask(task.id, { completed: !task.completed });
};

const handleTaskClick = (task: Task) => {
  editingTask.value = task;
  showEditDialog.value = true;
};
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.expired-tag {
  font-size: 10px;
  color: #ff4d4f;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  padding: 0 4px;
  border-radius: 4px;
  font-weight: normal;
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
}
</style> 