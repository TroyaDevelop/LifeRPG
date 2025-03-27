import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementModel } from '../models/AchievementModel';
import { ProfileService } from './ProfileService';
import { StatisticsService } from './StatisticsService';
import TaskService from './TaskService'; // Правильный импорт - без фигурных скобок
import { CategoryService } from './CategoryService';

const ACHIEVEMENTS_STORAGE_KEY = '@LifeRPG:achievements';

export class AchievementService {
  // Метод для преобразования объектов из JSON в экземпляры AchievementModel
  static deserializeAchievements(achievementsData) {
    try {
      const parsedData = JSON.parse(achievementsData);
      
      // Убедимся, что у нас есть массив
      if (!Array.isArray(parsedData)) {
        console.error('Данные достижений не являются массивом');
        return [];
      }
      
      // Преобразуем каждый объект в экземпляр модели
      return parsedData.map((data, index) => {
        if (!data) {
          console.warn(`Пустой объект достижения на индексе ${index}`);
          return null;
        }
        
        if (!data.id) {
          // Генерируем ID для достижений без идентификатора
          data.id = `generated-${index}-${Date.now()}`;
          console.warn(`Сгенерирован ID для достижения без идентификатора: ${data.id}`);
        }
        
        try {
          return new AchievementModel(data);
        } catch (err) {
          console.error(`Ошибка при создании экземпляра AchievementModel для ${data.id}:`, err);
          return null;
        }
      }).filter(achievement => achievement !== null); // Удаляем null-значения
    } catch (error) {
      console.error('Ошибка при десериализации достижений:', error);
      return [];
    }
  }

  // Обновляем метод getAllAchievements для использования нового метода десериализации
  static async getAllAchievements() {
    try {
      const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      
      if (achievementsData) {
        return this.deserializeAchievements(achievementsData);
      }
      
      // Если достижений нет, создаем предопределенные
      const predefinedAchievements = AchievementModel.createPredefinedAchievements();
      await this.saveAchievements(predefinedAchievements);
      return predefinedAchievements;
    } catch (error) {
      console.error('Ошибка при получении достижений:', error);
      return [];
    }
  }
  
