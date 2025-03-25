// Форматирование даты в читаемый формат
export const formatDate = (date) => {
  if (!date) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(date).toLocaleDateString('ru-RU', options);
};

// Форматирование времени
export const formatTime = (date) => {
  if (!date) return '';
  
  const options = { 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  
  return new Date(date).toLocaleTimeString('ru-RU', options);
};

// Форматирование даты и времени
export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)}, ${formatTime(date)}`;
};

// Проверка, просрочена ли задача
export const isTaskOverdue = (dueDate) => {
  if (!dueDate) return false;
  
  const now = new Date();
  const due = new Date(dueDate);
  
  return due < now;
};

// Получение дней, оставшихся до дедлайна
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Получение статуса задачи на основе дедлайна и статуса выполнения
export const getTaskStatus = (task) => {
  if (task.isCompleted) {
    return 'completed';
  }
  
  if (!task.dueDate) {
    return 'no-deadline';
  }
  
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  
  if (daysUntilDue < 0) {
    return 'overdue';
  } else if (daysUntilDue === 0) {
    return 'due-today';
  } else if (daysUntilDue === 1) {
    return 'due-tomorrow';
  } else if (daysUntilDue <= 7) {
    return 'due-soon';
  } else {
    return 'upcoming';
  }
};

// Группировка задач по различным критериям
export const groupTasksByStatus = (tasks) => {
  return tasks.reduce((groups, task) => {
    const status = getTaskStatus(task);
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {});
};

export const groupTasksByCategory = (tasks, categories) => {
  return tasks.reduce((groups, task) => {
    const categoryId = task.categoryId || 'uncategorized';
    if (!groups[categoryId]) {
      groups[categoryId] = [];
    }
    groups[categoryId].push(task);
    return groups;
  }, {});
};

export const groupTasksByPriority = (tasks) => {
  return tasks.reduce((groups, task) => {
    const priority = task.priority || 'medium';
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(task);
    return groups;
  }, {});
};
