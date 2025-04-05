import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import TaskService from '../services/TaskService';
import { CategoryService } from '../services/CategoryService';
import { StatisticsService } from '../services/StatisticsService';
import SchedulerService from '../services/SchedulerService';
import ProfileService from '../services/ProfileService';
import { AchievementService } from '../services/AchievementService';
import { AvatarService } from '../services/AvatarService';
import ResetService from '../services/ResetService';
import { useNotification } from './NotificationContext'; // Импортируем хук уведомлений

// Создаем контекст
export const AppContext = createContext();

// Хук для использования контекста
export const useApp = () => {
  return useContext(AppContext);
};

// Провайдер контекста
export const AppProvider = ({ children }) => {
  // Используем хук уведомлений внутри провайдера
  const { showExperienceGained, showExperienceLost, showError } = useNotification();
  
  // Добавляем ref для отслеживания загрузки
  const isLoadingRef = useRef(false);
  
  // Создаем экземпляр ProfileService для использования его методов
  const profileService = ProfileService.getInstance();
  
  // Общее состояние загрузки
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние данных
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [categories, setCategories] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Добавляем состояния для ресурсов
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [maxEnergy, setMaxEnergy] = useState(100);
  
  // Флаг обновления данных
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Обеспечим, чтобы loadAllData всегда возвращала Promise
  const loadAllData = useCallback(async () => {
    // Проверяем, не выполняется ли уже загрузка
    if (isLoadingRef.current) {
      console.log('AppContext: Загрузка данных уже выполняется, пропускаем повторный вызов');
      return false;
    }
    
    console.log('AppContext: Загрузка всех данных');
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      // Создаем экземпляр ProfileService для использования его методов
      const profileService = ProfileService.getInstance();
      
      // Последовательно загружаем данные, чтобы избежать конфликтов доступа к AsyncStorage
      
      // 1. Загружаем профиль
      const profile = await profileService.getProfile();
      setProfile(profile || null);
      
      // Устанавливаем значения здоровья и энергии
      setHealth(profile.health);
      setMaxHealth(profile.maxHealth);
      setEnergy(profile.energy);
      setMaxEnergy(profile.maxEnergy);
      
      // 2. Загружаем аватар
      const avatar = await AvatarService.getAvatar();
      setAvatar(avatar || null);
      
      // 3. Загружаем категории
      const categories = await CategoryService.getAllCategories();
      setCategories(categories || []);
      
      // 4. Загружаем задачи
      const tasks = await TaskService.getAllTasks();
      setTasks(tasks || []);
      
      // 5. Загружаем достижения
      const achievements = await AchievementService.getAllAchievements();
      setAchievements(achievements || []);
      
      // 6. Загружаем статистику
      try {
        const statistics = await StatisticsService.getAllStatistics();
        setStatistics(statistics || null);
      } catch (statsError) {
        console.error('AppContext: Ошибка при загрузке статистики:', statsError);
        // Не обновляем состояние при ошибке статистики, чтобы избежать рендера с некорректными данными
      }
      
      console.log('AppContext: Все данные успешно загружены');
      return true;
    } catch (error) {
      console.error('AppContext: Ошибка при загрузке данных:', error);
      return false;
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Обеспечим, чтобы refreshData всегда возвращала Promise
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Проверяем, нужно ли сбросить ежедневные задачи и восстановить энергию
      await SchedulerService.checkAndResetDailyTasks();
      
      // Загружаем профиль с обновленными ресурсами
      await loadAllData();
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadAllData]);

  useEffect(() => {
    console.log('AppContext: Инициализация контекста');
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(`AppContext: Запущено обновление данных (триггер: ${refreshTrigger})`);
      loadAllData();
    }
  }, [refreshTrigger, loadAllData]);

  // CRUD операции для задач
  const addTask = async (taskData) => {
    try {
      const newTask = await TaskService.addTask(taskData);
      setTasks(prevTasks => [...prevTasks, newTask]);
      return newTask;
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await TaskService.updateTask(taskId, taskData);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? updatedTask : task)
      );
      return updatedTask;
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const success = await TaskService.deleteTask(taskId);
      
      if (success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        return true;
      } else {
        console.error('Не удалось удалить задачу:', taskId);
        return false;
      }
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      throw error;
    }
  };

  const completeTask = async (taskId) => {
    try {
      // Находим задачу
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        throw new Error('Задача не найдена');
      }
      
      // Инвертируем текущий статус выполнения
      const newIsCompleted = !task.isCompleted;
      
      // Вызываем нужный метод в зависимости от того, выполняем или отменяем
      let result;
      if (newIsCompleted) {
        // Выполнение задачи
        result = await TaskService.completeTask(taskId);
        
        // Показываем уведомление с информацией о полученном опыте
        if (result.success && result.experienceGained) {
          showExperienceGained(result.experienceGained);
        }
      } else {
        // Отмена выполнения задачи
        result = await TaskService.uncompleteTask(taskId);
        
        // Показываем уведомление с информацией о потерянном опыте
        if (result.success && result.experienceReturned) {
          showExperienceLost(result.experienceReturned);
        }
      }
      
      // Обновляем список задач
      if (result.taskRemoved) {
        // Если задача была удалена (автоудаление), удаляем из состояния
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      } else {
        // Обновляем задачу в состоянии
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? result.task : t)
        );
      }
      
      // Обновляем профиль, если он изменился
      if (result.profile) {
        setProfile(result.profile);
      }
      
      // Обновляем достижения, если были разблокированы новые
      if (result.achievements && result.achievements.achievementsUnlocked) {
        const unlockedAchievements = result.achievements.achievementsUnlocked;
        if (unlockedAchievements.length > 0) {
          setAchievements(prevAchievements => {
            // Создаем копию массива достижений
            const updatedAchievements = [...prevAchievements];
            
            // Обновляем разблокированные достижения
            unlockedAchievements.forEach(unlockedAchievement => {
              const index = updatedAchievements.findIndex(a => a.id === unlockedAchievement.id);
              if (index !== -1) {
                updatedAchievements[index] = unlockedAchievement;
              }
            });
            
            return updatedAchievements;
          });
        }
      }
      
      // Обновляем статистику
      refreshData();
      
      // Возвращаем результат для показа UI уведомлений (например, о повышении уровня)
      return result;
    } catch (error) {
      console.error('Ошибка при изменении статуса задачи:', error);
      showError('Ошибка при изменении статуса задачи');
      throw error;
    }
  };

  // Функции управления профилем
  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await profileService.updateProfile(profileData); // Используем экземпляр
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  };

  // Функции управления аватаром
  const updateAvatar = async (avatarData) => {
    try {
      const updatedAvatar = await AvatarService.updateAvatar(avatarData);
      setAvatar(updatedAvatar);
      return updatedAvatar;
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      throw error;
    }
  };

  // Функции управления категориями
  const addCategory = async (categoryData) => {
    try {
      const newCategory = await CategoryService.addCategory(categoryData);
      setCategories(prevCategories => [...prevCategories, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
      throw error;
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      const updatedCategory = await CategoryService.updateCategory(categoryId, categoryData);
      setCategories(prevCategories => 
        prevCategories.map(category => category.id === categoryId ? updatedCategory : category)
      );
      return updatedCategory;
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await CategoryService.deleteCategory(categoryId);
      setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId));
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      throw error;
    }
  };

  // Функция сброса прогресса
  const resetProgress = async (options) => {
    try {
      console.log('AppContext: Сброс прогресса с опциями:', JSON.stringify(options));
      
      // Используем сервис для сброса
      const result = await ResetService.resetAllData(options);
      
      if (result) {
        console.log('AppContext: Сброс прогресса выполнен успешно');
        
        // Принудительно обновляем локальное состояние
        if (options.resetCategories) {
          console.log('AppContext: Сбрасываем состояние категорий');
          setCategories([]);
          
          // Очищаем кэш категорий
          try {
            if (CategoryService.clearCache) {
              await CategoryService.clearCache();
            }
          } catch (e) {
            console.error('Ошибка при очистке кэша категорий:', e);
          }
        }
        
        // Обновляем остальные данные
        setTimeout(() => {
          refreshData();
        }, 500);
        
        return true;
      }
      
      console.warn('AppContext: Сброс прогресса вернул false');
      return false;
    } catch (error) {
      console.error('AppContext: Ошибка при сбросе прогресса:', error);
      return false;
    }
  };

  // Функции для работы с ресурсами
  const updateHealth = async (delta) => {
    try {
      const updatedProfile = await profileService.updateHealth(delta);
      setHealth(updatedProfile.health);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Ошибка при обновлении здоровья:', error);
      throw error;
    }
  };
  
  const updateEnergy = async (delta) => {
    try {
      const updatedProfile = await profileService.updateEnergy(delta);
      setEnergy(updatedProfile.energy);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Ошибка при обновлении энергии:', error);
      throw error;
    }
  };

  const value = {
    isLoading,
    tasks,
    profile,
    avatar,
    categories,
    achievements,
    statistics,
    health,
    maxHealth,
    energy,
    maxEnergy,
    refreshData,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    updateProfile,
    updateAvatar,
    addCategory,
    updateCategory,
    deleteCategory,
    resetProgress,
    updateHealth,
    updateEnergy,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Хук для использования контекста
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext должен использоваться внутри AppProvider');
  }
  return context;
};