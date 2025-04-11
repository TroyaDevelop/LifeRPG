import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Button, Modal, LoadingIndicator, Avatar } from '../components';
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

const InventoryScreen = ({ navigation }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [equippedItems, setEquippedItems] = useState({});
  
  // Получаем данные аватара из контекста
  const { avatar, updateAvatar } = useAppContext();

  const equipmentService = new EquipmentService();

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      // Используем метод initializeWithSampleData вместо getAllEquipment для загрузки тестовых данных
      const items = await equipmentService.initializeWithSampleData();
      setEquipment(items);
      
      // Группируем экипированные предметы по типу
      const equipped = {};
      items.filter(item => item.equipped).forEach(item => {
        equipped[item.type] = item;
      });
      setEquippedItems(equipped);
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
          <Avatar size="large" avatarData={avatar} />
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
                  size={20} 
                  color={equippedItems[type] ? "#FFFFFF" : "#AAAAAA"} 
                />
              </View>
              <Text style={styles.slotName}>{label}</Text>
              <Text style={[
                styles.slotItemName,
                !equippedItems[type] && styles.emptySlot
              ]}>
                {equippedItems[type]?.name || 'Пусто'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Инвентарь" hasBack={true} onBack={() => navigation.goBack()} />
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <View style={styles.content}>
          {renderEquippedItems()}
          
          <Text style={styles.sectionTitle}>Доступные предметы</Text>
          {renderTabs()}
          
          {filteredEquipment.length > 0 ? (
            <FlatList
              data={filteredEquipment}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
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
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
});

export default InventoryScreen;