import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Импортируем перед uuid

const CATEGORIES_STORAGE_KEY = '@LifeRPG:categories';

// Кэш для хранения категорий в памяти
let categoriesCache = null;

// Флаг для предотвращения одновременных вызовов создания категорий
let isCreatingDefaultCategories = false;

export class CategoryService {
  /**
   * Получение всех категорий
   * @param {boolean} createDefault - Создавать ли стандартные категории, если нет существующих
   * @returns {Promise<Array>} - Массив категорий
   */
  static async getAllCategories(createDefault = true) {
    try {
      // Если есть кэш, возвращаем его
      if (categoriesCache && categoriesCache.length > 0) {
        return [...categoriesCache]; // Возвращаем копию кэша
      }
      
      // Загружаем категории из хранилища
      const categoriesJson = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      
      if (categoriesJson) {
        try {
          // Парсим JSON и сохраняем в кэш
          const parsedCategories = JSON.parse(categoriesJson);
          if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
            categoriesCache = parsedCategories;
            console.log(`CategoryService: Загружено ${parsedCategories.length} категорий из хранилища`);
            return [...parsedCategories]; // Возвращаем копию
          }
        } catch (parseError) {
          console.error('CategoryService: Ошибка при парсинге JSON категорий:', parseError);
        }
      }
      
      // Если категорий нет и нужно создать стандартные
      if (createDefault && !isCreatingDefaultCategories) {
        console.log('CategoryService: Нет категорий, создаем стандартные');
        const defaultCategories = await this.createDefaultCategories();
        return [...defaultCategories]; // Возвращаем копию
      }
      
      // Если категорий нет и не нужно создавать стандартные
      // или если создание стандартных категорий уже выполняется
      return [];
    } catch (error) {
      console.error('CategoryService: Ошибка при получении категорий:', error);
      return [];
    }
  }

  /**
   * Получение категории по ID
   * @param {string} categoryId - ID категории
   * @returns {Promise<Object|null>} - Объект категории или null
   */
  static async getCategoryById(categoryId) {
    try {
      const categories = await this.getAllCategories();
      return categories.find(category => category.id === categoryId) || null;
    } catch (error) {
      console.error(`Ошибка при получении категории с ID ${categoryId}:`, error);
      return null;
    }
  }

  /**
   * Создание новой категории
   * @param {Object} categoryData - Данные категории
   * @returns {Promise<Object|null>} - Новая категория или null
   */
  static async createCategory(categoryData) {
    try {
      // Получаем все категории
      const categories = await this.getAllCategories();
      
      // Создаем новую категорию
      const newCategory = {
        id: Date.now().toString(), // Генерируем ID на основе времени
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...categoryData
      };
      
      // Добавляем в массив категорий
      const updatedCategories = [...categories, newCategory];
      
      // Сохраняем обновленный массив
      await AsyncStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(updatedCategories)
      );
      
      // Обновляем кэш
      categoriesCache = updatedCategories;
      
      console.log(`CategoryService: Создана новая категория ${newCategory.name} с ID ${newCategory.id}`);
      return newCategory;
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      return null;
    }
  }

  /**
   * Обновление категории
   * @param {string} categoryId - ID категории
   * @param {Object} updatedData - Обновленные данные
   * @returns {Promise<Object|null>} - Обновленная категория или null
   */
  static async updateCategory(categoryId, updatedData) {
    try {
      // Получаем все категории
      const categories = await this.getAllCategories();
      
      // Находим индекс категории в массиве
      const categoryIndex = categories.findIndex(
        category => category.id === categoryId
      );
      
      if (categoryIndex === -1) {
        console.warn(`Категория с ID ${categoryId} не найдена`);
        return null;
      }
      
      // Обновляем данные категории
      const updatedCategory = {
        ...categories[categoryIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      // Заменяем старую категорию на обновленную
      categories[categoryIndex] = updatedCategory;
      
      // Сохраняем обновленный массив
      await AsyncStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(categories)
      );
      
      // Обновляем кэш
      categoriesCache = categories;
      
      console.log(`CategoryService: Обновлена категория с ID ${categoryId}`);
      return updatedCategory;
    } catch (error) {
      console.error(`Ошибка при обновлении категории с ID ${categoryId}:`, error);
      return null;
    }
  }

  /**
   * Удаление категории
   * @param {string} categoryId - ID категории
   * @returns {Promise<boolean>} - Успешность операции
   */
  static async deleteCategory(categoryId) {
    try {
      // Получаем все категории
      const categories = await this.getAllCategories();
      
      // Фильтруем массив, исключая категорию по ID
      const updatedCategories = categories.filter(
        category => category.id !== categoryId
      );
      
      // Сохраняем обновленный массив
      await AsyncStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(updatedCategories)
      );
      
      // Обновляем кэш
      categoriesCache = updatedCategories;
      
      console.log(`CategoryService: Удалена категория с ID ${categoryId}`);
      return true;
    } catch (error) {
      console.error(`Ошибка при удалении категории с ID ${categoryId}:`, error);
      return false;
    }
  }

  /**
   * Сброс всех категорий и создание стандартных
   * @param {boolean} createDefault - Создавать ли стандартные категории после сброса
   * @returns {Promise<boolean>} - Результат операции
   */
  static async resetAllCategories(createDefault = true) {
    try {
      console.log('CategoryService: Начинаем сброс всех категорий');
      
      // Очищаем хранилище
      await AsyncStorage.removeItem(CATEGORIES_STORAGE_KEY);
      
      // Очищаем кэш
      categoriesCache = null;
      
      console.log('CategoryService: Все категории успешно сброшены');
      
      // Создаем стандартные категории, если нужно
      if (createDefault) {
        console.log('CategoryService: Создаем стандартные категории после сброса');
        await this.createDefaultCategories();
      }
      
      return true;
    } catch (error) {
      console.error('CategoryService: Ошибка при сбросе категорий:', error);
      return false;
    }
  }

  /**
   * Принудительное обновление кэша категорий
   * @returns {Promise<boolean>} - Результат операции
   */
  static async clearCache() {
    try {
      console.log('CategoryService: Очистка кэша категорий');
      categoriesCache = null;
      return true;
    } catch (error) {
      console.error('CategoryService: Ошибка при очистке кэша:', error);
      return false;
    }
  }

  /**
   * Создание стандартных категорий
   * @returns {Promise<Array>} - Массив созданных категорий
   */
  static async createDefaultCategories() {
    // Проверяем, не выполняется ли уже создание категорий
    if (isCreatingDefaultCategories) {
      console.log('CategoryService: Создание стандартных категорий уже выполняется, пропускаем');
      return categoriesCache || [];
    }
    
    isCreatingDefaultCategories = true;
    
    try {
      console.log('CategoryService: Создание стандартных категорий');
      
      // Проверяем, нет ли уже категорий в хранилище
      const categoriesJson = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (categoriesJson) {
        try {
          const existingCategories = JSON.parse(categoriesJson);
          if (Array.isArray(existingCategories) && existingCategories.length > 0) {
            console.log(`CategoryService: В хранилище уже есть ${existingCategories.length} категорий, пропускаем создание`);
            categoriesCache = existingCategories;
            isCreatingDefaultCategories = false;
            return existingCategories;
          }
        } catch (parseError) {
          console.error('Ошибка при парсинге существующих категорий:', parseError);
        }
      }
      
      // Определяем стандартные категории
      const defaultCategories = [
        {
          name: 'Здоровье',
          icon: 'heart-outline',
          color: '#FF5733',
          description: 'Задачи, связанные со здоровьем и спортом'
        },
        {
          name: 'Работа',
          icon: 'briefcase-outline',
          color: '#3498DB',
          description: 'Рабочие задачи и проекты'
        },
        {
          name: 'Учеба',
          icon: 'school-outline',
          color: '#9B59B6',
          description: 'Образование и развитие навыков'
        },
        {
          name: 'Личное',
          icon: 'person-outline',
          color: '#2ECC71',
          description: 'Личные дела и хобби'
        }
      ];
      
      // Создаем категории с временными метками и ID
      const timestamp = Date.now();
      const categoriesWithIds = defaultCategories.map((category, index) => ({
        ...category,
        id: `default-${index + 1}-${timestamp}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Сохраняем в хранилище
      const jsonCategories = JSON.stringify(categoriesWithIds);
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, jsonCategories);
      
      // Проверяем, сохранились ли категории
      const savedJson = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!savedJson) {
        console.error('CategoryService: Категории не были сохранены в хранилище');
        isCreatingDefaultCategories = false;
        return [];
      }
      
      // Обновляем кэш
      categoriesCache = categoriesWithIds;
      
      console.log(`CategoryService: Создано ${categoriesWithIds.length} стандартных категорий`);
      return categoriesWithIds;
    } catch (error) {
      console.error('CategoryService: Ошибка при создании стандартных категорий:', error);
      return [];
    } finally {
      isCreatingDefaultCategories = false;
    }
  }
}

// Добавляем экспорт категории по умолчанию для совместимости
export default CategoryService;
