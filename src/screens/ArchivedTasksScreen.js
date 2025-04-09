import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import LoadingIndicator from '../components/LoadingIndicator';

// Компонент для отображения архивированной задачи
const ArchivedTaskCard = ({ task, onDelete, onRestore }) => {
  const formattedDate = task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '';
  
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskCardHeader}>
        <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={14} color="#888888" />
          <Text style={styles.dateText}>Выполнено {formattedDate}</Text>
        </View>
      </View>
      
      {task.description ? (
        <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>
      ) : null}
      
      <View style={styles.taskCardFooter}>
        {task.priority && (
          <View style={[styles.priorityBadge, {
            backgroundColor: task.priority === 'high' ? '#FFECEB' 
                           : task.priority === 'medium' ? '#FFF5E5'
                           : '#EEF1FE'
          }]}>
            <Text style={[styles.priorityText, {
              color: task.priority === 'high' ? '#FF3B30'
                   : task.priority === 'medium' ? '#FF9500'
                   : '#4E64EE'
            }]}>
              {task.priority === 'high' ? 'Высокий'
               : task.priority === 'medium' ? 'Средний'
               : 'Низкий'}
            </Text>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.restoreButton]}
            onPress={onRestore}
          >
            <Ionicons name="refresh-outline" size={16} color="#4E64EE" />
            <Text style={styles.actionButtonText}>Восстановить</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={styles.actionButtonTextDelete}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ArchivedTasksScreen = ({ navigation }) => {
  const { 
    archivedTasks, 
    restoreTask, 
    deleteTask, 
    refreshData, 
    isLoading 
  } = useAppContext();
  
  const [refreshing, setRefreshing] = useState(false);

  // Обновляем данные при фокусе на экране
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  const handleRestoreTask = (taskId) => {
    Alert.alert(
      "Восстановление задачи",
      "Восстановить эту задачу? Она вернется в список активных задач.",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Восстановить", 
          onPress: async () => {
            try {
              await restoreTask(taskId);
            } catch (error) {
              console.error("Ошибка при восстановлении задачи:", error);
              Alert.alert("Ошибка", "Не удалось восстановить задачу");
            }
          }
        }
      ]
    );
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      "Удаление задачи",
      "Вы уверены, что хотите удалить эту задачу навсегда?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Удалить", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTask(taskId);
            } catch (error) {
              console.error("Ошибка при удалении задачи:", error);
              Alert.alert("Ошибка", "Не удалось удалить задачу");
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="archive-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyText}>
        В архиве нет задач.{"\n"}
        Выполненные задачи попадают сюда автоматически.
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="Архив задач" hasBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color="#4E64EE" />
          <Text style={styles.loadingText}>Загрузка архива...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Архив задач" hasBack={true} onBack={() => navigation.goBack()} />
      
      <FlatList
        data={archivedTasks}
        renderItem={({ item }) => (
          <ArchivedTaskCard 
            task={item} 
            onRestore={() => handleRestoreTask(item.id)}
            onDelete={() => handleDeleteTask(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#4E64EE"]} 
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  restoreButton: {
    backgroundColor: '#EEF1FE',
  },
  deleteButton: {
    backgroundColor: '#FFECEB',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4E64EE',
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtonTextDelete: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 4,
  }
});

export default ArchivedTasksScreen;