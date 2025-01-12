import { NotificationManager } from '../components/Notification';

// 监听定时器触发
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const taskId = alarm.name.replace('task-', '');
  const data = await chrome.storage.local.get('tasks');
  const tasks = data.tasks || [];
  
  const task = tasks.find(t => t.id === parseInt(taskId));
  if (task && !task.completed) {
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
      const task = tasks[taskIndex];
      await chrome.alarms.create(`task-${task.id}`, {
        when: Date.now() + (15 * 60 * 1000)
      });
    }
  }
});

// 初始化时设置所有未完成任务的提醒
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get('tasks');
  const tasks = data.tasks || [];
  
  const now = Date.now();
  tasks.forEach(task => {
    if (!task.completed && new Date(task.deadline).getTime() > now) {
      chrome.alarms.create(`task-${task.id}`, {
        when: new Date(task.deadline).getTime()
      });
    }
  });
}); 