<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 月份导航 -->
    <div class="flex justify-between items-center px-4 py-3 border-b">
      <h2 class="text-2xl font-normal">{{ currentMonth }}</h2>
      <div class="flex items-center gap-2">
        <button 
          @click="backToToday"
          class="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          {{ t('common.today') }}
        </button>
        <button 
          @click="previousMonth"
          class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 border rounded"
        >
          ‹
        </button>
        <button 
          @click="nextMonth"
          class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 border rounded"
        >
          ›
        </button>
      </div>
    </div>

    <!-- 星期标题 -->
    <div class="grid grid-cols-7 border-b">
      <div v-for="(day, index) in t('calendar.weekdays')" :key="index" 
        class="text-center py-2 text-sm text-gray-600">
        {{ day }}
      </div>
    </div>
    
    <!-- 日历格子 -->
    <div class="flex-1 grid grid-cols-7">
      <div
        v-for="date in calendarDays"
        :key="date.date"
        class="border-b border-r p-2 min-h-[100px] relative"
        :class="[
          !date.isCurrentMonth ? 'bg-gray-50' : 'bg-white',
        ]"
      >
        <div class="flex flex-col h-full">
          <!-- 日期显示 -->
          <div class="flex items-start justify-between mb-1">
            <div class="flex flex-col items-start">
              <span class="text-xs text-gray-400">{{ getDateInfo(date.date).lunarDate }}</span>
              <span :class="[
                'text-sm leading-none mt-1',
                isToday(date.date) ? 'text-red-500' : (date.isCurrentMonth ? 'text-gray-900' : 'text-gray-400')
              ]">
                {{ formatDayNumber(date.dayOfMonth) }}
              </span>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="space-y-1">
            <div
              v-for="task in getDateTasks(date.date)"
              :key="task.id"
              :class="[
                'task-item text-xs py-0.5 cursor-pointer truncate',
                getTaskColorClass(task)
              ]"
              :data-task-id="task.id"
              @click="handleTaskClick(task)"
            >
              <div class="flex items-center gap-1">
                <span class="task-dot"></span>
                {{ task.title }}
              </div>
            </div>
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
import { computed, onMounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { useTaskStore } from '@/stores/task';
import type { Task } from '@/types/task';
import { formatDate, isTaskExpired } from '@/utils/date';
import TaskEditDialog from './TaskEditDialog.vue';
import { t, currentLocale } from '@/locales';

const taskStore = useTaskStore();

// 添加编辑对话框相关的状态
const showEditDialog = ref(false);
const editingTask = ref<Task | null>(null);

// 当前显示的月份
const currentDate = ref(dayjs());

// 计算当前月份显示文本
const currentMonth = computed(() => {
  if (currentLocale.value === 'zh') {
    return currentDate.value.format('YYYY年M月');
  } else if (currentLocale.value === 'ja') {
    return currentDate.value.format('YYYY年M月');
  } else {
    return currentDate.value.format('MMMM YYYY');
  }
});

// 格式化日期数字
const formatDayNumber = (day: number) => {
  if (currentLocale.value === 'zh') {
    return `${day}日`;
  } else if (currentLocale.value === 'ja') {
    return `${day}日`;
  } else {
    return day;
  }
};

// 月份切换函数
const previousMonth = () => {
  currentDate.value = currentDate.value.subtract(1, 'month');
};

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month');
};

// 生成日历数据
const calendarDays = computed(() => {
  const startOfMonth = currentDate.value.startOf('month');
  const endOfMonth = currentDate.value.endOf('month');
  const days = [];
  let current = startOfMonth.startOf('week');
  const end = endOfMonth.endOf('week');

  while (current.isBefore(end)) {
    days.push({
      date: current.toDate(),
      dayOfMonth: current.date(),
      isCurrentMonth: current.month() === currentDate.value.month()
    });
    current = current.add(1, 'day');
  }
  
  return days;
});

