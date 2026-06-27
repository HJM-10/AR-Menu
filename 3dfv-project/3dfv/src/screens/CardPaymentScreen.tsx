import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { formatRs } from '../utils/format';
import { styles } from '../styles/styles';

export default function CardPaymentScreen({
  total,
  onBack,
  onPay,
}: {
  total: number;
  onBack: () => void;
  onPay: () => void;
}) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePay = () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      Alert.alert('Missing Details', 'Please enter all card details.');
      return;
    }

    if (cardNumber.length < 12) {
      Alert.alert('Invalid Card', 'Please enter a valid card number.');
      return;
    }

    if (cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV.');
      return;
    }

    onPay();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="Card Payment" onBack={onBack} />

        <View style={styles.checkoutCard}>
          <Ionicons name="card-outline" size={42} color="#35C989" />
          <Text style={styles.sectionTitle}>Enter Card Details</Text>
          <Text style={styles.mutedText}>
            This is a demo payment screen for your project.
          </Text>
        </View>

        <TextInput
          value={cardName}
          onChangeText={setCardName}
          placeholder="Cardholder Name"
          style={styles.input}
        />

        <TextInput
          value={cardNumber}
          onChangeText={setCardNumber}
          placeholder="Card Number"
          keyboardType="number-pad"
          maxLength={16}
          style={styles.input}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TextInput
            value={expiry}
            onChangeText={setExpiry}
            placeholder="MM/YY"
            maxLength={5}
            style={[styles.input, { flex: 1 }]}
          />

          <TextInput
            value={cvv}
            onChangeText={setCvv}
            placeholder="CVV"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            style={[styles.input, { flex: 1 }]}
          />
        </View>

        <View style={styles.checkoutCard}>
          <Text style={styles.sectionTitle}>Amount to Pay</Text>
          <Text style={styles.boldText}>{formatRs(total)}</Text>
        </View>

        <Pressable style={styles.primaryBtn} onPress={handlePay}>
          <Text style={styles.primaryBtnText}>Pay Now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}