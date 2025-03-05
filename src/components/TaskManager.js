class TaskManager {
    constructor() {
        this.tasks = [];
    }

    async loadTasks() {
        console.log('从存储加载任务...');
        const data = await chrome.storage.local.get('tasks');
        this.tasks = data.tasks || [];
        console.log('加载的任务:', this.tasks);
        this.renderTasks(); // 确保在加载后渲染任务
    }

    async addTask(task) {
        console.log('添加任务到任务管理器:', task);
        this.tasks.push(task);
        await this.saveTasks();
        console.log('任务已保存，设置提醒...');
        const deadlineTime = new Date(task.deadline).getTime();
        if (deadlineTime > Date.now()) {
            await chrome.alarms.create(`task-${task.id}`, {
                when: deadlineTime
            });
            console.log('提醒已设置:', task.id);
        } else {
            console.warn('截止时间已过，不设置提醒');
        }
    }

    async saveTasks() {
        console.log('保存任务到存储:', this.tasks);
        await chrome.storage.local.set({ tasks: this.tasks });
    }

    renderTasks() {
        // 渲染任务的逻辑
    }
} 