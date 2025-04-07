import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PushNotification from 'react-native-push-notification';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { NotificationService } from './src/services';
import { AppProvider } from './src/context/AppContext';
import { NotificationProvider } from './src/context/NotificationContext';

// Настройка канала уведомлений для Android
PushNotification.createChannel(
  {
    channelId: 'default-channel',
    channelName: 'Default Channel',
    channelDescription: 'Канал для всех уведомлений приложения',
    playSound: true,
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Канал уведомлений создан: ${created}`)
);

// Настройка обработчиков уведомлений
PushNotification.configure({
  onRegister: function(token) {
    console.log('TOKEN:', token);
  },
  
  onNotification: function(notification) {
    console.log('Получено уведомление:', notification);
    
    // Если пользователь нажал на уведомление
    if (notification.userInteraction) {
      console.log('Пользователь нажал на уведомление:', notification);
      
      if (notification.data && notification.data.taskId) {
        console.log('Нужно перейти к задаче с ID:', notification.data.taskId);
        // Навигация будет обрабатываться отдельно
      }
    }

    // Требуется для iOS
    notification.finish('UIBackgroundFetchResultNoData');
  },

  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  
  popInitialNotification: true,
  requestPermissions: true,
});

// Инициализация уведомлений
NotificationService.init();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Запрос разрешений на уведомления через NotificationService
    NotificationService.registerForPushNotificationsAsync();
    
    // В react-native-push-notification не нужно удалять слушателей,
    // так как они настраиваются один раз через configure
  }, []);

  // Обработчик завершения экрана загрузки
  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <SafeAreaProvider>
          <NotificationProvider>
            <AppProvider>
                <StatusBar barStyle="dark-content" />
                <AppNavigator />
            </AppProvider>
          </NotificationProvider>
        </SafeAreaProvider>
      )}
    </>
  );
}
