import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';
import Header from '../components/Header';

const NOTIFICATIONS_SETTINGS_KEY = '@LifeRPG:notificationsSettings';

const NotificationSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    taskReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Обновляем настройки в NotificationService
      if (!newSettings.enabled) {
        // Если уведомления отключены - отменяем все существующие
        await NotificationService.cancelAllNotifications();
      }
      
      // Можно расширить здесь логику обновления настроек уведомлений
    } catch (error) {
      console.error('Ошибка при сохранении настроек уведомлений:', error);
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const renderSwitchItem = (label, key, description = "") => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: "#D1D1D6", true: "#4E66F1" }}
        thumbColor={"#FFFFFF"}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title="Настройки уведомлений" 
          hasBack={true}
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.loadingContainer}>
          <Text>Загрузка настроек...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Настройки уведомлений" 
        hasBack={true}
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основные</Text>
          {renderSwitchItem('Уведомления', 'enabled', 'Включить все уведомления от приложения')}
          
          {settings.enabled && (
            <>
              {renderSwitchItem('Напоминания о задачах', 'taskReminders', 'Уведомления о приближающихся сроках')}
            </>
          )}
        </View>
        
        {settings.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Звук и вибрация</Text>
            {renderSwitchItem('Звук', 'soundEnabled', 'Включить звук уведомлений')}
            {renderSwitchItem('Вибрация', 'vibrationEnabled', 'Включить вибрацию для уведомлений')}
          </View>
        )}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Настройки уведомлений позволяют контролировать способ получения напоминаний о задачах.
            Изменения вступают в силу немедленно.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default NotificationSettingsScreen;