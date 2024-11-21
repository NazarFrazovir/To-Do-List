document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
  
    // Додавання завдання
    addTaskBtn.addEventListener('click', () => {
      const taskText = taskInput.value.trim();
  
      if (taskText === '') {
        alert('Please enter a task!');
        return;
      }
  
      const taskItem = document.createElement('li');
      taskItem.textContent = taskText;
  
      // Додавання кнопки видалення
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        taskList.removeChild(taskItem);
      });
  
      // Позначення виконаного завдання
      taskItem.addEventListener('click', () => {
        taskItem.classList.toggle('completed');
      });
  
      taskItem.appendChild(deleteBtn);
      taskList.appendChild(taskItem);
  
      taskInput.value = '';
    });
  
    // Додавання завдання натисканням Enter
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTaskBtn.click();
      }
    });
  });
  