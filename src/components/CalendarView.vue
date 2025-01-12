<template>
  <div class="h-full flex flex-col">
    <div class="grid grid-cols-7 gap-1 mb-4">
      <div v-for="day in weekDays" :key="day" class="text-center font-bold p-2">
        {{ day }}
      </div>
    </div>
    
    <div class="flex-1 grid grid-cols-7 gap-1 overflow-auto">
      <div
        v-for="date in calendarDays"
        :key="date.date"
        :class="[
          'p-2 min-h-[100px] border rounded',
          isToday(date.date) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
        ]"
      >
        <div class="flex justify-between items-center mb-2">
          <span :class="{'text-blue-600 font-bold': isToday(date.date)}">
            {{ date.dayOfMonth }}
          </span>
          <span class="text-xs text-gray-500">
            {{ getTaskCount(date.date) }}个任务
          </span>
        </div>
        
        <div class="space-y-1">
          <div
            v-for="task in getDateTasks(date.date)"
            :key="task.id"
            :class="[
              'task-item text-xs p-1 rounded cursor-pointer truncate',
              getTaskColorClass(task)
            ]"
            :data-task-id="task.id"
            @click="handleTaskClick(task)"
          >
            {{ task.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import dayjs from 'dayjs';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { useTaskStore } from '@/stores/task';
import type { Task } from '@/types/task';
import { formatDate } from '@/utils/date';

const taskStore = useTaskStore();

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const today = dayjs();
const startOfMonth = today.startOf('month');
const endOfMonth = today.endOf('month');

// 生成日历数据
const calendarDays = computed(() => {
  const days = [];
  let current = startOfMonth.startOf('week');
  const end = endOfMonth.endOf('week');

  while (current.isBefore(end)) {
    days.push({
      date: current.toDate(),
      dayOfMonth: current.date(),
      isCurrentMonth: current.month() === today.month()
    });
    current = current.add(1, 'day');
  }
  
  return days;
});

// 判断是否是今天
const isToday = (date: Date) => {
  return dayjs(date).isSame(today, 'day');
};

// 获取指定日期的任务
const getDateTasks = (date: Date) => {
  console.log('正在获取日期的任务:', dayjs(date).format('YYYY-MM-DD'));
  const tasks = taskStore.tasks.filter(task => {
    const taskDate = dayjs(task.deadline);
    const compareDate = dayjs(date);
    const isSameDay = taskDate.format('YYYY-MM-DD') === compareDate.format('YYYY-MM-DD');
    console.log('比较任务:', {
      taskTitle: task.title,
      taskDate: taskDate.format('YYYY-MM-DD HH:mm:ss'),
      compareDate: compareDate.format('YYYY-MM-DD'),
      isSameDay
    });
    return isSameDay;
  });
  console.log('找到的任务:', tasks);
  return tasks;
};

// 获取任务数量
const getTaskCount = (date: Date) => {
  return getDateTasks(date).length;
};

// 获取任务颜色类名
const getTaskColorClass = (task: Task) => {
  if (task.completed) return 'bg-gray-100 text-gray-500 line-through';
  if (task.important && task.urgent) return 'bg-red-100 text-red-800';
  if (task.important) return 'bg-yellow-100 text-yellow-800';
  if (task.urgent) return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800';
};

// 处理任务点击
const handleTaskClick = (task: Task) => {
  console.log('点击任务:', task);
};

// 格式化任务详情
const formatTaskDetails = (task: Task) => {
  return `
    <div class="p-2">
      <div class="font-bold mb-1">${task.title}</div>
      <div class="text-sm mb-1">${task.description || '无描述'}</div>
      <div class="text-xs text-gray-500">
        截止时间: ${formatDate(task.deadline)}
        <br>
        优先级: ${task.important ? '重要' : '不重要'}${task.urgent ? '且紧急' : '不紧急'}
        <br>
        状态: ${task.completed ? '已完成' : '未完成'}
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
  console.log('日历视图加载，当前任务列表:', taskStore.tasks);
  // 等待DOM更新后初始化提示
  setTimeout(initTooltips, 0);
});

// 监听任务变化
watch(() => taskStore.tasks, () => {
  // 等待DOM更新后重新初始化提示
  setTimeout(initTooltips, 0);
}, { deep: true });
</script> 

<style>
/* 自定义提示样式 */
.tippy-box[data-theme~='custom'] {
  background-color: white;
  color: black;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.tippy-box[data-theme~='custom'] .tippy-arrow {
  color: white;
}

.tippy-box[data-theme~='custom'] .tippy-content {
  padding: 0;
}
</style> 