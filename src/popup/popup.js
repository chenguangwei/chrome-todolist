document.addEventListener('DOMContentLoaded', () => {
  const taskManager = new TaskManager();
  const viewContainer = document.getElementById('viewContainer');
  const quadrantView = new QuadrantView(viewContainer);
  const calendarView = new CalendarView(viewContainer);

  // 初始化显示四象限视图
  quadrantView.render();

  // 视图切换
  document.getElementById('quadrantView').addEventListener('click', () => {
    quadrantView.render();
  });

  document.getElementById('calendarView').addEventListener('click', () => {
    calendarView.render();
  });

  // 添加任务
  document.getElementById('addTask').addEventListener('click', async () => {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const deadline = document.getElementById('deadline').value;
    const important = document.getElementById('important').checked;
    const urgent = document.getElementById('urgent').checked;

    if (!title || !deadline) {
      alert('请填写任务标题和截止时间！');
      return;
    }

    const task = new Task(title, description, deadline, important, urgent);
    await taskManager.addTask(task);
    
    // 重新渲染当前视图
    quadrantView.render();
    
    // 清空输入框
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('deadline').value = '';
    document.getElementById('important').checked = false;
    document.getElementById('urgent').checked = false;
  });
}); 