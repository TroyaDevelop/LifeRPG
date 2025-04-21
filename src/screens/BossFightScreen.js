import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Button, Modal, LoadingIndicator } from '../components';
import BossService from '../services/BossService';
import ProfileService from '../services/ProfileService'; // Импорт ProfileService
import Ionicons from 'react-native-vector-icons/Ionicons';

const BossFightScreen = ({ navigation }) => {
  const [boss, setBoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [damageHistory, setDamageHistory] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);

  // Создаем экземпляр ProfileService
  const profileService = new ProfileService();

  // Получение активного босса и профиля
  const fetchData = async () => {
    setLoading(true);
    try {
      const activeBoss = await BossService.getActiveBoss();
      setBoss(activeBoss);
      
      if (activeBoss) {
        setRemainingDays(activeBoss.getRemainingDays());
        // Сортируем историю урона по дате, от новых к старым
        const sortedHistory = [...activeBoss.damageHistory].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setDamageHistory(sortedHistory);
      }
      
      // Используем экземпляр profileService
      const userProfile = await profileService.getProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Ошибка при загрузке данных босса:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Кнопка информации о боссах
  const handleInfoPress = () => {
    setShowInfoModal(true);
  };

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  // Отображение истории урона
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
      <Text style={styles.historyDamage}>{item.damage} урона</Text>
    </View>
  );

  // Если загрузка данных
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Битва с боссом" hasBack={true} onBack={() => navigation.goBack()} />
        <LoadingIndicator />
      </View>
    );
  }

  // Если нет активного босса
  if (!boss) {
    return (
      <View style={styles.container}>
        <Header title="Битва с боссом" hasBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Ionicons name="skull-outline" size={60} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Нет активного босса</Text>
          <Text style={styles.emptyDescription}>
            Приобретите свиток призыва в магазине, чтобы вызвать босса на битву
          </Text>
          <Button 
            title="Перейти в магазин" 
            onPress={() => navigation.navigate('Shop')} 
            style={styles.shopButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Битва с боссом" 
        hasBack={true} 
        onBack={() => navigation.goBack()} 
        rightIcon={<Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />}
        onRightPress={handleInfoPress}
      />
      
      <ScrollView style={styles.content}>
        {/* Секция информации о боссе */}
        <View style={styles.bossCard}>
          <View style={styles.bossImageContainer}>
            {boss.imageUrl ? (
              <Image source={{ uri: boss.imageUrl }} style={styles.bossImage} resizeMode="contain" />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="skull" size={56} color="#FFFFFF" />
              </View>
            )}
          </View>
          
          <View style={styles.bossInfo}>
            <Text style={styles.bossName}>{boss.name}</Text>
            <Text style={styles.bossLevel}>Уровень {boss.level}</Text>
            
            {/* Полоса здоровья босса */}
            <View style={styles.healthContainer}>
              <View style={styles.healthBarContainer}>
                <View 
                  style={[
                    styles.healthBar, 
                    { width: `${boss.getHealthPercentage()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.healthText}>
                {boss.currentHealth}/{boss.maxHealth} HP ({boss.getHealthPercentage()}%)
              </Text>
            </View>
            
            {/* Оставшееся время */}
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={18} color="#666666" />
              <Text style={styles.timeText}>
                {remainingDays > 0 
                  ? `Осталось дней: ${remainingDays}` 
                  : 'Последний день битвы!'
                }
              </Text>
            </View>
          </View>
        </View>
        
        {/* Описание босса */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Описание</Text>
          <Text style={styles.descriptionText}>{boss.description}</Text>
        </View>
        
        {/* Секция информации об уроне */}
        <View style={styles.damageInfoCard}>
          <Text style={styles.damageInfoTitle}>Как нанести урон</Text>
          <Text style={styles.damageInfoText}>
            Выполняйте задачи, чтобы наносить урон боссу. Каждая выполненная задача наносит урон, 
            зависящий от её приоритета. Накопленный за день урон применяется в полночь.
          </Text>
          <View style={styles.damageTipsContainer}>
            <View style={styles.damageTip}>
              <View style={styles.tipPriorityBadge}>
                <Text style={styles.tipPriorityText}>Низкий</Text>
              </View>
              <Text style={styles.tipDamageText}>5+ урона</Text>
            </View>
            <View style={styles.damageTip}>
              <View style={[styles.tipPriorityBadge, { backgroundColor: '#FFA726' }]}>
                <Text style={styles.tipPriorityText}>Средний</Text>
              </View>
              <Text style={styles.tipDamageText}>10+ урона</Text>
            </View>
            <View style={styles.damageTip}>
              <View style={[styles.tipPriorityBadge, { backgroundColor: '#F44336' }]}>
                <Text style={styles.tipPriorityText}>Высокий</Text>
              </View>
              <Text style={styles.tipDamageText}>15+ урона</Text>
            </View>
          </View>
        </View>
        
        {/* Секция накопленного урона */}
        <View style={styles.currentDamageCard}>
          <Text style={styles.currentDamageTitle}>Накопленный урон</Text>
          <View style={styles.currentDamageContainer}>
            <Ionicons name="flash" size={24} color="#F44336" />
            <Text style={styles.currentDamageValue}>{boss.accumulatedDamage || 0}</Text>
            <Text style={styles.currentDamageNote}>
              (применится в полночь)
            </Text>
          </View>
        </View>
        
        {/* Секция истории урона */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>История урона</Text>
          {damageHistory.length > 0 ? (
            <FlatList
              data={damageHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => `damage-${item.date}-${index}`}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              style={styles.historyList}
            />
          ) : (
            <Text style={styles.noHistoryText}>Пока не нанесено никакого урона</Text>
          )}
        </View>
        
        {/* Секция наград */}
        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsTitle}>Награды за победу</Text>
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.rewardValue}>{boss.rewards.experience} опыта</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <Text style={styles.rewardValue}>{boss.rewards.gold} актусов</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Модальное окно с информацией о боссах */}
      <Modal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="О системе боссов"
      >
        <View style={styles.infoModalContent}>
          <Text style={styles.infoModalSection}>
            <Text style={styles.infoModalTitle}>Как работают боссы:</Text>{'\n\n'}
            Боссы - это особые испытания, которые помогают поддерживать мотивацию. Выполняя свои задачи, 
            вы наносите урон активному боссу. Накопленный за день урон применяется в полночь.
          </Text>
          
          <Text style={styles.infoModalSection}>
            <Text style={styles.infoModalTitle}>Как нанести урон:</Text>{'\n\n'}
            • Выполняйте ежедневные и обычные задачи{'\n'}
            • Чем выше приоритет задачи, тем больше урона{'\n'}
            • Урон применяется автоматически каждую полночь
          </Text>
          
          <Text style={styles.infoModalSection}>
            <Text style={styles.infoModalTitle}>Как призвать босса:</Text>{'\n\n'}
            Приобретите свиток призыва в магазине и используйте его из инвентаря. Боссы существуют ограниченное 
            время и исчезают через 7 дней, если их не победить.
          </Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    marginTop: 16,
  },
  bossCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bossImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  bossImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#666666',
  },
  bossInfo: {
    flex: 1,
  },
  bossName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  bossLevel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  healthContainer: {
    marginBottom: 8,
  },
  healthBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthBar: {
    height: '100%',
    backgroundColor: '#F44336',
  },
  healthText: {
    fontSize: 12,
    color: '#666666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  damageInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  damageInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  damageInfoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  damageTipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  damageTip: {
    alignItems: 'center',
  },
  tipPriorityBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  tipPriorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipDamageText: {
    fontSize: 12,
    color: '#666666',
  },
  currentDamageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentDamageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  currentDamageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDamageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginHorizontal: 8,
  },
  currentDamageNote: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  historyDate: {
    fontSize: 14,
    color: '#666666',
  },
  historyDamage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  noHistoryText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  rewardsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 6,
  },
  infoModalContent: {
    padding: 16,
  },
  infoModalSection: {
    marginBottom: 16,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  infoModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default BossFightScreen;