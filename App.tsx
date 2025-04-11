import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { NotificationService } from './src/services';
import { AppProvider } from './src/context/AppContext';
import { NotificationProvider } from './src/context/NotificationContext';

// Инициализация сервиса уведомлений (теперь вся конфигурация находится в NotificationService.js)
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