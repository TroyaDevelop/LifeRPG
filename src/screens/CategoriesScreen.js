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
import { CategoryService, TaskService } from '../services';
import Header from '../components/Header';

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taskCounts, setTaskCounts] = useState({});

  // Загрузка категорий при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  // Загрузка категорий из хранилища
  const loadCategories = async () => {
    try {
      setLoading(true);
      const allCategories = await CategoryService.getAllCategories();
      setCategories(allCategories || []);

      // Получаем количество задач для каждой категории
      const allTasks = await TaskService.getAllTasks();
      const counts = {};
      
      allCategories.forEach(category => {
        counts[category.id] = allTasks.filter(task => task.categoryId === category.id).length;
      });
      
      setTaskCounts(counts);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить категории');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Обновление списка (pull-to-refresh)
  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  // Обработка удаления категории
  const handleDeleteCategory = (categoryId, categoryName) => {
    Alert.alert(
      'Удалить категорию',
      `Вы уверены, что хотите удалить категорию "${categoryName}"? Все связанные задачи будут перемещены в категорию "Другое".`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              await CategoryService.deleteCategory(categoryId);
              
              // Обновляем список категорий
              setCategories(prevCategories => 
                prevCategories.filter(cat => cat.id !== categoryId)
              );
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
    if (loading) return null;
    
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

  // Заголовок с кнопкой добавления
  const renderHeader = () => {
    const rightComponent = (
      <TouchableOpacity 
        onPress={() => navigation.navigate('AddCategory')}
        style={styles.headerButton}
      >
        <Ionicons name="add" size={24} color="#4E64EE" />
      </TouchableOpacity>
    );

    return (
      <Header 
        title="Категории" 
        hasBack={true}
        onBack={() => navigation.goBack()}
        rightComponent={rightComponent} 
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E64EE" />
        <Text style={styles.loadingText}>Загрузка категорий...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4E64EE']} />
        }
      />

      {/* FAB для быстрого добавления */}
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