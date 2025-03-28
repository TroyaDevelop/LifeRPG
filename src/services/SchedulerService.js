import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskService } from './TaskService';

/**
 * Сервис для управления периодическими задачами и расписанием
 */
export class SchedulerService {
  // Ключи для хранения данных
  static LAST_DAILY_RESET_KEY = 'LAST_DAILY_RESET_DATE';
  
  /**
   * Проверяет и сбрасывает ежедневные задачи, если нужно
   * @returns {Promise<boolean>} - true если был выполнен сброс, false если сброс не требуется
   */
  static async checkAndResetDailyTasks() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastResetDate = await AsyncStorage.getItem(this.LAST_DAILY_RESET_KEY);
      
      // Если дата последнего сброса отличается от сегодняшней, выполняем сброс
      if (!lastResetDate || lastResetDate !== today) {
        console.log('Выполняем сброс ежедневных задач...');
        const result = await TaskService.resetDailyTasks();
        await AsyncStorage.setItem(this.LAST_DAILY_RESET_KEY, today);
        return result;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при проверке и сбросе ежедневных задач:', error);
      return false;
    }
  }
  
  /**
   * Устанавливает обработчики для периодических событий
   */
  static setupScheduledEvents() {
    // Здесь можно добавить код для настройки других периодических задач
    // Например, еженедельных или ежемесячных
  }
}