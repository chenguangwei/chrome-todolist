// 定义通知管理器类
class NotificationManager {
  async createNotification(task) {
    try {
      // 检查通知权限
      const permission = await chrome.permissions.contains({
        permissions: ['notifications']
      });
      
      if (!permission) {
        console.error('没有通知权限');
        return;
      }

      // 获取当前语言的翻译
      const translations = await this.getTranslations();

      // 创建通知
      return await chrome.notifications.create(`task-${task.id}`, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon128.png'),
        title: translations.taskReminder,
        message: `${task.title}\n${task.description || ''}`,
        buttons: [
          { title: translations.completeTask },
          { title: translations.remindLater }
        ],
        requireInteraction: true,
        priority: 2
      });
    } catch (error) {
      console.error('创建通知失败:', error);
    }
  }

  async getTranslations() {
    const result = await chrome.storage.local.get('locale');
    const locale = result.locale || 'en';
    
    const translations = {
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
    
    return translations[locale] || translations['en'];
  }
}

// 获取所有任务的辅助函数
const getTasks = async () => {
  try {
    const data = await chrome.storage.local.get('tasks');
    return Array.isArray(data.tasks) ? data.tasks : [];
  } catch (error) {
    return [];
  }
};

// 监听定时器触发
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const taskId = alarm.name.replace('task-', '');
  const data = await chrome.storage.local.get('tasks');
  const tasks = data.tasks || [];
  
  const task = tasks.find(t => t.id === parseInt(taskId));
  if (task) {
    console.log(`Alarm triggered: ${alarm.name}`);
    const notificationManager = new NotificationManager();
    await notificationManager.createNotification(task);
  }
});

// 监听通知按钮点击
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  const taskId = notificationId.replace('task-', '');
  const data = await chrome.storage.local.get('tasks');
  const tasks = data.tasks || [];
  const taskIndex = tasks.findIndex(t => t.id === parseInt(taskId));

  if (taskIndex !== -1) {
    if (buttonIndex === 0) {
      // 完成任务
      tasks[taskIndex].completed = true;
      await chrome.storage.local.set({ tasks });
    } else if (buttonIndex === 1) {
      // 稍后提醒（15分钟后）
      const notificationManager = new NotificationManager();
      const task = tasks[taskIndex];
      await chrome.alarms.create(`task-${task.id}`, {
        when: Date.now() + (15 * 60 * 1000)
      });
    }
  }
});

// 启动时重新注册所有提醒
chrome.runtime.onStartup.addListener(async () => {
  try {
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