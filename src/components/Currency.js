import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Пути к спрайтам валюты
const ACTUS_ICON = require('../../assets/sprites/currency/actus_coin.png');
const TASK_COIN_ICON = require('../../assets/sprites/currency/task_coin.png');

/**
 * Компонент для отображения обычной валюты (Актусы)
 */
export const CurrencyBar = ({ amount, style, compact = false }) => {
  if (compact) {
    // Компактный режим для отображения в ряду
    return (
      <View style={[styles.compactContainer, styles.actusContainer, style]}>
        <Image source={ACTUS_ICON} style={styles.icon} />
        <Text style={styles.compactLabel}>{amount}</Text>
      </View>
    );
  }

  // Стандартный режим для отображения в профиле
  return (
    <View style={[styles.container, styles.actusContainer, style]}>
      <View style={styles.labelContainer}>
        <Image source={ACTUS_ICON} style={styles.icon} />
        <Text style={styles.label}>{amount} Актусов</Text>
      </View>
    </View>
  );
};

/**
 * Компонент для отображения премиум-валюты (TaskCoin)
 */
export const PremiumCurrencyBar = ({ amount, style, compact = false }) => {
  if (compact) {
    // Компактный режим для отображения в ряду
    return (
      <View style={[styles.compactContainer, styles.taskCoinContainer, style]}>
        <Image source={TASK_COIN_ICON} style={styles.icon} />
        <Text style={styles.compactLabel}>{amount}</Text>
      </View>
    );
  }

  // Стандартный режим для отображения в профиле
  return (
    <View style={[styles.container, styles.taskCoinContainer, style]}>
      <View style={styles.labelContainer}>
        <Image source={TASK_COIN_ICON} style={styles.icon} />
        <Text style={styles.label}>{amount} TaskCoin</Text>
      </View>
    </View>
  );
};

/**
 * Компонент для отображения обеих валют в одном ряду
 */
export const CurrencyRow = ({ actus, taskCoins, style }) => {
  return (
    <View style={[styles.currencyRow, style]}>
      <CurrencyBar amount={actus} compact={true} style={styles.currencyItem} />
      <PremiumCurrencyBar amount={taskCoins} compact={true} style={styles.currencyItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Общие стили
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 4
  },
  label: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 4
  },
  // Стили для компактного режима
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  compactLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 4
  },
  
  // Стили для компонента CurrencyRow
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  currencyItem: {
    flex: 1,
    marginHorizontal: 4
  }
});

// Экспорт по умолчанию для обратной совместимости
export default { CurrencyBar, PremiumCurrencyBar, CurrencyRow };