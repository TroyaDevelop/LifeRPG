import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileService } from './ProfileService';
import TaskService from './TaskService';
import { AchievementService } from './AchievementService';
import { StatisticsService } from './StatisticsService';
import CategoryService from './CategoryService';
import StorageService from './StorageService';

class ResetService {
  /**
   * Сбрасывает все данные пользователя
   */
  static async resetAllData(options = {
    resetProfile: true,
    resetTasks: true,
    resetAchievements: true,
    resetStatistics: true,
    resetCategories: true
  }) {
    try {
      console.log('Начинаем сброс данных приложения...');
      
      const operations = [];
      
      // Сброс профиля
      if (options.resetProfile) {
        console.log('Сбрасываем профиль пользователя...');
        operations.push(
          (async () => {
            try {
              // Сначала удаляем существующий профиль
              await AsyncStorage.removeItem('@LifeRPG:userProfile');
              console.log('Профиль пользователя удален');
              
              // Инициализируем новый профиль через сервис
              const profileService = ProfileService.getInstance();
              await profileService.initProfile();
              console.log('Новый профиль создан');
            } catch (err) {
              console.error('Ошибка при сбросе профиля:', err);
            }
          })()
        );
      }
      
      // Сброс задач
      if (options.resetTasks) {
        console.log('Сбрасываем задачи...');
        operations.push(
          (async () => {
            try {
              await StorageService.setTasks([]);
              console.log('Задачи сброшены');
            } catch (err) {
              console.error('Ошибка при сбросе задач:', err);
            }
          })()
        );
      }
      
      // Сброс достижений
      if (options.resetAchievements) {
        console.log('Сбрасываем достижения...');
        operations.push(
          (async () => {
            try {
              await AsyncStorage.removeItem('@LifeRPG:achievements');
              console.log('Достижения сброшены');
              // Инициализация новых достижений произойдет при следующем обращении
            } catch (err) {
              console.error('Ошибка при сбросе достижений:', err);
            }
          })()
        );
      }
      
      // Сброс статистики
      if (options.resetStatistics) {
        console.log('Сбрасываем статистику...');
        operations.push(
          (async () => {
            try {
              const statisticsKeys = await AsyncStorage.getAllKeys();
              const statsKeys = statisticsKeys.filter(key => 
                key.startsWith('@LifeRPG:statistics'));
              
              if (statsKeys.length > 0) {
                await AsyncStorage.multiRemove(statsKeys);
              }
              console.log('Статистика сброшена');
            } catch (err) {
              console.error('Ошибка при сбросе статистики:', err);
            }
          })()
        );
      }
      
      // Сброс категорий
      if (options.resetCategories) {
        console.log('Сбрасываем категории...');
        operations.push(
          (async () => {
            try {
              await StorageService.setCategories([]);
              console.log('Категории сброшены');
              // Инициализируем дефолтные категории
              await CategoryService.initDefaultCategories();
              console.log('Дефолтные категории созданы');
            } catch (err) {
              console.error('Ошибка при сбросе категорий:', err);
            }
          })()
        );
      }
      
      // Выполняем все операции параллельно
      await Promise.all(operations);
      
      console.log('Сброс данных успешно завершен');
      return true;
    } catch (error) {
      console.error('Ошибка при сбросе данных:', error);
      return false;
    }
  }
}

export default ResetService;