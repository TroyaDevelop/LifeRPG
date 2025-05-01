import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Button, Modal, LoadingIndicator, Avatar, Toast } from '../components';
import { CurrencyBar } from '../components/Currency'; // Импортируем компонент валюты
import { EquipmentService } from '../services';
import { useAppContext } from '../context/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ALL_EQUIPMENT_SPRITES } from '../constants/EquipmentSprites';
import { getItemIcon, DEFAULT_ITEM_ICONS } from '../constants/ItemIconSprites';

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
  const [timeUntilRefresh, setTimeUntilRefresh] = useState('');
  
  // Состояния для Toast-уведомлений
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Получаем данные из контекста на верхнем уровне компонента
  const { actus, updateActus, profile } = useAppContext();

  const equipmentService = new EquipmentService();

  // Разделение предметов на снаряжение и свитки призыва
  const equipmentItems = useCallback(() => {
    return shopItems.filter(item => 
      !(item.type === 'consumable' && 
        (item.subType === 'boss_summon' || item.name.toLowerCase().includes('свиток призыва')))
    );
  }, [shopItems]);

  const summonScrolls = useCallback(() => {
    return shopItems.filter(item => 
      item.type === 'consumable' && 
      (item.subType === 'boss_summon' || item.name.toLowerCase().includes('свиток призыва'))
    );
  }, [shopItems]);

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
      case 'consumable': 
        // Для свитков призыва показываем специальную иконку
        return 'book-outline';
      default: return 'cube-outline';
    }
  };

  // Получение названия типа снаряжения
  const getEquipmentTypeLabel = (type) => {
    switch (type) {
      case 'head': return 'Головной убор';
      case 'body': return 'Верхняя одежда';
      case 'legs': return 'Штаны';
      case 'footwear': return 'Обувь';
      case 'weapon': return 'Оружие';
      case 'consumable': 
        // Для свитков призыва показываем специальное название
        return 'Свиток призыва';
      default: return type;
    }
  };

  // Функция для получения спрайта предмета по ID
  const getItemSprite = (itemId) => {
    if (ALL_EQUIPMENT_SPRITES[itemId] && ALL_EQUIPMENT_SPRITES[itemId].sprite) {
      return ALL_EQUIPMENT_SPRITES[itemId].sprite;
    }
    return null;
  };

  // Функция для форматирования времени до следующего обновления (24:00:00)
  const formatTimeUntilRefresh = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Обновление таймера
  useEffect(() => {
    const updateTimer = async () => {
      const timeLeft = await equipmentService.getTimeUntilNextRefresh();
      setTimeUntilRefresh(formatTimeUntilRefresh(timeLeft));
    };
    
    // Обновляем таймер сразу при монтировании компонента
    updateTimer();
    
    // Устанавливаем интервал для обновления таймера каждую секунду
    const interval = setInterval(async () => {
      updateTimer();
    }, 1000);
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(interval);
  }, []);

  // Рендер элемента в сетке (в виде квадрата)
  const renderItem = ({ item }) => {
    // Получаем иконку предмета
    const itemIcon = getItemIcon(item.id);
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.itemSquare}>
          <View style={[
            styles.itemImage, 
            { borderColor: renderRarityColor(item.rarity) }
          ]}>
            {itemIcon ? (
              <Image source={itemIcon} style={styles.itemSprite} resizeMode="contain" />
            ) : (
              // Используем спрайт по умолчанию для типа предмета или иконку
              DEFAULT_ITEM_ICONS[item.type] ? (
                <Image source={DEFAULT_ITEM_ICONS[item.type]} style={styles.itemSprite} resizeMode="contain" />
              ) : (
                <Ionicons name={getEquipmentTypeIcon(item.type)} size={32} color="#FFFFFF" />
              )
            )}
          </View>
          
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          
          <View style={styles.itemFooter}>
            <Text style={styles.itemType} numberOfLines={1}>{getEquipmentTypeLabel(item.type)}</Text>
            
            <CurrencyBar amount={item.price} compact={true} style={styles.compactCurrency} />
          </View>

          {item.level > 1 && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{item.level}</Text>
            </View>
          )}
          
          {item.set && (
            <View style={styles.setBadge}>
              <Ionicons name="link-outline" size={12} color="#4E64EE" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Рендер секции для свитков призыва
  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={22} color="#4E64EE" style={styles.sectionHeaderIcon} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Магазин снаряжения" hasBack={true} onBack={() => navigation.goBack()} />
      
      <View style={styles.currencyContainer}>
        <CurrencyBar amount={actus} compact={true} />
        <View style={styles.refreshTimerContainer}>
          <Ionicons name="time-outline" size={18} color="#4E64EE" />
          <Text style={styles.refreshTimerText}>Новые товары через: {timeUntilRefresh}</Text>
        </View>
      </View>
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <ScrollView style={styles.content}>
          {shopItems.length > 0 ? (
            <>
              {/* Секция снаряжения */}
              {equipmentItems().length > 0 && (
                <View style={styles.section}>
                  {renderSectionHeader('Снаряжение', 'shirt-outline')}
                  <View style={styles.gridContainer}>
                    {equipmentItems().map(item => (
                      <View key={item.id} style={styles.gridItem}>
                        {renderItem({item})}
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Секция свитков призыва */}
              {summonScrolls().length > 0 && (
                <View style={styles.section}>
                  {renderSectionHeader('Свитки призыва боссов', 'book-outline')}
                  <View style={styles.gridContainer}>
                    {summonScrolls().map(item => (
                      <View key={item.id} style={styles.gridItem}>
                        {renderItem({item})}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                В магазине пока нет доступных предметов
              </Text>
            </View>
          )}
          
          {/* Добавляем немного отступа внизу для прокрутки */}
          <View style={{height: 20}} />
        </ScrollView>
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
              { borderColor: renderRarityColor(selectedItem.rarity) }
            ]}>
              {getItemIcon(selectedItem.id) ? (
                <Image 
                  source={getItemIcon(selectedItem.id)} 
                  style={styles.itemSpriteLarge} 
                  resizeMode="contain" 
                />
              ) : (
                // Используем спрайт по умолчанию для типа предмета или иконку
                DEFAULT_ITEM_ICONS[selectedItem.type] ? (
                  <Image 
                    source={DEFAULT_ITEM_ICONS[selectedItem.type]} 
                    style={styles.itemSpriteLarge} 
                    resizeMode="contain" 
                  />
                ) : (
                  <Ionicons name={getEquipmentTypeIcon(selectedItem.type)} size={36} color="#FFFFFF" />
                )
              )}
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
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    backgroundColor: '#F7F9FC',
    paddingTop: 8,
  },
  gridItem: {
    width: '50%',
    padding: 4,
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
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  itemSquare: {
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  itemFooter: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemType: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F39C12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  setBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactCurrency: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    height: 200,
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
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
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
  modalCurrency: {
    marginTop: 8,
  },
  refreshTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#EFF3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  refreshTimerText: {
    fontSize: 12,
    color: '#4E64EE',
    fontWeight: '500',
    marginLeft: 4,
  },
  itemSprite: {
    width: '100%',
    height: '100%',
  },
  itemSpriteLarge: {
    width: '85%',
    height: '85%',
  },
});

export default ShopScreen;