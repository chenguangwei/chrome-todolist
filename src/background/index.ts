/// <reference types="chrome"/>
import type { Task } from '@/types/task';

// 从 storage 获取任务列表
const getTasks = async (): Promise<Task[]> => {
  try {
    const result = await chrome.storage.local.get('tasks');
    return Array.isArray(result.tasks) ? result.tasks : [];
  } catch (error) {
    return [];
  }
};

// 监听定时器触发
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    const taskId = parseInt(alarm.name.replace('task-', ''));
    if (isNaN(taskId)) return;

    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task && !task.completed) {
      const notificationId = `task-${task.id}`;
      await chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: '/assets/icons/icon128.png',
        title: '任务提醒',
        message: `${task.title}\n${task.description || ''}`,
        buttons: [
          { title: '完成任务' },
          { title: '稍后提醒' }
        ],
        requireInteraction: true,
        priority: 2
      });
    }
  } catch (error) {
    // 静默处理错误
  }
});

// 监听通知按钮点击
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  try {
    const taskId = parseInt(notificationId.replace('task-', ''));
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
      if (buttonIndex === 0) {
        // 完成任务
        tasks[taskIndex].completed = true;
        await chrome.storage.local.set({ tasks });
      } else if (buttonIndex === 1) {
        // 稍后提醒（15分钟后）
        await chrome.alarms.create(`task-${tasks[taskIndex].id}`, {
          when: Date.now() + (15 * 60 * 1000)
        });
      }
    }
  } catch (error) {
    // 静默处理错误
  }
});

// 在扩展启动时检查所有 alarms
chrome.runtime.onStartup.addListener(async () => {
  try {
    const tasks = await getTasks();
    const now = Date.now();

    // 重新设置未完成任务的提醒
    for (const task of tasks) {
      if (!task.completed) {
        const deadline = new Date(task.deadline).getTime();
        if (deadline > now) {
          await chrome.alarms.create(`task-${task.id}`, {
            when: deadline
          });
        }
      }
    }
  } catch (error) {
    // 静默处理错误
  }
});

// 安装/更新时的处理
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // 初始化存储
    const result = await chrome.storage.local.get('tasks');
    if (!result.tasks) {
      await chrome.storage.local.set({ tasks: [] });
    }
    
    // 重新注册所有提醒
    const tasks = await getTasks();
    const now = Date.now();
    
    for (const task of tasks) {
      if (!task.completed) {
        const deadline = new Date(task.deadline).getTime();
        if (deadline > now) {
          await chrome.alarms.create(`task-${task.id}`, {
            when: deadline
          });
        }
      }
    }
  } catch (error) {
    // 静默处理错误
  }
}); 