import { defineStore } from 'pinia';
import { Task, QuadrantType } from '@/types/task';

interface TaskState {
  tasks: Task[];
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: []
  }),

  getters: {
    getTasksByQuadrant: (state) => (quadrant: QuadrantType) => {
      return state.tasks.filter(task => {
        if (quadrant === QuadrantType.ImportantUrgent) {
          return task.important && task.urgent;
        } else if (quadrant === QuadrantType.ImportantNotUrgent) {
          return task.important && !task.urgent;
        } else if (quadrant === QuadrantType.NotImportantUrgent) {
          return !task.important && task.urgent;
        }
        return !task.important && !task.urgent;
      });
    }
  },

  actions: {
    async loadTasks() {
      const data = await chrome.storage.local.get('tasks');
      this.tasks = data.tasks || [];
    },

    async addTask(task: Task) {
      this.tasks.push(task);
      await this.saveTasks();
    },

    async updateTask(task: Task) {
      const index = this.tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.tasks[index] = task;
        await this.saveTasks();
      }
    },

    async deleteTask(taskId: number) {
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      await this.saveTasks();
    },

    async saveTasks() {
      await chrome.storage.local.set({ tasks: this.tasks });
    }
  }
}); 