import { v4 as uuidv4 } from 'uuid';

export class TaskModel {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.title = data.title || '';
    this.description = data.description || '';
    this.dueDate = data.dueDate || null;
    this.priority = data.priority || 'medium';
    this.categoryId = data.categoryId || null; // Убедимся, что используется именно categoryId
    
    // Явно устанавливаем false, если не передано true
    this.isCompleted = data.isCompleted === true;
    
    this.completedAt = data.completedAt || null;
    
    // Устранение конфликта между type и isDaily
    this.isDaily = data.isDaily || false;
    // Для обратной совместимости
    this.type = data.isDaily ? 'daily' : 'regular';
    
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastCompletedDate = data.lastCompletedDate || null; // Для отслеживания выполнения ежедневных задач
    this.reminderEnabled = data.reminderEnabled || false;
    this.reminderTime = data.reminderTime || null;
    this.notificationId = data.notificationId || null;
    
    // Хранение информации о фактически потраченной энергии 
    // и полученном опыте при выполнении задачи
    this.noExperienceGained = data.noExperienceGained || false;
    this.energySpent = data.energySpent || 0; // Добавляем фактические траты энергии
  }

  // Метод для преобразования объекта задачи в обычный объект
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      categoryId: this.categoryId, // Проверим обработку categoryId
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
      isDaily: this.isDaily, // Добавляем флаг ежедневной задачи
      type: this.isDaily ? 'daily' : 'regular',
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      reminderEnabled: this.reminderEnabled,
      reminderTime: this.reminderTime,
      notificationId: this.notificationId,
      xpReward: this.xpReward,
      lastCompletedDate: this.lastCompletedDate, // Для отслеживания выполнения ежедневных задач
      noExperienceGained: this.noExperienceGained,
      energySpent: this.energySpent, // Сохраняем фактические траты энергии
    };
  }

  // Статический метод для создания экземпляра TaskModel из обычного объекта
  static fromJSON(json) {
    return new TaskModel({
      ...json,
      dueDate: json.dueDate ? new Date(json.dueDate) : null,
      createdAt: json.createdAt ? new Date(json.createdAt) : new Date().toISOString(),
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : new Date().toISOString(),
      completedAt: json.completedAt ? new Date(json.completedAt) : null,
      reminderTime: json.reminderTime ? new Date(json.reminderTime) : null,
    });
  }
}

export default TaskModel;
