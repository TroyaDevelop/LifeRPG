import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SchedulerService } from '../services/SchedulerService';

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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  useEffect(() => {
    // Проверка и сброс ежедневных задач при загрузке навигатора
    const initializeScheduler = async () => {
      // Проверяем и сбрасываем ежедневные задачи, если нужно
      await SchedulerService.checkAndResetDailyTasks();
      
      // Настраиваем обработчики для других периодических задач
      SchedulerService.setupScheduledEvents();
    };
    
    initializeScheduler();
  }, []);
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F5F7FA' }
        }}
      >
        {/* Основные экраны */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
        <Stack.Screen 
          name="NotificationSettings" 
          component={NotificationSettingsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen 
          name="Achievements" 
          component={AchievementsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AppSettings" 
          component={AppSettingsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* Экраны категорий */}
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
        <Stack.Screen name="EditCategory" component={EditCategoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
