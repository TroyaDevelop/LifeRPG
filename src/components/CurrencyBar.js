import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CurrencyBar = ({ amount, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Ionicons name="cash-outline" size={16} color="#4CD964" />
        <Text style={styles.label}>{amount} Актусов</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
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

export default CurrencyBar;