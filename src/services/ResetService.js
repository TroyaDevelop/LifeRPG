import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileService } from './ProfileService';
import { TaskService } from './TaskService';
import { AchievementService } from './AchievementService';
import CategoryService from './CategoryService';
import EquipmentService from './EquipmentService';
import BossService from './BossService';

// Ключи хранилища
const TASKS_STORAGE_KEY = 'tasks'; // Правильный ключ для задач
const PROFILE_STORAGE_KEY = '@LifeRPG:profile';
const CATEGORIES_STORAGE_KEY = '@LifeRPG:categories';
const ACHIEVEMENTS_STORAGE_KEY = '@LifeRPG:achievements';
const AVATAR_STORAGE_KEY = '@LifeRPG:avatar';
const EQUIPMENT_STORAGE_KEY = 'liferpg_equipment';
const SHOP_ITEMS_KEY = 'liferpg_shop_items';
const SHOP_LAST_UPDATE_KEY = 'liferpg_shop_last_update';
const BOSSES_STORAGE_KEY = 'bosses';
const ACTIVE_BOSS_KEY = 'activeBoss';

class ResetService {
  /**
   * Сбросить все данные приложения
   * @returns {Promise<boolean>} - Результат операции
   */
  static async resetAllData() {
    try {
      console.log('ResetService: Сбрасываем все данные приложения');
      
      // Создаем массив промисов для параллельного выполнения
      const resetPromises = [];
      
      // 1. Сброс задач
      console.log('ResetService: Сбрасываем задачи');
      resetPromises.push(
        new Promise(async (resolve) => {
          try {
            // Сначала пробуем использовать метод сервиса
            const success = await TaskService.resetAllTasks();
            console.log('ResetService: Результат сброса задач через TaskService:', success);
            
            // Если основной метод не сработал, используем запасной
            if (!success) {
              console.warn('ResetService: Используем запасной вариант сброса задач');
              await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
              console.log('ResetService: Задачи успешно сброшены через запасной метод');
            }
            
            // Сбрасываем кэш задач в TaskService
            if (TaskService.invalidateCache) {
              TaskService.invalidateCache();
              console.log('ResetService: Кэш задач сброшен');
            }
            
            resolve(true);
          } catch (error) {
            console.error('ResetService: Ошибка при сбросе задач:', error);
            try {
              // В случае ошибки используем прямое удаление
              await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
              console.log('ResetService: Задачи сброшены напрямую после ошибки');
              resolve(true);
            } catch (storageError) {
              console.error('ResetService: Критическая ошибка при сбросе задач:', storageError);
              resolve(false);
            }
          }
        })
      );
      
      // 2. Сброс профиля - сохраняем ID, но сбрасываем прогресс
      console.log('ResetService: Сбрасываем профиль');
      const profileService = ProfileService.getInstance();
      resetPromises.push(profileService.resetProfile());
      
      // 3. Сброс боссов - удаляем активного босса и все данные о боссах
      console.log('ResetService: Сбрасываем данные о боссах');
      resetPromises.push(
        new Promise(async (resolve) => {
          try {
            // Удаляем активного босса
            await AsyncStorage.removeItem(ACTIVE_BOSS_KEY);
            // Удаляем все сохраненные боссы
            await AsyncStorage.removeItem(BOSSES_STORAGE_KEY);
            console.log('ResetService: Данные о боссах успешно удалены');
            resolve(true);
          } catch (error) {
            console.error('ResetService: Ошибка при сбросе данных о боссах:', error);
            resolve(false);
          }
        })
      );
      
      // 4. Сброс инвентаря и снаряжения
      console.log('ResetService: Сбрасываем инвентарь и снаряжение');
      if (EquipmentService.resetAllEquipment) {
        resetPromises.push(EquipmentService.resetAllEquipment(true)); // Сбрасываем и инициализируем тестовыми данными
        
        // 5. Сбрасываем данные магазина
        console.log('ResetService: Сбрасываем данные магазина');
        resetPromises.push(AsyncStorage.removeItem(SHOP_ITEMS_KEY));
        resetPromises.push(AsyncStorage.removeItem(SHOP_LAST_UPDATE_KEY));
        
        // 6. Обновляем магазин новыми предметами
        const equipmentService = new EquipmentService();
        resetPromises.push(equipmentService.refreshShopItems());
      } else {
        resetPromises.push(AsyncStorage.removeItem(EQUIPMENT_STORAGE_KEY));
        resetPromises.push(AsyncStorage.removeItem(SHOP_ITEMS_KEY));
        resetPromises.push(AsyncStorage.removeItem(SHOP_LAST_UPDATE_KEY));
        console.log('ResetService: Внимание! EquipmentService.resetAllEquipment не найден, используем прямое удаление');
      }
      
      // 7. Сброс категорий
      console.log('ResetService: Сбрасываем категории');
      resetPromises.push(
        new Promise(async (resolve) => {
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
            resolve(true);
          } catch (categoryError) {
            console.error('ResetService: Ошибка при сбросе категорий:', categoryError);
            resolve(false);
          }
        })
      );
      
      // 8. Ждем завершения всех операций
      const results = await Promise.all(resetPromises);
      
      console.log('ResetService: Все операции сброса завершены с результатами:', results);
      
      // Проверяем, что все операции были успешными
      const allSuccess = results.every(result => result !== false);
      
      if (allSuccess) {
        console.log('ResetService: Все данные успешно сброшены');
        return true;
      } else {
        console.warn('ResetService: Не все операции сброса завершились успешно');
        return false;
      }
    } catch (error) {
      console.error('ResetService: Ошибка при сбросе данных:', error);
      return false;
    }
  }
}

export default ResetService;