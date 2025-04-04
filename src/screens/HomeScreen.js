import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext'; // Импортируем хук контекста
import LevelProgressBar from '../components/LevelProgressBar';
import LevelUpModal from '../components/LevelUpModal';
import { TaskCard, Modal, Button } from '../components/index';
import Header from '../components/Header';
import { formatDate } from '../utils/helpers';
import { TASK_PRIORITIES, PRIORITY_COLORS } from '../utils/constants';
import Avatar from '../components/Avatar';

// Оптимизируем TaskCard с помощью memo
const MemoizedTaskCard = memo(TaskCard);

const HomeScreen = ({ navigation }) => {
  // Используем контекст вместо локального состояния
  const { 
    tasks, 
    profile, 
    avatar, 
    completeTask, 
    deleteTask, 
    refreshData, 
    isLoading 
  } = useAppContext();
  
  // Состояние для UI
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ visible: false, level: 1, bonuses: [] });
  const [tabType, setTabType] = useState('daily'); // 'regular' или 'daily'

  // Обновление данных при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      refreshData(); // Вызываем обновление из контекста
    }, [])
  );

  // Обработка события pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Фильтрация и сортировка задач
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];
    
    // Фильтрация по типу задачи (обычная или ежедневная)
    result = result.filter(task => task.type === tabType);
    
    // Фильтрация по статусу
    if (filterType === 'active') {
      result = result.filter(task => !task.isCompleted);
    } else if (filterType === 'completed') {
      result = result.filter(task => task.isCompleted);
    }
    
    // Поиск по тексту
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Сортировка
    if (sortType === 'date') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortType === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortType === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return result;
  }, [tasks, filterType, sortType, searchQuery, tabType]);

  // Обработчик выполнения задачи
  const handleCompleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Задача не найдена:', taskId);
        return;
      }
      
      // Вызываем функцию из контекста только с ID задачи
      const result = await completeTask(taskId);
      
      // Показываем модальное окно повышения уровня, если есть
      if (result.levelUp) {
        setLevelUpData({
          visible: true,
          level: result.levelUp.level,
          bonuses: result.levelUp.bonuses || []
        });
      }
      
      // Обновляем данные в экране
      refreshData();
    } catch (error) {
      console.error('Ошибка при выполнении задачи:', error);
      Alert.alert('Ошибка', 'Не удалось изменить статус задачи.');
    }
  };

  // Обработчик удаления задачи
  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Удаление задачи',
      'Вы уверены, что хотите удалить задачу?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
            } catch (error) {
              console.error('Ошибка при удалении задачи:', error);
              Alert.alert('Ошибка', 'Не удалось удалить задачу.');
            }
          }
        }
      ]
    );
  };

  // Закрытие модального окна повышения уровня
  const closeLevelUpModal = () => {
    setLevelUpData({ ...levelUpData, visible: false });
  };

  // Компонент для отображения пустого списка
  const renderEmptyList = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="list-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyText}>
          {searchQuery.trim() 
            ? 'Нет задач, соответствующих поиску' 
            : 'У вас пока нет задач'}
        </Text>
        <Button 
          title="Добавить задачу" 
          onPress={() => navigation.navigate('AddTask')}
          style={styles.addButton}
        />
      </View>
    );
  };

  // Компонент фильтра и сортировки
  const renderHeaderComponent = () => (
    <View style={styles.headerContainer}>
      {/* Показываем аватар и прогресс уровня */}
      <View style={styles.profileContainer}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('Profile')}
        >
          <Avatar size="small" style={styles.avatar} avatarData={avatar} />
        </TouchableOpacity>
        {profile && (
          <LevelProgressBar profile={profile} style={styles.levelProgressBar} />
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#AAAAAA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск задач..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#AAAAAA"
        />
      </View>

      <View style={styles.filterSortContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={20} color="#4E64EE" />
          <Text style={styles.filterSortText}>Фильтр</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={20} color="#4E64EE" />
          <Text style={styles.filterSortText}>Сортировка</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Модальное окно сортировки
  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      onClose={() => setShowSortModal(false)}
      title="Сортировка"
    >
      <TouchableOpacity 
        style={[styles.modalOption, sortType === 'date' && styles.selectedOption]} 
        onPress={() => {
          setSortType('date');
          setShowSortModal(false);
        }}
      >
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={sortType === 'date' ? '#4E64EE' : '#666666'} 
        />
        <Text style={[styles.modalOptionText, sortType === 'date' && styles.selectedOptionText]}>
          По сроку
        </Text>
        {sortType === 'date' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.modalOption, sortType === 'priority' && styles.selectedOption]} 
        onPress={() => {
          setSortType('priority');
          setShowSortModal(false);
        }}
      >
        <Ionicons 
          name="alert-circle-outline" 
          size={20} 
          color={sortType === 'priority' ? '#4E64EE' : '#666666'} 
        />
        <Text style={[styles.modalOptionText, sortType === 'priority' && styles.selectedOptionText]}>
          По приоритету
        </Text>
        {sortType === 'priority' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.modalOption, sortType === 'title' && styles.selectedOption]} 
        onPress={() => {
          setSortType('title');
          setShowSortModal(false);
        }}
      >
        <Ionicons 
          name="text-outline" 
          size={20} 
          color={sortType === 'title' ? '#4E64EE' : '#666666'} 
        />
        <Text style={[styles.modalOptionText, sortType === 'title' && styles.selectedOptionText]}>
          По названию
        </Text>
        {sortType === 'title' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
      </TouchableOpacity>
    </Modal>
  );

  // Модальное окно фильтра
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      title="Фильтр"
    >
      <TouchableOpacity 
        style={[styles.modalOption, filterType === 'all' && styles.selectedOption]} 
        onPress={() => {
          setFilterType('all');
          setShowFilterModal(false);
        }}
      >
        <Ionicons 
          name="list-outline" 
          size={20} 
          color={filterType === 'all' ? '#4E64EE' : '#666666'} 
        />
        <Text style={[styles.modalOptionText, filterType === 'all' && styles.selectedOptionText]}>
          Все задачи
        </Text>
        {filterType === 'all' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.modalOption, filterType === 'active' && styles.selectedOption]} 
        onPress={() => {
          setFilterType('active');
          setShowFilterModal(false);
        }}
      >
        <Ionicons 
          name="time-outline" 
          size={20} 
          color={filterType === 'active' ? '#4E64EE' : '#666666'} 
        />
        <Text style={[styles.modalOptionText, filterType === 'active' && styles.selectedOptionText]}>
          Активные
        </Text>
        {filterType === 'active' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.modalOption, filterType === 'completed' && styles.selectedOption]} 
        onPress={() => {
          setFilterType('completed');
          setShowFilterModal(false);
        }}
      >
        <Ionicons 
          name="checkmark-circle-outline" 
          size={20} 
          color={filterType === 'completed' ? '#4E64EE' : '#666666'} 
        />
        <Text style={[styles.modalOptionText, filterType === 'completed' && styles.selectedOptionText]}>
          Выполненные
        </Text>
        {filterType === 'completed' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
      </TouchableOpacity>
    </Modal>
  );

  // Собственный компонент заголовка с кнопкой добавления
  const renderHeader = () => {
    const rightComponent = (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('NotificationSettings')}
          style={styles.headerButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#4E64EE" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Categories')}
          style={styles.headerButton}
        >
          <Ionicons name="folder-outline" size={24} color="#4E64EE" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddTask')}
          style={styles.headerButton}
        >
          <Ionicons name="add" size={24} color="#4E64EE" />
        </TouchableOpacity>
      </View>
    );

    return (
      <Header 
        title="Мои задачи" 
        hasSettings={true}
        onSettingsPress={() => navigation.navigate('Settings')}
      />
    );
  };

  // Переключение между обычными и ежедневными задачами
  const toggleTaskType = (type) => {
    if (type !== tabType) {
      setTabType(type);
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E64EE" />
        <Text style={styles.loadingText}>Загрузка задач...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {/* Переключение между обычными и ежедневными задачами */}
      <View style={styles.tabContainer}>
      <TouchableOpacity 
          style={[styles.tabButton, tabType === 'daily' ? styles.activeTab : null]}
          onPress={() => toggleTaskType('daily')}
        >
          <Text style={tabType === 'daily' ? styles.activeTabText : styles.tabText}>Ежедневные</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, tabType === 'regular' ? styles.activeTab : null]}
          onPress={() => toggleTaskType('regular')}
        >
          <Text style={tabType === 'regular' ? styles.activeTabText : styles.tabText}>Обычные</Text>
        </TouchableOpacity>
        
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <MemoizedTaskCard
            task={item}
            onPress={() => navigation.navigate('EditTask', { taskId: item.id })}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeaderComponent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4E64EE']} />
        }
        // Отключаем ненужные ререндеры
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        // Продолжаем показывать контент даже когда список не в фокусе
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      />

      {/* Модальное окно повышения уровня */}
      <LevelUpModal 
        visible={levelUpData.visible}
        level={levelUpData.level}
        bonuses={levelUpData.bonuses}
        onClose={closeLevelUpModal}
      />

      {/* FAB для быстрого добавления - показываем только если есть задачи */}
      {filteredTasks.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('AddTask')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {renderSortModal()}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Дополнительный отступ для FAB
  },
  headerContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333',
  },
  filterSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterSortText: {
    marginLeft: 8,
    color: '#4E64EE',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    width: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4E64EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedOption: {
    backgroundColor: '#F0F4FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  selectedOptionText: {
    color: '#4E64EE',
    fontWeight: '500',
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  levelProgressBar: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4E66F1',
  },
  tabText: {
    color: '#888888',
    fontSize: 16,
  },
  activeTabText: {
    color: '#4E66F1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Добавляем новые стили
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 8,
    // Добавим немного отступа сверху и снизу
    marginVertical: 6,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#4E64EE',
    borderRadius: 8, // Изменяем на квадрат с закругленными углами
    backgroundColor: '#E9EDF5', // Соответствует цвету фона в Avatar
    // Добавим небольшую тень
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: 110, // Явно задаем размер
    height: 110, // Явно задаем размер
  },
  levelProgressBar: {
    flex: 1,
  },
});

export default HomeScreen;
