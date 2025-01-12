import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Task } from '@/types/task';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);

  // 从 Chrome storage 加载任务
  const loadTasks = async () => {
    const data = await chrome.storage.local.get('tasks');
    tasks.value = data.tasks || [];
  };

  // 保存任务到 Chrome storage
  const saveTasks = async () => {
    await chrome.storage.local.set({ tasks: tasks.value });
  };

  // 添加任务
  const addTask = async (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      completed: false,
      createdAt: new Date()
    };
    tasks.value.push(newTask);
    await saveTasks();
    
    // 设置提醒
    if (new Date(task.deadline).getTime() > Date.now()) {
      await chrome.alarms.create(`task-${newTask.id}`, {
        when: new Date(task.deadline).getTime()
      });
    }
  };

  // 更新任务
  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates };
      await saveTasks();
    }
  };

  // 删除任务
  const deleteTask = async (taskId: number) => {
    tasks.value = tasks.value.filter(t => t.id !== taskId);
    await saveTasks();
    await chrome.alarms.clear(`task-${taskId}`);
  };

  // 初始化加载任务
  loadTasks();

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    loadTasks
  };
}); 