import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatisticsModel } from '../models/StatisticsModel';

const STATS_STORAGE_KEY = '@LifeRPG:statistics';

export class StatisticsService {
  // Получение статистики за определенный день
  static async getDailyStatistics(date) {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const statsKey = `${STATS_STORAGE_KEY}:${dateStr}`;
      const statsData = await AsyncStorage.getItem(statsKey);
      
      if (statsData) {
        return new StatisticsModel(JSON.parse(statsData));
      }
      
      // Если нет данных за этот день, создаем новую статистику
      const newStats = new StatisticsModel({ date: dateStr });
      await AsyncStorage.setItem(statsKey, JSON.stringify(newStats));
      return newStats;
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      return new StatisticsModel();
    }
  }
  
  // Сохранение статистики
  static async saveStatistics(statistics) {
    try {
      const statsKey = `${STATS_STORAGE_KEY}:${statistics.date}`;
      await AsyncStorage.setItem(statsKey, JSON.stringify(statistics));
    } catch (error) {
      console.error('Ошибка при сохранении статистики:', error);
    }
  }
  
  // Получение статистики за неделю
  static async getWeeklyStatistics() {
    try {
      const today = new Date();
      const weeklyStats = [];
      
      // Получаем данные за последние 7 дней
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const stats = await this.getDailyStatistics(date);
        weeklyStats.push(stats);
      }
      
      return weeklyStats.reverse(); // От старых к новым
    } catch (error) {
      console.error('Ошибка при получении недельной статистики:', error);
      return [];
    }
  }
  
  // Получение статистики за месяц
  static async getMonthlyStatistics() {
    try {
      const today = new Date();
      const monthlyStats = [];
      
      // Получаем данные за последние 30 дней
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const stats = await this.getDailyStatistics(date);
        monthlyStats.push(stats);
      }
      
      return monthlyStats.reverse(); // От старых к новым
    } catch (error) {
      console.error('Ошибка при получении месячной статистики:', error);
      return [];
    }
  }
  
  // Обновление статистики при выполнении задачи
  static async updateStatisticsOnTaskCompletion(task, experienceGained) {
    try {
      const today = new Date();
      const stats = await this.getDailyStatistics(today);
      stats.updateOnTaskCompletion(task, experienceGained);
      await this.saveStatistics(stats);
      return stats;
    } catch (error) {
      console.error('Ошибка при обновлении статистики:', error);
    }
  }
  
  // Обновление статистики при создании задачи
  static async updateStatisticsOnTaskCreation(task) {
    try {
      const today = new Date();
      const stats = await this.getDailyStatistics(today);
      stats.updateOnTaskCreation(task);
      await this.saveStatistics(stats);
      return stats;
    } catch (error) {
      console.error('Ошибка при обновлении статистики:', error);
    }
  }
  
  // Обновление статистических данных с указанной датой
  static async updateStatisticsData(dateStr, data) {
    try {
      const stats = await this.getDailyStatistics(new Date(dateStr));
      
      // Обновляем запланированные задачи
      if (data.plannedTasks !== undefined) {
        stats.dailyStats.tasksPlanned = data.plannedTasks;
      }
      
      // Обновляем просроченные задачи
      if (data.overdueTasks !== undefined) {
        stats.dailyStats.tasksOverdue = data.overdueTasks;
      }
      
      // Пересчитываем коэффициент завершения
      stats.dailyStats.completionRate = stats.calculateCompletionRate();
      
      // Сохраняем обновленную статистику
      await this.saveStatistics(stats);
      return stats;
    } catch (error) {
      console.error('Ошибка при обновлении статистических данных:', error);
      return null;
    }
  }
  
  // Расчет эффективности за период (неделя или месяц)
  static calculateEfficiency(statisticsArray) {
    if (!statisticsArray || statisticsArray.length === 0) return 0;
    
    // Минимальное количество дней для точного расчета
    const MIN_DAYS_REQUIRED = 3;
    const daysCount = statisticsArray.length;
    
    // Если дней меньше минимума, снижаем максимально возможную эффективность
    const daysFactor = Math.min(1, daysCount / MIN_DAYS_REQUIRED);
    
    let totalCompleted = 0;
    let totalCreated = 0;
    let totalPlanned = 0;
    let totalOverdue = 0;
    
    statisticsArray.forEach(stats => {
      totalCompleted += stats.dailyStats.tasksCompleted || 0;
      totalCreated += stats.dailyStats.tasksCreated || 0;
      totalPlanned += stats.dailyStats.tasksPlanned || 0;
      totalOverdue += stats.dailyStats.tasksOverdue || 0;
    });
    
    // Общее число задач для расчета
    const totalTasksForEfficiency = Math.max(
      totalCompleted, 
      totalCreated + totalPlanned
    ) + totalOverdue;
    
    // Если нет задач, эффективность равна 0
    if (totalTasksForEfficiency === 0) return 0;
    
    // Минимальное количество задач для корректного расчета
    const MIN_TASKS_FOR_ACCURACY = 5;
    
    // Коэффициент снижения эффективности при малом количестве задач
    const tasksFactor = Math.min(1, totalTasksForEfficiency / MIN_TASKS_FOR_ACCURACY);
    
    // Базовый расчет эффективности
    let rawEfficiency = Math.round((totalCompleted / totalTasksForEfficiency) * 100);
    
    // Применяем коэффициенты для учета количества дней и задач
    const adjustedEfficiency = Math.round(rawEfficiency * daysFactor * tasksFactor);
    
    console.log(`Расчет эффективности: ${rawEfficiency}% * ${daysFactor} (дни) * ${tasksFactor} (задачи) = ${adjustedEfficiency}%`);
    
    return adjustedEfficiency;
  }
  
  // Получение статистики по дням недели
  static async getWeekdayStatistics() {
    try {
      // Объект для хранения данных по дням недели
      const weekdayStats = {
        'Понедельник': { completed: 0, created: 0, planned: 0, overdue: 0, efficiency: 0, count: 0 },
        'Вторник': { completed: 0, created: 0, planned: 0, overdue: 0, efficiency: 0, count: 0 },
        'Среда': { completed: 0, created: 0, planned: 0, overdue: 0, efficiency: 0, count: 0 },
        'Четверг': { completed: 0, created: 0, planned: 0, overdue: 0, efficiency: 0, count: 0 },
        'Пятница': { completed: 0, created: 0, planned: 0, overdue: 0, efficiency: 0, count: 0 },
        'Суббота': { completed: 0, created: 0, planned: 0, overdue: 0, efficiency: 0, count: 0 },
        'Воскресенье': { completed: 0, created: 0, planned: 0, overdue: 0, efficiency: 0, count: 0 }
      };
      
      // Получаем данные за месяц для более точной статистики
      const monthlyStats = await this.getMonthlyStatistics();
      
      if (!monthlyStats || monthlyStats.length === 0) {
        return weekdayStats;
      }
      
      // Группируем статистику по дням недели
      for (const stats of monthlyStats) {
        if (!stats || !stats.date) continue;
        
        const date = new Date(stats.date);
        // Получаем день недели (0 - воскресенье, 1 - понедельник и т.д.)
        const dayIndex = date.getDay();
        const dayNames = [
          'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 
          'Четверг', 'Пятница', 'Суббота'
        ];
        const dayOfWeek = dayNames[dayIndex];
        
        // Добавляем данные в соответствующий день недели
        if (stats.dailyStats) {
          weekdayStats[dayOfWeek].completed += stats.dailyStats.tasksCompleted || 0;
          weekdayStats[dayOfWeek].created += stats.dailyStats.tasksCreated || 0;
          weekdayStats[dayOfWeek].planned += stats.dailyStats.tasksPlanned || 0;
          weekdayStats[dayOfWeek].overdue += stats.dailyStats.tasksOverdue || 0;
          
          // Используем существующую эффективность или рассчитываем, если нет
          const efficiency = stats.dailyStats.completionRate || this.calculateDailyEfficiency(stats.dailyStats);
          weekdayStats[dayOfWeek].efficiency += efficiency;
          weekdayStats[dayOfWeek].count += 1;
        }
      }
      
      // Вычисляем средние значения эффективности
      for (const day in weekdayStats) {
        if (weekdayStats[day].count > 0) {
          weekdayStats[day].efficiency = Math.round(weekdayStats[day].efficiency / weekdayStats[day].count);
        }
      }
      
      return weekdayStats;
    } catch (error) {
      console.error('Ошибка при получении статистики по дням недели:', error);
      return {};
    }
  }
  
  // Получение лучшего и худшего дня недели по эффективности
  static async getBestAndWorstDay() {
    try {
      const weekdayStats = await this.getWeekdayStatistics();
      
      let bestDay = { day: null, efficiency: -1 };
      let worstDay = { day: null, efficiency: 101 }; // 101%, т.к. максимум 100%
      
      for (const day in weekdayStats) {
        const dayStats = weekdayStats[day];
        
        // Проверяем только дни с данными
        if (dayStats.count > 0) {
          if (dayStats.efficiency > bestDay.efficiency) {
            bestDay = { day, efficiency: dayStats.efficiency };
          }
          
          if (dayStats.efficiency < worstDay.efficiency) {
            worstDay = { day, efficiency: dayStats.efficiency };
          }
        }
      }
      
      // Если нет данных, устанавливаем значения по умолчанию
      if (bestDay.day === null) {
        bestDay = { day: 'Не определен', efficiency: 0 };
      }
      
      if (worstDay.day === null) {
        worstDay = { day: 'Не определен', efficiency: 0 };
      }
      
      return { bestDay, worstDay };
    } catch (error) {
      console.error('Ошибка при определении лучшего и худшего дня:', error);
      return { bestDay: { day: 'Не определен', efficiency: 0 }, worstDay: { day: 'Не определен', efficiency: 0 } };
    }
  }
  
  // Вспомогательный метод для расчета дневной эффективности
  static calculateDailyEfficiency(dailyStats) {
    if (!dailyStats) return 0;
    
    const completed = dailyStats.tasksCompleted || 0;
    const created = dailyStats.tasksCreated || 0;
    const planned = dailyStats.tasksPlanned || 0;
    const overdue = dailyStats.tasksOverdue || 0;
    
    const totalTasksForEfficiency = Math.max(completed, created + planned) + overdue;
    
    if (totalTasksForEfficiency === 0) return 0;
    
    return Math.round((completed / totalTasksForEfficiency) * 100);
  }

  // Вспомогательный метод для определения дня недели из даты
  static getDayOfWeekFromDate(dateStr) {
    try {
      const date = new Date(dateStr);
      const days = [
        'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 
        'Четверг', 'Пятница', 'Суббота'
      ];
      return days[date.getDay()];
    } catch (error) {
      console.error('Ошибка при определении дня недели:', error, dateStr);
      return 'Понедельник'; // По умолчанию
    }
  }

  /**
   * Обновление статистики при отмене выполнения задачи
   * @param {object} task - задача, для которой отменено выполнение
   * @param {number} experienceReturned - возвращенный опыт
   */
  static async updateStatisticsOnTaskUncompletion(task, experienceReturned) {
    try {
      // Получаем текущую статистику за день
      const today = new Date();
      const dailyStats = await this.getDailyStatistics(today);
      
      if (!dailyStats || !dailyStats.dailyStats) {
        console.error('Не удалось получить ежедневную статистику');
        return;
      }
      
      // Обновляем статистику
      dailyStats.dailyStats.tasksCompleted = Math.max(0, (dailyStats.dailyStats.tasksCompleted || 0) - 1);
      dailyStats.dailyStats.totalExperienceGained = Math.max(0, (dailyStats.dailyStats.totalExperienceGained || 0) - experienceReturned);
      
      // Пересчитываем коэффициент выполнения
      const totalTasks = dailyStats.dailyStats.tasksCreated + 
                        (dailyStats.dailyStats.tasksPlanned || 0);
      
      if (totalTasks > 0) {
        dailyStats.dailyStats.completionRate = Math.round(
          (dailyStats.dailyStats.tasksCompleted / totalTasks) * 100
        );
      }
      
      // Сохраняем обновленную статистику
      await this.saveStatistics(dailyStats);
    } catch (error) {
      console.error('Ошибка при обновлении статистики отмены выполнения:', error);
    }
  }

  /**
   * Получение всей статистики для контекста
   * @returns {Promise<Object>} - Объект со всеми данными статистики
   */
  static async getAllStatistics() {
    try {
      console.log('StatisticsService: Начинаем загрузку всей статистики');
      
      // Создаем новую модель статистики для текущего дня
      const today = new Date();
      const dailyStats = new StatisticsModel({
        date: today.toISOString().split('T')[0]
      });
      
      // Загружаем сохраненную статистику для текущего дня, если она есть
      const dailyKey = `${STATS_STORAGE_KEY}:${today.toISOString().split('T')[0]}`;
      let dailyStatistics = dailyStats;
      
      try {
        const dailyData = await AsyncStorage.getItem(dailyKey);
        if (dailyData) {
          dailyStatistics = new StatisticsModel(JSON.parse(dailyData));
        }
      } catch (dailyError) {
        console.error('StatisticsService: Ошибка при загрузке дневной статистики:', dailyError);
      }
      
      // Загружаем недельную статистику с защитой от ошибок
      let weeklyStatistics = [];
      try {
        weeklyStatistics = await this._getWeeklyDataFromStorage();
      } catch (weeklyError) {
        console.error('StatisticsService: Ошибка при загрузке недельной статистики:', weeklyError);
      }
      
      // Загружаем месячную статистику с защитой от ошибок
      let monthlyStatistics = [];
      try {
        monthlyStatistics = await this._getMonthlyDataFromStorage();
      } catch (monthlyError) {
        console.error('StatisticsService: Ошибка при загрузке месячной статистики:', monthlyError);
      }
      
      // Рассчитываем статистику по дням недели с защитой от ошибок
      let weekdayStatistics = {};
      try {
        weekdayStatistics = this._calculateWeekdayStats(weeklyStatistics);
      } catch (weekdayError) {
        console.error('StatisticsService: Ошибка при расчете статистики по дням недели:', weekdayError);
      }
      
      const result = {
        dailyStatistics,
        weeklyStatistics,
        monthlyStatistics,
        weekdayStatistics
      };
      
      console.log('StatisticsService: Статистика успешно загружена');
      return result;
    } catch (error) {
      console.error('StatisticsService: Ошибка при получении всей статистики:', error);
      // Возвращаем базовую структуру при ошибке
      return {
        dailyStatistics: new StatisticsModel(),
        weeklyStatistics: [],
        monthlyStatistics: [],
        weekdayStatistics: {}
      };
    }
  }
  
  /**
   * Получение недельных данных из хранилища
   * @private
   * @returns {Promise<Array>} - Массив статистики за неделю
   */
  static async _getWeeklyDataFromStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const statKeys = keys.filter(key => key.startsWith(STATS_STORAGE_KEY));
      
      // Получаем все элементы статистики
      const allStats = await AsyncStorage.multiGet(statKeys);
      
      // Фильтруем только данные за последние 7 дней
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const weeklyStats = [];
      
      allStats.forEach(([key, value]) => {
        if (value) {
          const data = JSON.parse(value);
          const statsDate = new Date(data.date);
          
          if (statsDate >= sevenDaysAgo) {
            weeklyStats.push(new StatisticsModel(data));
          }
        }
      });
      
      // Сортируем по дате
      weeklyStats.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return weeklyStats;
    } catch (error) {
      console.error('StatisticsService: Ошибка при получении недельных данных:', error);
      return [];
    }
  }
  
  /**
   * Получение месячных данных из хранилища
   * @private
   * @returns {Promise<Array>} - Массив статистики за месяц
   */
  static async _getMonthlyDataFromStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const statKeys = keys.filter(key => key.startsWith(STATS_STORAGE_KEY));
      
      // Получаем все элементы статистики
      const allStats = await AsyncStorage.multiGet(statKeys);
      
      // Фильтруем только данные за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyStats = [];
      
      allStats.forEach(([key, value]) => {
        if (value) {
          const data = JSON.parse(value);
          const statsDate = new Date(data.date);
          
          if (statsDate >= thirtyDaysAgo) {
            monthlyStats.push(new StatisticsModel(data));
          }
        }
      });
      
      // Сортируем по дате
      monthlyStats.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return monthlyStats;
    } catch (error) {
      console.error('StatisticsService: Ошибка при получении месячных данных:', error);
      return [];
    }
  }
  
  /**
   * Рассчитывает статистику по дням недели
   * @private
   * @param {Array} weeklyStats - Массив недельной статистики
   * @returns {Object} - Объект со статистикой по дням недели
   */
  static _calculateWeekdayStats(weeklyStats) {
    if (!weeklyStats || !Array.isArray(weeklyStats)) {
      console.log('StatisticsService: Недельные данные пусты или некорректны, возвращаем пустой объект');
      return {};
    }
    
    const dayNames = [
      'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 
      'Четверг', 'Пятница', 'Суббота'
    ];
    
    // Инициализируем статистику по дням недели
    const weekdayStats = {};
    dayNames.forEach(day => {
      weekdayStats[day] = {
        completed: 0,
        total: 0,
        count: 0,
        efficiency: 0
      };
    });
    
    // Заполняем статистику из недельных данных
    weeklyStats.forEach(dayStat => {
      if (dayStat && dayStat.date) {
        try {
          const date = new Date(dayStat.date);
          const dayName = dayNames[date.getDay()];
          
          if (dayName) {
            weekdayStats[dayName].completed += dayStat.dailyStats?.tasksCompleted || 0;
            weekdayStats[dayName].total += dayStat.dailyStats?.tasksCreated || 0;
            weekdayStats[dayName].count += 1;
          }
        } catch (e) {
          console.error('StatisticsService: Ошибка при обработке статистики дня:', e, dayStat);
        }
      }
    });
    
    // Вычисляем эффективность для каждого дня
    Object.keys(weekdayStats).forEach(day => {
      const stats = weekdayStats[day];
      if (stats.total > 0) {
        stats.efficiency = Math.round((stats.completed / stats.total) * 100);
      } else {
        stats.efficiency = 0;
      }
    });
    
    return weekdayStats;
  }
  
  /**
   * Сброс всей статистики
   * @returns {Promise<boolean>} - Успешность операции
   */
  static async resetAllStatistics() {
    try {
      console.log('StatisticsService: Начинаем сброс статистики');
      
      // Получаем все ключи
      const keys = await AsyncStorage.getAllKeys();
      
      // Фильтруем ключи, связанные со статистикой
      const statsKeys = keys.filter(key => key.startsWith(STATS_STORAGE_KEY));
      
      if (statsKeys.length > 0) {
        console.log(`StatisticsService: Найдено ${statsKeys.length} записей статистики для удаления`);
        await AsyncStorage.multiRemove(statsKeys);
        console.log('StatisticsService: Сброс статистики выполнен успешно');
      } else {
        console.log('StatisticsService: Нет записей статистики для удаления');
      }
      
      return true;
    } catch (error) {
      console.error('StatisticsService: Ошибка при сбросе статистики:', error);
      return false;
    }
  }
}