// 判断是否是今天
const isToday = (date: Date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

// 获取指定日期的任务
const getDateTasks = (date: Date) => {
  const tasks = taskStore.tasks.filter(task => {
    const taskDate = dayjs(task.deadline);
    const compareDate = dayjs(date);
    return taskDate.format('YYYY-MM-DD') === compareDate.format('YYYY-MM-DD');
  });
  return tasks;
};

// 获取任务数量
const getTaskCount = (date: Date) => {
  return getDateTasks(date).length;
};

// 获取任务颜色类名
const getTaskColorClass = (task: Task) => {
  if (task.completed) return 'text-gray-400';
  if (task.important && task.urgent) return 'text-red-500';
  if (task.important) return 'text-yellow-600';
  if (task.urgent) return 'text-blue-500';
  return 'text-green-500';
};

// 处理任务点击
const handleTaskClick = (task: Task) => {
  editingTask.value = task;
  showEditDialog.value = true;
};

// 格式化任务详情
const formatTaskDetails = (task: Task) => {
  const reminderText = task.reminder ? `${t('task.reminder')}: ${task.reminder >= 60 ? task.reminder / 60 + t('time.hour') : task.reminder + t('time.minute')}` : t('task.noReminder');
  const repeatMap: Record<string, string> = {
    hourly: t('repeat.hourly'),
    daily: t('repeat.daily'),
    weekly: t('repeat.weekly'),
    monthly: t('repeat.monthly'),
    workdays: t('repeat.workdays'),
    weekends: t('repeat.weekends')
  };
  const repeatText = task.repeat ? repeatMap[task.repeat] : t('repeat.never');

  return `
    <div class="p-2">
      <div class="font-bold mb-1">${task.title}</div>
      <div class="text-sm mb-1">${task.description || t('task.noDescription')}</div>
      <div class="text-xs text-gray-500">
        ${t('task.deadline')}: ${formatDate(task.deadline)}
        <br>
        ${t('task.reminder')}: ${reminderText}
        <br>
        ${t('task.repeat')}: ${repeatText}
        <br>
        ${t('task.priority')}: ${task.important ? t('task.important') : t('task.notImportant')}${task.urgent ? t('task.andUrgent') : t('task.notUrgent')}
        <br>
        ${t('task.status')}: ${task.completed ? t('common.completed') : t('common.uncompleted')}
      </div>
    </div>
  `;
};

// 初始化提示
const initTooltips = () => {
  const taskElements = document.querySelectorAll('.task-item');
  taskElements.forEach(element => {
    const taskId = element.getAttribute('data-task-id');
    const task = taskStore.tasks.find(t => t.id === Number(taskId));
    if (task) {
      tippy(element, {
        content: formatTaskDetails(task),
        allowHTML: true,
        placement: 'right',
        interactive: true,
        theme: 'custom',
        delay: [200, 0], // 显示延迟200ms，隐藏无延迟
        maxWidth: 300
      });
    }
  });
};

// 在组件挂载和任务更新时初始化提示
onMounted(() => {
  setTimeout(initTooltips, 0);
});

// 监听任务变化
watch(() => taskStore.tasks, () => {
  // 等待DOM更新后重新初始化提示
  setTimeout(initTooltips, 0);
}, { deep: true });

// 监听语言变化
watch(currentLocale, () => {
  setTimeout(initTooltips, 0);
});

// 添加返回今天的功能
const backToToday = () => {
  currentDate.value = dayjs();
};

// 添加获取日期信息的函数
const getDateInfo = (date: Date) => {
  return {
    lunarDate: '', // 这里需要集成农历转换库
  };
};
</script>

<style scoped>
.task-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: currentColor;
}

.task-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item:hover {
  opacity: 0.8;
}

/* 移除最右侧的边框 */
.grid-cols-7 > div:nth-child(7n) {
  border-right: none;
}

/* 移除最后一行的底部边框 */
.grid-cols-7 > div:nth-last-child(-n+7) {
  border-bottom: none;
}
</style> 