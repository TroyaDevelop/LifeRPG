import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext'; // Импортируем хук контекста
import Header from '../components/Header';

const CategoriesScreen = ({ navigation }) => {
  // Используем контекст вместо прямых вызовов сервисов
  const { 
    categories, 
    tasks, 
    deleteCategory,
    refreshData,
    isLoading 
  } = useAppContext();
  
  const [refreshing, setRefreshing] = useState(false);
  const [taskCounts, setTaskCounts] = useState({});
  const [localLoading, setLocalLoading] = useState(true); // Добавляем локальное состояние загрузки
  
  // Инициализация при монтировании
  useEffect(() => {
    const initScreen = async () => {
      try {
        await refreshData();
        setLocalLoading(false);
      } catch (error) {
        console.error('Ошибка при инициализации экрана категорий:', error);
        setLocalLoading(false);
      }
    };
    
    initScreen();
  }, []);

  // Расчет количества задач для каждой категории
  const calculateTaskCounts = useCallback(() => {
    if (!categories || !tasks) return;
    
    const counts = {};
    
    // Для каждой категории считаем количество связанных задач
    categories.forEach(category => {
      counts[category.id] = tasks.filter(task => task.categoryId === category.id).length;
    });
    
    setTaskCounts(counts);
  }, [categories, tasks]);

  // Обновляем счетчики задач при изменении категорий или задач
  useEffect(() => {
    calculateTaskCounts();
  }, [categories, tasks, calculateTaskCounts]);

  // Обновление при фокусе экрана (без повторной загрузки, если уже загружено)
  useFocusEffect(
    useCallback(() => {
      const updateCategoriesData = async () => {
        console.log('CategoriesScreen: Экран в фокусе, обновляем данные');
        setLocalLoading(true);
        
        try {
          // Безопасно обновляем задачи и категории
          await refreshData();
          
          // Обновляем счетчики задач после обновления данных
          calculateTaskCounts();
        } catch (error) {
          console.error('CategoriesScreen: Ошибка при обновлении данных:', error);
        } finally {
          setLocalLoading(false);
        }
      };
      
      // Запускаем обновление
      updateCategoriesData();
      
      // Функция очистки
      return () => {
        console.log('CategoriesScreen: Выход из фокуса');
      };
    }, [])  // Пустой массив зависимостей для запуска только при фокусировке
  );

  // Обновление списка (pull-to-refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const refreshPromise = refreshData();
      
      if (refreshPromise && typeof refreshPromise.then === 'function') {
        await refreshPromise;
      }
      
      calculateTaskCounts();
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData, calculateTaskCounts]);

  // Обработка удаления категории
  const handleDeleteCategory = (categoryId, categoryName) => {
    const tasksWithCategory = tasks.filter(task => task.categoryId === categoryId);
    
    let message = 'Вы уверены, что хотите удалить категорию?';
    if (tasksWithCategory.length > 0) {
      message += ` У вас есть ${tasksWithCategory.length} задач с этой категорией.`;
    }
    
    Alert.alert(
      `Удалить категорию "${categoryName}"`,
      message,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Используем функцию из контекста
              await deleteCategory(categoryId);
              
              // Обновляем данные
              refreshData();
            } catch (error) {
              console.error('Ошибка при удалении категории:', error);
              Alert.alert('Ошибка', 'Не удалось удалить категорию');
            }
          }
        }
      ]
    );
  };

  // Компонент элемента категории
  const renderCategoryItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => navigation.navigate('EditCategory', { categoryId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <View 
              style={[styles.categoryIcon, { backgroundColor: item.color }]}
            >
              <Ionicons name={item.icon} size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.categoryTitle}>{item.name}</Text>
          </View>
          
          <View style={styles.categoryActions}>
            <Text style={styles.taskCount}>
              {taskCounts[item.id] || 0} задач
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteCategory(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Компонент для отображения пустого списка
  const renderEmptyList = () => {
    if (localLoading || isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="folder-open-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyText}>
          У вас пока нет категорий
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCategory')}
        >
          <Text style={styles.addButtonText}>Добавить категорию</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Заголовок без кнопки добавления в верхнем углу
  const renderHeader = () => {
    return (
      <Header 
        title="Категории" 
        hasBack={true}
        onBack={() => navigation.goBack()}
        // Убрали rightComponent с кнопкой добавления
      />
    );
  };

  // Проверяем, загружаются ли данные (либо глобально, либо локально, но не при обновлении)
  if ((isLoading || localLoading) && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4E64EE" />
          <Text style={styles.loadingText}>Загрузка категорий...</Text>
        </View>
      </View>
    );
  }

  // Проверяем, что категории существуют и это массив
  const categoriesData = Array.isArray(categories) ? categories : [];

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={categoriesData}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4E64EE']} />
        }
      />

      {/* FAB для быстрого добавления - оставляем только эту кнопку */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddCategory')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
    paddingBottom: 80,
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
    backgroundColor: '#4E64EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 14,
    color: '#666666',
    marginRight: 12,
  },
  deleteButton: {
    padding: 6,
  },
  headerButton: {
    padding: 8,
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
});

export default CategoriesScreen;