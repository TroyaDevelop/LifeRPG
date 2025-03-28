import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { ProfileService } from '../services/ProfileService';
import Header from '../components/Header';

const AppSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    autoDeleteCompletedTasks: true
  });
  const [loading, setLoading] = useState(true);
  
  // Загружаем настройки при открытии экрана
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      setLoading(true);
      const profileService = ProfileService.getInstance();
      const userSettings = await profileService.getSettings();
      
      setSettings({
        autoDeleteCompletedTasks: userSettings.autoDeleteCompletedTasks ?? true
      });
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggle = async (setting, value) => {
    try {
      const newSettings = { ...settings, [setting]: value };
      setSettings(newSettings);
      
      const profileService = ProfileService.getInstance();
      await profileService.updateSettings({ [setting]: value });
    } catch (error) {
      console.error('Ошибка при сохранении настройки:', error);
      // Возвращаем предыдущее значение, если произошла ошибка
      setSettings(prev => ({ ...prev }));
    }
  };
  
  const renderSettingItem = (label, key, description = "") => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => handleToggle(key, value)}
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
            "Автоудаление выполненных задач", 
            "autoDeleteCompletedTasks",
            "Автоматическое удаление обычных задач после их выполнения"
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