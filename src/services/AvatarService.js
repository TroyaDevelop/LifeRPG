import AsyncStorage from '@react-native-async-storage/async-storage';
import { AvatarModel } from '../models/AvatarModel';

const AVATAR_STORAGE_KEY = '@LifeRPG:avatar';

// Кэш аватара для оптимизации
let avatarCache = null;
let lastCacheTime = 0;
const CACHE_MAX_AGE = 10000; // 10 секунд

export class AvatarService {
  /**
   * Получить аватар пользователя
   * @param {boolean} forceRefresh - Принудительно обновить из хранилища
   * @returns {Promise<AvatarModel>} - Аватар пользователя
   */
  static async getAvatar(forceRefresh = false) {
    try {
      // Если у вас есть локальный кэш и не требуется обновление
      if (!forceRefresh && AvatarService._cachedAvatar) {
        return AvatarService._cachedAvatar;
      }
      
      const data = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (data) {
        const avatar = AvatarModel.fromJSON(JSON.parse(data));
        // Кэшируем для будущих запросов
        AvatarService._cachedAvatar = avatar;
        return avatar;
      }
      
      // Если аватара нет, создаем новый
      const newAvatar = new AvatarModel();
      await this.saveAvatar(newAvatar);
      AvatarService._cachedAvatar = newAvatar;
      return newAvatar;
    } catch (error) {
      console.error('Ошибка при получении аватара:', error);
      // В случае ошибки возвращаем новый аватар по умолчанию
      return new AvatarModel();
    }
  }

  /**
   * Сохранить аватар пользователя
   * @param {AvatarModel} avatar - Аватар для сохранения
   * @returns {Promise<void>}
   */
  static async saveAvatar(avatar) {
    try {
      // Обновляем кэш при сохранении
      avatarCache = avatar;
      lastCacheTime = Date.now();
      
      await AsyncStorage.setItem(
        AVATAR_STORAGE_KEY,
        JSON.stringify(avatar.toJSON())
      );
    } catch (error) {
      console.error('Ошибка при сохранении аватара:', error);
      throw error;
    }
  }

  /**
   * Обновить аватар пользователя
   * @param {Object} updateData - Данные для обновления
   * @returns {Promise<AvatarModel>} - Обновленный аватар
   */
  static async updateAvatar(updateData) {
    try {
      // Загружаем актуальный аватар, игнорируя кэш
      const avatar = await this.getAvatar(true);
      const updatedAvatar = avatar.update(updateData);
      await this.saveAvatar(updatedAvatar);
      return updatedAvatar;
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      throw error;
    }
  }
  
  /**
   * Сбросить кэш аватара
   */
  static invalidateCache() {
    avatarCache = null;
    lastCacheTime = 0;
  }
}