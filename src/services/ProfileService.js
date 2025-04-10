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
        // Правильно парсим данные
        const parsedData = JSON.parse(data);
        
        // Создаем экземпляр UserProfile
        const profile = new UserProfile(parsedData);
        
        // Рассчитываем актуальный уровень и опыт
        const calculatedLevel = this.calculateLevelFromExperience(profile.experience);
        
        // Если уровень не соответствует опыту, корректируем его
        if (calculatedLevel.level !== profile.level) {
          console.log(`Корректировка уровня: ${profile.level} -> ${calculatedLevel.level}`);
          profile.level = calculatedLevel.level;
        }
        
        // Убедимся, что experienceToNextLevel вычислен корректно
        profile.experienceToNextLevel = UserProfile.getExperienceForNextLevel(profile.level);
        
        await this.saveProfile(profile);
        return profile;
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
      
      // Особые поля, которые нужно суммировать, а не заменять
      const additiveFields = ['actus', 'taskCoins'];
      
      // Обновляем поля профиля
      Object.keys(updateData).forEach(key => {
        if (key === 'settings' && updateData.settings) {
          // Для настроек делаем глубокое объединение
          profile.settings = {
            ...profile.settings,
            ...updateData.settings
          };
        } else if (additiveFields.includes(key) && typeof updateData[key] === 'number') {
          // Для числовых полей из additiveFields выполняем суммирование
          const currentValue = profile[key] || 0;
          profile[key] = currentValue + updateData[key];
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

  // Исправить метод addExperience
  async addExperience(amount) {
    try {
      console.log(`Добавление опыта: ${amount}`);
      
      // Получаем текущий профиль
      const profile = await this.getProfile();
      
      // Логируем начальные значения
      console.log(`До добавления: Уровень ${profile.level}, Опыт ${profile.experience}/${profile.experienceToNextLevel}`);
      
      // Добавляем опыт через метод модели
      const levelUpInfo = profile.addExperience(amount);
      
      // Логируем конечные значения
      console.log(`После добавления: Уровень ${profile.level}, Опыт ${profile.experience}/${profile.experienceToNextLevel}`);
      
      // Сохраняем обновленный профиль
      await this.saveProfile(profile);
      
      // Возвращаем информацию о повышении уровня, если оно произошло
      return levelUpInfo;
    } catch (error) {
      console.error('Ошибка при добавлении опыта:', error);
      return null;
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
    
    // Вычисляем уровень на основе опыта
    while (experience >= UserProfile.getExperienceForNextLevel(level)) {
      level++;
    }
    
    const expForNextLevel = UserProfile.getExperienceForNextLevel(level);
    const expForCurrentLevel = UserProfile.getExperienceForNextLevel(level - 1) || 0;
    const progressExp = experience - expForCurrentLevel;
    const expNeeded = expForNextLevel - expForCurrentLevel;
    
    return {
      level,
      experienceToNextLevel: expForNextLevel,
      progressExp,
      expNeeded
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

  // Метод для обновления здоровья
  async updateHealth(delta) {
    try {
      const profile = await this.getProfile();
      profile.updateHealth(delta);
      await this.saveProfile(profile);
      return profile;
    } catch (error) {
      console.error('Ошибка при обновлении здоровья:', error);
      throw error;
    }
  }

  // Метод для обновления энергии
  async updateEnergy(delta) {
    try {
      const profile = await this.getProfile();
      profile.updateEnergy(delta);
      await this.saveProfile(profile);
      return profile;
    } catch (error) {
      console.error('Ошибка при обновлении энергии:', error);
      throw error;
    }
  }

  // Метод для восстановления энергии
  async restoreEnergy() {
    try {
      const profile = await this.getProfile();
      const lastRefill = new Date(profile.lastEnergyRefill);
      const now = new Date();
      
      // Устанавливаем время на начало дня для сравнения
      lastRefill.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Если с последнего восстановления прошел хотя бы день, восстанавливаем энергию
      if (today > lastRefill) {
        profile.restoreFullEnergy();
        await this.saveProfile(profile);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при восстановлении энергии:', error);
      return false;
    }
  }

  // Метод для обработки здоровья при ежедневном сбросе
  async processDailyHealthUpdate(completedAllDailyTasks, missedTasksCount) {
    try {
      const profile = await this.getProfile();
      
      if (completedAllDailyTasks) {
        // Восстанавливаем небольшое количество здоровья за выполнение всех ежедневных задач
        const healthBonus = 5; // 5 HP в день восстановления
        profile.updateHealth(healthBonus);
      } else if (missedTasksCount > 0) {
        // Отнимаем здоровье за каждую пропущенную ежедневную задачу
        const healthPenalty = -5 * missedTasksCount;
        profile.updateHealth(healthPenalty);
      }
      
      await this.saveProfile(profile);
      return profile;
    } catch (error) {
      console.error('Ошибка при обновлении здоровья за ежедневные задачи:', error);
      throw error;
    }
  }
}

export default ProfileService;
