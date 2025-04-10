import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PremiumCurrencyBar = ({ amount, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Ionicons name="diamond-outline" size={16} color="#FF9500" />
        <Text style={styles.label}>{amount} TaskCoin</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 4
  }
});

export default PremiumCurrencyBar;