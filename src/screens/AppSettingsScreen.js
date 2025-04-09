import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useAppContext } from '../context/AppContext'; // Импортируем контекст
import Header from '../components/Header';

const AppSettingsScreen = ({ navigation }) => {
  // Используем контекст
  const { profile, updateProfile, refreshData, isLoading } = useAppContext();
  
  const [settings, setSettings] = useState({
    autoArchiveCompletedTasks: true,
    // Другие настройки...
  });
  
  // Загружаем настройки из профиля
  useEffect(() => {
    if (profile && profile.settings) {
      setSettings({
        autoArchiveCompletedTasks: profile.settings.autoArchiveCompletedTasks ?? true,
        // Загружаем другие настройки...
      });
    }
  }, [profile]);

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
  
  return (
    <View style={styles.container}>
      <Header 
        title="Настройки приложения" 
        hasBack={true} 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Задачи</Text>
          {renderSettingItem(
            "Автоархивирование выполненных задач", 
            "autoArchiveCompletedTasks",
            "Автоматическое перемещение выполненных задач в архив"
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