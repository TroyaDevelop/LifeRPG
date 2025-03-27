import React, { useState, useEffect, useCallback } from 'react';
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
import { TaskService } from '../services';
// Добавляем новые импорты
import { ProfileService } from '../services/ProfileService';
import LevelProgressBar from '../components/LevelProgressBar';
import LevelUpModal from '../components/LevelUpModal';
// Исправляем путь к компонентам
import { TaskCard, Modal, Button } from '../components/index';
import Header from '../components/Header';
import { formatDate } from '../utils/helpers';
import { TASK_PRIORITIES, PRIORITY_COLORS } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('date'); // 'date', 'priority', 'title'
  const [filterType, setFilterType] = useState('all'); // 'all', 'completed', 'active'
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Добавляем новые состояния для профиля и модального окна повышения уровня
  const [profile, setProfile] = useState(null);
  const [levelUpData, setLevelUpData] = useState({ visible: false, level: 1, bonuses: [] });

  // Загрузка задач при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadTasks();
      loadProfile(); // Добавляем загрузку профиля
    }, [])
  );

  // Применение фильтров и сортировки при изменении данных
  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchQuery, sortType, filterType]);

  // Загрузка задач из хранилища
  const loadTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await TaskService.getAllTasks();
      setTasks(allTasks || []);
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить задачи');
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Загрузка профиля пользователя
  const loadProfile = async () => {
    try {
      const profileService = ProfileService.getInstance();
      const userProfile = await profileService.getProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  // Обновление списка (pull-to-refresh)
  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
    loadProfile(); // Добавляем загрузку профиля при обновлении
  };

  // Применение фильтров и сортировки
  const applyFiltersAndSort = () => {
    if (!tasks || tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }
    
    let result = [...tasks];

    // Применение фильтра по статусу
    switch (filterType) {
      case 'completed':
        result = result.filter(task => task.isCompleted);
        break;
      case 'active':
        result = result.filter(task => !task.isCompleted);
        break;
      default:
        // All tasks
        break;
    }

    // Применение поиска по названию или описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Применение сортировки
    switch (sortType) {
      case 'date':
        result.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      case 'priority':
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        result.sort((a, b) => 
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredTasks(result);
  };

  // Обработка отметки задачи как выполненной
  const handleCompleteTask = async (taskId) => {
    try {
      console.log('Получен ID задачи:', taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.warn(`Задача с ID ${taskId} не найдена в локальном состоянии`);
        return;
      }
      
      console.log('Найденная задача:', task);
      // Если задача уже выполнена, просто меняем статус
      if (task.isCompleted) {
        // Обновляем локальное состояние
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, isCompleted: false, completedAt: null } : t
          )
        );
        
        // Отправляем изменения в хранилище
        await TaskService.updateTask(taskId, { 
          isCompleted: false, 
          completedAt: null 
        });
        return;
      }
      
      // Если задача не выполнена, выполняем ее и начисляем опыт
      const result = await TaskService.completeTask(taskId);
      
      // Обновляем список задач
      await loadTasks();
      
      // Обновляем профиль
      await loadProfile();
      
      // Если произошло повышение уровня, показываем модальное окно
      if (result.didLevelUp) {
        setLevelUpData({
          visible: true,
          level: result.newLevel,
          bonuses: result.newBonuses
        });
      }
      
      // Сообщаем пользователю о полученном опыте
      Alert.alert(
        'Задача выполнена!',
        `Вы получили +${result.experienceGained} XP`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      Alert.alert('Ошибка', 'Не удалось обновить статус задачи');
      // Откатываем изменения, если произошла ошибка
      loadTasks();
    }
  };

  // Обработка удаления задачи
  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Удалить задачу',
      'Вы уверены, что хотите удалить эту задачу?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Обновляем локальное состояние сразу для лучшего UX
              setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
              
              // Затем удаляем из хранилища
              await TaskService.deleteTask(taskId);
            } catch (error) {
              console.error('Ошибка при удалении задачи:', error);
              Alert.alert('Ошибка', 'Не удалось удалить задачу');
              // Откатываем изменения, если произошла ошибка
              loadTasks();
            }
          }
        }
      ]
    );
  };

  // Закрытие модального окна повышения уровня
  const handleCloseLevelUpModal = () => {
    setLevelUpData({ ...levelUpData, visible: false });
  };

  // Компонент для отображения пустого списка
  const renderEmptyList = () => {
    if (loading) return null;
    
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
      {/* Показываем прогресс уровня */}
      {profile && (
        <LevelProgressBar profile={profile} style={styles.levelProgressBar} />
      )}
    
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#AAAAAA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск задач..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#AAAAAA" />
          </TouchableOpacity>
        ) : null}
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

  if (loading && !refreshing) {
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
      
      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <TaskCard
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
      />

      {/* Модальное окно повышения уровня */}
      <LevelUpModal 
        visible={levelUpData.visible}
        level={levelUpData.level}
        bonuses={levelUpData.bonuses}
        onClose={handleCloseLevelUpModal}
      />

      {/* FAB для быстрого добавления */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

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
});

export default HomeScreen;
