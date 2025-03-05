import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Task } from '@/types/task';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);
  const isInitialized = ref(false);

  const loadTasks = async () => {
    if (isInitialized.value) return;
    
    try {
      const result = await chrome.storage.sync.get('tasks');
      
      if (result.tasks) {
        if (Array.isArray(result.tasks)) {
          const formattedTasks = result.tasks.map(task => {
            const deadline = new Date(task.deadline);
            const createdAt = new Date(task.createdAt);
            
            return {
              id: Number(task.id),
              title: String(task.title),
              description: task.description ? String(task.description) : '',
              deadline,
              important: Boolean(task.important),
              urgent: Boolean(task.urgent),
              completed: Boolean(task.completed),
              createdAt
            };
          });
          
          tasks.value = formattedTasks;
        } else {
          tasks.value = [];
        }
      } else {
        tasks.value = [];
      }
      
      isInitialized.value = true;
    } catch (error) {
      tasks.value = [];
    }
  };

  const saveTasks = async () => {
    try {
      if (!Array.isArray(tasks.value)) {
        return;
      }

      const validTasks = tasks.value.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        deadline: new Date(task.deadline).toISOString(),
        important: Boolean(task.important),
        urgent: Boolean(task.urgent),
        completed: Boolean(task.completed),
        createdAt: new Date(task.createdAt).toISOString()
      }));

      await chrome.storage.sync.set({ tasks: validTasks });
    } catch (error) {
      // 静默处理错误
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now(),
      completed: false,
      createdAt: new Date()
    };
    tasks.value.push(newTask);
    await saveTasks();
    
    const deadlineTime = new Date(task.deadline).getTime();
    const now = Date.now();
    
    if (deadlineTime > now) {
      try {
        await chrome.alarms.create(`task-${newTask.id}`, {
          when: deadlineTime
        });
      } catch (error) {
        // 静默处理错误
      }
    }
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const oldTask = tasks.value[index];
      tasks.value[index] = { ...oldTask, ...updates };
      await saveTasks();

      try {
        if (updates.deadline && updates.deadline.getTime() !== oldTask.deadline.getTime()) {
          await chrome.alarms.clear(`task-${taskId}`);

          const deadlineTime = new Date(updates.deadline).getTime();
          const now = Date.now();
          
          if (deadlineTime > now && !tasks.value[index].completed) {
            await chrome.alarms.create(`task-${taskId}`, {
              when: deadlineTime
            });
          }
        }

        if (updates.completed && updates.completed !== oldTask.completed) {
          await chrome.alarms.clear(`task-${taskId}`);
        }
      } catch (error) {
        // 静默处理错误
      }
    }
  };

  const deleteTask = async (taskId: number) => {
    tasks.value = tasks.value.filter(t => t.id !== taskId);
    await saveTasks();
    try {
      await chrome.alarms.clear(`task-${taskId}`);
    } catch (error) {
      // 静默处理错误
    }
  };

  const $reset = () => {
    tasks.value = [];
    isInitialized.value = false;
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    loadTasks,
    saveTasks,
    $reset
  };
}); 