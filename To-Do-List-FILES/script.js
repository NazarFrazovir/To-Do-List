document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput'); // Поле для вводу завдання
    const addTaskBtn = document.getElementById('addTaskBtn'); // Кнопка для додавання завдання
    const addCategoryBtn = document.getElementById('addCategoryBtn'); // Кнопка для додавання категорії
    const categorySelect = document.getElementById('categorySelect'); // Вибір категорії
    const taskContainer = document.getElementById('task-container'); // Контейнер для секцій
    const modal = document.getElementById('modal'); // Модальне вікно
    const newCategoryInput = document.getElementById('newCategoryInput'); // Поле для нової категорії
    const saveCategoryBtn = document.getElementById('saveCategoryBtn'); // Кнопка для збереження категорії
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn'); // Кнопка для скасування модального вікна
    let currentTask = null; // Поточне завдання, яке перетягується
  
    // Завантаження даних із LocalStorage при завантаженні сторінки
    loadFromLocalStorage();
  
    // Додавання нового завдання
    addTaskBtn.addEventListener('click', () => {
      const taskText = taskInput.value.trim(); // Отримуємо текст із поля вводу
      const selectedCategory = categorySelect.value; // Обираємо категорію
  
      if (!taskText) {
        alert('Please enter a task!'); // Якщо поле порожнє, показуємо повідомлення
        return;
      }
  
      // Створюємо нове завдання
      const taskItem = createTaskItem(taskText, selectedCategory);
      const categoryList = document.querySelector(`[data-category="${selectedCategory}"] .task-list`);
      categoryList.appendChild(taskItem); // Додаємо завдання до відповідної секції
  
      taskInput.value = ''; // Очищаємо поле вводу
      saveToLocalStorage(); // Зберігаємо зміни
    });
  
    // Відкрити модальне вікно для додавання нової категорії
    addCategoryBtn.addEventListener('click', () => {
      modal.classList.remove('hidden'); // Показуємо модальне вікно
      newCategoryInput.value = ''; // Очищаємо поле вводу
      newCategoryInput.focus(); // Ставимо фокус на поле вводу
    });
  
    // Зберегти нову категорію
    saveCategoryBtn.addEventListener('click', () => {
      const newCategory = newCategoryInput.value.trim(); // Отримуємо назву нової категорії
      if (!newCategory) {
        alert('Please enter a category name!'); // Якщо порожньо, показуємо повідомлення
        return;
      }
  
      addNewCategory(newCategory); // Додаємо нову категорію
      modal.classList.add('hidden'); // Закриваємо модальне вікно
    });
  
    // Скасувати додавання категорії
    cancelCategoryBtn.addEventListener('click', () => {
      modal.classList.add('hidden'); // Закриваємо модальне вікно
    });
  
    // Додавання нової категорії
    function addNewCategory(categoryName) {
      // Перевіряємо, чи така категорія вже існує
      if (document.querySelector(`[data-category="${categoryName}"]`)) {
        return;
      }
  
      // Додаємо категорію у випадаючий список
      const newOption = document.createElement('option');
      newOption.value = categoryName;
      newOption.textContent = categoryName;
      categorySelect.appendChild(newOption);
  
      // Створюємо нову секцію для завдань
      const newSection = document.createElement('div');
      newSection.className = 'task-section';
      newSection.dataset.category = categoryName;
      newSection.innerHTML = `
        <div class="section-header">
          <h3>${categoryName}</h3>
          <button class="delete-section-btn" data-category="${categoryName}">Delete Section</button>
        </div>
        <ul class="task-list" data-category="${categoryName}"></ul>
      `;
      taskContainer.appendChild(newSection);
  
      // Додаємо подію для кнопки видалення секції
      const deleteBtn = newSection.querySelector('.delete-section-btn');
      deleteBtn.addEventListener('click', () => handleDeleteSection(categoryName, newSection));
  
      saveToLocalStorage(); // Зберігаємо зміни
    }
  
    // Видалення категорії з LocalStorage
    function removeCategoryFromLocalStorage(categoryName) {
      const savedData = JSON.parse(localStorage.getItem('todoData')) || { categories: [], tasks: [] };
      console.log('Before removing category:', savedData);
  
      // Видаляємо категорію з масиву categories
      savedData.categories = savedData.categories.filter(category => category !== categoryName);
  
      // Видаляємо всі завдання, пов’язані з цією категорією
      savedData.tasks = savedData.tasks.filter(task => task.category !== categoryName);
  
      // Оновлюємо LocalStorage
      localStorage.setItem('todoData', JSON.stringify(savedData));
      console.log('After removing category:', savedData);
    }
  
    // Видалення секції
    function handleDeleteSection(categoryName, sectionElement) {
      console.log('Deleting section:', categoryName);
  
      // Видаляємо секцію з DOM
      sectionElement.remove();
  
      // Видаляємо категорію з LocalStorage
      removeCategoryFromLocalStorage(categoryName);
    }
  
    // Створення завдання
    function createTaskItem(text, category) {
      const taskItem = document.createElement('li');
      taskItem.textContent = text;
      taskItem.className = 'task';
      taskItem.dataset.category = category;
      taskItem.setAttribute('draggable', 'true'); // Робимо завдання перетягуваним
  
      // Кнопка для видалення завдання
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        taskItem.remove(); // Видаляємо завдання з DOM
        saveToLocalStorage(); // Оновлюємо LocalStorage
      });
  
      taskItem.appendChild(deleteBtn);
  
      // Додаємо події для перетягування
      taskItem.addEventListener('dragstart', handleDragStart);
      taskItem.addEventListener('dragend', handleDragEnd);
  
      return taskItem;
    }
  
    // Події перетягування
    taskContainer.addEventListener('dragover', (e) => e.preventDefault()); // Дозволяємо перетягування
    taskContainer.addEventListener('drop', handleDrop);
  
    function handleDragStart(e) {
      currentTask = e.target; // Зберігаємо поточне завдання
      e.dataTransfer.effectAllowed = 'move'; // Вказуємо, що елемент перетягується
      e.target.classList.add('dragging'); // Додаємо клас для стилізації
    }
  
    function handleDragEnd(e) {
      e.target.classList.remove('dragging'); // Видаляємо клас після перетягування
      currentTask = null; // Очищаємо поточне завдання
    }
  
    function handleDrop(e) {
      e.preventDefault();
      const targetList = e.target.closest('.task-list'); // Знаходимо цільову секцію
      if (targetList && currentTask) {
        targetList.appendChild(currentTask); // Переміщуємо завдання до нової секції
        currentTask.dataset.category = targetList.dataset.category; // Оновлюємо категорію
        saveToLocalStorage(); // Зберігаємо зміни
      }
    }
  
    // Збереження даних у LocalStorage
    function saveToLocalStorage() {
      const data = { categories: [], tasks: [] };
  
      // Збираємо всі категорії
      const options = categorySelect.querySelectorAll('option');
      options.forEach(option => {
        if (option.value !== 'all') {
          data.categories.push(option.value);
        }
      });
  
      // Збираємо всі завдання
      const taskLists = document.querySelectorAll('.task-list');
      taskLists.forEach(list => {
        const category = list.dataset.category;
        const tasks = list.querySelectorAll('.task');
        tasks.forEach(task => {
          data.tasks.push({
            text: task.textContent.replace('Delete', '').trim(),
            category
          });
        });
      });
  
      console.log('Saving to LocalStorage:', data);
      localStorage.setItem('todoData', JSON.stringify(data)); // Оновлюємо LocalStorage
    }
  
    // Завантаження даних із LocalStorage
    function loadFromLocalStorage() {
      const savedData = JSON.parse(localStorage.getItem('todoData')) || { categories: [], tasks: [] };
      console.log('Loading from LocalStorage:', savedData);
  
      // Очищаємо випадаючий список і секції
      categorySelect.innerHTML = '<option value="all" selected>General</option>';
      const existingSections = document.querySelectorAll('.task-section');
      existingSections.forEach(section => {
        if (section.dataset.category !== 'all') {
          section.remove();
        }
      });
  
      // Відновлюємо категорії
      savedData.categories.forEach(category => {
        addNewCategory(category);
      });
  
      // Відновлюємо завдання
      savedData.tasks.forEach(task => {
        const taskItem = createTaskItem(task.text, task.category);
        const categoryList = document.querySelector(`[data-category="${task.category}"] .task-list`);
        if (categoryList) {
          categoryList.appendChild(taskItem);
        }
      });
    }
  });
  