export class StatisticsModel {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.userId = data.userId || null;
    this.date = data.date || new Date().toISOString().split('T')[0]; // формат YYYY-MM-DD
    
    // Ежедневная статистика
    this.dailyStats = {
      tasksCompleted: data.dailyStats?.tasksCompleted || 0,
      tasksCreated: data.dailyStats?.tasksCreated || 0,
      tasksPlanned: data.dailyStats?.tasksPlanned || 0, // добавляем запланированные
      tasksOverdue: data.dailyStats?.tasksOverdue || 0,  // добавляем просроченные
      completionRate: data.dailyStats?.completionRate || 0,
      totalExperienceGained: data.dailyStats?.totalExperienceGained || 0
    };
    
    // Хранение данных по категориям
    this.categoryStats = data.categoryStats || {}; // { categoryId: { completed: 0, total: 0 } }
    
    // Данные по приоритетам
    this.priorityStats = data.priorityStats || {
      low: { completed: 0, total: 0 },
      medium: { completed: 0, total: 0 },
      high: { completed: 0, total: 0 }
    };
    
    // Временные показатели
    this.timeStats = data.timeStats || {
      morningCompleted: 0, // 5:00 - 12:00
      afternoonCompleted: 0, // 12:00 - 17:00
      eveningCompleted: 0, // 17:00 - 21:00
      nightCompleted: 0 // 21:00 - 5:00
    };
  }
  
  // Вспомогательные методы для анализа данных
  
  // Расчет процента выполнения для текущего дня
  calculateCompletionRate() {
    const completed = this.dailyStats.tasksCompleted;
    const created = this.dailyStats.tasksCreated;
    const planned = this.dailyStats.tasksPlanned || 0;
    const overdue = this.dailyStats.tasksOverdue || 0;
    
    // Общее число задач на день (включая перенесенные и просроченные)
    const total = Math.max(completed, created + planned + overdue);
    
    // Минимальное количество задач для точного расчета
    const MIN_TASKS_FOR_ACCURACY = 2;
    
    if (total < MIN_TASKS_FOR_ACCURACY) {
      // Если задач недостаточно, учитываем это в расчете
      const penaltyFactor = total / MIN_TASKS_FOR_ACCURACY;
      const rawEfficiency = (completed / Math.max(1, total)) * 100;
      return Math.round(rawEfficiency * penaltyFactor);
    }
    
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }
  
  // Получение статистики по категории
  getCategoryCompletionRate(categoryId) {
    const category = this.categoryStats[categoryId];
    if (!category || category.total === 0) return 0;
    return Math.round((category.completed / category.total) * 100);
  }
  
  // Получение наиболее продуктивного времени дня
  getMostProductiveTimeOfDay() {
    const times = this.timeStats;
    const max = Math.max(times.morningCompleted, times.afternoonCompleted, 
                         times.eveningCompleted, times.nightCompleted);
    
    if (max === 0) return 'Недостаточно данных';
    if (max === times.morningCompleted) return 'Утро';
    if (max === times.afternoonCompleted) return 'День';
    if (max === times.eveningCompleted) return 'Вечер';
    return 'Ночь';
  }
  
  // Обновление статистики при выполнении задачи
  updateOnTaskCompletion(task, experienceGained) {
    this.dailyStats.tasksCompleted += 1;
    this.dailyStats.totalExperienceGained += experienceGained;
    this.dailyStats.completionRate = this.calculateCompletionRate();
    
    // Проверка поля category в задаче
    if (task.categoryId) {
      if (!this.categoryStats[task.categoryId]) {
        this.categoryStats[task.categoryId] = { completed: 0, total: 0 };
      }
      this.categoryStats[task.categoryId].completed += 1;
    }
    
    // Обновление приоритета
    if (task.priority) {
      this.priorityStats[task.priority].completed += 1;
    }
    
    // Обновление времени дня
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      this.timeStats.morningCompleted += 1;
    } else if (hour >= 12 && hour < 17) {
      this.timeStats.afternoonCompleted += 1;
    } else if (hour >= 17 && hour < 21) {
      this.timeStats.eveningCompleted += 1;
    } else {
      this.timeStats.nightCompleted += 1;
    }
  }
  
  // Обновление статистики при создании задачи
  updateOnTaskCreation(task) {
    this.dailyStats.tasksCreated += 1;
    this.dailyStats.completionRate = this.calculateCompletionRate();
    
    // Обновление категории
    if (task.categoryId) {
      if (!this.categoryStats[task.categoryId]) {
        this.categoryStats[task.categoryId] = { completed: 0, total: 0 };
      }
      this.categoryStats[task.categoryId].total += 1;
    }
    
    // Обновление приоритета
    if (task.priority) {
      this.priorityStats[task.priority].total += 1;
    }
  }

  // Обновление для учета запланированных задач
  updatePlannedTasks(count) {
    this.dailyStats.tasksPlanned += count;
  }

  // Обновление для учета просроченных задач
  updateOverdueTasks(count) {
    this.dailyStats.tasksOverdue += count;
  }
}