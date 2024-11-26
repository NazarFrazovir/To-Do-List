document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const openTaskModalBtn = document.getElementById('openTaskModalBtn');
    const openCategoryModalBtn = document.getElementById('openCategoryModalBtn');
    const taskModal = document.getElementById('taskModal');
    const categoryModal = document.getElementById('categoryModal');
    const modalTaskInput = document.getElementById('modalTaskInput');
    const modalPrioritySelect = document.getElementById('modalPrioritySelect');
    const modalCategorySelect = document.getElementById('modalCategorySelect');
    const modalDeadlineDate = document.getElementById('modalDeadlineDate');
    const modalDeadlineTime = document.getElementById('modalDeadlineTime');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    const taskContainer = document.getElementById('task-container');
    let currentTask = null;
  
    // Завантаження даних із LocalStorage
    loadFromLocalStorage();
  
    // Відкрити модальне вікно для створення завдання
    openTaskModalBtn.addEventListener('click', () => {
      taskModal.classList.remove('hidden');
      modalTaskInput.value = '';
      modalPrioritySelect.value = 'medium'; // За замовчуванням "medium"
      modalCategorySelect.value = 'all'; // За замовчуванням "General"
      modalDeadlineDate.value = '';
      modalDeadlineTime.value = '';
      modalTaskInput.focus();
    });
  
    // Закрити модальне вікно для створення завдання
    cancelTaskBtn.addEventListener('click', () => {
      taskModal.classList.add('hidden');
    });
  
    // Зберегти завдання
    saveTaskBtn.addEventListener('click', () => {
      const taskText = modalTaskInput.value.trim();
      const selectedPriority = modalPrioritySelect.value || 'medium';
      const selectedCategory = modalCategorySelect.value;
      const deadline =
        modalDeadlineDate.value && modalDeadlineTime.value
          ? `${modalDeadlineDate.value} ${modalDeadlineTime.value}`
          : null;
  
      if (!taskText) {
        alert('Task text is required!');
        return;
      }
  
      const taskItem = createTaskItem(taskText, selectedCategory, selectedPriority, deadline);
      const categoryList = document.querySelector(`[data-category="${selectedCategory}"] .task-list`);
      categoryList.appendChild(taskItem);
  
      sortTasks(categoryList); // Сортуємо завдання в категорії
      taskModal.classList.add('hidden'); // Закриваємо модальне вікно
      saveToLocalStorage(); // Оновлюємо LocalStorage
    });
  
    // Відкрити модальне вікно для створення категорії
    openCategoryModalBtn.addEventListener('click', () => {
      categoryModal.classList.remove('hidden');
      newCategoryInput.value = '';
      newCategoryInput.focus();
    });
  
    // Закрити модальне вікно для створення категорії
    cancelCategoryBtn.addEventListener('click', () => {
      categoryModal.classList.add('hidden');
    });
  
    // Зберегти нову категорію
    saveCategoryBtn.addEventListener('click', () => {
      const categoryName = newCategoryInput.value.trim();
      if (!categoryName) {
        alert('Please enter a category name!');
        return;
      }
  
      addNewCategory(categoryName);
      categoryModal.classList.add('hidden');
    });
  
    // Створення завдання
    function createTaskItem(text, category, priority, deadline) {
        const taskItem = document.createElement('li');
        taskItem.className = `task ${priority}`;
        taskItem.dataset.category = category;
        taskItem.dataset.priority = priority;
        taskItem.dataset.deadline = deadline;
      
        const taskText = document.createElement('span');
        taskText.textContent = text;
        taskItem.appendChild(taskText);
      
        // Обробка дедлайну
        const deadlineSpan = document.createElement('span');
        deadlineSpan.className = 'deadline';
        if (deadline) {
          deadlineSpan.textContent = ` (Deadline: ${deadline})`;
      
          // Стиль дедлайну
          const now = new Date();
          const deadlineDate = new Date(deadline);
          const timeDiff = deadlineDate - now;
      
          if (timeDiff < 0) {
            deadlineSpan.classList.add('overdue'); // Прострочений дедлайн
          } else if (timeDiff <= 24 * 60 * 60 * 1000) {
            deadlineSpan.classList.add('upcoming'); // Менше ніж 24 години
          } else {
            deadlineSpan.classList.add('safe'); // Далека дата
          }
        } else {
          deadlineSpan.textContent = ' (No deadline has been set)'; // Якщо дедлайн не встановлено
          deadlineSpan.classList.add('no-deadline');
        }
        taskItem.appendChild(deadlineSpan);
      
        // Кнопка видалення
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
          taskItem.remove();
          saveToLocalStorage();
        });
      
        taskItem.appendChild(deleteBtn);
      
        taskItem.setAttribute('draggable', 'true');
        taskItem.addEventListener('dragstart', handleDragStart);
        taskItem.addEventListener('dragend', handleDragEnd);
      
        return taskItem;
      }
      
      
      
  
    // Видалення категорії
    function deleteCategory(categoryName, sectionElement) {
      sectionElement.remove(); // Видаляємо секцію з DOM
  
      const savedData = JSON.parse(localStorage.getItem('todoData')) || { categories: [], tasks: [] };
  
      savedData.categories = savedData.categories.filter((cat) => cat !== categoryName);
      savedData.tasks = savedData.tasks.filter((task) => task.category !== categoryName);
  
      localStorage.setItem('todoData', JSON.stringify(savedData));
    }
  
    // Додавання категорії
    function addNewCategory(categoryName) {
      if (document.querySelector(`[data-category="${categoryName}"]`)) return;
  
      const newOption = document.createElement('option');
      newOption.value = categoryName;
      newOption.textContent = categoryName;
      modalCategorySelect.appendChild(newOption);
  
      const newSection = document.createElement('div');
      newSection.className = 'task-section';
      newSection.dataset.category = categoryName;
      newSection.innerHTML = `
        <div class="section-header">
          <h3>${categoryName}</h3>
          <button class="delete-category-btn">Delete Category</button>
        </div>
        <ul class="task-list" data-category="${categoryName}"></ul>
      `;
  
      const deleteCategoryBtn = newSection.querySelector('.delete-category-btn');
      deleteCategoryBtn.addEventListener('click', () => {
        deleteCategory(categoryName, newSection);
      });
  
      taskContainer.appendChild(newSection);
      saveToLocalStorage();
    }
  
    // Завантаження даних із LocalStorage
    function loadFromLocalStorage() {
      const savedData = JSON.parse(localStorage.getItem('todoData')) || { categories: [], tasks: [] };
  
      // Очищаємо попередні категорії (крім базової "General")
      modalCategorySelect.innerHTML = '<option value="all" selected>General</option>';
      const existingSections = document.querySelectorAll('.task-section');
      existingSections.forEach((section) => {
        if (section.dataset.category !== 'all') {
          section.remove();
        }
      });
  
      // Відновлюємо категорії з LocalStorage
      savedData.categories.forEach((category) => {
        if (category !== 'all') {
          addNewCategory(category);
        }
      });
  
      // Відновлюємо завдання
      savedData.tasks.forEach((task) => {
        const categoryList = document.querySelector(`[data-category="${task.category}"] .task-list`);
        if (categoryList) {
          const taskItem = createTaskItem(task.text, 
            task.category, 
            task.priority || '', // Пріоритет може бути порожнім
        task.deadline || null // Якщо дедлайн порожній, передаємо `null`
        );
          categoryList.appendChild(taskItem);
          sortTasks(categoryList);
        }
      });
    }
  
    // Збереження даних у LocalStorage
    function saveToLocalStorage() {
      const data = { categories: [], tasks: [] };
  
      const options = modalCategorySelect.querySelectorAll('option');
      options.forEach((option) => {
        if (option.value !== 'all') {
          data.categories.push(option.value);
        }
      });
  
      const taskLists = document.querySelectorAll('.task-list');
      taskLists.forEach((list) => {
        const category = list.dataset.category;
        const tasks = list.querySelectorAll('.task');
        tasks.forEach((task) => {
          data.tasks.push({
            text: task.querySelector('span').textContent,
            category,
            priority: task.dataset.priority || '', // Якщо пріоритет не задано, зберігаємо як порожній рядок
        deadline: task.dataset.deadline || '' // Якщо дедлайн не задано, зберігаємо як порожній рядок
          });
        });
      });
  
      localStorage.setItem('todoData', JSON.stringify(data));
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
        saveToLocalStorage();
      }
    }
  
    // Сортування завдань за пріоритетом
    function sortTasks(categoryList) {
      const tasks = Array.from(categoryList.children);
  
      const priorityOrder = { high: 1, medium: 2, low: 3 };
  
      tasks.sort((a, b) => {
        return priorityOrder[a.dataset.priority] - priorityOrder[b.dataset.priority];
      });
  
      tasks.forEach((task) => categoryList.appendChild(task));
    }
  });
  