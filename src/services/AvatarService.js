import AsyncStorage from '@react-native-async-storage/async-storage';
import { AvatarModel } from '../models/AvatarModel';

const AVATAR_STORAGE_KEY = '@LifeRPG:avatar';

export class AvatarService {
  /**
   * Получить аватар пользователя
   * @returns {Promise<AvatarModel>} - Аватар пользователя
   */
  static async getAvatar() {
    try {
      const data = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (data) {
        return AvatarModel.fromJSON(JSON.parse(data));
      }
      // Если аватара нет, создаем новый
      const newAvatar = new AvatarModel();
      await this.saveAvatar(newAvatar);
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
      const avatar = await this.getAvatar();
      const updatedAvatar = avatar.update(updateData);
      await this.saveAvatar(updatedAvatar);
      return updatedAvatar;
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      throw error;
    }
  }
}