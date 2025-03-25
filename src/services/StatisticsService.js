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
  
  // Расчет эффективности за период (неделя или месяц)
  static calculateEfficiency(statisticsArray) {
    if (!statisticsArray || statisticsArray.length === 0) return 0;
    
    let totalCompleted = 0;
    let totalCreated = 0;
    
    statisticsArray.forEach(stats => {
      totalCompleted += stats.dailyStats.tasksCompleted;
      totalCreated += stats.dailyStats.tasksCreated;
    });
    
    if (totalCreated === 0) return 0;
    return Math.round((totalCompleted / totalCreated) * 100);
  }
}