  // Сохранение всех достижений
  static async saveAchievements(achievements) {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Ошибка при сохранении достижений:', error);
    }
  }
  
  // Метод для обновления достижений
  static async updateAchievementsOnTaskComplete(task, profile) {
    try {
      console.log('Обновление достижений при выполнении задачи:', task.id);
      const achievements = await this.getAllAchievements();
      console.log('Загружено достижений:', achievements.length);
      
      // Получаем необходимые данные для проверки условий
      const tasks = await TaskService.getAllTasks();
      console.log('Получено задач:', tasks.length);
      
      // ИСПРАВЛЕНИЕ: Используем isCompleted вместо completed
      const completedTasks = tasks.filter(t => t.isCompleted).length;
      const highPriorityCompleted = tasks.filter(t => t.isCompleted && t.priority === 'high').length;
      
      console.log('Количество выполненных задач (isCompleted):', completedTasks);
      console.log('Количество выполненных задач высокого приоритета:', highPriorityCompleted);
      
      const streakDays = profile.streakDays;
      const level = profile.level;
      const currentHour = new Date().getHours();
      const isNight = currentHour >= 22 || currentHour < 5;
      const isMorning = currentHour >= 5 && currentHour < 9;
      
      // Получаем статистику для еженедельной эффективности
      let weeklyEfficiency = 0;
      const statistics = await StatisticsService.getWeeklyStatistics();
      if (statistics && statistics.length > 0) {
        weeklyEfficiency = StatisticsService.calculateEfficiency(statistics);
      }
      
      let achievementsUnlocked = [];
      
      // Для отладки
      console.log('Текущие данные:');
      console.log('- Выполнено задач:', completedTasks);
      console.log('- Серия дней:', streakDays);
      console.log('- Текущий уровень:', level);
      
      // Для отладки проблемных достижений
      for (const achievement of achievements) {
        if (['first_steps', 'tasks_master', 'productivity_legend'].includes(achievement.id)) {
          console.log(`До обновления: ${achievement.id} - прогресс=${achievement.progress}/${achievement.progressTarget}`);
        }
      }
      
      // Проверяем каждое достижение
      for (const achievement of achievements) {
        let updated = false;
        let progress = 0;
        
        if (achievement.condition) {
          switch(achievement.condition.type) {
            case 'taskCompleted':
              progress = completedTasks;
              // Детальное логирование для отладки
              if (['first_steps', 'tasks_master', 'productivity_legend'].includes(achievement.id)) {
                console.log(`${achievement.id}: Устанавливаем прогресс на ${progress} (из ${completedTasks} выполненных задач)`);
              }
              break;
            case 'streak':
              progress = streakDays;
              break;
            case 'level':
              progress = level;
              break;
            case 'priority':
              if (achievement.condition.priority === 'high') {
                progress = highPriorityCompleted;
              }
              break;
            case 'timeOfDay':
              // Специальная логика для достижений за время дня
              if (achievement.condition.timeRange === 'night' && isNight) {
                progress = achievement.progress + 1; // Увеличиваем на 1
              } else if (achievement.condition.timeRange === 'morning' && isMorning) {
                progress = achievement.progress + 1; // Увеличиваем на 1
              } else {
                progress = achievement.progress; // Оставляем как есть
              }
              break;
            case 'efficiency':
              progress = weeklyEfficiency;
              break;
          }
          
          // Обновляем прогресс достижения
          updated = achievement.updateProgress(progress);
          
          // Если достижение разблокировано, добавляем его в список
          if (updated && achievement.unlocked) {
            achievementsUnlocked.push(achievement);
          }
        }
      }
      
      // Для отладки проблемных достижений после обновления
      for (const achievement of achievements) {
        if (['first_steps', 'tasks_master', 'productivity_legend'].includes(achievement.id)) {
          console.log(`После обновления: ${achievement.id} - прогресс=${achievement.progress}/${achievement.progressTarget}, разблокировано=${achievement.unlocked}`);
        }
      }
      
      // Сохраняем обновленные достижения
      await this.saveAchievements(achievements);
      
      // Если есть разблокированные достижения, начисляем награды
      if (achievementsUnlocked.length > 0) {
        console.log('Разблокировано достижений:', achievementsUnlocked.length);
        let totalExperience = 0;
        let totalCoins = 0;
        
        for (const achievement of achievementsUnlocked) {
          totalExperience += achievement.rewards?.experience || 0;
          totalCoins += achievement.rewards?.coins || 0;
        }
        
        const profileService = ProfileService.getInstance();
        
        if (totalExperience > 0) {
          // Добавляем опыт от достижений
          const result = await profileService.addExperience(totalExperience);
          
          return {
            achievementsUnlocked,
            totalExperience,
            totalCoins,
            levelUp: result.didLevelUp,
            newLevel: result.newLevel
          };
        }
        
        return {
          achievementsUnlocked,
          totalExperience,
          totalCoins
        };
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка при обновлении достижений:', error);
      return null;
    }
  }
  
  // Метод для проверки и обновления достижений на основе эффективности
  static async updateAchievementsForEfficiency() {
    try {
      const achievements = await this.getAllAchievements();
      
      // Проверяем, что достижения были успешно загружены
      if (!Array.isArray(achievements) || achievements.length === 0) {
        console.error('Не удалось загрузить достижения или список пуст');
        return null;
      }
      
      const weeklyStats = await StatisticsService.getWeeklyStatistics();
      
      // Минимальное количество дней для точного расчета эффективности
      const MIN_DAYS_REQUIRED = 3;
      
      // Проверка минимального количества дней для определения эффективности
      if (!weeklyStats || weeklyStats.length < MIN_DAYS_REQUIRED) {
        console.log(`Недостаточно дней для расчета достижения по эффективности. Нужно минимум ${MIN_DAYS_REQUIRED}, текущее: ${weeklyStats ? weeklyStats.length : 0}`);
        return null;
      }
      
      // Проверяем, что сегодня действительно конец недели (воскресенье)
      const currentDay = new Date().getDay();
      const isEndOfWeek = currentDay === 0; // 0 = воскресенье
      
      // Если сейчас не конец недели, пропускаем проверку достижений эффективности
      if (!isEndOfWeek) {
        console.log('Сегодня не конец недели. Проверка достижений эффективности отложена до воскресенья.');
        return null;
      }
      
      // Проверяем общее количество задач за неделю
      let totalTasks = 0;
      let completedTasks = 0;
      
      weeklyStats.forEach(stats => {
        if (stats && stats.dailyStats) {
          totalTasks += stats.dailyStats.tasksCreated + (stats.dailyStats.tasksPlanned || 0);
          completedTasks += stats.dailyStats.tasksCompleted;
        }
      });
      
      // Минимальное количество задач для точного расчета эффективности
      const MIN_TASKS_REQUIRED = 5;
      
      if (totalTasks < MIN_TASKS_REQUIRED) {
        console.log(`Недостаточно задач для расчета достижения по эффективности. Нужно минимум ${MIN_TASKS_REQUIRED}, текущее: ${totalTasks}`);
        return null;
      }
      
      const weeklyEfficiency = StatisticsService.calculateEfficiency(weeklyStats);
      console.log(`Текущая эффективность за неделю: ${weeklyEfficiency}%`);
      console.log(`Всего задач: ${totalTasks}, выполнено: ${completedTasks}`);
      
      let achievementsUnlocked = [];
      
      // Обрабатываем достижения по эффективности
      for (const achievement of achievements) {
        if (achievement && achievement.condition && achievement.condition.type === 'efficiency') {
          const targetPercentage = achievement.condition.percentage || 90;
          const targetPeriod = achievement.condition.period || 'week';
          
          // Проверяем достижение требуемого уровня эффективности
          if (targetPeriod === 'week' && weeklyEfficiency >= targetPercentage) {
            // Безопасное обновление прогресса
            if (typeof achievement.updateProgress === 'function') {
              const updated = achievement.updateProgress(targetPercentage);
              if (updated && achievement.unlocked) {
                achievementsUnlocked.push(achievement);
              }
            } else {
              console.error('Объект achievement не имеет метода updateProgress:', achievement);
            }
          }
        }
      }
      
      if (achievementsUnlocked.length > 0) {
        await this.saveAchievements(achievements);
        
        // Возвращаем информацию о разблокированных достижениях
        let totalExperience = 0;
        let totalCoins = 0;
        
        for (const achievement of achievementsUnlocked) {
          totalExperience += achievement.rewards?.experience || 0;
          totalCoins += achievement.rewards?.coins || 0;
        }
        
        return {
          achievementsUnlocked,
          totalExperience,
          totalCoins
        };
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка при обновлении достижений по эффективности:', error);
      return null;
    }
  }

  // Получение достижения по идентификатору
  static async getAchievementById(achievementId) {
    try {
      const achievements = await this.getAllAchievements();
      return achievements.find(achievement => achievement.id === achievementId);
    } catch (error) {
      console.error('Ошибка при получении достижения:', error);
      return null;
    }
  }
  
  // Получение разблокированных достижений
  static async getUnlockedAchievements() {
    try {
      const achievements = await this.getAllAchievements();
      return achievements.filter(achievement => achievement.unlocked);
    } catch (error) {
      console.error('Ошибка при получении разблокированных достижений:', error);
      return [];
    }
  }
  
  // Получение достижений по категории
  static async getAchievementsByCategory(category) {
    try {
      const achievements = await this.getAllAchievements();
      return achievements.filter(achievement => achievement.category === category);
    } catch (error) {
      console.error('Ошибка при получении достижений по категории:', error);
      return [];
    }
  }
  
  // Получение видимых достижений (не скрытых или уже разблокированных)
  static async getVisibleAchievements() {
    try {
      const achievements = await this.getAllAchievements();
      return achievements.filter(achievement => !achievement.hidden || achievement.unlocked);
    } catch (error) {
      console.error('Ошибка при получении видимых достижений:', error);
      return [];
    }
  }
  
  // Получение скрытых неразблокированных достижений
  static async getHiddenAchievements() {
    try {
      const achievements = await this.getAllAchievements();
      return achievements.filter(achievement => achievement.hidden && !achievement.unlocked);
    } catch (error) {
      console.error('Ошибка при получении скрытых достижений:', error);
      return [];
    }
  }
  
  // Проверка новых достижений
  static async getNewAchievements() {
    try {
      const achievements = await this.getAllAchievements();
      return achievements.filter(achievement => achievement.unlocked && !achievement.viewed);
    } catch (error) {
      console.error('Ошибка при проверке новых достижений:', error);
      return [];
    }
  }
  
  // Отметка достижений как просмотренных
  static async markAchievementsAsViewed(achievementIds) {
    try {
      const achievements = await this.getAllAchievements();
      let updated = false;
      
      for (const achievement of achievements) {
        if (achievementIds.includes(achievement.id) && !achievement.viewed) {
          achievement.viewed = true;
          updated = true;
        }
      }
      
      if (updated) {
        await this.saveAchievements(achievements);
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при отметке достижений как просмотренных:', error);
      return false;
    }
  }
  
  // Обновление прогресса достижения
  static async updateAchievementProgress(achievementId, progress) {
    try {
      const achievements = await this.getAllAchievements();
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (achievement) {
        const updated = achievement.updateProgress(progress);
        await this.saveAchievements(achievements);
        return { updated, achievement };
      }
      
      return { updated: false };
    } catch (error) {
      console.error('Ошибка при обновлении прогресса достижения:', error);
      return { updated: false, error: error.message };
    }
  }
}