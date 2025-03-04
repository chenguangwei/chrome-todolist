import type { Task } from '@/types/task';

export class NotificationManager {
  async createNotification(task: Task) {
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

  private async getTranslations() {
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