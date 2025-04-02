import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../models/UserProfile';

const PROFILE_STORAGE_KEY = '@LifeRPG:userProfile';

export class ProfileService {
  static instance = null;

  constructor() {
    if (ProfileService.instance) {
      return ProfileService.instance;
    }
    ProfileService.instance = this;
  }

  static getInstance() {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Получение профиля пользователя из хранилища
   * @returns {Promise<UserProfile>} Профиль пользователя
   */
  async getProfile() {
    try {
      const data = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (data) {
        return new UserProfile(JSON.parse(data));
      }
      // Если профиля нет, создаем новый
      const newProfile = new UserProfile();
      await this.saveProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      // В случае ошибки возвращаем новый профиль
      return new UserProfile();
    }
  }

  /**
   * Сохранение профиля пользователя
   * @param {UserProfile} profile Профиль для сохранения
   * @returns {Promise<void>}
   */
  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY, 
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      throw error;
    }
  }

  /**
   * Обновление профиля пользователя
   * @param {Object} updateData Данные для обновления
   * @returns {Promise<UserProfile>} Обновленный профиль
   */
  async updateProfile(updateData) {
    try {
      const profile = await this.getProfile();
      
      // Обновляем поля профиля
      Object.keys(updateData).forEach(key => {
        if (key === 'settings' && updateData.settings) {
          // Для настроек делаем глубокое объединение
          profile.settings = {
            ...profile.settings,
            ...updateData.settings
          };
        } else if (profile.hasOwnProperty(key)) {
          profile[key] = updateData[key];
        }
      });
      
      profile.updatedAt = new Date().toISOString();
      await this.saveProfile(profile);
      return profile;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  }
  
  /**
   * Сброс профиля пользователя
   * @returns {Promise<UserProfile>} Новый профиль
   */
  async resetProfile() {
    try {
      const newProfile = new UserProfile();
      await this.saveProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Ошибка при сбросе профиля:', error);
      throw error;
    }
  }

  async addExperience(amount) {
    try {
      const profile = await this.getProfile();
      const result = profile.addExperience(amount);
      await this.saveProfile(profile);
      return { ...result, profile };
    } catch (error) {
      console.error('Ошибка при добавлении опыта:', error);
      return { didLevelUp: false, newLevel: 0, newBonuses: [], profile: null };
    }
  }

  // Метод для обновления статистики при выполнении задачи
  async updateStatsOnTaskComplete() {
    try {
      const profile = await this.getProfile();
      profile.totalTasksCompleted += 1;
      
      // Проверяем последнюю активность для подсчета серии дней
      const lastActiveDate = new Date(profile.lastActive).setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActiveDate === yesterday.getTime()) {
        // Увеличиваем серию, если последняя активность была вчера
        profile.streakDays += 1;
      } else if (lastActiveDate !== today) {
        // Сбрасываем серию, если был пропущен день
        profile.streakDays = 1;
      }
      
      profile.lastActive = new Date().toISOString();
      await this.saveProfile(profile);
      
      return profile;
    } catch (error) {
      console.error('Ошибка при обновлении статистики:', error);
      return null;
    }
  }

  /**
   * Обновление статистики профиля при отмене выполнения задачи
   */
  async updateStatsOnTaskUncomplete() {
    try {
      const profile = await this.getProfile();
      
      // Уменьшаем счетчик выполненных задач
      if (profile.stats && profile.stats.tasksCompleted > 0) {
        profile.stats.tasksCompleted -= 1;
      }
      
      // Пересчитываем общую эффективность
      if (profile.stats && profile.stats.tasksCompleted >= 0 && profile.stats.tasksCreated > 0) {
        profile.stats.efficiency = Math.round(
          (profile.stats.tasksCompleted / profile.stats.tasksCreated) * 100
        );
      }
      
      await this.saveProfile(profile);
    } catch (error) {
      console.error('Ошибка при обновлении статистики после отмены выполнения задачи:', error);
    }
  }

  // Добавить метод инициализации профиля
  async initProfile() {
    try {
      // Создаем базовый профиль
      const newProfile = {
        id: Date.now().toString(),
        name: 'Искатель приключений',
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        streakDays: 0,
        avatar: null,
        lastActive: new Date().toISOString(),
        totalTasksCompleted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unlockedBonuses: []
      };
      
      // Сохраняем напрямую в AsyncStorage
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      
      // Обновляем локальный экземпляр
      this._profile = new UserProfile(newProfile);
      
      console.log('Профиль успешно инициализирован');
      return this._profile;
    } catch (error) {
      console.error('Ошибка при инициализации профиля:', error);
      return null;
    }
  }

  // Дополняем класс ProfileService
  async resetProfile() {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      console.log('Существующий профиль удален');
      
      return await this.initProfile();
    } catch (error) {
      console.error('Ошибка при сбросе профиля:', error);
      return null;
    }
  }

  // Добавьте эти методы в класс ProfileService:

  // Обновление настроек профиля
  async updateSettings(newSettings) {
    try {
      const profile = await this.getProfile();
      profile.settings = {
        ...profile.settings,
        ...newSettings
      };
      
      await this.saveProfile(profile);
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении настроек:', error);
      return false;
    }
  }

  // Получение настроек
  async getSettings() {
    try {
      const profile = await this.getProfile();
      return profile.settings || {};
    } catch (error) {
      console.error('Ошибка при получении настроек:', error);
      return {};
    }
  }

  /**
   * Снятие опыта у пользователя при отмене выполнения задачи
   * @param {number} amount - количество опыта для снятия
   * @returns {Promise<object>} - обновленные данные профиля
   */
  async subtractExperience(amount) {
    try {
      const profile = await this.getProfile();
      
      // Определяем новое значение опыта (не меньше 0)
      const newExperience = Math.max(0, profile.experience - amount);
      
      // Определяем текущий уровень пользователя перед вычетом опыта
      const currentLevel = profile.level;
      
      // Рассчитываем новый уровень на основе оставшегося опыта
      let newLevel = 1;
      let experienceToNextLevel = 100;
      
      // Находим новый уровень на основе оставшегося опыта
      while (newExperience >= UserProfile.getExperienceForNextLevel(newLevel)) {
        newLevel++;
      }
      
      experienceToNextLevel = UserProfile.getExperienceForNextLevel(newLevel) - newExperience;
      
      // Обновляем профиль
      profile.experience = newExperience;
      
      // Проверяем, был ли понижен уровень
      const didLevelDown = newLevel < currentLevel;
      profile.level = newLevel;
      
      await this.saveProfile(profile);
      
      // Возвращаем информацию об обновленном профиле
      return {
        profile,
        newExperience,
        newLevel,
        experienceToNextLevel,
        didLevelDown
      };
    } catch (error) {
      console.error('Ошибка при снятии опыта:', error);
      return { error: error.message };
    }
  }

  /**
   * Рассчитывает уровень на основе опыта
   * @param {number} experience - Количество опыта
   * @returns {object} - Объект с информацией об уровне и опыте до следующего уровня
   */
  calculateLevelFromExperience(experience) {
    let level = 1;
    let experienceToNextLevel = 0;
    
    // Используем метод из класса UserProfile для расчета уровня
    while (experience >= UserProfile.getExperienceForNextLevel(level)) {
      level += 1;
    }
    
    experienceToNextLevel = UserProfile.getExperienceForNextLevel(level) - experience;
    
    return {
      level,
      experienceToNextLevel
    };
  }

  /**
   * Сбросить профиль, сохраняя ID
   * @returns {Promise<Object>} - Новый профиль
   */
  resetProfile = async () => {
    try {
      console.log('ProfileService: Сброс профиля');
      
      // Получаем текущий профиль для сохранения ID
      const currentProfile = await this.getProfile();
      
      if (!currentProfile) {
        console.log('ProfileService: Профиль не найден, создаем новый');
        return this.createNewProfile();
      }
      
      // Создаем новый профиль, сохраняя только ID
      const defaultProfile = {
        id: currentProfile.id,
        level: 1,
        experience: 0,
        tasksCompleted: 0,
        createdAt: currentProfile.createdAt,
        updatedAt: new Date().toISOString(),
        settings: {}
      };
      
      // Сохраняем новый профиль
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(defaultProfile)
      );
      
      console.log('ProfileService: Профиль успешно сброшен');
      return defaultProfile;
    } catch (error) {
      console.error('ProfileService: Ошибка при сбросе профиля:', error);
      throw error;
    }
  }
}

export default ProfileService;
