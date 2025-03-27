import 'react-native-get-random-values'; // Импортируем перед uuid
import { v4 as uuidv4 } from 'uuid';
import StorageService from './StorageService';

class CategoryService {
  // Получение всех категорий
  static async getAllCategories() {
    return await StorageService.getCategories();
  }

  // Получение категории по ID
  static async getCategoryById(categoryId) {
    const categories = await this.getAllCategories();
    return categories.find(category => category.id === categoryId) || null;
  }

  // Создание новой категории
  static async createCategory(categoryData) {
    const categories = await this.getAllCategories();
    
    const newCategory = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...categoryData
    };
    
    const updatedCategories = [...categories, newCategory];
    const success = await StorageService.setCategories(updatedCategories);
    
    return success ? newCategory : null;
  }

  // Обновление категории
  static async updateCategory(categoryId, categoryData) {
    const categories = await this.getAllCategories();
    const categoryIndex = categories.findIndex(category => category.id === categoryId);
    
    if (categoryIndex === -1) {
      return null;
    }
    
    const updatedCategory = {
      ...categories[categoryIndex],
      ...categoryData,
      updatedAt: new Date().toISOString()
    };
    
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = updatedCategory;
    
    const success = await StorageService.setCategories(updatedCategories);
    return success ? updatedCategory : null;
  }

  // Удаление категории
  static async deleteCategory(categoryId) {
    const categories = await this.getAllCategories();
    const updatedCategories = categories.filter(category => category.id !== categoryId);
    
    // Здесь также можно реализовать логику обновления задач, 
    // чтобы заменить удаленную категорию на "Другое"
    
    return await StorageService.setCategories(updatedCategories);
  }

  // Добавить метод инициализации базовых категорий
  static async initDefaultCategories() {
    try {
      const defaultCategories = [
        {
          id: '1',
          name: 'Работа',
          color: '#4E66F1',
          icon: 'briefcase'
        },
        {
          id: '2',
          name: 'Личное',
          color: '#FF9500',
          icon: 'person'
        },
        {
          id: '3',
          name: 'Здоровье',
          color: '#4CD964',
          icon: 'heart'
        },
        {
          id: '4',
          name: 'Образование',
          color: '#AF52DE',
          icon: 'book'
        }
      ];
      
      await StorageService.setCategories(defaultCategories);
      return defaultCategories;
    } catch (error) {
      console.error('Ошибка при инициализации категорий:', error);
      return [];
    }
  }
}

export default CategoryService;
