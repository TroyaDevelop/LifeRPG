import { UserProfile } from '../models/UserProfile';
import StorageService from './StorageService';

const PROFILE_STORAGE_KEY = 'lifeRpg_userProfile';

export class ProfileService {
  static instance = null;

  static getInstance() {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async getProfile() {
    try {
      // Используем getItem вместо getData
      const profileData = await StorageService.getItem(PROFILE_STORAGE_KEY);
      
      if (!profileData) {
        // Если профиль не найден, создаем новый
        const newProfile = new UserProfile();
        await this.saveProfile(newProfile);
        return newProfile;
      }
      
      return new UserProfile(JSON.parse(profileData));
    } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      // В случае ошибки возвращаем новый профиль
      return new UserProfile();
    }
  }

  async saveProfile(profile) {
    try {
      profile.updatedAt = new Date().toISOString();
      // Используем setItem вместо setData
      await StorageService.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      return false;
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
}
