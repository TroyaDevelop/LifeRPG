import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class NotificationService {
  // Инициализация уведомлений
  static init() {
    // Настраиваем общие параметры уведомлений
    PushNotification.configure({
      // Вызывается когда токен регистрации получен
      onRegister: function(token) {
        console.log("TOKEN:", token);
      },
      
      // Вызывается когда получено уведомление
      onNotification: function(notification) {
        console.log("NOTIFICATION:", notification);
        
        // Если пользователь нажал на уведомление
        if (notification.userInteraction) {
          console.log('Пользователь нажал на уведомление:', notification);
          
          // Здесь можно добавить навигацию к задаче по ID
          // если notification.data && notification.data.taskId
        }
        
        // Требуется для iOS
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      
      // ANDROID ONLY: GCM или FCM Sender ID (product_number) (необязательно - не указывайте, если не используете FCM)
      // senderID: 'YOUR_GCM_SENDER_ID',
      
      // Должны ли уведомления показываться когда приложение на переднем плане
      foreground: true,
      
      // Отключает автоматический clear уведомлений, когда на них нажали
      popInitialNotification: true,
      
      // Запрашивать разрешения для iOS
      requestPermissions: Platform.OS === 'ios',
      
      // Разрешения для iOS
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    });
    
    // Создание канала для Android
    if (Platform.OS === 'android') {
      // Удаляем старый канал перед созданием нового для обновления настроек
      PushNotification.deleteChannel('default');
      
      PushNotification.createChannel(
        {
          channelId: 'default',
          channelName: 'Основной канал',
          channelDescription: 'Основной канал для уведомлений Taskovia', 
          importance: 4, // Высокая важность
          vibrate: true,
          vibration: 300,
          playSound: true,
          soundName: 'default',
          lightColor: '#4E64EE',
          enableLights: true,
        },
        (created) => console.log(`Канал уведомлений создан: '${created}'`)
      );
    }
    
    console.log('NotificationService: Инициализация завершена');
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