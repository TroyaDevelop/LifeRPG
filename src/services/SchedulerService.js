import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskService from './TaskService';
import ProfileService from './ProfileService';
import EquipmentService from './EquipmentService';

/**
 * Сервис для управления периодическими задачами и расписанием
 */
export class SchedulerService {
  // Ключи для хранения данных
  static LAST_DAILY_RESET_KEY = '@LifeRPG:lastDailyReset';
  
  /**
   * Инициализирует планировщик и выполняет первоначальные проверки
   * @returns {Promise<void>}
   */
  static async initializeScheduler() {
    try {
      console.log('Инициализация планировщика...');
      
      // Проверяем и сбрасываем ежедневные задачи при запуске
      await this.checkAndResetDailyTasks();
      
      // Настраиваем обработчики периодических событий
      this.setupScheduledEvents();
      
      console.log('Планировщик успешно инициализирован');
    } catch (error) {
      console.error('Ошибка при инициализации планировщика:', error);
    }
  }
  
  /**
   * Проверяет и сбрасывает ежедневные задачи, если нужно
   * @returns {Promise<boolean>} - true если был выполнен сброс, false если сброс не требуется
   */
  static async checkAndResetDailyTasks() {
    try {
      const lastResetStr = await AsyncStorage.getItem(this.LAST_DAILY_RESET_KEY);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      console.log('SchedulerService: Последний сброс:', lastResetStr);
      console.log('SchedulerService: Сегодня:', today);
      
      if (!lastResetStr || lastResetStr !== today) {
        console.log('SchedulerService: Выполняем ежедневный сброс задач');
        
        // Сначала восстанавливаем энергию
        const profileService = new ProfileService();
        await profileService.restoreEnergy();
        
        // Затем сбрасываем ежедневные задачи (там же обрабатывается здоровье)
        const resetResult = await TaskService.resetDailyTasks();
        console.log('SchedulerService: Результат сброса задач:', resetResult);
        
        // Обновляем ассортимент магазина
        console.log('SchedulerService: Обновляем ассортимент магазина');
        const equipmentService = new EquipmentService();
        const shopResult = await equipmentService.refreshShopItems();
        console.log('SchedulerService: Результат обновления магазина:', shopResult.length > 0 ? `Добавлено ${shopResult.length} товаров` : 'Ошибка обновления магазина');
        
        // Обновляем дату последнего сброса
        await AsyncStorage.setItem(this.LAST_DAILY_RESET_KEY, today);
        return true;
      }
      
      console.log('SchedulerService: Сброс не требуется, задачи уже были сброшены сегодня');
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

// Экспортируем класс по умолчанию
export default SchedulerService;