import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { NotificationService } from './src/services';
import { AppProvider } from './src/context/AppContext';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Запрос разрешений на уведомления
    NotificationService.registerForPushNotificationsAsync();

    // Настройка обработчиков уведомлений
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Получено уведомление:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Пользователь нажал на уведомление:', response);
      const { data } = response.notification.request.content;
      
      if (data && data.taskId) {
        console.log('Нужно перейти к задаче с ID:', data.taskId);
        // Навигация будет обрабатываться отдельно
      }
    });

    // Очистка слушателей при размонтировании
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
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
        <AppProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </SafeAreaProvider>
        </AppProvider>
      )}
    </>
  );
}
