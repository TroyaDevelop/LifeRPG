import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Button, Modal, LoadingIndicator, Avatar, Toast } from '../components';
import { CurrencyBar } from '../components/Currency'; // Импортируем компонент валюты
import { EquipmentService } from '../services';
import { useAppContext } from '../context/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EQUIPMENT_TYPES = {
  head: 'Головные уборы',
  body: 'Верхняя одежда',
  legs: 'Штаны',
  footwear: 'Обувь',
  weapon: 'Оружие'
};

// Словарь для перевода названий характеристик
const STAT_NAMES = {
  strength: 'Сила',
  intelligence: 'Интеллект',
  agility: 'Ловкость',
  willpower: 'Воля',
  luck: 'Удача',
  setBonus: 'Бонус комплекта'
};

const ShopScreen = ({ navigation }) => {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Состояния для Toast-уведомлений
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Получаем данные из контекста на верхнем уровне компонента
  const { actus, updateActus, profile } = useAppContext();

  const equipmentService = new EquipmentService();

  // Загрузка предметов, доступных в магазине
  const fetchShopItems = async () => {
    setLoading(true);
    try {
      // Здесь получаем предметы для магазина из сервиса
      const items = await equipmentService.getShopItems();
      setShopItems(items);
    } catch (error) {
      console.error('Error fetching shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка предметов при открытии экрана
  useFocusEffect(
    useCallback(() => {
      fetchShopItems();
    }, [])
  );

  // Обработка нажатия на предмет
  const handleItemPress = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  // Покупка предмета
  const handleBuyItem = async () => {
    if (!selectedItem) return;

    // Проверка наличия валюты
    if (actus < selectedItem.price) {
      // Показываем Toast с ошибкой
      setToastMessage("Недостаточно актусов для покупки этого предмета");
      setToastType("error");
      setToastVisible(true);
      return;
    }

    try {
      // Покупаем предмет
      await equipmentService.addToInventory(selectedItem);
      
      // Списываем валюту - передаем положительное число, но со знаком минус
      await updateActus(-Math.abs(selectedItem.price));
      
      // Закрываем модальное окно деталей предмета
      setShowDetailsModal(false);
      
      // Показываем Toast с успешной покупкой
      setToastMessage(`Вы приобрели ${selectedItem.name}!`);
      setToastType("success");
      setToastVisible(true);

      // Обновляем список товаров
      fetchShopItems();
      
    } catch (error) {
      console.error('Error buying item:', error);
      // Показываем Toast с ошибкой
      setToastMessage("Произошла ошибка при покупке предмета");
      setToastType("error");
      setToastVisible(true);
    }
  };

  // Определение цвета редкости предмета
  const renderRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#A0A0A0';
      case 'rare': return '#4A90E2';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F1C40F';
      default: return '#A0A0A0';
    }
  };
  
  // Получение текстового представления редкости
  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      case 'legendary': return 'Легендарный';
      default: return 'Обычный';
    }
  };

  // Получение иконки для типа снаряжения
  const getEquipmentTypeIcon = (type) => {
    switch (type) {
      case 'head': return 'helmet-outline';
      case 'body': return 'shirt-outline';
      case 'legs': return 'walk-outline';
      case 'footwear': return 'footsteps-outline';
      case 'weapon': return 'flame-outline';
      default: return 'cube-outline';
    }
  };

  // Получение названия типа снаряжения
  const getEquipmentTypeLabel = (type) => {
    return EQUIPMENT_TYPES[type] || type;
  };

  // Фильтрация предметов в магазине по выбранному типу
  const filteredItems = shopItems.filter(item => 
    activeTab === 'all' || item.type === activeTab
  );

  // Рендер элемента в списке
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={[
          styles.itemImage, 
          { backgroundColor: renderRarityColor(item.rarity) }
        ]}>
          <Ionicons name={getEquipmentTypeIcon(item.type)} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemType}>{getEquipmentTypeLabel(item.type)}</Text>
          
          {item.level > 1 && (
            <Text style={styles.levelRequirementSmall}>Уровень: {item.level}</Text>
          )}
        </View>
        <View style={styles.priceTag}>
          <CurrencyBar amount={item.price} compact={true} style={styles.compactCurrency} />
        </View>
        <Ionicons 
          name="chevron-forward-outline" 
          size={20} 
          color="#CCCCCC" 
          style={styles.itemArrow}
        />
      </View>
    </TouchableOpacity>
  );
  
  // Рендер вкладок фильтрации
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Ionicons 
            name="grid-outline" 
            size={20} 
            color={activeTab === 'all' ? '#4E64EE' : '#666666'} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'all' && styles.activeTabText
          ]}>
            Все
          </Text>
        </TouchableOpacity>
        
        {Object.entries(EQUIPMENT_TYPES).map(([type, label]) => (
          <TouchableOpacity 
            key={type}
            style={[styles.tab, activeTab === type && styles.activeTab]} 
            onPress={() => setActiveTab(type)}
          >
            <Ionicons 
              name={getEquipmentTypeIcon(type)} 
              size={20} 
              color={activeTab === type ? '#4E64EE' : '#666666'} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === type && styles.activeTabText
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Магазин снаряжения" hasBack={true} onBack={() => navigation.goBack()} />
      
      <View style={styles.currencyContainer}>
        <CurrencyBar amount={actus} compact={true} />
      </View>
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <View style={styles.content}>
          {renderTabs()}
          
          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'all' 
                  ? 'В магазине пока нет доступных предметов' 
                  : `Нет предметов типа "${getEquipmentTypeLabel(activeTab)}"`}
              </Text>
            </View>
          )}
        </View>
      )}

      <Modal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedItem?.name || 'Детали предмета'}
      >
        {selectedItem && (
          <View style={styles.modalContent}>
            <View style={[
              styles.itemImageLarge,
              { backgroundColor: renderRarityColor(selectedItem.rarity) }
            ]}>
              <Ionicons name={getEquipmentTypeIcon(selectedItem.type)} size={36} color="#FFFFFF" />
            </View>
            
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityBadgeText}>
                {getRarityLabel(selectedItem.rarity)}
              </Text>
            </View>
            
            <Text style={styles.itemTypeLarge}>{getEquipmentTypeLabel(selectedItem.type)}</Text>
            <Text style={styles.itemDescription}>{selectedItem.description || 'Нет описания'}</Text>
            
            {selectedItem.set && (
              <View style={styles.setContainer}>
                <Ionicons name="link-outline" size={18} color="#4E64EE" />
                <Text style={styles.setText}>{selectedItem.set}</Text>
              </View>
            )}
            
            {selectedItem.level > 1 && (
              <Text style={[
                styles.levelRequirement,
                profile?.level < selectedItem.level ? styles.levelRequirementNotMet : {}
              ]}>
                Требуемый уровень: {selectedItem.level}
              </Text>
            )}
            
            <Text style={styles.statsTitle}>Характеристики:</Text>
            {Object.keys(selectedItem.stats || {}).length > 0 ? (
              <View style={styles.statsContainer}>
                {Object.entries(selectedItem.stats).map(([key, value]) => (
                  <View key={key} style={styles.statItemContainer}>
                    <Text style={styles.statItem}>
                      {STAT_NAMES[key] || key}: <Text style={styles.statValue}>+{value}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noStats}>Нет характеристик</Text>
            )}
            
            <View style={styles.priceContainer}>
              <CurrencyBar amount={selectedItem.price} style={styles.modalCurrency} />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Купить" 
                onPress={handleBuyItem} 
                disabled={
                  actus < selectedItem.price || 
                  (selectedItem.level > 1 && profile?.level < selectedItem.level)
                } 
              />
            </View>
          </View>
        )}
      </Modal>
      
      {/* Toast для уведомлений о покупке */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#EFF3FF',
  },
  tabText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#666666',
  },
  activeTabText: {
    color: '#4E64EE',
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemType: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  levelRequirementSmall: {
    fontSize: 12,
    color: '#F39C12',
    marginTop: 2,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
    color: '#333333',
  },
  itemArrow: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  modalContent: {
    padding: 16,
    alignItems: 'center',
  },
  itemImageLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  rarityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F3FF',
  },
  rarityBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4E64EE',
  },
  itemTypeLarge: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#EFF3FF',
    borderRadius: 8,
  },
  setText: {
    fontSize: 14,
    color: '#4E64EE',
    fontWeight: '500',
    marginLeft: 6,
  },
  levelRequirement: {
    fontSize: 14,
    color: '#F39C12',
    marginBottom: 16,
  },
  levelRequirementNotMet: {
    color: '#E74C3C',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  statItemContainer: {
    width: '50%',
    marginBottom: 6,
  },
  statItem: {
    fontSize: 14,
    color: '#666666',
  },
  statValue: {
    color: '#4E64EE',
    fontWeight: '500',
  },
  noStats: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  priceValueLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  compactCurrency: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  modalCurrency: {
    marginTop: 8,
  },
});

export default ShopScreen;