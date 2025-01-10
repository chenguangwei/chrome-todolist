class NotificationManager {
  constructor() {
    this.checkPermission();
  }

  async checkPermission() {
    const permission = await chrome.permissions.contains({
      permissions: ['notifications']
    });
    
    if (!permission) {
      console.warn('通知权限未获取');
    }
  }

  async createNotification(task) {
    const notificationId = `task-${task.id}`;
    
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: '/assets/icons/icon48.png',
      title: '任务提醒',
      message: `任务"${task.title}"即将到期`,
      buttons: [
        { title: '完成任务' },
        { title: '稍后提醒' }
      ],
      priority: 2
    });
  }

  async scheduleNotification(task) {
    const deadline = new Date(task.deadline).getTime();
    const now = Date.now();
    const reminderTime = deadline - (30 * 60 * 1000); // 提前30分钟提醒

    if (reminderTime > now) {
      await chrome.alarms.create(`task-${task.id}`, {
        when: reminderTime
      });
    }
  }
}

window.NotificationManager = NotificationManager; 