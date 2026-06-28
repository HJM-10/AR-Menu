import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem, MenuItem } from '../types';
import { formatRs } from '../utils/format';
import { getDefaultPortion, getPortionOptions, getPortionPrice, isPizzaItem } from '../utils/pricing';
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
  const [portion, setPortion] = useState<CartItem['portion']>('');
  const [notes, setNotes] = useState('');
  const [truffle, setTruffle] = useState(false);
  const [cheese, setCheese] = useState(false);

  useEffect(() => {
    if (item) {
      setPortion(getDefaultPortion(item));
    }
  }, [item?.id]);

  if (!item) return null;

  const selectedPortion = portion || getDefaultPortion(item);
  const portionOptions = getPortionOptions(item);
  const portionLabel = isPizzaItem(item) ? 'Pizza Size' : 'Portion';
  const unitPrice = getPortionPrice(item, selectedPortion);
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
          <Text style={styles.mutedText}>
            {selectedPortion} price: {formatRs(unitPrice)}
          </Text>
          <Text style={styles.sectionTitle}>{portionLabel}</Text>
          <View style={styles.portionRow}>
            {portionOptions.map((option) => (
              <Pressable
                key={option.label}
                style={[styles.portionBtn, selectedPortion === option.label && styles.portionActive]}
                onPress={() => setPortion(option.label)}
              >
                <Text style={[styles.portionText, selectedPortion === option.label && styles.portionTextActive]}>
                  {option.label}
                </Text>
                <Text style={[styles.portionPriceText, selectedPortion === option.label && styles.portionTextActive]}>
                  {formatRs(option.price)}
                </Text>
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
          <Pressable
            style={styles.primaryBtn}
            onPress={() => onAdd(item, { portion: selectedPortion, notes, addons, unitPrice })}
          >
            <Text style={styles.primaryBtnText}>Add to Cart</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
