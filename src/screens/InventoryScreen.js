import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Button, Modal, LoadingIndicator, Avatar } from '../components';
import { EquipmentService } from '../services';
import { useAppContext } from '../context/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { EQUIPMENT_SETS, ALL_EQUIPMENT_SPRITES } from '../constants/EquipmentSprites';

const EQUIPMENT_TYPES = {
  head: 'Головные уборы',
  body: 'Верхняя одежда',
  legs: 'Штаны',
  footwear: 'Обувь',
  weapon: 'Оружие'
};

const InventoryScreen = ({ navigation }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [equippedItems, setEquippedItems] = useState({});
  const [equipmentSets, setEquipmentSets] = useState({});
  const [showSetDetailsModal, setShowSetDetailsModal] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  
  // Получаем данные аватара из контекста
  const { avatar, updateAvatar } = useAppContext();

  const equipmentService = new EquipmentService();

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      // Используем метод getPlayerInventory для загрузки предметов инвентаря игрока
      const items = await equipmentService.getPlayerInventory();
      setEquipment(items);
      
      // Группируем экипированные предметы по типу
      const equipped = {};
      const equippedItems = items.filter(item => item.equipped);
      equippedItems.forEach(item => {
        equipped[item.type] = item;
      });
      setEquippedItems(equipped);
      
      // Получаем информацию о наборах снаряжения
      const setsInfo = equipmentService.calculateEquipmentBonuses(equippedItems).sets;
      setEquipmentSets(setsInfo);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEquipment();
    }, [])
  );

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleEquipItem = async () => {
    if (!selectedItem) return;
    
    try {
      await equipmentService.equipItem(selectedItem.id);
      
      // Обновляем экипировку аватара
      if (avatar) {
        const updatedEquipment = { ...avatar.equipment };
        updatedEquipment[selectedItem.type] = selectedItem.id;
        updateAvatar({ equipment: updatedEquipment });
      }
      
      fetchEquipment();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const handleUnequipItem = async () => {
    if (!selectedItem) return;
    
    try {
      await equipmentService.unequipItem(selectedItem.id);
      
      // Обновляем экипировку аватара
      if (avatar) {
        const updatedEquipment = { ...avatar.equipment };
        updatedEquipment[selectedItem.type] = null;
        updateAvatar({ equipment: updatedEquipment });
      }
      
      fetchEquipment();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  const renderRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#A0A0A0';
      case 'rare': return '#4A90E2';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#F1C40F';
      default: return '#A0A0A0';
    }
  };
  
  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      case 'legendary': return 'Легендарный';
      default: return 'Обычный';
    }
  };

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

  const getEquipmentTypeLabel = (type) => {
    return EQUIPMENT_TYPES[type] || type;
  };

  const filteredEquipment = equipment.filter(item => 
    activeTab === 'all' || item.type === activeTab
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemCard, item.equipped && styles.equippedItem]}
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
          {item.equipped && <Text style={styles.equippedText}>Надето</Text>}
        </View>
        <View style={styles.statsPreview}>
          {Object.entries(item.stats || {}).slice(0, 2).map(([key, value]) => (
            <Text key={key} style={styles.statPreview}>
              +{value} {key}
            </Text>
          ))}
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
  
  // Рендер вкладок категорий
  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.tabsContainer}
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
  );

  // Секция с надетыми предметами
  const renderEquippedItems = () => (
    <View style={styles.equippedSection}>
      <Text style={styles.sectionTitle}>Экипировка персонажа</Text>
      
      <View style={styles.characterPreview}>
        <View style={styles.avatarContainer}>
          <Avatar size="large" avatarData={avatar} showEquipment={true} />
        </View>
        
        <View style={styles.equippedSlotsContainer}>
          {Object.entries(EQUIPMENT_TYPES).map(([type, label]) => (
            <View key={type} style={styles.equippedSlot}>
              <View style={[
                styles.slotIcon,
                equippedItems[type] ? { backgroundColor: renderRarityColor(equippedItems[type].rarity) } : {}
              ]}>
                <Ionicons 
                  name={getEquipmentTypeIcon(type)} 
                  size={22} 
                  color={equippedItems[type] ? "#FFFFFF" : "#CCCCCC"} 
                />
              </View>
              <Text style={styles.slotLabel}>{label}</Text>
              {equippedItems[type] && (
                <TouchableOpacity 
                  style={styles.equippedItemButton}
                  onPress={() => handleItemPress(equippedItems[type])}
                >
                  <Text style={styles.equippedItemName} numberOfLines={1}>
                    {equippedItems[type].name}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Обработчик нажатия на набор снаряжения
  const handleSetPress = (setName) => {
    setSelectedSet({
      ...equipmentSets[setName],
      name: setName
    });
    setShowSetDetailsModal(true);
  };
  
  // Секция с наборами снаряжения
  const renderEquipmentSets = () => {
    // Проверяем, есть ли у игрока наборы снаряжения
    const hasSets = Object.keys(equipmentSets).length > 0;
    
    if (!hasSets) return null;
    
    return (
      <View style={styles.setsSection}>
        <Text style={styles.sectionTitle}>Наборы снаряжения</Text>
        
        {Object.entries(equipmentSets).map(([setName, setInfo]) => (
          <TouchableOpacity 
            key={setName}
            style={[
              styles.setCard,
              setInfo.completed && styles.completedSetCard
            ]}
            onPress={() => handleSetPress(setName)}
          >
            <View style={styles.setHeaderRow}>
              <View style={styles.setNameContainer}>
                <Ionicons 
                  name={setInfo.completed ? "shield" : "shield-outline"} 
                  size={24} 
                  color={setInfo.completed ? "#FF8C00" : "#4E64EE"} 
                />
                <Text style={styles.setName}>{setInfo.name || setName}</Text>
              </View>
              
              <View style={styles.setProgressContainer}>
                <Text style={styles.setProgressText}>
                  {setInfo.collectedPieces}/{setInfo.totalPieces}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      {
                        width: `${(setInfo.collectedPieces / setInfo.totalPieces) * 100}%`,
                        backgroundColor: setInfo.completed ? "#FF8C00" : "#4E64EE"
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
            
            {setInfo.bonusApplied && (
              <View style={styles.setBonusRow}>
                <Ionicons name="star" size={16} color="#FF8C00" />
                <Text style={styles.setBonusText}>
                  {setInfo.completed ? "Активны полные бонусы набора" : "Активны частичные бонусы набора"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Инвентарь" hasBack={true} onBack={() => navigation.goBack()} />
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <ScrollView style={styles.content}>
          {renderEquippedItems()}
          {renderEquipmentSets()}
          
          <Text style={styles.sectionTitle}>Доступные предметы</Text>
          {renderTabs()}
          
          {filteredEquipment.length > 0 ? (
            <FlatList
              data={filteredEquipment}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'all' 
                  ? 'У вас пока нет предметов в инвентаре' 
                  : `У вас нет предметов типа "${getEquipmentTypeLabel(activeTab)}"`}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Модальное окно с деталями предмета */}
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
                <Text style={styles.setText}>{selectedItem.getSetName()}</Text>
              </View>
            )}
            
            {selectedItem.level > 1 && (
              <Text style={styles.levelRequirement}>Требуемый уровень: {selectedItem.level}</Text>
            )}
            
            <Text style={styles.statsTitle}>Характеристики:</Text>
            {Object.keys(selectedItem.stats || {}).length > 0 ? (
              <View style={styles.statsContainer}>
                {Object.entries(selectedItem.stats).map(([key, value]) => (
                  <View key={key} style={styles.statItemContainer}>
                    <Text style={styles.statItem}>
                      {key}: <Text style={styles.statValue}>+{value}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noStats}>Нет характеристик</Text>
            )}
            
            <View style={styles.priceContainer}>
              <Ionicons name="cash-outline" size={20} color="#4CD964" />
              <Text style={styles.priceValue}>{selectedItem.price} актусов</Text>
            </View>
            
            <View style={styles.buttonContainer}>
              {selectedItem.equipped ? (
                <Button title="Снять" onPress={handleUnequipItem} type="secondary" />
              ) : (
                <Button title="Экипировать" onPress={handleEquipItem} />
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* Модальное окно с деталями набора */}
      <Modal
        visible={showSetDetailsModal}
        onClose={() => setShowSetDetailsModal(false)}
        title={selectedSet?.name ? `Набор "${selectedSet.name}"` : 'Детали набора'}
      >
        {selectedSet && (
          <View style={styles.modalContent}>
            <View style={[
              styles.setIconLarge,
              { backgroundColor: selectedSet.completed ? "#FF8C00" : "#4E64EE" }
            ]}>
              <Ionicons 
                name={selectedSet.completed ? "shield" : "shield-outline"} 
                size={36} 
                color="#FFFFFF" 
              />
            </View>
            
            <Text style={styles.setProgressLarge}>
              {selectedSet.collectedPieces}/{selectedSet.totalPieces} предметов собрано
            </Text>
            
            {EQUIPMENT_SETS[selectedSet.name] && (
              <Text style={styles.setDescription}>
                {EQUIPMENT_SETS[selectedSet.name].description || "Нет описания"}
              </Text>
            )}
            
            <Text style={styles.statsTitle}>Бонусы набора:</Text>
            {EQUIPMENT_SETS[selectedSet.name] && EQUIPMENT_SETS[selectedSet.name].bonus ? (
              <View style={styles.statsContainer}>
                {Object.entries(EQUIPMENT_SETS[selectedSet.name].bonus).map(([key, value]) => {
                  // Если набор не полный и применяются частичные бонусы, показываем уменьшенный бонус
                  const actualValue = selectedSet.completed 
                    ? value 
                    : (selectedSet.bonusApplied ? Math.floor(value * 0.5) : 0);
                  
                  return (
                    <View key={key} style={styles.statItemContainer}>
                      <Text style={styles.statItem}>
                        {key}: <Text style={[
                          styles.statValue,
                          { color: selectedSet.bonusApplied ? "#FF8C00" : "#999999" }
                        ]}>
                          +{actualValue}
                        </Text>
                        {!selectedSet.completed && selectedSet.bonusApplied && (
                          <Text style={styles.fullBonusValue}> (полный: +{value})</Text>
                        )}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noStats}>Нет бонусов</Text>
            )}
            
            {EQUIPMENT_SETS[selectedSet.name] && (
              <>
                <Text style={[styles.statsTitle, { marginTop: 16 }]}>Предметы в наборе:</Text>
                <View style={styles.setPiecesContainer}>
                  {EQUIPMENT_SETS[selectedSet.name].pieces.map((pieceId) => {
                    // Ищем предмет в инвентаре по его ID или originalId
                    const inventoryItem = equipment.find(item => 
                      item.id === pieceId || 
                      (item.originalId && item.originalId === pieceId)
                    );
                    
                    // Определяем, собран ли предмет
                    const isCollected = selectedSet.items && selectedSet.items.some(
                      id => id.includes(pieceId)
                    );
                    
                    // Получаем название предмета из разных источников в порядке приоритета:
                    // 1. Из инвентаря игрока (если предмет есть в инвентаре)
                    // 2. Из словаря ALL_EQUIPMENT_SPRITES (получаем имя объекта)
                    // 3. Человекопонятное форматирование ID, если ничего не найдено
                    const itemName = inventoryItem ? inventoryItem.name : 
                                    (ALL_EQUIPMENT_SPRITES[pieceId] ? ALL_EQUIPMENT_SPRITES[pieceId].name : 
                                    pieceId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
                    
                    return (
                      <View key={pieceId} style={styles.setPieceRow}>
                        <Ionicons 
                          name={isCollected ? "checkmark-circle" : "ellipse-outline"} 
                          size={20} 
                          color={isCollected ? "#4CAF50" : "#CCCCCC"} 
                        />
                        <Text style={[
                          styles.setPieceText,
                          isCollected ? styles.collectedPiece : styles.missingPiece
                        ]}>
                          {itemName}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
            
            {selectedSet.completed && (
              <View style={styles.completionBadge}>
                <Ionicons name="trophy" size={20} color="#FFFFFF" />
                <Text style={styles.completionText}>Набор собран полностью!</Text>
              </View>
            )}
          </View>
        )}
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    marginHorizontal: 16,
    color: '#333333',
  },
  equippedSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  characterPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    marginRight: 16,
  },
  equippedSlotsContainer: {
    flex: 1,
  },
  equippedSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  slotIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  slotName: {
    width: 80,
    fontSize: 13,
    color: '#666666',
  },
  slotItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  emptySlot: {
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  tabsContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tabsContent: {
    paddingHorizontal: 12,
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
  equippedItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
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
  equippedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  statsPreview: {
    marginRight: 8,
  },
  statPreview: {
    fontSize: 12,
    color: '#4E64EE',
    textAlign: 'right',
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
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 6,
  },
  // Стили для секции наборов снаряжения
  setsSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  setCard: {
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedSetCard: {
    borderColor: '#FF8C00',
    borderWidth: 2,
  },
  setHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  setName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333333',
  },
  setProgressContainer: {
    alignItems: 'flex-end',
  },
  setProgressText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    width: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4E64EE',
  },
  setBonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 6,
    backgroundColor: '#FFF5E6',
    borderRadius: 6,
  },
  setBonusText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF8C00',
  },
  
  // Стили для модального окна деталей набора
  setIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4E64EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  setProgressLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  setDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 24,
    padding: 8,
  },
  setPiecesContainer: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  setPieceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setPieceText: {
    marginLeft: 8,
    fontSize: 14,
  },
  collectedPiece: {
    color: '#333333',
    fontWeight: '500',
  },
  missingPiece: {
    color: '#999999',
  },
  fullBonusValue: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8C00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  completionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
});

export default InventoryScreen;