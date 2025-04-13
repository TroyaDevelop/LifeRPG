import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileService } from './ProfileService';
import { TaskService } from './TaskService';
import { AchievementService } from './AchievementService';
import CategoryService from './CategoryService';
import EquipmentService from './EquipmentService';

// Ключи хранилища
const TASKS_STORAGE_KEY = '@LifeRPG:tasks';
const PROFILE_STORAGE_KEY = '@LifeRPG:profile';
const CATEGORIES_STORAGE_KEY = '@LifeRPG:categories';
const ACHIEVEMENTS_STORAGE_KEY = '@LifeRPG:achievements';
const AVATAR_STORAGE_KEY = '@LifeRPG:avatar';
const EQUIPMENT_STORAGE_KEY = 'liferpg_equipment';

class ResetService {
  /**
   * Сбросить все данные
   * @param {Object} options - Объект с опциями сброса
   * @returns {Promise<boolean>} - Результат операции
   */
  static async resetAllData(options = {}) {
    try {
      console.log('ResetService.resetAllData with options:', options);
      
      // Создаем массив промисов для параллельного выполнения
      const resetPromises = [];
      
      // Сброс задач
      if (options.resetTasks) {
        console.log('ResetService: Сбрасываем задачи');
        // Используем метод TaskService вместо AsyncStorage напрямую
        if (TaskService.resetAllTasks) {
          resetPromises.push(TaskService.resetAllTasks());
        } else {
          // Запасной вариант с прямым доступом
          resetPromises.push(AsyncStorage.removeItem(TASKS_STORAGE_KEY));
          console.log('ResetService: Внимание! TaskService.resetAllTasks не найден, используем прямое удаление');
        }
      }
      
      // Сброс профиля - сохраняем ID, но сбрасываем прогресс
      if (options.resetProfile) {
        console.log('ResetService: Сбрасываем профиль');
        const profileService = ProfileService.getInstance();
        resetPromises.push(profileService.resetProfile());
        
        // Сброс инвентаря при сбросе профиля
        console.log('ResetService: Сбрасываем инвентарь и снаряжение вместе с профилем');
        if (EquipmentService.resetAllEquipment) {
          resetPromises.push(EquipmentService.resetAllEquipment(true)); // Сбрасываем и инициализируем тестовыми данными
        } else {
          resetPromises.push(AsyncStorage.removeItem(EQUIPMENT_STORAGE_KEY));
          console.log('ResetService: Внимание! EquipmentService.resetAllEquipment не найден, используем прямое удаление');
        }
      }
      
      // Сброс категорий
      if (options.resetCategories) {
        console.log('ResetService: Сбрасываем категории');
        
        try {
          // Используем метод сервиса с флагом создания стандартных категорий
          if (CategoryService.resetAllCategories) {
            await CategoryService.resetAllCategories(true); // Создаем стандартные категории после сброса
          } else {
            // Запасной вариант
            await AsyncStorage.removeItem(CATEGORIES_STORAGE_KEY);
            // Добавляем стандартные категории
            if (CategoryService.createDefaultCategories) {
              await CategoryService.createDefaultCategories();
            }
          }
          
          console.log('ResetService: Категории успешно сброшены и созданы стандартные');
        } catch (categoryError) {
          console.error('ResetService: Ошибка при сбросе категорий:', categoryError);
        }
      }
      
      // Убрана секция сброса достижений, так как они сбрасываются при сбросе профиля
      
      // Ждем завершения всех операций
      const results = await Promise.all(resetPromises);
      
      console.log('ResetService: Все операции сброса завершены с результатами:', results);
      console.log('ResetService: Все данные успешно сброшены');
      
      return true;
    } catch (error) {
      console.error('ResetService: Ошибка при сбросе данных:', error);
      return false;
    }
  }
}

export default ResetService;