<template>
  <div class="h-full flex flex-col bg-white p-6">
    <!-- 月份导航 -->
    <div class="flex justify-between items-center mb-6 px-2">
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-medium">{{ currentMonth }}</h2>
        <button 
          @click="backToToday"
          class="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
        >
          今天
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button 
          @click="previousMonth"
          class="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          ‹
        </button>
        <button 
          @click="nextMonth"
          class="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          ›
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 mb-2">
      <div v-for="day in weekDays" :key="day" class="text-center text-sm text-gray-500 font-medium p-2">
        {{ day }}
      </div>
    </div>
    
    <div class="flex-1 grid grid-cols-7 gap-[1px] overflow-auto bg-gray-100">
      <div
        v-for="date in calendarDays"
        :key="date.date"
        :class="[
          'p-3 min-h-[120px] bg-white hover:bg-gray-50 transition-colors duration-200',
          isToday(date.date) ? 'relative ring-2 ring-blue-500 ring-inset' : '',
          !date.isCurrentMonth ? 'bg-gray-50/50' : ''
        ]"
      >
        <div class="flex justify-between items-center mb-2">
          <span :class="[
            'flex items-center justify-center text-sm w-7 h-7 rounded-full',
            isToday(date.date) ? 'bg-blue-500 text-white font-medium' : 'text-gray-700'
          ]">
            {{ date.dayOfMonth }}
          </span>
          <span v-if="getTaskCount(date.date) > 0" class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
            {{ getTaskCount(date.date) }}
          </span>
        </div>
        
        <div class="space-y-1.5">
          <div
            v-for="task in getDateTasks(date.date)"
            :key="task.id"
            :class="[
              'task-item text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-200 hover:translate-x-0.5',
              getTaskColorClass(task)
            ]"
            :data-task-id="task.id"
            @click="handleTaskClick(task)"
          >
            <div class="task-title line-clamp-1">
              {{ task.title }}
              <span v-if="isTaskExpired(task.deadline)" class="expired-tag">过期</span>
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

const taskStore = useTaskStore();

// 添加编辑对话框相关的状态
const showEditDialog = ref(false);
const editingTask = ref<Task | null>(null);

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 当前显示的月份
const currentDate = ref(dayjs());

// 计算当前月份显示文本
const currentMonth = computed(() => {
  return currentDate.value.format('YYYY年M月');
});

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
  editingTask.value = task;
  showEditDialog.value = true;
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

// 添加返回今天的功能
const backToToday = () => {
  currentDate.value = dayjs();
};
</script> 

<style>
/* 自定义提示样式 */
.tippy-box[data-theme~='custom'] {
  background-color: white;
  color: black;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tippy-box[data-theme~='custom'] .tippy-arrow {
  color: white;
}

.tippy-box[data-theme~='custom'] .tippy-content {
  padding: 0;
}

.task-title {
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 4px;
}

.expired-tag {
  font-size: 10px;
  color: #ff4d4f;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  padding: 0 4px;
  border-radius: 4px;
  font-weight: normal;
}

/* 任务卡片样式 */
.task-item {
  border-left: 3px solid transparent;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 更新任务颜色类 */
.task-item.bg-red-100 {
  background-color: #fff2f0;
  border-left-color: #ff4d4f;
}

.task-item.bg-yellow-100 {
  background-color: #feffe6;
  border-left-color: #faad14;
}

.task-item.bg-blue-100 {
  background-color: #e6f4ff;
  border-left-color: #1890ff;
}

.task-item.bg-green-100 {
  background-color: #f6ffed;
  border-left-color: #52c41a;
}

.task-item.bg-gray-100 {
  background-color: #fafafa;
  border-left-color: #d9d9d9;
}
</style> 