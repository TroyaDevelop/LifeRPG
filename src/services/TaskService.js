import 'react-native-get-random-values'; // Импортируем перед uuid
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskModel } from '../models';
import StorageService from './StorageService';
import NotificationService from './NotificationService';
import { ProfileService } from './ProfileService';
import { StatisticsService } from './StatisticsService';
import { AchievementService } from './AchievementService';

let tasksCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 минута действия кэша

const TASKS_STORAGE_KEY = 'tasks';

export class TaskService {
  // Получение всех задач
  static async getAllTasks(forceRefresh = false) {
    // Если запрошено принудительное обновление или кэш отсутствует
    if (forceRefresh || !tasksCache) {
      try {
        const data = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        const tasks = data ? JSON.parse(data).map(taskData => 
          new TaskModel(taskData)
        ) : [];
        
        tasksCache = tasks;
        return tasks;
      } catch (error) {
        console.error('Ошибка при получении задач:', error);
        return [];
      }
    }
    
    return tasksCache;
  }

  // Получение задачи по ID
  static async getTaskById(taskId) {
    const tasks = await this.getAllTasks();
    return tasks.find(task => task.id === taskId) || null;
  }

  // Создание новой задачи
  static async createTask(taskData) {
    try {
      const tasks = await this.getAllTasks();
      
      // Преобразуем данные задачи в модель
      const newTask = new TaskModel({
        ...taskData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('TaskService: Создаваемая задача:', newTask.toJSON());
      
      const updatedTasks = [...tasks, newTask.toJSON()];
      const success = await StorageService.setTasks(updatedTasks);
      
      // Инвалидируем кэш после создания
      this.invalidateCache();
      
      // Обновление статистики при создании задачи
      await StatisticsService.updateStatisticsOnTaskCreation(newTask);
      
      return success ? newTask.toJSON() : null;
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      return null;
    }
  }

  // Обновление задачи
  static async updateTask(taskId, taskData) {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) {
        console.error('Задача не найдена:', taskId);
        return null;
      }
      
      // Убедимся, что categoryId корректно обрабатывается
      console.log('TaskService: Исходные данные для обновления:', taskData);
      
      const updatedTask = {
        ...tasks[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('TaskService: Обновленная задача:', updatedTask);
      
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      
      const success = await StorageService.setTasks(updatedTasks);
      
      // Инвалидируем кэш
      this.invalidateCache();
      
      return success ? updatedTask : null;
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      return null;
    }
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

  /**
   * Отмена выполнения задачи и снятие полученного опыта
   * @param {object|string} taskOrId - задача или ее ID
   * @returns {Promise<object>} - результат операции
   */
  static async uncompleteTask(taskOrId) {
    try {
      const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.id;
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return { success: false, error: 'Задача не найдена' };
      }
      
      const task = tasks[taskIndex];
      
      // Проверяем, что задача была выполнена
      if (!task.isCompleted) {
        return { success: false, error: 'Задача не была выполнена' };
      }
      
      // Определяем, сколько опыта нужно вернуть
      let experienceToReturn = 10; // базовый опыт
      if (task.priority === 'medium') experienceToReturn = 20;
      if (task.priority === 'high') experienceToReturn = 30;
      
      // Сбрасываем статус выполнения
      task.isCompleted = false;
      task.completedAt = null;
      
      if (task.isDaily) {
        task.lastCompletedDate = null;
      }
      
      // Обновляем задачу в списке
      tasks[taskIndex] = task;
      const success = await StorageService.setTasks(tasks);
      
      if (!success) {
        return { success: false, error: 'Не удалось сохранить изменения' };
      }
      
      // Обновление статистики при отмене выполнения
      await StatisticsService.updateStatisticsOnTaskUncompletion(task, experienceToReturn);
      
      // Получаем экземпляр ProfileService
      const profileService = ProfileService.getInstance();
      
      // Обновление статистики профиля
      await profileService.updateStatsOnTaskUncomplete();
      
      // Снимаем опыт у пользователя
      const result = await profileService.subtractExperience(experienceToReturn);
      
      // Инвалидируем кэш
      this.invalidateCache();
      
      return { 
        success: true, 
        task, 
        experienceReturned: experienceToReturn, // Используем experienceToReturn вместо experienceReturned
        profile: result.profile,
        levelDown: result.didLevelDown ? {
          level: result.newLevel
        } : null
      };
    } catch (error) {
      console.error('Ошибка при отмене выполнения задачи:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получение ежедневных задач
   * @returns {Promise<Array>} - массив ежедневных задач
   */
  static async getDailyTasks() {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter(task => task.isDaily);
    } catch (error) {
      console.error('Ошибка при получении ежедневных задач:', error);
      return [];
    }
  }
  
  /**
   * Получение обычных задач (не ежедневных)
   * @returns {Promise<Array>} - массив обычных задач
   */
  static async getRegularTasks() {
    try {
      const allTasks = await this.getAllTasks();
      return allTasks.filter(task => !task.isDaily);
    } catch (error) {
      console.error('Ошибка при получении обычных задач:', error);
      return [];
    }
  }
  
  /**
   * Сброс ежедневных задач (вызывается через SchedulerService)
   * @returns {Promise<boolean>} - результат операции
   */
  static async resetDailyTasks() {
    try {
      const dailyTasks = await this.getDailyTasks();
      const today = new Date().toISOString().split('T')[0];
      let updatedCount = 0;
      
      for (const task of dailyTasks) {
        // Сбрасываем только те задачи, которые были выполнены не сегодня
        if (task.isCompleted && (!task.lastCompletedDate || task.lastCompletedDate !== today)) {
          // Обновляем задачу: сбрасываем статус выполнения, но сохраняем историю
          const updatedTask = {
            ...task,
            isCompleted: false,
            completedAt: null
          };
          
          await this.updateTask(updatedTask.id, updatedTask);
          updatedCount++;
        }
      }
      
      console.log(`Сброшено ${updatedCount} из ${dailyTasks.length} ежедневных задач`);
      return true;
    } catch (error) {
      console.error('Ошибка при сбросе ежедневных задач:', error);
      return false;
    }
  }
  
  /**
   * Отметка задачи как выполненной
   * @param {object|string} taskOrId - задача или ее ID
   * @returns {Promise<object>} - результат операции
   */
  static async completeTask(taskOrId) {
    try {
      const taskId = typeof taskOrId === 'string' ? taskOrId : taskOrId.id;
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        return { success: false, error: 'Задача не найдена' };
      }
      
      const task = tasks[taskIndex];
      const now = new Date();
      
      // Если задача уже выполнена, просто возвращаем её
      if (task.isCompleted) {
        return { success: true, task, alreadyCompleted: true };
      }
      
      // Устанавливаем выполнение задачи
      task.isCompleted = true;
      task.completedAt = now.toISOString();
      
      // Для ежедневных задач записываем дату выполнения
      if (task.isDaily) {
        task.lastCompletedDate = now.toISOString().split('T')[0];
      }
      
      // Создаем новый массив задач для сохранения
      let updatedTasks = [...tasks];
      updatedTasks[taskIndex] = task;
      
      // Расчет опыта в зависимости от приоритета задачи
      let experienceGained = 10; // базовый опыт
      if (task.priority === 'medium') experienceGained = 20;
      if (task.priority === 'high') experienceGained = 30;
      
      // Отменяем уведомление, если оно было
      if (task.notificationId) {
        await NotificationService.cancelTaskReminder(task.notificationId);
      }
      
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
      
      let taskRemoved = false;
      
      // Проверяем настройку автоудаления для обычных задач
      if (!task.isDaily) {
        try {
          const profile = await profileService.getProfile();
          const autoDeleteCompletedTasks = profile.settings?.autoDeleteCompletedTasks ?? true;
          
          // Если включено автоудаление, удаляем задачу из массива перед сохранением
          if (autoDeleteCompletedTasks) {
            updatedTasks = updatedTasks.filter(t => t.id !== taskId);
            taskRemoved = true;
          }
        } catch (error) {
          console.error('Ошибка при проверке настройки автоудаления:', error);
        }
      }
      
      // Сохраняем обновленные задачи
      const success = await StorageService.setTasks(updatedTasks);
      
      if (!success) {
        return { success: false, error: 'Не удалось сохранить изменения' };
      }
      
      // Инвалидируем кэш
      this.invalidateCache();
      
      return {
        success: true, 
        task, 
        experienceGained, 
        taskRemoved,
        profile: result.profile,
        levelUp: result.didLevelUp ? {
          level: result.newLevel,
          bonuses: result.bonuses || []
        } : null,
        achievements: achievementsResult
      };
    } catch (error) {
      console.error('Ошибка при выполнении задачи:', error);
      return { success: false, error: error.message };
    }
  }

  // Добавьте метод для инвалидации кэша при изменениях
  static invalidateCache() {
    console.log('Invalidating tasks cache');
    tasksCache = null;
  }

  // Добавляем метод сброса всех задач

  /**
   * Сброс всех задач
   * @returns {Promise<boolean>} - Результат операции
   */
  static async resetAllTasks() {
    try {
      console.log('TaskService: Начинаем сброс всех задач');
      
      // Очищаем хранилище
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
      
      // Очищаем кэш в сервисе, если он используется
      tasksCache = [];
      
      console.log('TaskService: Все задачи успешно сброшены');
      return true;
    } catch (error) {
      console.error('TaskService: Ошибка при сбросе задач:', error);
      return false;
    }
  }
}
export default TaskService;