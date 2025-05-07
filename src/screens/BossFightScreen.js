import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Button, Modal, LoadingIndicator } from '../components';
import BossService from '../services/BossService';
import ProfileService from '../services/ProfileService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BOSS_SPRITES } from '../constants/BossSprites';

const BossFightScreen = ({ navigation }) => {
  const [boss, setBoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [damageHistory, setDamageHistory] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showEffectsModal, setShowEffectsModal] = useState(false);

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
        // Ограничиваем историю до 5 последних записей
        setDamageHistory(sortedHistory.slice(0, 5));
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

  // Показать эффекты босса
  const handleShowEffects = () => {
    setShowEffectsModal(true);
  };

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  // Отображение истории урона
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyDateContainer}>
        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
        {item.criticalHits > 0 && (
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalBadgeText}>КРИТ x{item.criticalHits}</Text>
          </View>
        )}
      </View>
      <Text style={styles.historyDamage}>{item.damage} урона</Text>
      
      {/* Отображение разделения на физический и магический урон */}
      {(item.physicalDamage > 0 || item.magicalDamage > 0) && (
        <View style={styles.damageTypesContainer}>
          {item.physicalDamage > 0 && (
            <View style={styles.damageTypeItem}>
              <Ionicons name="barbell-outline" size={14} color="#FF5722" />
              <Text style={styles.physicalDamageText}>{item.physicalDamage} физ.</Text>
            </View>
          )}
          {item.magicalDamage > 0 && (
            <View style={styles.damageTypeItem}>
              <Ionicons name="bulb-outline" size={14} color="#2196F3" />
              <Text style={styles.magicalDamageText}>{item.magicalDamage} маг.</Text>
            </View>
          )}
        </View>
      )}
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

  // Получение цвета полосы здоровья в зависимости от процента
  const getHealthBarColor = (percentage) => {
    if (percentage < 25) return '#F44336'; // Красный при низком здоровье
    if (percentage < 50) return '#FF9800'; // Оранжевый при среднем здоровье
    return '#4CAF50'; // Зеленый при высоком здоровье
  };

  // Проверка, есть ли у босса особые эффекты
  const hasBossEffects = boss.effects && boss.effects.length > 0;

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
        <View style={[styles.bossCard, { borderLeftWidth: 3, borderLeftColor: boss.getRarityColor() }]}>
          <View style={styles.bossImageContainer}>
            <Image source={boss.getBossImage()} style={styles.bossImage} resizeMode="contain" />
          </View>
          
          <View style={styles.bossInfo}>
            <Text style={styles.bossName}>{boss.name}</Text>
            <View style={styles.bossDetails}>
              {/* Удалено поле уровня босса */}
              {/* Удалено отображение редкости босса */}
            </View>
            
            {/* Полоса здоровья босса */}
            <View style={styles.healthContainer}>
              <View style={styles.healthBarContainer}>
                <View 
                  style={[
                    styles.healthBar, 
                    { width: `${boss.getHealthPercentage()}%`, backgroundColor: getHealthBarColor(boss.getHealthPercentage()) }
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
            
            {/* Индикатор особых эффектов */}
            {hasBossEffects && (
              <TouchableOpacity 
                style={styles.effectsButton} 
                onPress={handleShowEffects}
              >
                <Ionicons name="flash" size={16} color="#9C27B0" />
                <Text style={styles.effectsButtonText}>Особые эффекты</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Описание босса */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Описание</Text>
          <Text style={styles.descriptionText}>{boss.description}</Text>
        </View>
        
        {/* Удален блок боевых характеристик */}
        
        {/* Сопротивления босса (если есть) */}
        {hasBossEffects && (
          <View style={styles.resistCard}>
            <Text style={styles.resistTitle}>Сопротивления босса</Text>
            <View style={styles.resistItem}>
              <Ionicons name="shield-outline" size={20} color="#2196F3" />
              <Text style={styles.resistLabel}>Сопротивление урону:</Text>
              <Text style={styles.resistValue}>
                {boss.currentResistance + (boss.effects.find(e => e.type === 'damageReduction')?.value || 0)}%
              </Text>
            </View>
            
            {boss.effects.find(e => e.type === 'criticalResistance') && (
              <View style={styles.resistItem}>
                <Ionicons name="shield-half-outline" size={20} color="#9C27B0" />
                <Text style={styles.resistLabel}>Сопрот. критам:</Text>
                <Text style={styles.resistValue}>
                  {boss.effects.find(e => e.type === 'criticalResistance').value}%
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Секция накопленного урона */}
        <View style={styles.currentDamageCard}>
          <Text style={styles.currentDamageTitle}>Нанесено урона</Text>
          <View style={styles.currentDamageContainer}>
            <Ionicons name="flash" size={24} color="#F44336" />
            <Text style={styles.currentDamageValue}>{boss.accumulatedDamage || 0}</Text>
            <Text style={styles.currentDamageNote}>
              (применится в полночь)
            </Text>
          </View>
          {/* Разделение на физический и магический урон */}
          <View style={styles.damageTypesContainer}>
            <View style={styles.damageTypeItem}>
              <Ionicons name="barbell-outline" size={18} color="#FF5722" />
              <Text style={styles.physicalDamageText}>{boss.accumulatedPhysicalDamage || 0} физ.</Text>
            </View>
            <View style={styles.damageTypeItem}>
              <Ionicons name="bulb-outline" size={18} color="#2196F3" />
              <Text style={styles.magicalDamageText}>{boss.accumulatedMagicalDamage || 0} маг.</Text>
            </View>
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
          
          <View style={styles.rewardsGrid}>
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.rewardValue}>{boss.rewards.experience} опыта</Text>
            </View>
            
            <View style={styles.rewardItem}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <Text style={styles.rewardValue}>{boss.rewards.gold} актусов</Text>
            </View>
            
            {boss.rewards.taskCoins > 0 && (
              <View style={styles.rewardItem}>
                <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                <Text style={styles.rewardValue}>{boss.rewards.taskCoins} монет задач</Text>
              </View>
            )}
          </View>
          
          {/* Возможное снаряжение */}
          {boss.rewards.possibleEquipment && boss.rewards.possibleEquipment.length > 0 && (
            <View style={styles.equipmentReward}>
              <Text style={styles.equipmentRewardTitle}>
                {boss.rewards.guaranteedEquipment ? 'Гарантированное снаряжение:' : 'Возможное снаряжение:'}
              </Text>
              <View style={styles.rarityContainer}>
                {boss.rewards.possibleEquipment.map((rarity, index) => (
                  <View key={`rarity-${index}`} style={[
                    styles.rarityPill, 
                    { backgroundColor: getRarityColor(rarity) }
                  ]}>
                    <Text style={styles.rarityPillText}>{getRarityName(rarity)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
            • Ваши боевые характеристики влияют на урон{'\n'}
            • Урон применяется автоматически каждую полночь
          </Text>
          
          <Text style={styles.infoModalSection}>
            <Text style={styles.infoModalTitle}>Редкость боссов:</Text>{'\n\n'}
            • Обычные - легко победить, базовые награды{'\n'}
            • Необычные - умеренная сложность, хорошие награды{'\n'}
            • Редкие - требуют усилий, ценные награды{'\n'}
            • Эпические - очень сложные, уникальные награды{'\n'}
            • Легендарные - исключительно сложные, лучшие награды
          </Text>
          
          <Text style={styles.infoModalSection}>
            <Text style={styles.infoModalTitle}>Особые эффекты боссов:</Text>{'\n\n'}
            Некоторые боссы обладают особыми эффектами, такими как сопротивление урону,
            регенерация здоровья или защита от критических ударов. Изучите эффекты босса,
            чтобы эффективнее с ним бороться.
          </Text>
        </View>
      </Modal>
      
      {/* Модальное окно с эффектами босса */}
      <Modal
        visible={showEffectsModal}
        onClose={() => setShowEffectsModal(false)}
        title="Особые эффекты босса"
      >
        <View style={styles.effectsModalContent}>
          {boss.effects.map((effect, index) => (
            <View key={`effect-${index}`} style={styles.effectItem}>
              <View style={styles.effectIconContainer}>
                {getEffectIcon(effect.type)}
              </View>
              <View style={styles.effectInfo}>
                <Text style={styles.effectDescription}>{effect.description}</Text>
              </View>
            </View>
          ))}
          
          {boss.currentResistance > 0 && !boss.effects.find(e => e.type === 'increasingResistance') && (
            <View style={styles.effectItem}>
              <View style={styles.effectIconContainer}>
                <Ionicons name="shield" size={24} color="#2196F3" />
              </View>
              <View style={styles.effectInfo}>
                <Text style={styles.effectDescription}>
                  Текущее сопротивление: {boss.currentResistance}% к урону
                </Text>
              </View>
            </View>
          )}
          
          {boss.effects.length === 0 && (
            <Text style={styles.noEffectsText}>
              У этого босса нет активных особых эффектов.
            </Text>
          )}
        </View>
      </Modal>
    </View>
  );
};

// Функция для получения цвета редкости
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'legendary': return '#FF9800';  // Оранжевый
    case 'epic': return '#9C27B0';       // Фиолетовый
    case 'rare': return '#2196F3';       // Синий
    case 'uncommon': return '#4CAF50';   // Зеленый
    default: return '#9E9E9E';           // Серый для обычных
  }
};

// Функция для получения названия редкости на русском
const getRarityName = (rarity) => {
  switch (rarity) {
    case 'legendary': return 'Легендарное';
    case 'epic': return 'Эпическое';
    case 'rare': return 'Редкое';
    case 'uncommon': return 'Необычное';
    default: return 'Обычное';
  }
};

// Функция для получения иконки эффекта
const getEffectIcon = (effectType) => {
  switch (effectType) {
    case 'damageReduction':
      return <Ionicons name="shield-outline" size={24} color="#2196F3" />;
    case 'healthRegen':
      return <Ionicons name="heart-outline" size={24} color="#F44336" />;
    case 'criticalResistance':
      return <Ionicons name="flash-off-outline" size={24} color="#9C27B0" />;
    case 'increasingResistance':
      return <Ionicons name="trending-up-outline" size={24} color="#FF9800" />;
    default:
      return <Ionicons name="alert-circle-outline" size={24} color="#757575" />;
  }
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
  bossInfo: {
    flex: 1,
  },
  bossName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  bossDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  },
  healthText: {
    fontSize: 12,
    color: '#666666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  effectsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  effectsButtonText: {
    fontSize: 12,
    color: '#9C27B0',
    marginLeft: 4,
    fontWeight: 'bold',
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
  statsCard: {
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
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    width: 100,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 6,
  },
  statInfo: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  resistCard: {
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
  resistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  resistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resistLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    width: 150,
  },
  resistValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
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
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  historyDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  criticalBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  criticalBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyDamage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  damageTypesContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  damageTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  physicalDamageText: {
    fontSize: 12,
    color: '#FF5722',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  magicalDamageText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: 'bold',
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
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: '45%',
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 6,
  },
  equipmentReward: {
    marginTop: 8,
  },
  equipmentRewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  rarityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rarityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  rarityPillText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  effectsModalContent: {
    padding: 16,
  },
  effectItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  effectIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  effectInfo: {
    flex: 1,
  },
  effectDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 18,
  },
  noEffectsText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default BossFightScreen;