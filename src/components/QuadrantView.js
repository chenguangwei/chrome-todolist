class QuadrantView {
  constructor(container) {
    this.container = container;
    this.taskManager = new TaskManager();
  }

  async render() {
    const tasks = await this.taskManager.loadTasks();
    
    this.container.innerHTML = `
      <div class="quadrant-grid">
        <div class="quadrant important urgent">
          <h3>重要且紧急</h3>
          <div class="task-list" id="quadrant-1"></div>
        </div>
        <div class="quadrant important">
          <h3>重要不紧急</h3>
          <div class="task-list" id="quadrant-2"></div>
        </div>
        <div class="quadrant urgent">
          <h3>紧急不重要</h3>
          <div class="task-list" id="quadrant-3"></div>
        </div>
        <div class="quadrant">
          <h3>不重要不紧急</h3>
          <div class="task-list" id="quadrant-4"></div>
        </div>
      </div>
    `;

    this.renderTasks(tasks);
  }

  renderTasks(tasks) {
    // 按象限分类任务
    const quadrants = {1: [], 2: [], 3: [], 4: []};
    tasks.forEach(task => {
      quadrants[task.getQuadrant()].push(task);
    });

    // 渲染每个象限的任务
    Object.keys(quadrants).forEach(quadrant => {
      const quadrantEl = document.getElementById(`quadrant-${quadrant}`);
      quadrantEl.innerHTML = quadrants[quadrant]
        .map(task => this.createTaskElement(task))
        .join('');
    });
  }

  createTaskElement(task) {
    return `
      <div class="task-item" data-id="${task.id}">
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <time>${new Date(task.deadline).toLocaleString()}</time>
      </div>
    `;
  }
}

window.QuadrantView = QuadrantView; 