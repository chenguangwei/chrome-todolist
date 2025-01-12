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
              'text-xs p-1 rounded cursor-pointer truncate',
              getTaskColorClass(task)
            ]"
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
import { computed } from 'vue';
import dayjs from 'dayjs';
import { useTaskStore } from '@/stores/task';
import type { Task } from '@/types/task';

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
  return taskStore.tasks.filter(task => 
    dayjs(task.deadline).isSame(date, 'day')
  );
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
  // TODO: 显示任务详情或编辑对话框
  console.log('Task clicked:', task);
};
</script> 