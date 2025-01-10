class CalendarView {
  constructor(container) {
    this.container = container;
    this.taskManager = new TaskManager();
    this.currentDate = new Date();
  }

  async render() {
    const tasks = await this.taskManager.loadTasks();
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let calendar = `
      <div class="calendar">
        <div class="calendar-header">
          <button class="prev-month">&lt;</button>
          <h3>${year}年${month + 1}月</h3>
          <button class="next-month">&gt;</button>
        </div>
        <div class="calendar-grid">
          <div class="weekday">日</div>
          <div class="weekday">一</div>
          <div class="weekday">二</div>
          <div class="weekday">三</div>
          <div class="weekday">四</div>
          <div class="weekday">五</div>
          <div class="weekday">六</div>
    `;

    // 填充日历开始前的空白天数
    for (let i = 0; i < startingDay; i++) {
      calendar += '<div class="calendar-day empty"></div>';
    }

    // 填充日历天数
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate.getDate() === day &&
               taskDate.getMonth() === month &&
               taskDate.getFullYear() === year;
      });

      calendar += `
        <div class="calendar-day ${dayTasks.length ? 'has-tasks' : ''}">
          <div class="day-number">${day}</div>
          <div class="day-tasks">
            ${dayTasks.map(task => `
              <div class="calendar-task quadrant-${task.getQuadrant()}"
                   title="${task.title}">
                ${task.title}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    calendar += `
        </div>
      </div>
    `;

    this.container.innerHTML = calendar;
    this.addEventListeners();
  }

  addEventListeners() {
    const prevMonth = this.container.querySelector('.prev-month');
    const nextMonth = this.container.querySelector('.next-month');

    prevMonth.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    nextMonth.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });
  }
}

window.CalendarView = CalendarView; 