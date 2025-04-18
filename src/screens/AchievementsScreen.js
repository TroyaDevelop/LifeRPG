import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext'; // Импортируем контекст
import Header from '../components/Header';
import Modal from '../components/Modal';
import { CurrencyBar, PremiumCurrencyBar } from '../components/Currency'; // Импортируем компоненты валют

export function AchievementsScreen({ navigation }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  // Используем контекст
  const { 
    achievements, 
    refreshData,
    isLoading 
  } = useAppContext();

  // Загружаем достижения при фокусе на экране
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  // Группировка достижений по категориям
  const achievementsByCategory = React.useMemo(() => {
    const grouped = {
      tasks: [],
      streaks: [],
      efficiency: [],
      organization: [],
      priorities: [],
      levels: [],
      general: []
    };
    
    if (achievements) {
      achievements.forEach(achievement => {
        if (achievement.category in grouped) {
          grouped[achievement.category].push(achievement);
        } else {
          grouped.general.push(achievement);
        }
      });
    }
    
    return grouped;
  }, [achievements]);

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common':
        return '#8E8E93'; // серый
      case 'uncommon':
        return '#4CD964'; // зеленый
      case 'rare':
        return '#007AFF'; // синий
      case 'epic':
        return '#AF52DE'; // фиолетовый
      case 'legendary':
        return '#FF9500'; // оранжевый
      default:
        return '#8E8E93';
    }
  };

  const getRarityName = (rarity) => {
    switch(rarity) {
      case 'common':
        return 'Обычное';
      case 'uncommon':
        return 'Необычное';
      case 'rare':
        return 'Редкое';
      case 'epic':
        return 'Эпическое';
      case 'legendary':
        return 'Легендарное';
      default:
        return 'Обычное';
    }
  };

  const renderCategory = (category) => {
    if (!achievements) return null;
    
    const categoryAchievements = achievements.filter(
      a => a.category === category && (
        !a.hidden || 
        a.unlocked || 
        a.id === 'night_owl' || 
        a.id === 'early_bird'
      )
    );
    
    if (categoryAchievements.length === 0) return null;
    
    return (
      <View style={styles.categorySection} key={`category-${category}`}>
        <Text style={styles.categoryTitle}>
          {getCategoryName(category)}
        </Text>
        <FlatList
          data={categoryAchievements}
          keyExtractor={(item) => `achievement-${item.id || Math.random().toString()}`}
          renderItem={({ item }) => renderAchievementItem(item)}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
    );
  };

  const getCategoryName = (category) => {
    switch(category) {
      case 'tasks': return 'Задачи';
      case 'streaks': return 'Серии';
      case 'efficiency': return 'Эффективность';
      case 'organization': return 'Организация';
      case 'priorities': return 'Приоритеты';
      case 'levels': return 'Уровни';
      case 'time': return 'Время суток';
      case 'general': return 'Общие';
      default: return category;
    }
  };

  const renderAchievementItem = (achievement) => {
    const isCompleted = achievement.unlocked;
    const isHidden = achievement.hidden && !achievement.unlocked;
    const progress = Math.min(100, Math.round((achievement.progress / achievement.progressTarget) * 100));
    
    return (
      <TouchableOpacity
        style={styles.achievementItem}
        onPress={() => handleAchievementPress(achievement)}
      >
        <View 
          style={[
            styles.achievementIconContainer,
            isCompleted ? { backgroundColor: achievement.rarityColor } : styles.incomplete,
            isHidden ? styles.hidden : null
          ]}
        >
          {isHidden ? (
            <Ionicons name="lock-closed" size={26} color="#8E8E93" />
          ) : (
            <Ionicons 
              name={achievement.icon} 
              size={26} 
              color={isCompleted ? "#FFFFFF" : "#8E8E93"} 
            />
          )}
        </View>
        
        {!isHidden && (
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progress}%`, backgroundColor: achievement.rarityColor }
              ]} 
            />
          </View>
        )}
        
        <Text 
          style={[
            styles.achievementTitle,
            isCompleted ? { color: achievement.rarityColor } : styles.incompleteText,
            isHidden ? styles.hiddenText : null
          ]} 
          numberOfLines={1}
        >
          {isHidden ? "???" : achievement.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAchievementDetails = () => {
    if (!selectedAchievement) return null;
    
    const isCompleted = selectedAchievement.unlocked;
    const isHidden = selectedAchievement.hidden && !selectedAchievement.unlocked;
    const progress = Math.min(100, Math.round((selectedAchievement.progress / selectedAchievement.progressTarget) * 100));
    
    return (
      <View style={styles.modalContent}>
        <View style={styles.achievementHeader}>
          <View 
            style={[
              styles.modalIconContainer,
              isCompleted ? { backgroundColor: selectedAchievement.rarityColor } : styles.incomplete
            ]}
          >
            {isHidden ? (
              <Ionicons name="lock-closed" size={40} color="#8E8E93" />
            ) : (
              <Ionicons 
                name={selectedAchievement.icon} 
                size={40} 
                color={isCompleted ? "#FFFFFF" : "#8E8E93"} 
              />
            )}
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={styles.modalTitle}>
              {isHidden ? "Скрытое достижение" : selectedAchievement.title}
            </Text>
            <View style={styles.rarityBadge}>
              <Text style={[
                styles.rarityText,
                { color: selectedAchievement.rarityColor }
              ]}>
                {selectedAchievement.getRarityLabel()}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.description}>
          {isHidden ? "Выполните определенные условия, чтобы открыть это достижение." : selectedAchievement.description}
        </Text>
        
        {!isHidden && (
          <>
            <View style={styles.modalProgressContainer}>
              <View style={styles.modalProgressBarContainer}>
                <View 
                  style={[
                    styles.modalProgressBar, 
                    { width: `${progress}%`, backgroundColor: selectedAchievement.rarityColor }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {selectedAchievement.progress} / {selectedAchievement.progressTarget}
              </Text>
            </View>
            
            {selectedAchievement.unlocked && (
              <View style={styles.completedInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.completedText}>
                  Получено: {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {selectedAchievement.rewards && (Object.values(selectedAchievement.rewards).some(v => v > 0 || (Array.isArray(v) && v.length > 0))) && (
              <View style={styles.rewardSection}>
                <Text style={styles.rewardTitle}>Награда:</Text>
                <View style={styles.rewardItems}>
                  {selectedAchievement.rewards.experience > 0 && (
                    <View style={styles.rewardItem}>
                      <View style={styles.rewardIconWrapper}>
                        <Image 
                          source={require('../../assets/sprites/currency/exp_icon.png')} 
                          style={styles.experienceSprite} 
                        />
                      </View>
                      <View style={styles.rewardTextContainer}>
                        <Text style={styles.rewardAmount}>
                          {selectedAchievement.rewards.experience}
                        </Text>
                        <Text style={styles.rewardText}> опыта</Text>
                      </View>
                    </View>
                  )}
                  {selectedAchievement.rewards.actus > 0 && (
                    <View style={styles.rewardItem}>
                      <View style={styles.rewardIconWrapper}>
                        <CurrencyBar compact={true} />
                      </View>
                      <View style={styles.rewardTextContainer}>
                        <Text style={styles.rewardAmount}>
                          {selectedAchievement.rewards.actus}
                        </Text>
                        <Text style={styles.rewardText}> Актусов</Text>
                      </View>
                    </View>
                  )}
                  {selectedAchievement.rewards.taskCoins > 0 && (
                    <View style={styles.rewardItem}>
                      <View style={styles.rewardIconWrapper}>
                        <PremiumCurrencyBar compact={true} />
                      </View>
                      <View style={styles.rewardTextContainer}>
                        <Text style={styles.rewardAmount}>
                          {selectedAchievement.rewards.taskCoins}
                        </Text>
                        <Text style={styles.rewardText}> TaskCoin</Text>
                      </View>
                    </View>
                  )}
                  {selectedAchievement.rewards.items && selectedAchievement.rewards.items.length > 0 && (
                    selectedAchievement.rewards.items.map((item, index) => (
                      <View key={index} style={styles.rewardItem}>
                        <View style={styles.rewardIconWrapper}>
                          <Ionicons name="gift" size={20} color="#AF52DE" />
                        </View>
                        <Text style={styles.rewardText}>
                          {item.name}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Достижения" 
        hasBack={true} 
        onBack={() => navigation.goBack()} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4E66F1" />
          <Text style={styles.loadingText}>Загрузка достижений...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.listContainer}
          data={['tasks', 'streaks', 'efficiency', 'organization', 'priorities', 'levels', 'time', 'general']}
          keyExtractor={(item) => `category-section-${item}`}
          renderItem={({ item }) => renderCategory(item)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>Нет доступных достижений</Text>
            </View>
          }
        />
      )}
      
      <Modal visible={showModal} onClose={closeModal}>
        {renderAchievementDetails()}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888888',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  achievementItem: {
    width: '31%',
    marginBottom: 16,
    marginRight: '2.33%',
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4E66F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomplete: {
    backgroundColor: '#F0F0F5',
  },
  hidden: {
    backgroundColor: '#DDDDDD',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#F0F0F5',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4E66F1',
  },
  incompleteText: {
    color: '#888888',
  },
  hiddenText: {
    color: '#AAAAAA',
  },
  modalContent: {
    padding: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4E66F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F5F6FA',
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 16,
  },
  modalProgressContainer: {
    marginBottom: 16,
  },
  modalProgressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F5',
    borderRadius: 4,
    marginBottom: 8,
  },
  modalProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'right',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  rewardSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  rewardItems: {
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  rewardIconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 8,
  },
  rewardTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  rewardText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    paddingLeft: 4,
  },
  experienceSprite: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});