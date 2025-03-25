import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = 'tasks';
const CATEGORIES_STORAGE_KEY = 'categories';

class StorageService {
  // Общие методы для работы с AsyncStorage
  static async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  static async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Ошибка при удалении данных (${key}):`, error);
      return false;
    }
  }

  // Методы для работы с задачами
  static async getTasks() {
    return this.getItem(TASKS_STORAGE_KEY) || [];
  }

  static async setTasks(tasks) {
    return this.setItem(TASKS_STORAGE_KEY, tasks);
  }

  // Методы для работы с категориями
  static async getCategories() {
    return this.getItem(CATEGORIES_STORAGE_KEY) || [];
  }

  static async setCategories(categories) {
    return this.setItem(CATEGORIES_STORAGE_KEY, categories);
  }
}

export default StorageService;
