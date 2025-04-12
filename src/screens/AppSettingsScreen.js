import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useAppContext } from '../context/AppContext'; // Импортируем контекст
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

const NOTIFICATIONS_SETTINGS_KEY = '@LifeRPG:notificationsSettings';

const AppSettingsScreen = ({ navigation, route }) => {
  // Используем контекст
  const { profile, updateProfile, refreshData, isLoading } = useAppContext();
  
  // Ссылка для прокрутки к разделу уведомлений
  const notificationSectionRef = React.useRef(null);
  const scrollViewRef = React.useRef(null);
  
  const [settings, setSettings] = useState({
    autoArchiveCompletedTasks: true,
    // Другие настройки...
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    taskReminders: true,
  });
  
  // Загружаем настройки из профиля
  useEffect(() => {
    if (profile && profile.settings) {
      setSettings({
        autoArchiveCompletedTasks: profile.settings.autoArchiveCompletedTasks ?? true,
        // Загружаем другие настройки...
      });
    }
    
    // Загружаем настройки уведомлений
    loadNotificationSettings();
  }, [profile]);
  
  // Логика автоматической прокрутки к разделу уведомлений
  useEffect(() => {
    if (route.params?.section === 'notifications' && notificationSectionRef.current && scrollViewRef.current) {
      // Небольшая задержка для уверенности, что компонент полностью отрисован
      setTimeout(() => {
        notificationSectionRef.current.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({ y, animated: true });
          },
          () => console.log('Ошибка измерения позиции раздела уведомлений')
        );
      }, 300);
    }
  }, [route.params?.section, notificationSectionRef.current, scrollViewRef.current]);
  
  // Функция для загрузки настроек уведомлений
  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек уведомлений:', error);
    }
  };
  
  // Функция для сохранения настроек уведомлений
  const saveNotificationSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Обновляем настройки в NotificationService
      if (!newSettings.enabled) {
        // Если уведомления отключены - отменяем все существующие
        await NotificationService.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек уведомлений:', error);
    }
  };
  
  // Обработчик изменения настроек уведомлений
  const handleNotificationSettingChange = (key) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  // Обработчик изменения настройки
  const handleSettingChange = async (setting, value) => {
    try {
      // Обновляем локальное состояние
      setSettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      // Обновляем профиль через контекст
      await updateProfile({
        settings: {
          ...profile.settings,
          [setting]: value
        }
      });
      
      // Обновляем данные в контексте
      refreshData();
    } catch (error) {
      console.error('Ошибка при обновлении настроек:', error);
    }
  };

  // Компонент для отображения элемента настройки
  const renderSettingItem = (label, setting, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[setting]}
        onValueChange={(value) => handleSettingChange(setting, value)}
        trackColor={{ false: "#E5E7EB", true: "#4E66F1" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
  
  // Компонент для отображения элемента настроек уведомлений
  const renderNotificationSettingItem = (label, key, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={notificationSettings[key]}
        onValueChange={() => handleNotificationSettingChange(key)}
        trackColor={{ false: "#D1D1D6", true: "#4E66F1" }}
        thumbColor={"#FFFFFF"}
      />
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Header 
        title="Настройки приложения" 
        hasBack={true} 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView} ref={scrollViewRef}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Задачи</Text>
          {renderSettingItem(
            "Автоархивирование выполненных задач", 
            "autoArchiveCompletedTasks",
            "Автоматическое перемещение выполненных задач в архив"
          )}
        </View>
        
        {/* Новый раздел с настройками уведомлений */}
        <View style={styles.section} ref={notificationSectionRef}>
          <Text style={styles.sectionTitle}>Уведомления</Text>
          {renderNotificationSettingItem(
            'Уведомления', 
            'enabled', 
            'Включить все уведомления от приложения'
          )}
          
          {notificationSettings.enabled && (
            <>
              {renderNotificationSettingItem(
                'Напоминания о задачах', 
                'taskReminders', 
                'Уведомления о приближающихся сроках'
              )}
            </>
          )}
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Настройки приложения влияют на его поведение. Изменения вступают в силу немедленно.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

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
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    marginHorizontal: 16,
    marginVertical: 12,
    textTransform: 'uppercase',
  },
  subsection: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888888',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#888888',
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#EEF1FE',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default AppSettingsScreen;