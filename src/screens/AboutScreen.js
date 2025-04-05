import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext'; // Импортируем контекст
import Header from '../components/Header';
import Constants from 'expo-constants';

const AboutScreen = ({ navigation }) => {
  const appVersion = Constants.manifest?.version || '1.0.0';
  const { refreshData } = useAppContext(); // Используем контекст для обновления данных
  
  const handleOpenLink = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Невозможно открыть URL: ${url}`);
      }
    });
  };

  // Функция для обработки секретного тапа по логотипу (например, для разблокировки скрытых функций)
  const handleSecretTap = () => {
    // Обновляем данные через контекст
    refreshData();
  };

  return (
    <View style={styles.container}>
      <Header 
        title="О приложении" 
        hasBack={true}
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={handleSecretTap} activeOpacity={0.7}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.appName}>Taskovia</Text>
          <Text style={styles.versionText}>Версия {appVersion}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <Text style={styles.descriptionText}>
            Taskovia — это приложение для управления задачами с элементами геймификации. 
            Превратите свои повседневные задачи в увлекательное приключение, 
            повышайте уровень своего персонажа, получайте опыт и достижения за
            выполнение реальных целей.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Функции</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkbox" size={24} color="#4E64EE" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Управление задачами</Text>
              <Text style={styles.featureDescription}>
                Создавайте обычные и ежедневные задачи, устанавливайте сроки и приоритеты
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="stats-chart" size={24} color="#4E64EE" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Статистика и анализ</Text>
              <Text style={styles.featureDescription}>
                Отслеживайте свой прогресс и анализируйте эффективность с помощью подробной статистики
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="trophy" size={24} color="#4E64EE" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Достижения</Text>
              <Text style={styles.featureDescription}>
                Получайте опыт и разблокируйте достижения за выполнение задач
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="person" size={24} color="#4E64EE" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Персонаж</Text>
              <Text style={styles.featureDescription}>
                Создайте и настройте своего виртуального персонажа, который растет вместе с вами
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контакты</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleOpenLink('mailto:support@liferpg.app')}
          >
            <Ionicons name="mail-outline" size={24} color="#4E64EE" style={styles.contactIcon} />
            <Text style={styles.contactText}>goddys777@icloud.com</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Правовая информация</Text>
          
          {/* <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => handleOpenLink('https://liferpg.app/privacy')}
          >
            <Text style={styles.legalText}>Политика конфиденциальности</Text>
            <Ionicons name="chevron-forward" size={20} color="#888888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => handleOpenLink('https://liferpg.app/terms')}
          >
            <Text style={styles.legalText}>Условия использования</Text>
            <Ionicons name="chevron-forward" size={20} color="#888888" />
          </TouchableOpacity> */}
        </View>
        
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Taskovia. Все права защищены.
        </Text>
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
  contentContainer: {
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#888888',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#333333',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legalText: {
    fontSize: 16,
    color: '#333333',
  },
  copyrightText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default AboutScreen;