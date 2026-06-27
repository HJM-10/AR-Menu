import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles/styles';

export default function PriceRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, bold && styles.boldText]}>{label}</Text>
      <Text style={[styles.priceValue, bold && styles.boldText]}>{value}</Text>
    </View>
  );
}
