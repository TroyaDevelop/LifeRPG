import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class NotificationService {
  // Инициализация уведомлений
  static init() {
    PushNotification.configure({
      // (обязательно) Вызывается когда токен регистрации получен
      onRegister: function(token) {
        console.log("TOKEN:", token);
      },
      
      // (требуется) Вызывается когда получено уведомление
      onNotification: function(notification) {
        console.log("NOTIFICATION:", notification);
        
        // Требуется для iOS
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      
      // Должен ли уведомления показываться когда приложение на переднем плане
      // default: true
      popInitialNotification: true,
      requestPermissions: true,
    });
    
    // Создание Android канала
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default', // (required)
          channelName: 'default', // (required)
          channelDescription: 'Основной канал для уведомлений', // (optional)
          importance: 4, // (optional) default: 4. Важность: Int значение от 0 до 4
          vibrate: true, // (optional) Значение по умолчанию: true. Создает вибрацию для уведомлений
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false
          playSound: true, // (optional) Значение по умолчанию: true
          soundName: 'default', // (optional) Sound to play when the notification is shown
          lightColor: '#4E64EE', // (optional) Значение по умолчанию: 'white'
        },
        (created) => console.log(`Канал уведомлений создан: '${created}'`)
      );
    }
  }

  // Регистрация устройства для уведомлений
  static async registerForPushNotificationsAsync() {
    try {
      // Проверяем, на реальном ли устройстве запущено приложение
      if (DeviceInfo.isEmulator()) {
        console.log('Push-уведомления недоступны в эмуляторе');
        return null;
      }

      // Запрашиваем разрешения на уведомления
      if (Platform.OS === 'ios') {
        PushNotificationIOS.requestPermissions().then((data) => {
          return data.alert;
        });
      } else {
        // На Android разрешения запрашиваются при инициализации
        return true;
      }
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

      // Создаем уникальный ID для уведомления
      const notificationId = task.id.toString();

      // Планируем новое уведомление
      PushNotification.localNotificationSchedule({
        channelId: 'default',
        id: notificationId,
        title: 'Напоминание о задаче',
        message: task.title,
        userInfo: { taskId: task.id },
        date: triggerTime,
        allowWhileIdle: true, // (optional) разрешить уведомление даже при режиме Doze
        importance: 'high',
        playSound: true,
        soundName: 'default',
        vibrate: true,
        vibration: 300,
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
      PushNotification.cancelLocalNotification(notificationId);
      console.log('Уведомление отменено:', notificationId);
      return true;
    } catch (error) {
      console.error('Ошибка при отмене уведомления:', error);
      return false;
    }
  }

  // Получение всех запланированных уведомлений
  static async getAllScheduledNotifications() {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }

  // Удаление всех уведомлений
  static async cancelAllNotifications() {
    try {
      PushNotification.cancelAllLocalNotifications();
      return true;
    } catch (error) {
      console.error('Ошибка при отмене всех уведомлений:', error);
      return false;
    }
  }
}

export default NotificationService;