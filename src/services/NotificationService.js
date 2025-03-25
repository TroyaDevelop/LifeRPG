import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Конфигурация отображения уведомлений в приложении
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  // Регистрация устройства для уведомлений
  static async registerForPushNotificationsAsync() {
    try {
      // Для Android настраиваем канал уведомлений
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4E64EE',
        });
      }

      // Проверяем, на реальном ли устройстве запущено приложение
      if (!Device.isDevice) {
        console.log('Push-уведомления недоступны в эмуляторе');
        return null;
      }

      // Запрашиваем разрешения на уведомления
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Разрешение на уведомления не получено!');
        return null;
      }
      
      // Для локальных уведомлений нам не нужен токен,
      // поэтому возвращаем true, если разрешение получено
      return true;
    } catch (error) {
      console.error('Ошибка при регистрации для уведомлений:', error);
      return null;
    }
  }

  // Планирование локального уведомления для задачи
  static async scheduleTaskReminder(task, reminderTime = null) {
    try {
      if (!task.dueDate) {
        console.log('Невозможно запланировать напоминание: нет даты дедлайна');
        return null;
      }

      // Получаем время напоминания
      let triggerTime;
      
      if (reminderTime) {
        // Использовать указанное время
        triggerTime = new Date(reminderTime);
      } else {
        // По умолчанию напоминаем за 1 час до дедлайна
        triggerTime = new Date(task.dueDate);
        triggerTime.setHours(triggerTime.getHours() - 1);
      }

      // Проверка, что время напоминания не в прошлом
      if (triggerTime.getTime() <= Date.now()) {
        console.log('Время напоминания в прошлом, уведомление не будет запланировано');
        return null;
      }

      // Отменяем ранее запланированное уведомление, если оно существует
      if (task.notificationId) {
        await this.cancelTaskReminder(task.notificationId);
      }

      // Планируем новое уведомление
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Напоминание о задаче',
          body: task.title,
          data: { taskId: task.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: triggerTime,
      });

      console.log('Уведомление запланировано с ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Ошибка при планировании уведомления:', error);
      return null;
    }
  }

  // Отмена запланированного уведомления
  static async cancelTaskReminder(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Уведомление отменено:', notificationId);
      return true;
    } catch (error) {
      console.error('Ошибка при отмене уведомления:', error);
      return false;
    }
  }

  // Получение всех запланированных уведомлений
  static async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Ошибка при получении запланированных уведомлений:', error);
      return [];
    }
  }

  // Удаление всех уведомлений
  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Ошибка при отмене всех уведомлений:', error);
      return false;
    }
  }
}

export default NotificationService;