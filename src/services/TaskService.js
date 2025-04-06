import 'react-native-get-random-values'; // Импортируем перед uuid
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskModel } from '../models';
import StorageService from './StorageService';
import NotificationService from './NotificationService';
import { ProfileService } from './ProfileService';
import { StatisticsService } from './StatisticsService';

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
        isCompleted: false, // Явно устанавливаем задачу как невыполненную
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
    try {
      const tasks = await this.getAllTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        console.warn('TaskService: Задача с ID', taskId, 'не найдена');
        return false;
      }
      
      // Если задача имеет уведомление, отменяем его
      if (task.notificationId) {
        await NotificationService.cancelTaskReminder(task.notificationId);
      }
      
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      
      // Сохраняем напрямую в AsyncStorage
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      // Инвалидируем кэш после удаления
      this.invalidateCache();
      
      console.log('TaskService: Задача успешно удалена, ID:', taskId);
      return true;
    } catch (error) {
      console.error('TaskService: Ошибка при удалении задачи:', error);
      return false;
    }
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
  static async uncompleteTask(taskId) {
    try {
      const task = await this.getTaskById(taskId);
      if (!task) {
        throw new Error('Задача не найдена');
      }

      if (!task.isCompleted) {
        return { success: false, message: 'Задача не была выполнена' };
      }

      const profileService = new ProfileService();
      
      // Используем сохраненное значение фактически потраченной энергии
      const energyReturn = task.energySpent || 0;
      
      // Возвращаем опыт, только если он был начислен
      const experienceReturn = !task.noExperienceGained ? this.calculateExperience(task) : 0;
      
      // Снимаем метку выполнения и очищаем связанные данные
      task.isCompleted = false;
      task.completedAt = null;
      task.noExperienceGained = undefined;
      task.energySpent = 0; // Сбрасываем сохраненную энергию
      await this.updateTask(taskId, task);
      
      // Возвращаем энергию только если она была потрачена
      if (energyReturn > 0) {
        await profileService.updateEnergy(energyReturn);
      }
      
      // Забираем опыт, если он был начислен
      if (experienceReturn > 0) {
        await profileService.addExperience(-experienceReturn);
      }
      
      return {
        success: true,
        task,
        experienceReturned: experienceReturn,
        energyReturned: energyReturn
      };
    } catch (error) {
      console.error('Ошибка при отмене выполнения задачи:', error);
      throw error;
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
      const allTasks = await this.getAllTasks();
      const dailyTasks = allTasks.filter(task => task.type === 'daily');
      
      // Подсчет невыполненных задач для штрафа здоровья
      const missedTasks = dailyTasks.filter(task => !task.isCompleted);
      
      if (missedTasks.length > 0) {
        // Отнимаем здоровье за пропущенные задачи
        const profileService = new ProfileService();
        await profileService.processDailyHealthUpdate(false, missedTasks.length);
      }
      
      // Сбрасываем статус всех ежедневных задач
      for (const task of dailyTasks) {
        task.isCompleted = false;
        task.completedAt = null;
        await this.updateTask(task.id, task);
      }
      
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
  static async completeTask(taskId) {
    try {
      const task = await this.getTaskById(taskId);
      if (!task) {
        throw new Error('Задача не найдена');
      }

      if (task.isCompleted) {
        return { success: false, message: 'Задача уже выполнена' };
      }

      const profileService = new ProfileService();
      const profile = await profileService.getProfile();
      
      // Вычисляем затраты энергии и потенциальный опыт
      const energyCost = TaskService.calculateEnergyCost(task);
      const experienceGain = TaskService.calculateExperience(task);
      
      // Проверяем, достаточно ли энергии
      const hasEnoughEnergy = profile.energy >= energyCost;
      
      // Фактически полученный опыт
      const actualExperienceGain = hasEnoughEnergy ? experienceGain : 0;
      
      // Отмечаем задачу как выполненную
      task.isCompleted = true;
      task.completedAt = new Date().toISOString();
      
      // Помечаем, получил ли игрок опыт за задачу и сколько потратил энергии
      task.noExperienceGained = !hasEnoughEnergy;
      const energySpent = hasEnoughEnergy ? energyCost : Math.min(energyCost, profile.energy);
      task.energySpent = energySpent; // Сохраняем фактически потраченную энергию
      
      // Проверяем настройку автоудаления
      const autoDeleteEnabled = profile.settings?.autoDeleteCompletedTasks;
      let taskRemoved = false;
      
      // Если это обычная задача (не ежедневная) и автоудаление включено
      if (autoDeleteEnabled && task.type === 'regular') {
        // Удаляем задачу
        await this.deleteTask(taskId);
        taskRemoved = true;
        
        // Удаляем напоминание, если есть
        if (task.notificationId) {
          await NotificationService.cancelTaskReminder(task.notificationId);
        }
      } else {
        // Иначе просто обновляем задачу
        await this.updateTask(taskId, task);
      }
      
      // Расходуем энергию
      if (energySpent > 0) {
        await profileService.updateEnergy(-energySpent);
      }
      
      // Начисляем опыт если хватило энергии
      let levelUp = null;
      if (actualExperienceGain > 0) {
        levelUp = await profileService.addExperience(actualExperienceGain);
      }
      
      // Обновляем счетчики в профиле
      await profileService.updateStatsOnTaskComplete();
      
      await StatisticsService.updateStatisticsOnTaskCompletion(task, actualExperienceGain);
      
      // Проверяем, все ли ежедневные задачи выполнены
      if (task.type === 'daily') {
        const allTasks = await this.getAllTasks();
        const dailyTasks = allTasks.filter(t => t.type === 'daily');
        const allDailyCompleted = dailyTasks.every(t => t.isCompleted);
        
        // Если все ежедневные задачи выполнены, восстанавливаем часть здоровья
        if (allDailyCompleted) {
          await profileService.processDailyHealthUpdate(true, 0);
        }
      }
      
      return {
        success: true,
        task,
        taskRemoved,  // Добавляем флаг удаления задачи
        experienceGained: actualExperienceGain,
        energySpent,
        insufficientEnergy: !hasEnoughEnergy,
        levelUp
      };
    } catch (error) {
      console.error('Ошибка при выполнении задачи:', error);
      throw error;
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

  // Расчет стоимости энергии для задачи
  static calculateEnergyCost(task) {
    switch (task.priority) {
      case 'high': return 15;
      case 'medium': return 10;
      case 'low': return 5;
      default: return 10;
    }
  }

  // Расчет опыта за выполнение задачи
  static calculateExperience(task) {
    switch (task.priority) {
      case 'high': return 30;
      case 'medium': return 20;
      case 'low': return 10;
      default: return 20;
    }
  }
}
export default TaskService;