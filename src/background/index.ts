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
  if (alarm.name.startsWith('task-')) {
    const taskId = parseInt(alarm.name.replace('task-', ''));
    const data = await chrome.storage.local.get('tasks');
    const tasks = data.tasks || [];
    const task = tasks.find((t: { id: number }) => t.id === taskId);
    
    if (task && !task.completed) {
      try {
        // 创建通知
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
      } catch (error) {
        // 静默处理错误
      }
    }
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
    const result = await chrome.storage.local.get(['tasks', 'locale']);
    if (!result.tasks) {
      await chrome.storage.local.set({ tasks: [] });
    }
    
    // 初始化语言设置
    if (!result.locale) {
      // 尝试使用浏览器语言
      const browserLang = navigator.language.split('-')[0];
      if (['zh', 'en', 'ja'].includes(browserLang)) {
        await chrome.storage.local.set({ locale: browserLang });
      } else {
        // 默认使用英语
        await chrome.storage.local.set({ locale: 'en' });
      }
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

// 获取当前语言的翻译
type TranslationKey = 'taskReminder' | 'taskExpired' | 'completeTask' | 'remindLater';
type SupportedLocale = 'zh' | 'en' | 'ja';

async function getTranslation(key: TranslationKey): Promise<string> {
  const result = await chrome.storage.local.get('locale');
  const locale = (result.locale as SupportedLocale) || 'en';
  
  const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
    zh: {
      taskReminder: '任务提醒',
      taskExpired: '任务已到期',
      completeTask: '完成任务',
      remindLater: '稍后提醒(15分钟)'
    },
    en: {
      taskReminder: 'Task Reminder',
      taskExpired: 'Task Expired',
      completeTask: 'Complete Task',
      remindLater: 'Remind Later (15 min)'
    },
    ja: {
      taskReminder: 'タスクリマインダー',
      taskExpired: 'タスク期限切れ',
      completeTask: '完了',
      remindLater: '後で通知（15分後）'
    }
  };
  
  return translations[locale][key] || translations['en'][key];
}

// 导入 background.js
import './background.js'; 