import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem, MenuItem } from '../types';
import { formatRs } from '../utils/format';
import { styles } from '../styles/styles';

export default function CustomizerModal({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, extras: Partial<CartItem>) => void;
}) {
  const [portion, setPortion] = useState<CartItem['portion']>('Standard');
  const [notes, setNotes] = useState('');
  const [truffle, setTruffle] = useState(false);
  const [cheese, setCheese] = useState(false);

  if (!item) return null;

  const addons = [truffle ? 'Shaved black truffles' : '', cheese ? 'Extra cheese' : ''].filter(Boolean);

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <View style={styles.sectionHeader}>
            <Text style={styles.homeTitle}>Customize</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={26} color="#333" /></Pressable>
          </View>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.mutedText}>{formatRs(item.price)}</Text>
          <Text style={styles.sectionTitle}>Portion</Text>
          <View style={styles.portionRow}>
            {(['Petite', 'Standard', 'Grand'] as CartItem['portion'][]).map((p) => (
              <Pressable key={p} style={[styles.portionBtn, portion === p && styles.portionActive]} onPress={() => setPortion(p)}>
                <Text style={[styles.portionText, portion === p && styles.portionTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.checkRow} onPress={() => setTruffle(!truffle)}>
            <Ionicons name={truffle ? 'checkbox' : 'square-outline'} size={22} color="#35C989" />
            <Text style={styles.locationText}>Shaved black truffles + Rs. 600</Text>
          </Pressable>
          <Pressable style={styles.checkRow} onPress={() => setCheese(!cheese)}>
            <Ionicons name={cheese ? 'checkbox' : 'square-outline'} size={22} color="#35C989" />
            <Text style={styles.locationText}>Extra cheese + Rs. 250</Text>
          </Pressable>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Special notes" style={styles.input} />
          <Pressable style={styles.primaryBtn} onPress={() => onAdd(item, { portion, notes, addons })}>
            <Text style={styles.primaryBtnText}>Add to Cart</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
