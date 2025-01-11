import { Task } from '@/types/task';

export class NotificationManager {
  async createNotification(task: Task) {
    return chrome.notifications.create(`task-${task.id}`, {
      type: 'basic',
      iconUrl: '/assets/icons/icon128.png',
      title: '任务提醒',
      message: task.title,
      buttons: [
        { title: '完成任务' },
        { title: '稍后提醒' }
      ],
      requireInteraction: true
    });
  }
} 