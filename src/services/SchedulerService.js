import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskService from './TaskService';
import ProfileService from './ProfileService';
import EquipmentService from './EquipmentService';
import BossService from './BossService'; // Добавляем импорт BossService

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
      await this.checkAndPerformDailyReset();
      
      // Настраиваем обработчики периодических событий
      this.setupScheduledEvents();
      
      console.log('Планировщик успешно инициализирован');
    } catch (error) {
      console.error('Ошибка при инициализации планировщика:', error);
    }
  }
  
  /**
   * Проверяет и выполняет ежедневный сброс при необходимости
   * @returns {Promise<Object>} - Результаты обновлений или null, если сброс не требуется
   */
  static async checkAndPerformDailyReset() {
    try {
      const lastResetStr = await AsyncStorage.getItem(this.LAST_DAILY_RESET_KEY);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      console.log('SchedulerService: Последний сброс:', lastResetStr);
      console.log('SchedulerService: Сегодня:', today);
      
      if (!lastResetStr || lastResetStr !== today) {
        console.log('SchedulerService: Необходим ежедневный сброс');
        
        // Выполняем все операции ежедневного сброса
        const resetResults = await this.performDailyReset();
        
        // Обновляем дату последнего сброса
        await AsyncStorage.setItem(this.LAST_DAILY_RESET_KEY, today);
        
        console.log('SchedulerService: Ежедневный сброс выполнен успешно');
        return resetResults;
      }
      
      console.log('SchedulerService: Сброс не требуется, уже был выполнен сегодня');
      return null;
    } catch (error) {
      console.error('SchedulerService: Ошибка при проверке и выполнении ежедневного сброса:', error);
      return {
        tasksReset: false,
        shopRefreshed: false,
        bossUpdated: false,
        bossDefeated: false,
        bossDamage: 0,
        energyRestored: false,
        healthUpdated: false,
        error: error.message
      };
    }
  }
  
  /**
   * Выполняет ежедневные обновления: сброс заданий, магазина, применение урона боссам, восстановление энергии
   * @returns {Promise<Object>} - Результаты обновлений
   */
  static async performDailyReset() {
    try {
      console.log('SchedulerService: Выполняем ежедневный сброс');
      
      // Результаты операций
      const results = {
        tasksReset: false,
        shopRefreshed: false,
        bossUpdated: false,
        bossDefeated: false,
        bossDamage: 0,
        energyRestored: false,
        healthUpdated: false
      };
      
      // 1. Восстановление энергии игрока
      try {
        const profileService = new ProfileService();
        const energyRestored = await profileService.restoreEnergy();
        results.energyRestored = energyRestored;
        console.log('SchedulerService: Восстановление энергии:', energyRestored ? 'выполнено' : 'не требуется');
      } catch (error) {
        console.error('SchedulerService: Ошибка при восстановлении энергии:', error);
      }
      
      // 2. Сброс ежедневных задач и обработка здоровья игрока
      try {
        // При сбросе ежедневных задач также обрабатывается здоровье игрока
        // (штраф за пропущенные задачи или восстановление за выполнение всех)
        const resetResult = await TaskService.resetDailyTasks();
        results.tasksReset = resetResult.success;
        results.healthUpdated = resetResult.healthUpdated;
        console.log('SchedulerService: Ежедневные задачи сброшены:', resetResult);
      } catch (error) {
        console.error('SchedulerService: Ошибка при сбросе ежедневных задач:', error);
      }
      
      // 3. Обновление магазина, если нужно
      try {
        const equipmentService = new EquipmentService();
        const shopItems = await equipmentService.refreshShopItems();
        results.shopRefreshed = shopItems.length > 0;
        console.log('SchedulerService: Обновление магазина:', results.shopRefreshed ? `Добавлено ${shopItems.length} товаров` : 'Не требуется');
      } catch (error) {
        console.error('SchedulerService: Ошибка при обновлении магазина:', error);
      }
      
      // 4. Применение накопленного урона к боссу
      try {
        const bossResult = await BossService.applyAccumulatedDamage();
        results.bossUpdated = bossResult.applied;
        results.bossDefeated = bossResult.isBossDefeated;
        results.bossDamage = bossResult.damage;
        
        console.log('SchedulerService: Обновление босса:', 
          bossResult.applied ? `Нанесено ${bossResult.damage} урона` : 'Активный босс не найден',
          bossResult.isBossDefeated ? '(босс побежден)' : '');
      } catch (error) {
        console.error('SchedulerService: Ошибка при обновлении босса:', error);
      }
      
      return results;
    } catch (error) {
      console.error('SchedulerService: Ошибка при ежедневном сбросе:', error);
      return {
        tasksReset: false,
        shopRefreshed: false,
        bossUpdated: false,
        bossDefeated: false,
        bossDamage: 0,
        energyRestored: false,
        healthUpdated: false,
        error: error.message
      };
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