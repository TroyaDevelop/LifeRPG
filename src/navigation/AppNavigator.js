import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SchedulerService } from '../services/SchedulerService';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Импорт экранов
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen/EditTaskScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import EditCategoryScreen from '../screens/EditCategoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AvatarCustomizationScreen from '../screens/AvatarCustomizationScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  useEffect(() => {
    // Инициализация сервиса планировщика при запуске приложения
    SchedulerService.initializeScheduler();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#F5F7FA', // Устанавливаем фоновый цвет для всех экранов
          },
          // Добавляем опции для сохранения состояния экранов
          detachInactiveScreens: false,
          // Настройка анимации перехода для более плавной навигации
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ freezeOnBlur: false }} 
        />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
        <Stack.Screen name="EditCategory" component={EditCategoryScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AvatarCustomization" component={AvatarCustomizationScreen} />
        <Stack.Screen 
          name="About" 
          component={AboutScreen} 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
