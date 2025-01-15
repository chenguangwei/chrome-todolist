<template>
  <div class="p-6">
    <!-- 月份和年份显示 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-800">
        {{ currentDate.format('YYYY年 M月') }}
      </h2>
      <div class="flex space-x-2">
        <button
          @click="changeMonth(-1)"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="changeMonth(1)"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-4">
      <!-- 星期标题 -->
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center font-medium text-gray-600 pb-2"
      >
        {{ day }}
      </div>
      
      <!-- 日历格子 -->
      <div
        v-for="date in calendarDates"
        :key="date.toISOString()"
        class="bg-white border rounded-lg shadow-sm transition-all hover:shadow-md relative"
        :class="{
          'bg-gray-50/50': !isCurrentMonth(date),
          'ring-2 ring-blue-500 ring-offset-2': isToday(date)
        }"
      >
        <div class="p-2 border-b bg-gradient-to-b from-gray-50">
          <div class="flex justify-between items-center">
            <span 
              class="text-sm font-medium" 
              :class="{ 
                'text-gray-400': !isCurrentMonth(date),
                'text-blue-600': isToday(date)
              }"
            >
              {{ formatDateNumber(date) }}
            </span>
            <span 
              v-if="getDateTasks(date).length > 0" 
              class="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium"
            >
              {{ getDateTasks(date).length }}
            </span>
          </div>
        </div>
        
        <div class="p-2 space-y-1 min-h-[80px] max-h-[120px] overflow-y-auto">
          <div
            v-for="task in getDateTasks(date)"
            :key="task.id"
            class="group relative"
          >
            <!-- 任务标题条 -->
            <div
              @click="handleTaskClick(task)"
              class="text-sm px-2 py-1.5 rounded cursor-pointer transition-all hover:translate-x-0.5 flex items-center gap-1"
              :class="{
                'bg-red-50 text-red-800 hover:bg-red-100 border border-red-100': task.important && task.urgent,
                'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-100': task.important && !task.urgent,
                'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-100': !task.important && task.urgent,
                'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-100': !task.important && !task.urgent,
                'opacity-60': task.completed
              }"
            >
              <span class="truncate flex-1" :class="{ 'line-through': task.completed }">{{ task.title }}</span>
              <span 
                v-if="task.completed" 
                class="flex-shrink-0 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full"
              >
                {{ $t('task.status.completed') }}
              </span>
            </div>

            <!-- 悬浮提示框 -->
            <div 
              class="absolute left-0 top-full mt-1 z-10 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200"
            >
              <div class="text-sm font-medium mb-1">{{ task.title }}</div>
              <div class="text-xs text-gray-600 mb-2">
                {{ dayjs(task.deadline).format('YYYY-MM-DD HH:mm') }}
              </div>
              <div class="text-xs text-gray-600 line-clamp-3">{{ task.description || '暂无描述' }}</div>
              <div class="flex gap-2 mt-2">
                <span 
                  v-if="task.important" 
                  class="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full"
                >
                  {{ $t('task.input.important') }}
                </span>
                <span 
                  v-if="task.urgent" 
                  class="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full"
                >
                  {{ $t('task.input.urgent') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TaskEditDialog
    v-model:show="showEditDialog"
    :task="editingTask"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { useTaskStore } from '@/stores/task';
import type { Task } from '@/types/task';
import TaskEditDialog from './TaskEditDialog.vue';

const taskStore = useTaskStore();
const showEditDialog = ref(false);
const editingTask = ref<Task | null>(null);
const currentDate = ref(dayjs());

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 生成日历日期数组
const calendarDates = computed(() => {
  const startOfMonth = currentDate.value.startOf('month');
  const startOfCalendar = startOfMonth.startOf('week');
  
  const dates: Date[] = [];
  for (let i = 0; i < 42; i++) {
    dates.push(startOfCalendar.add(i, 'day').toDate());
  }
  return dates;
});

// 切换月份
const changeMonth = (delta: number) => {
  currentDate.value = currentDate.value.add(delta, 'month');
};

// 获取指定日期的任务
const getDateTasks = (date: Date) => {
  return taskStore.tasks.filter(task => {
    const taskDate = dayjs(task.deadline);
    return taskDate.format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD');
  });
};

// 格式化日期数字
const formatDateNumber = (date: Date) => {
  return dayjs(date).format('D');
};

// 判断是否是当前月份
const isCurrentMonth = (date: Date) => {
  return dayjs(date).month() === currentDate.value.month();
};

// 判断是否是今天
const isToday = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
};

// 处理任务点击
const handleTaskClick = (task: Task) => {
  editingTask.value = task;
  showEditDialog.value = true;
};
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}

/* 确保悬浮提示框在滚动容器之上 */
.group:hover {
  z-index: 20;
}
</style> 