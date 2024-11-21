document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskSections = document.querySelectorAll('.task-list'); // Всі списки завдань
  
    // Додавання нового завдання
    addTaskBtn.addEventListener('click', () => {
      const taskText = taskInput.value.trim();
      if (taskText === '') {
        alert('Please enter a task!');
        return;
      }
  
      // Створюємо нове завдання
      const taskItem = createTaskItem(taskText);
  
      // Додаємо до секції "All"
      const allSection = document.querySelector('[data-filter="all"]');
      allSection.appendChild(taskItem);
  
      taskInput.value = ''; // Очищаємо поле вводу
    });
  
    // Функція створення завдання
    function createTaskItem(text) {
      const taskItem = document.createElement('li');
      taskItem.textContent = text;
      taskItem.setAttribute('draggable', 'true'); // Завдання можна перетягувати
      taskItem.className = 'task';
  
      // Кнопка видалення
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        taskItem.remove();
      });
  
      taskItem.appendChild(deleteBtn);
  
      // Додаємо події для перетягування
      taskItem.addEventListener('dragstart', handleDragStart);
      taskItem.addEventListener('dragend', handleDragEnd);
  
      return taskItem;
    }
  
    // Події для списків завдань
    taskSections.forEach(section => {
      section.addEventListener('dragover', handleDragOver);
      section.addEventListener('drop', handleDrop);
      section.addEventListener('dragleave', handleDragLeave);
    });
  
    // Змінна для збереження посилання на початковий список
    let currentTask = null;
  
    // Подія: початок перетягування
    function handleDragStart(e) {
      currentTask = e.target; // Зберігаємо посилання на завдання, яке перетягується
      e.dataTransfer.effectAllowed = 'move'; // Встановлюємо режим переміщення
      e.target.classList.add('dragging');
    }
  
    // Подія: завершення перетягування
    function handleDragEnd(e) {
      e.target.classList.remove('dragging'); // Забираємо клас "dragging"
      currentTask = null; // Очищаємо посилання на завдання
    }
  
    // Подія: елемент "над" зоною
    function handleDragOver(e) {
      e.preventDefault(); // Дозволяємо drop
      this.classList.add('drag-over'); // Додаємо візуальний ефект
    }
  
    // Подія: залишення зони перетягування
    function handleDragLeave() {
      this.classList.remove('drag-over'); // Видаляємо візуальний ефект
    }
  
    // Подія: "випускання" завдання
    function handleDrop(e) {
      e.preventDefault();
      this.classList.remove('drag-over'); // Забираємо візуальний ефект
  
      if (currentTask) {
        // Видаляємо завдання зі старого списку
        const oldSection = currentTask.parentNode;
        oldSection.removeChild(currentTask);
  
        // Додаємо завдання в новий список
        this.appendChild(currentTask);
      }
    }
  });
  