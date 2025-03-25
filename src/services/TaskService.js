import 'react-native-get-random-values'; // Импортируем перед uuid
import { v4 as uuidv4 } from 'uuid';
import { TaskModel } from '../models';
import StorageService from './StorageService';
import NotificationService from './NotificationService';
import { ProfileService } from './ProfileService';
import { StatisticsService } from './StatisticsService';

const TASKS_STORAGE_KEY = 'tasks';

class TaskService {
  // Получение всех задач
  static async getAllTasks() {
    return await StorageService.getTasks();
  }

  // Получение задачи по ID
  static async getTaskById(taskId) {
    const tasks = await this.getAllTasks();
    return tasks.find(task => task.id === taskId) || null;
  }

  // Создание новой задачи
  static async createTask(taskData) {
    const tasks = await this.getAllTasks();
    
    const newTask = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCompleted: false,
      notificationId: null,
      ...taskData
    };
    
    const updatedTasks = [...tasks, newTask];
    const success = await StorageService.setTasks(updatedTasks);
    
    // Если задача сохранена успешно и у неё есть дедлайн и включено напоминание
    if (success && newTask.dueDate && newTask.reminderEnabled) {
      const notificationId = await NotificationService.scheduleTaskReminder(
        newTask, 
        newTask.reminderTime
      );
      
      // Если уведомление запланировано, сохраняем его ID
      if (notificationId) {
        newTask.notificationId = notificationId;
        await this.updateTask(newTask.id, { notificationId });
      }
    }
    
    // Обновление статистики при создании задачи
    await StatisticsService.updateStatisticsOnTaskCreation(newTask);
    
    return success ? newTask : null;
  }

  // Обновление задачи
  static async updateTask(taskId, taskData) {
    const tasks = await this.getAllTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return null;
    }
    
    const oldTask = tasks[taskIndex];
    const updatedTask = {
      ...oldTask,
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;
    
    const success = await StorageService.setTasks(updatedTasks);
    
    // Обработка уведомлений
    if (success) {
      // Если задача выполнена, отменяем уведомление
      if (updatedTask.isCompleted && updatedTask.notificationId) {
        await NotificationService.cancelTaskReminder(updatedTask.notificationId);
        updatedTask.notificationId = null;
        
        // Обновляем задачу без уведомления
        const tasksWithoutNotification = updatedTasks.map(t => 
          t.id === taskId ? { ...t, notificationId: null } : t
        );
        await StorageService.setTasks(tasksWithoutNotification);
      }
      // Если изменились параметры напоминания, обновляем уведомление
      else if (updatedTask.dueDate && updatedTask.reminderEnabled) {
        const needUpdateNotification = 
          taskData.dueDate !== undefined || 
          taskData.reminderTime !== undefined ||
          (taskData.reminderEnabled !== undefined && taskData.reminderEnabled !== oldTask.reminderEnabled);
        
        if (needUpdateNotification) {
          // Отменяем старое уведомление, если оно есть
          if (updatedTask.notificationId) {
            await NotificationService.cancelTaskReminder(updatedTask.notificationId);
          }
          
          // Создаем новое уведомление
          const notificationId = await NotificationService.scheduleTaskReminder(
            updatedTask, 
            updatedTask.reminderTime
          );
          
          // Обновляем ID уведомления в хранилище
          if (notificationId) {
            updatedTask.notificationId = notificationId;
            const tasksWithNewNotification = updatedTasks.map(t => 
              t.id === taskId ? { ...t, notificationId } : t
            );
            await StorageService.setTasks(tasksWithNewNotification);
          }
        }
      }
      // Если напоминание отключено, отменяем уведомление
      else if (taskData.reminderEnabled === false && updatedTask.notificationId) {
        await NotificationService.cancelTaskReminder(updatedTask.notificationId);
        updatedTask.notificationId = null;
        
        // Обновляем задачу без уведомления
        const tasksWithoutNotification = updatedTasks.map(t => 
          t.id === taskId ? { ...t, notificationId: null } : t
        );
        await StorageService.setTasks(tasksWithoutNotification);
      }
    }
    
    return success ? updatedTask : null;
  }

  // Удаление задачи
  static async deleteTask(taskId) {
    const tasks = await this.getAllTasks();
    const task = tasks.find(t => t.id === taskId);
    
    // Если задача имеет уведомление, отменяем его
    if (task && task.notificationId) {
      await NotificationService.cancelTaskReminder(task.notificationId);
    }
    
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    return await StorageService.setTasks(updatedTasks);
  }

  // Получение задач по категории
  static async getTasksByCategory(categoryId) {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.categoryId === categoryId);
  }

  // Получение задач по статусу выполнения
  static async getTasksByCompletionStatus(isCompleted) {
    try {
      const tasks = await this.getAllTasks();
      return tasks.filter(task => task.isCompleted === isCompleted);
    } catch (error) {
      console.error('Error getting tasks by completion status:', error);
      return [];
    }
  }

  // Получение задач по приоритету
  static async getTasksByPriority(priority) {
    try {
      const tasks = await this.getAllTasks();
      return tasks.filter(task => task.priority === priority);
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      return [];
    }
  }

  // Получение задач с дедлайном на сегодня
  static async getTasksDueToday() {
    try {
      const tasks = await this.getAllTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return tasks.filter(task => {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate >= today && dueDate < tomorrow;
      });
    } catch (error) {
      console.error('Error getting tasks due today:', error);
      return [];
    }
  }

  // Получение просроченных задач
  static async getOverdueTasks() {
    try {
      const tasks = await this.getAllTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return tasks.filter(task => {
        if (!task.dueDate || task.isCompleted) return false;
        
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate < today;
      });
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return [];
    }
  }

  // Модифицируем метод completeTask, исправляя обращение к хранилищу
  async completeTask(taskId) {
    try {
      const tasks = await TaskService.getAllTasks();
      const taskIndex = tasks.findIndex((task) => task.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error(`Task with id ${taskId} not found`);
      }
      
      const task = tasks[taskIndex];
      task.isCompleted = true;
      task.completedAt = new Date().toISOString();
      tasks[taskIndex] = task;
      
      // Используем setTasks вместо setItem
      await StorageService.setTasks(tasks);
      
      // Получаем экземпляр profileService
      const profileService = ProfileService.getInstance();
      
      // Расчет опыта на основе приоритета задачи
      let experiencePoints = 10; // Базовый опыт
      
      if (task.priority === 'medium') {
        experiencePoints = 20;
      } else if (task.priority === 'high') {
        experiencePoints = 30;
      }
      
      // Дополнительные бонусы за выполнение до дедлайна
      if (task.dueDate) {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        
        if (now < dueDate) {
          experiencePoints += 10; // Бонус за выполнение до срока
        }
      }
      
      // Добавляем опыт и обновляем статистику (используем только один способ)
      const result = await profileService.addExperience(experiencePoints);
      await profileService.updateStatsOnTaskComplete();
      
      // Обновление статистики
      await StatisticsService.updateStatisticsOnTaskCompletion(task, experiencePoints);
      
      return { 
        task, 
        experience: experiencePoints,
        ...result
      };
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }
}

export default TaskService;
