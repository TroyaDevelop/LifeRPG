import { v4 as uuidv4 } from 'uuid';

class TaskModel {
  constructor({
    id = uuidv4(),
    title = '',
    description = '',
    dueDate = null,
    priority = 'medium', // 'low', 'medium', 'high'
    categoryId = null,
    isCompleted = false,
    completedAt = null,
    createdAt = new Date(),
    updatedAt = new Date(),
    reminderEnabled = false,
    reminderTime = null,
    notificationId = null,
    xpReward = 10, // базовое значение опыта за выполнение
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.categoryId = categoryId;
    this.isCompleted = isCompleted;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.reminderEnabled = reminderEnabled;
    this.reminderTime = reminderTime;
    this.notificationId = notificationId;
    this.xpReward = this.calculateXpReward(priority);
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
      categoryId: this.categoryId,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      reminderEnabled: this.reminderEnabled,
      reminderTime: this.reminderTime,
      notificationId: this.notificationId,
      xpReward: this.xpReward,
    };
  }

  // Статический метод для создания экземпляра TaskModel из обычного объекта
  static fromJSON(json) {
    return new TaskModel({
      ...json,
      dueDate: json.dueDate ? new Date(json.dueDate) : null,
      createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : new Date(),
      completedAt: json.completedAt ? new Date(json.completedAt) : null,
      reminderTime: json.reminderTime ? new Date(json.reminderTime) : null,
    });
  }
}

export default TaskModel;
