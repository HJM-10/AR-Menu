import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import PriceRow from '../components/PriceRow';
import { CartItem } from '../types';
import { formatRs } from '../utils/format';
import { getCartLinePrice } from '../utils/pricing';
import { styles } from '../styles/styles';

export default function CartScreen({
  cart,
  subtotal,
  tax,
  total,
  updateQuantity,
  onBack,
  onCheckout,
}: {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  updateQuantity: (index: number, change: number) => void;
  onBack: () => void;
  onCheckout: () => void;
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="Your Cart" onBack={onBack} />

        {cart.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bag-outline" size={54} color="#ccc" />
            <Text style={styles.bigTitle}>Cart is empty</Text>
            <Text style={styles.centerText}>
              Add something from the menu first.
            </Text>
          </View>
        ) : (
          cart.map((line, index) => (
            <View
              key={`${line.item.id}-${line.portion}-${index}`}
              style={styles.cartLine}
            >
              <Image
                source={{ uri: line.item.image }}
                style={styles.cartImage}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{line.item.name}</Text>

                <Text style={styles.mutedText}>
                  {line.portion} - {formatRs(getCartLinePrice(line))}
                </Text>

                {!!line.addons.length && (
                  <Text style={styles.tinyText}>
                    Addons: {line.addons.join(', ')}
                  </Text>
                )}
              </View>

              <View style={styles.qtyRow}>
                <Pressable
                  onPress={() => updateQuantity(index, -1)}
                  style={styles.qtyBtn}
                >
                  <Text>-</Text>
                </Pressable>

                <Text style={styles.qtyText}>{line.quantity}</Text>

                <Pressable
                  onPress={() => updateQuantity(index, 1)}
                  style={styles.qtyBtn}
                >
                  <Text>+</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <PriceRow label="Subtotal" value={formatRs(subtotal)} />
        <PriceRow label="Tax 16%" value={formatRs(tax)} />

        <View style={styles.divider} />

        <PriceRow label="Total" value={formatRs(total)} bold />

        <Pressable
          disabled={cart.length === 0}
          style={[
            styles.primaryBtn,
            cart.length === 0 && styles.disabledBtn,
          ]}
          onPress={onCheckout}
        >
          <Text style={styles.primaryBtnText}>Checkout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
