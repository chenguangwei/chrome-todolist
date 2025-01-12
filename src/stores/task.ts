import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Task } from '@/types/task';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);
  const isInitialized = ref(false);

  // 重置 store 状态
  const $reset = () => {
    tasks.value = [];
    isInitialized.value = false;
  };

  // 从 Chrome storage 加载任务
  const loadTasks = async () => {
    if (isInitialized.value) {
      console.log('Store 已经初始化，跳过加载');
      return;
    }
    
    try {
      console.log('开始加载任务...');
      const result = await chrome.storage.local.get('tasks');
      console.log('从storage获取的原始数据:', result);
      
      if (result.tasks) {
        // 验证并格式化任务数据
        if (Array.isArray(result.tasks)) {
          const formattedTasks = result.tasks.map(task => {
            // 确保日期是正确的格式
            const deadline = new Date(task.deadline);
            const createdAt = new Date(task.createdAt);
            
            console.log('格式化任务日期:', {
              taskId: task.id,
              originalDeadline: task.deadline,
              formattedDeadline: deadline,
              originalCreatedAt: task.createdAt,
              formattedCreatedAt: createdAt
            });
            
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
          console.log('格式化后的任务列表:', JSON.stringify(formattedTasks, null, 2));
        } else {
          console.error('获取的任务数据不是数组:', result.tasks);
          tasks.value = [];
        }
      } else {
        console.log('没有找到任务数据，初始化为空数组');
        tasks.value = [];
      }
      
      console.log('最终设置的任务列表:', tasks.value);
      isInitialized.value = true;
    } catch (error) {
      console.error('加载任务失败:', error);
      tasks.value = [];
    }
  };

  // 保存任务到 Chrome storage
  const saveTasks = async () => {
    try {
      console.log('准备保存任务列表，当前任务数:', tasks.value.length);
      
      // 确保任务列表是数组
      if (!Array.isArray(tasks.value)) {
        console.error('任务列表不是数组:', tasks.value);
        return;
      }

      // 检查每个任务的格式
      const validTasks = tasks.value.map(task => {
        // 确保日期是 ISO 字符串格式
        const deadline = new Date(task.deadline).toISOString();
        const createdAt = new Date(task.createdAt).toISOString();
        
        console.log('保存任务日期:', {
          taskId: task.id,
          deadline,
          createdAt
        });
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          deadline,
          important: Boolean(task.important),
          urgent: Boolean(task.urgent),
          completed: Boolean(task.completed),
          createdAt
        };
      });

      console.log('格式化后的任务列表:', JSON.stringify(validTasks, null, 2));
      await chrome.storage.local.set({ tasks: validTasks });
      console.log('任务保存成功');

      // 验证保存是否成功
      const savedData = await chrome.storage.local.get('tasks');
      console.log('验证保存的数据:', savedData);
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
        console.log('提醒已设置:', newTask.id, new Date(task.deadline));
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