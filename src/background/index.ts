/// <reference types="chrome"/>
import { NotificationManager } from '../components/Notification';
import type { Task } from '@/types/task';

// 从 storage 获取任务列表
const getTasks = async (): Promise<Task[]> => {
  try {
    console.log('background: 开始获取任务...');
    const result = await chrome.storage.local.get('tasks');
    console.log('background: 获取到的数据:', result);
    return Array.isArray(result.tasks) ? result.tasks : [];
  } catch (error) {
    console.error('background: 获取任务失败:', error);
    return [];
  }
};

// 监听定时器触发
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    console.log('收到 alarm 事件:', {
      name: alarm.name,
      scheduledTime: new Date(alarm.scheduledTime),
      currentTime: new Date()
    });

    const taskId = parseInt(alarm.name.replace('task-', ''));
    if (isNaN(taskId)) {
      console.log('无效的任务ID');
      return;
    }

    const tasks = await getTasks();
    console.log('获取到的所有任务:', tasks);
    const task = tasks.find(t => t.id === taskId);
    console.log('找到的任务:', task);
    
    if (task && !task.completed) {
      console.log('准备显示通知:', task);
      
      // 检查通知权限
      const permission = await chrome.permissions.contains({
        permissions: ['notifications']
      });
      
      console.log('通知权限状态:', permission);
      
      if (!permission) {
        console.error('没有通知权限，请在 Chrome 设置中允许通知');
        return;
      }

      // 创建通知
      const notificationOptions = {
        type: 'basic' as chrome.notifications.TemplateType,
        iconUrl: chrome.runtime.getURL('assets/icons/icon128.png'),
        title: '任务提醒',
        message: `任务"${task.title}"已到期\n${task.description || ''}`,
        buttons: [
          { title: '完成任务' },
          { title: '稍后提醒(15分钟)' }
        ],
        requireInteraction: true,
        priority: 2,
        silent: false
      };

      console.log('通知选项:', notificationOptions);

      try {
        console.log('开始创建通知...');
        const notificationId = await chrome.notifications.create(
          `task-${task.id}`,
          notificationOptions
        );
        console.log('通知已创建，ID:', notificationId);
      } catch (err: any) {
        console.error('创建通知失败:', err);
        console.error('错误详情:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
    } else {
      console.log('任务不存在或已完成:', taskId);
    }
  } catch (err: any) {
    console.error('处理提醒失败:', err);
    console.error('错误详情:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
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
    console.error('处理通知按钮点击失败:', error);
  }
});

// 在扩展启动时检查所有 alarms
chrome.runtime.onStartup.addListener(async () => {
  try {
    console.log('扩展启动，检查所有提醒...');
    const alarms = await chrome.alarms.getAll();
    console.log('当前所有提醒:', alarms);

    // 获取所有任务
    const tasks = await getTasks();
    console.log('当前所有任务:', tasks);

    // 重新设置未完成任务的提醒
    const now = Date.now();
    for (const task of tasks) {
      if (!task.completed) {
        const deadline = new Date(task.deadline).getTime();
        if (deadline > now) {
          await chrome.alarms.create(`task-${task.id}`, {
            when: deadline
          });
          console.log('重新设置提醒:', {
            taskId: task.id,
            deadline: new Date(deadline)
          });
        }
      }
    }
  } catch (error) {
    console.error('启动时检查提醒失败:', error);
  }
});

// 安装/更新时的处理
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('扩展已安装/更新:', details.reason);
  try {
    // 初始化存储
    const result = await chrome.storage.local.get('tasks');
    console.log('当前存储的数据:', result);
    
    if (!result.tasks) {
      console.log('初始化任务列表...');
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
          console.log('重新设置提醒:', task.id, new Date(deadline));
        }
      }
    }
  } catch (error) {
    console.error('初始化失败:', error);
  }
}); 