import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProfileService } from '../services';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Компонент для отображения характеристик персонажа с бонусами от снаряжения
 * @param {Object} props - свойства компонента
 * @param {Object} props.style - дополнительные стили
 * @returns {JSX.Element} - компонент характеристик персонажа
 */
const CharacterStats = ({ style }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  // Получаем дружественные названия характеристик
  const statNames = {
    strength: 'Сила',
    intelligence: 'Интеллект',
    endurance: 'Выносливость',
    charisma: 'Харизма',
    luck: 'Удача',
    wisdom: 'Мудрость',
    speed: 'Скорость',
    agility: 'Ловкость',
    defense: 'Защита',
    magic: 'Магия',
    productivity: 'Продуктивность',
    setBonus: 'Бонус комплекта'
  };
  
  // Иконки для характеристик
  const statIcons = {
    strength: 'barbell-outline',
    intelligence: 'bulb-outline',
    endurance: 'heart-outline',
    charisma: 'people-outline',
    luck: 'leaf-outline',
    wisdom: 'school-outline',
    speed: 'flash-outline',
    agility: 'body-outline',
    defense: 'shield-outline',
    magic: 'sparkles-outline',
    productivity: 'trending-up-outline',
    setBonus: 'link-outline'
  };

  // Загружаем характеристики персонажа с учетом бонусов от снаряжения
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const profileService = ProfileService.getInstance();
        
        // Применяем бонусы от экипировки
        await profileService.applyEquipmentBonuses();
        
        // Получаем общие характеристики персонажа с учетом бонусов
        const playerStats = await profileService.getPlayerStats();
        setStats(playerStats);
      } catch (error) {
        console.error('Ошибка при загрузке характеристик персонажа:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  // Преобразуем объект характеристик в массив для отображения
  const statsArray = Object.entries(stats).map(([key, value]) => ({
    name: statNames[key] || key,
    value,
    icon: statIcons[key] || 'stats-chart-outline'
  }));

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.title}>Характеристики персонажа</Text>
        <Ionicons
          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={24}
          color="#4E64EE"
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.statsContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Загрузка характеристик...</Text>
          ) : statsArray.length > 0 ? (
            statsArray.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon} size={20} color="#4E64EE" />
                </View>
                <Text style={styles.statName}>{stat.name}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Нет доступных характеристик</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  statsContainer: {
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statName: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  loadingText: {
    padding: 16,
    textAlign: 'center',
    color: '#666666',
  },
  emptyText: {
    padding: 16,
    textAlign: 'center',
    color: '#666666',
    fontStyle: 'italic',
  }
});

export default CharacterStats;