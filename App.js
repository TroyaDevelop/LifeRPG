import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificationService } from './src/services';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Запрос разрешений на уведомления
    NotificationService.registerForPushNotificationsAsync();

    // Слушатель для получения уведомлений в активном состоянии приложения
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Получено уведомление:', notification);
    });

    // Слушатель для обработки нажатия на уведомление
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Пользователь нажал на уведомление:', response);
      const { data } = response.notification.request.content;
      
      // Здесь можно добавить логику для навигации к задаче
      if (data && data.taskId) {
        // NavigationService.navigate('EditTask', { taskId: data.taskId });
        console.log('Нужно перейти к задаче с ID:', data.taskId);
      }
    });

    // Очистка слушателей при размонтировании
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
