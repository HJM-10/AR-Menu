import React from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { CartItem, MenuItem } from '../types';
import { formatRs } from '../utils/format';
import { styles } from '../styles/styles';

export default function ItemDetailScreen({
  item,
  onBack,
  onAddToCart,
  onCustomize,
  onOpenAr,
}: {
  item: MenuItem;
  onBack: () => void;
  onAddToCart: (item: MenuItem, extras?: Partial<CartItem>) => void;
  onCustomize: (item: MenuItem) => void;
  onOpenAr: (item: MenuItem) => void;
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="Menu Item" onBack={onBack} />

        <Image source={{ uri: item.image }} style={styles.detailHeroImage} />

        <View style={styles.detailHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigTitle}>{item.name}</Text>
            <Text style={styles.mutedText}>{item.category}</Text>
          </View>
          <Text style={styles.detailPrice}>{formatRs(item.price)}</Text>
        </View>

        <View style={styles.detailMetaRow}>
          <View style={styles.detailMetaPill}>
            <Ionicons
              name={item.is_available === false ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={18}
              color={item.is_available === false ? '#EF4444' : '#35C989'}
            />
            <Text style={styles.detailMetaText}>
              {item.is_available === false ? 'Unavailable' : 'Available'}
            </Text>
          </View>

          <View style={styles.detailMetaPill}>
            <Ionicons name="cube-outline" size={18} color="#A86B24" />
            <Text style={styles.detailMetaText}>
              {item.ar_enabled || item.model_3d_url ? '3D/AR Ready' : '3D/AR Preview'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.detailBodyText}>
          {item.description || 'No description is available for this item yet.'}
        </Text>

        <Pressable style={styles.arPreviewCard} onPress={() => onOpenAr(item)}>
          <View style={styles.arPreviewIcon}>
            <Ionicons name="cube-outline" size={24} color="#35C989" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.arPreviewTitle}>Open AR / 3D view</Text>
            <Text style={styles.arPreviewText}>
              {item.model_3d_url
                ? 'View the linked model or open the public QR viewing flow.'
                : '3D model not available yet, but the preview page is ready.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A3A0A5" />
        </Pressable>

        <Text style={styles.sectionTitle}>Customization</Text>
        <Text style={styles.detailBodyText}>
          Choose a portion and optional add-ons before adding this item to your cart.
        </Text>

        <View style={styles.detailActionRow}>
          <Pressable style={[styles.primaryBtn, { flex: 1 }]} onPress={() => onAddToCart(item)}>
            <Text style={styles.primaryBtnText}>Add to Cart</Text>
          </Pressable>

          <Pressable style={styles.secondaryIconBtn} onPress={() => onCustomize(item)}>
            <Ionicons name="options-outline" size={22} color="#35C989" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
