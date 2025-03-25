export class StatisticsModel {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.userId = data.userId || null;
    this.date = data.date || new Date().toISOString().split('T')[0]; // формат YYYY-MM-DD
    
    // Ежедневная статистика
    this.dailyStats = data.dailyStats || {
      tasksCompleted: 0,
      tasksCreated: 0,
      totalExperienceGained: 0,
      completionRate: 0, // процент выполнения
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
  
  // Расчет процента выполнения
  calculateCompletionRate() {
    if (this.dailyStats.tasksCreated === 0) return 0;
    return Math.round((this.dailyStats.tasksCompleted / this.dailyStats.tasksCreated) * 100);
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
    
    // Обновление категории
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
}