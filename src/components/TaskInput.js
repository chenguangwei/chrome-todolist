class Task {
  constructor(title, description, deadline, important, urgent) {
    this.id = Date.now();
    this.title = title;
    this.description = description;
    this.deadline = deadline;
    this.important = important;
    this.urgent = urgent;
    this.completed = false;
    this.createdAt = new Date();
  }

  getQuadrant() {
    if (this.important && this.urgent) return 1; // 红色
    if (this.important && !this.urgent) return 2; // 黄色
    if (!this.important && this.urgent) return 3; // 蓝色
    return 4; // 绿色
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  async addTask(task) {
    this.tasks.push(task);
    await this.saveTasks();
  }

  async saveTasks() {
    await chrome.storage.local.set({ tasks: this.tasks });
  }

  async loadTasks() {
    const data = await chrome.storage.local.get('tasks');
    this.tasks = data.tasks || [];
    return this.tasks;
  }
}

// 导出供其他模块使用
window.TaskManager = TaskManager;
window.Task = Task; 