document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput'); // Поле вводу завдання
    const addTaskBtn = document.getElementById('addTaskBtn'); // Кнопка "Add Task"
    const addCategoryBtn = document.getElementById('addCategoryBtn'); // Кнопка "Add Category"
    const prioritySelect = document.getElementById('prioritySelect'); // Вибір пріоритету
    const categorySelect = document.getElementById('categorySelect'); // Вибір категорії
    const taskContainer = document.getElementById('task-container'); // Контейнер секцій завдань
    const modal = document.getElementById('modal'); // Модальне вікно
    const newCategoryInput = document.getElementById('newCategoryInput'); // Поле вводу для нової категорії
    const saveCategoryBtn = document.getElementById('saveCategoryBtn'); // Кнопка "Save" у модальному вікні
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn'); // Кнопка "Cancel" у модальному вікні
    let currentTask = null; // Завдання, яке перетягується
  
    // Завантажуємо дані з LocalStorage при старті
    loadFromLocalStorage();
  
    // Додавання нового завдання
    addTaskBtn.addEventListener('click', () => {
      const taskText = taskInput.value.trim(); // Текст завдання
      const selectedPriority = prioritySelect.value; // Пріоритет завдання
      const selectedCategory = categorySelect.value; // Категорія завдання
  
      if (!taskText) {
        alert('Please enter a task!');
        return;
      }
  
      // Створення завдання
      const taskItem = createTaskItem(taskText, selectedCategory, selectedPriority);
      const categoryList = document.querySelector(`[data-category="${selectedCategory}"] .task-list`);
      categoryList.appendChild(taskItem); // Додаємо завдання до списку
  
      // Сортуємо завдання за пріоритетом
      sortTasks(categoryList);
  
      taskInput.value = ''; // Очищаємо поле вводу
      saveToLocalStorage(); // Оновлюємо LocalStorage
    });
  
    // Відкрити модальне вікно для додавання нової категорії
    addCategoryBtn.addEventListener('click', () => {
      modal.classList.remove('hidden'); // Показуємо модальне вікно
      newCategoryInput.value = ''; // Очищаємо поле вводу
      newCategoryInput.focus(); // Ставимо фокус на поле
    });
  
    // Зберегти нову категорію
    saveCategoryBtn.addEventListener('click', () => {
      const newCategory = newCategoryInput.value.trim();
      if (!newCategory) {
        alert('Please enter a category name!');
        return;
      }
  
      addNewCategory(newCategory); // Додаємо нову категорію
      modal.classList.add('hidden'); // Ховаємо модальне вікно
    });
  
    // Скасувати додавання нової категорії
    cancelCategoryBtn.addEventListener('click', () => {
      modal.classList.add('hidden'); // Ховаємо модальне вікно
    });
  
    // Додавання нової категорії
    function addNewCategory(categoryName) {
      // Перевіряємо, чи така категорія вже існує
      if (document.querySelector(`[data-category="${categoryName}"]`)) {
        return;
      }
  
      // Додаємо нову категорію у випадаючий список
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
  
      // Додаємо подію для кнопки видалення категорії
      const deleteBtn = newSection.querySelector('.delete-section-btn');
      deleteBtn.addEventListener('click', () => handleDeleteSection(categoryName, newSection));
  
      saveToLocalStorage(); // Зберігаємо зміни
    }
  
    // Видалення категорії
    function handleDeleteSection(categoryName, sectionElement) {
      sectionElement.remove(); // Видаляємо секцію з DOM
      removeCategoryFromLocalStorage(categoryName); // Видаляємо з LocalStorage
    }
  
    // Видалення категорії з LocalStorage
    function removeCategoryFromLocalStorage(categoryName) {
      const savedData = JSON.parse(localStorage.getItem('todoData')) || { categories: [], tasks: [] };
  
      // Видаляємо категорію та її завдання
      savedData.categories = savedData.categories.filter(category => category !== categoryName);
      savedData.tasks = savedData.tasks.filter(task => task.category !== categoryName);
  
      localStorage.setItem('todoData', JSON.stringify(savedData)); // Оновлюємо LocalStorage
    }
  
    function createTaskItem(text, category, priority) {
        const taskItem = document.createElement('li');
        taskItem.textContent = text;
        taskItem.className = `task ${priority}`; // Додаємо клас для пріоритету
        taskItem.dataset.category = category;
        taskItem.dataset.priority = priority;

        // Додаємо draggable атрибут
  taskItem.setAttribute('draggable', 'true');
      
        // Кнопка видалення завдання
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
      
      
  
    // Події для перетягування
    taskContainer.addEventListener('dragover', (e) => e.preventDefault());
    taskContainer.addEventListener('drop', handleDrop);
  
    function handleDragStart(e) {
      currentTask = e.target;
      e.dataTransfer.effectAllowed = 'move';
      e.target.classList.add('dragging');
    }
  
    function handleDragEnd(e) {
      e.target.classList.remove('dragging');
      currentTask = null;
    }
  
    function handleDrop(e) {
      e.preventDefault();
      const targetList = e.target.closest('.task-list');
      if (targetList && currentTask) {
        targetList.appendChild(currentTask);
        currentTask.dataset.category = targetList.dataset.category;
        saveToLocalStorage(); // Оновлюємо LocalStorage
      }
    }
  
    // Сортування завдань за пріоритетом
    function sortTasks(categoryList) {
      const tasks = Array.from(categoryList.children);
  
      // Визначаємо порядок пріоритетів
      const priorityOrder = { high: 1, medium: 2, low: 3 };
  
      tasks.sort((a, b) => {
        return priorityOrder[a.dataset.priority] - priorityOrder[b.dataset.priority];
      });
  
      tasks.forEach(task => categoryList.appendChild(task));
    }
  
    // Завантаження з LocalStorage
    function loadFromLocalStorage() {
        const savedData = JSON.parse(localStorage.getItem('todoData')) || { categories: [], tasks: [] };
      
        console.log('Loading from LocalStorage:', savedData);
      
        // Очищаємо існуючі категорії та секції, крім "General"
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
          const categoryList = document.querySelector(`[data-category="${task.category}"] .task-list`);
          if (categoryList) {
            const taskItem = createTaskItem(task.text, task.category, task.priority);
            categoryList.appendChild(taskItem);
          } else {
            console.error(`Category not found for task:`, task);
          }
        });
      
        // Сортуємо завдання у кожній категорії
        const taskLists = document.querySelectorAll('.task-list');
        taskLists.forEach(sortTasks);
      }
      

      
  
    // Збереження до LocalStorage
    function saveToLocalStorage() {
        const data = { categories: [], tasks: [] };
      
        // Зберігаємо всі категорії, крім "General"
        const options = categorySelect.querySelectorAll('option');
        options.forEach(option => {
          if (option.value !== 'all') {
            data.categories.push(option.value);
          }
        });
      
        // Зберігаємо всі завдання
        const taskLists = document.querySelectorAll('.task-list');
        taskLists.forEach(list => {
          const category = list.dataset.category;
          const tasks = list.querySelectorAll('.task');
          tasks.forEach(task => {
            data.tasks.push({
              text: task.textContent.replace('Delete', '').trim(),
              category,
              priority: task.dataset.priority,
            });
          });
        });
      
        console.log('Saving to LocalStorage:', data);
        localStorage.setItem('todoData', JSON.stringify(data));
      }
    });           
  