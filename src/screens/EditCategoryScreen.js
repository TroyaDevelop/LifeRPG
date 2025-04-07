import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CategoryService } from '../services';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/constants';

const EditCategoryScreen = ({ navigation, route }) => {
  const { categoryId } = route.params;
  
  // Состояние категории
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);

  // Состояние ошибок
  const [nameError, setNameError] = useState('');
  
  // Загрузка данных категории
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        
        // Загружаем категорию из CategoryService
        const categoryData = await CategoryService.getCategoryById(categoryId);
        
        if (!categoryData) {
          throw new Error(`Категория с ID ${categoryId} не найдена`);
        }
        
        setCategory(categoryData);
        setName(categoryData.name);
        setColor(categoryData.color);
        setIcon(categoryData.icon);
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке категории:', error);
        Alert.alert(
          'Ошибка',
          'Не удалось загрузить данные категории',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };
    
    loadCategory();
  }, [categoryId]);

  // Валидация формы
  const validateForm = () => {
    let isValid = true;
    
    // Проверка названия
    if (!name.trim()) {
      setNameError('Название категории обязательно');
      isValid = false;
    } else {
      setNameError('');
    }
    
    return isValid;
  };

  // Обновление категории
  const handleUpdateCategory = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Создаем обновленный объект категории
      const updatedCategoryData = {
        name,
        color,
        icon,
        updatedAt: new Date().toISOString()
      };
      
      // Обновляем категорию через CategoryService
      const updatedCategory = await CategoryService.updateCategory(categoryId, updatedCategoryData);
      
      if (!updatedCategory) {
        throw new Error('Ошибка при обновлении категории');
      }
      
      console.log('Категория обновлена:', updatedCategory);
      
      // Показываем сообщение об успехе
      Alert.alert(
        'Успех',
        'Категория успешно обновлена!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      Alert.alert('Ошибка', 'Не удалось обновить категорию');
    }
  };

  // Удаление категории
  const handleDeleteCategory = () => {
    Alert.alert(
      'Удалить категорию',
      'Вы уверены, что хотите удалить эту категорию? Все связанные задачи будут помечены как "Без категории".',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Удаляем через CategoryService
              const success = await CategoryService.deleteCategory(categoryId);
              
              if (!success) {
                throw new Error('Не удалось удалить категорию');
              }
              
              console.log('Категория удалена, ID:', categoryId);
              
              // Возвращаемся на предыдущий экран
              navigation.goBack();
            } catch (error) {
              console.error('Ошибка при удалении категории:', error);
              Alert.alert('Ошибка', 'Не удалось удалить категорию');
            }
          }
        }
      ]
    );
  };

  // Рендер образца цвета
  const renderColorItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.colorItem,
        { backgroundColor: item },
        color === item && styles.selectedColorItem
      ]}
      onPress={() => setColor(item)}
    >
      {color === item && (
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );

  // Рендер иконки
  const renderIconItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.iconItem,
        icon === item && { backgroundColor: color, ...styles.selectedIconItem }
      ]}
      onPress={() => setIcon(item)}
    >
      <Ionicons 
        name={item} 
        size={24} 
        color={icon === item ? '#FFFFFF' : '#666666'} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E64EE" />
        <Text style={styles.loadingText}>Загрузка категории...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Редактирование категории</Text>
          <TouchableOpacity onPress={handleDeleteCategory} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        {/* Форма категории */}
        <View style={styles.formContainer}>
          {/* Метаданные */}
          {category && category.createdAt && (
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>
                Создано: {new Date(category.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          {/* Название категории */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Название*</Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              placeholder="Введите название категории"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) setNameError('');
              }}
              maxLength={50}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>
          
          {/* Выбор цвета */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Цвет</Text>
            <View style={styles.colorPreview}>
              <View style={[styles.selectedColor, { backgroundColor: color }]} />
              <Text style={styles.colorHex}>{color}</Text>
            </View>
            <FlatList
              data={CATEGORY_COLORS}
              renderItem={renderColorItem}
              keyExtractor={item => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorList}
            />
          </View>
          
          {/* Выбор иконки */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Иконка</Text>
            <View style={styles.iconPreview}>
              <View style={[styles.selectedIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={24} color="#FFFFFF" />
              </View>
            </View>
            <FlatList
              data={CATEGORY_ICONS}
              renderItem={renderIconItem}
              keyExtractor={item => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconList}
            />
          </View>
        </View>
        
        {/* Кнопки */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleUpdateCategory}
          >
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  deleteButton: {
    padding: 8,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metaContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
  },
  inputError: {
    borderColor: '#F87171',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 4,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  colorHex: {
    fontSize: 14,
    color: '#666666',
  },
  colorList: {
    paddingVertical: 8,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  iconPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4E64EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconName: {
    fontSize: 14,
    color: '#666666',
  },
  iconList: {
    paddingVertical: 8,
  },
  iconItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedIconItem: {
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4E64EE',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default EditCategoryScreen;