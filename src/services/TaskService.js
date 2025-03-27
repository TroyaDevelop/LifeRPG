import 'react-native-get-random-values'; // Импортируем перед uuid
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskModel } from '../models';
import StorageService from './StorageService';
import NotificationService from './NotificationService';
import { ProfileService } from './ProfileService';
import { StatisticsService } from './StatisticsService';
import { AchievementService } from './AchievementService';

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

  // Изменяем метод completeTask на статический
  static async completeTask(taskId) {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        const now = new Date();
        
        // Проверяем, сколько времени прошло с момента создания задачи
        const createdAt = new Date(task.createdAt || now);
        const minutesSinceCreation = (now - createdAt) / (1000 * 60);
        
        // Если задача выполнена менее чем через 5 минут после создания,
        // снижаем "вес" этой задачи в расчете эффективности
        if (minutesSinceCreation < 5) {
          console.log(`Задача ${taskId} выполнена слишком быстро (${Math.round(minutesSinceCreation)} мин.), это может повлиять на расчет эффективности`);
          task.quickComplete = true; // Отмечаем задачу как "быстро выполненную"
        }
        
        task.isCompleted = true;
        task.completedAt = now.toISOString();
        tasks[taskIndex] = task;
        
        await StorageService.setTasks(tasks); // Используем StorageService вместо AsyncStorage
        
        // Расчет опыта в зависимости от приоритета задачи
        let experienceGained = 10; // базовый опыт
        if (task.priority === 'medium') experienceGained = 20;
        if (task.priority === 'high') experienceGained = 30;
        
        // Обновление статистики
        await StatisticsService.updateStatisticsOnTaskCompletion(task, experienceGained);
        
        // Получаем экземпляр ProfileService
        const profileService = ProfileService.getInstance();
        
        // Обновление статистики профиля
        await profileService.updateStatsOnTaskComplete();
        
        // Добавление опыта пользователю
        const result = await profileService.addExperience(experienceGained);
        
        // Обновление достижений при выполнении задачи
        const achievementsResult = await AchievementService.updateAchievementsOnTaskComplete(task, result.profile);
        
        return { 
          success: true, 
          task, 
          experienceGained, 
          ...result,
          achievements: achievementsResult
        };
      }
      
      return { success: false, error: 'Задача не найдена' };
    } catch (error) {
      console.error('Ошибка при выполнении задачи:', error);
      return { success: false, error: error.message };
    }
  }

  // Метод для отмены выполнения задачи
  static async uncompleteTask(taskId) {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        
        // Проверяем, была ли задача выполнена ранее
        if (!task.isCompleted) {
          return { success: false, message: 'Задача не была отмечена как выполненная' };
        }
        
        // Запоминаем, когда задача была выполнена
        const completedAt = task.completedAt ? new Date(task.completedAt) : null;
        const now = new Date();
        
        // Вычисляем опыт, который нужно отнять (такой же алгоритм как при начислении)
        const baseExperience = task.priority === 'high' ? 10 : (task.priority === 'medium' ? 5 : 3);
        const experienceToDeduct = baseExperience + (task.difficulty || 0);
        
        // Отменяем выполнение задачи
        task.isCompleted = false;
        task.completedAt = null;
        tasks[taskIndex] = task;
        await this.saveTasks(tasks);
        
        // Получаем профиль пользователя
        const profileService = ProfileService.getInstance();
        const profile = await profileService.getProfile();
        
        // Отнимаем опыт и возможно понижаем уровень
        profile.experience -= experienceToDeduct;
        
        // Не позволяем опыту упасть ниже 0
        if (profile.experience < 0) {
          // Если опыт ниже 0 и уровень больше 1, понижаем уровень
          if (profile.level > 1) {
            profile.level -= 1;
            profile.experience = Math.max(0, profile.experience + profile.experienceToNextLevel);
          } else {
            // Не позволяем опыту упасть ниже 0 на первом уровне
            profile.experience = 0;
          }
        }
        
        await profileService.saveProfile(profile);
        
        // Обновляем статистику
        await StatisticsService.updateStatisticsOnTaskUncompletion(task, experienceToDeduct);
        
        // Обновляем достижения, связанные с количеством выполненных задач
        await AchievementService.updateAchievementsOnTaskUncompletion(task, profile);
        
        return { 
          success: true, 
          experienceDeducted: experienceToDeduct, 
          profile
        };
      }
      
      return { success: false, message: 'Задача не найдена' };
    } catch (error) {
      console.error('Ошибка при отмене выполнения задачи:', error);
      return { success: false, message: error.message };
    }
  }
}

export default TaskService;
