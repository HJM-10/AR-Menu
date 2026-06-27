import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

export default function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color="#222" />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 42 }} />
    </View>
  );
}
