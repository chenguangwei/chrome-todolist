import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import type { Task } from '@/types/task';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);

  // 从 Chrome storage 加载任务
  const loadTasks = async () => {
    try {
      const data = await chrome.storage.local.get('tasks');
      tasks.value = Array.isArray(data.tasks) ? data.tasks : [];
    } catch (error) {
      console.error('加载任务失败:', error);
      tasks.value = [];
    }
  };

  // 保存任务到 Chrome storage
  const saveTasks = async () => {
    try {
      await chrome.storage.local.set({ tasks: tasks.value });
    } catch (error) {
      console.error('保存任务失败:', error);
    }
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
      try {
        await chrome.alarms.create(`task-${newTask.id}`, {
          when: new Date(task.deadline).getTime()
        });
      } catch (error) {
        console.error('设置提醒失败:', error);
      }
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
    try {
      await chrome.alarms.clear(`task-${taskId}`);
    } catch (error) {
      console.error('清除提醒失败:', error);
    }
  };

  // 初始化时加载任务
  onMounted(() => {
    loadTasks();
  });

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    loadTasks,
    saveTasks
  };
}); 