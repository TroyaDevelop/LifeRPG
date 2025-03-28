import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificationService } from './src/services';
import { TaskService } from './src/services/TaskService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
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
      
      // Здесь можно добавить логику для навигации к задаче
      if (data && data.taskId) {
        // NavigationService.navigate('EditTask', { taskId: data.taskId });
        console.log('Нужно перейти к задаче с ID:', data.taskId);
      }
    });

    // Очистка слушателей при размонтировании
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
