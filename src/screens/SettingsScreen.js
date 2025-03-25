import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

export default function SettingsScreen({ navigation }) {
  const menuItems = [
    {
      id: 'statistics',
      title: 'Статистика',
      icon: 'bar-chart-outline',
      description: 'Просмотр статистики выполнения задач',
      onPress: () => navigation.navigate('Statistics')
    },
    {
      id: 'categories',
      title: 'Категории',
      icon: 'pricetags-outline',
      description: 'Управление категориями задач',
      onPress: () => navigation.navigate('Categories')
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: 'notifications-outline',
      description: 'Настройка напоминаний и уведомлений',
      onPress: () => navigation.navigate('NotificationSettings')
    },
    {
      id: 'profile',
      title: 'Профиль',
      icon: 'person-outline',
      description: 'Управление профилем персонажа',
      onPress: () => navigation.navigate('Profile')
    },
    {
      id: 'about',
      title: 'О приложении',
      icon: 'information-circle-outline',
      description: 'Информация о приложении и разработчиках',
      onPress: () => navigation.navigate('About')
    }
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={item.icon} size={24} color="#4E66F1" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Настройки" 
        hasBack={true} 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основные настройки</Text>
          {menuItems.map(renderMenuItem)}
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Версия: 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    marginHorizontal: 16,
    marginVertical: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF1FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#888888',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#888888',
  },
});