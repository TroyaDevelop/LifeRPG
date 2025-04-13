import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  
  // Получаем дружественные названия характеристик
  const statNames = {
    strength: 'Сила',
    intelligence: 'Интеллект',
    agility: 'Ловкость',
    willpower: 'Воля',
    luck: 'Удача',
    setBonus: 'Бонус комплекта'
  };
  
  // Иконки для характеристик
  const statIcons = {
    strength: 'barbell-outline',
    intelligence: 'bulb-outline',
    agility: 'body-outline',
    willpower: 'shield-checkmark-outline',
    luck: 'leaf-outline',
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
      <Text style={styles.title}>Характеристики персонажа</Text>
      
      <View style={styles.statsContainer}>
        {loading ? (
          <Text style={styles.loadingText}>Загрузка характеристик...</Text>
        ) : statsArray.length > 0 ? (
          <View style={styles.statsColumn}>
            {statsArray.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon} size={18} color="#4E64EE" />
                </View>
                <Text style={styles.statName}>{stat.name}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Нет доступных характеристик</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
  },
  statsColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  statItem: {
    width: '100%', // Один элемент в ряду
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statName: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 4,
  },
  loadingText: {
    padding: 8,
    textAlign: 'center',
    color: '#666666',
  },
  emptyText: {
    padding: 8,
    textAlign: 'center',
    color: '#666666',
    fontStyle: 'italic',
  }
});

export default CharacterStats;