import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Импорт экранов
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen/EditTaskScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import EditCategoryScreen from '../screens/EditCategoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
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
        
        {/* Экраны категорий */}
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
        <Stack.Screen name="EditCategory" component={EditCategoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
