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

      // 创建通知
      return await chrome.notifications.create(`task-${task.id}`, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icons/icon128.png'),
        title: '任务提醒',
        message: `任务"${task.title}"已到期\n${task.description || ''}`,
        buttons: [
          { title: '完成任务' },
          { title: '稍后提醒(15分钟)' }
        ],
        requireInteraction: true,
        priority: 2
      });
    } catch (error) {
      console.error('创建通知失败:', error);
    }
  }
} 