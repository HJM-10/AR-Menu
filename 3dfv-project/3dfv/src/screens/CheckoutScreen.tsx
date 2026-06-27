import React from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import PriceRow from '../components/PriceRow';
import { formatRs } from '../utils/format';
import { styles } from '../styles/styles';

export default function CheckoutScreen({
  payment,
  setPayment,
  total,
  customerPhone,
  setCustomerPhone,
  loading,
  onBack,
  onPlaceOrder,
  onCardPayment,
}: {
  payment: string;
  setPayment: (value: string) => void;
  total: number;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  loading?: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
  onCardPayment: () => void;
}) {
  const paymentMethods = ['Cash on Counter', 'Debit/Credit Card'];

  const handlePlaceOrder = () => {
    if (payment === 'Debit/Credit Card') {
      onCardPayment();
    } else {
      onPlaceOrder();
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="Checkout" onBack={onBack} />

        <View style={styles.checkoutCard}>
          <Text style={styles.sectionTitle}>Pickup Order</Text>
          <Text style={styles.foodName}>
            Collect your order from the restaurant counter.
          </Text>
          <Text style={styles.mutedText}>
            Choose how you want to pay for your order.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Info</Text>
        <TextInput
          value={customerPhone}
          onChangeText={setCustomerPhone}
          placeholder="Phone number e.g. 03001234567"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Payment Method</Text>

        {paymentMethods.map((method) => (
          <Pressable
            key={method}
            style={[
              styles.locationRow,
              payment === method && styles.locationActive,
            ]}
            onPress={() => setPayment(method)}
          >
            <Ionicons
              name={payment === method ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color="#35C989"
            />
            <Text style={styles.locationText}>{method}</Text>
          </Pressable>
        ))}

        <PriceRow label="Payable Amount" value={formatRs(total)} bold />

        <Pressable 
          style={[styles.primaryBtn, loading && styles.disabledBtn]} 
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {payment === 'Debit/Credit Card'
                ? 'Continue to Card Payment'
                : 'Place Order'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}