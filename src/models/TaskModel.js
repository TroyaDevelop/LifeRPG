import { v4 as uuidv4 } from 'uuid';

export class TaskModel {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.title = data.title || '';
    this.description = data.description || '';
    this.isCompleted = data.isCompleted || false;
    this.priority = data.priority || 'medium';
    this.category = data.category || null;
    this.dueDate = data.dueDate || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
    this.isDaily = data.isDaily || false; // Добавляем флаг ежедневной задачи
    this.lastCompletedDate = data.lastCompletedDate || null; // Для отслеживания выполнения ежедневных задач
    this.reminderEnabled = data.reminderEnabled || false;
    this.reminderTime = data.reminderTime || null;
    this.notificationId = data.notificationId || null;
    this.xpReward = this.calculateXpReward(this.priority);
  }

  calculateXpReward(priority) {
    const baseXp = 10;
    switch (priority) {
      case 'low':
        return baseXp;
      case 'medium':
        return baseXp * 2;
      case 'high':
        return baseXp * 3;
      default:
        return baseXp;
    }
  }

  // Метод для преобразования объекта задачи в обычный объект
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      category: this.category,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      reminderEnabled: this.reminderEnabled,
      reminderTime: this.reminderTime,
      notificationId: this.notificationId,
      xpReward: this.xpReward,
      isDaily: this.isDaily, // Добавляем флаг ежедневной задачи
      lastCompletedDate: this.lastCompletedDate, // Для отслеживания выполнения ежедневных задач
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
