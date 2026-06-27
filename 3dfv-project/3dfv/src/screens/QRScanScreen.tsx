import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { MenuItem } from '../types';
import { styles } from '../styles/styles';

function extractMenuItemId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    return url.searchParams.get('itemId') || url.searchParams.get('menuItemId') || trimmed;
  } catch {
    return trimmed;
  }
}

export default function QRScanScreen({
  menuItems,
  onBack,
  onOpenItem,
  onOpenAr,
}: {
  menuItems: MenuItem[];
  onBack: () => void;
  onOpenItem: (item: MenuItem) => void;
  onOpenAr: (item: MenuItem) => void;
}) {
  const [qrValue, setQrValue] = useState('');
  const [error, setError] = useState('');

  const exampleId = useMemo(() => menuItems[0]?.id ?? '', [menuItems]);

  function findItem() {
    const itemId = extractMenuItemId(qrValue);
    return menuItems.find((item) => item.id === itemId);
  }

  function openFromQr(target: 'detail' | 'ar') {
    const item = findItem();
    if (!item) {
      setError('Invalid QR or menu item ID.');
      return;
    }

    setError('');
    if (target === 'detail') {
      onOpenItem(item);
    } else {
      onOpenAr(item);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="QR Menu View" onBack={onBack} />

        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code-outline" size={64} color="#35C989" />
          <Text style={styles.qrTitle}>QR viewing is ready</Text>
          <Text style={styles.qrText}>
            Paste a menu QR URL or item ID to open the public item page. Camera scanning can be connected later.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>QR value</Text>
        <TextInput
          value={qrValue}
          onChangeText={(value) => {
            setQrValue(value);
            setError('');
          }}
          placeholder={exampleId ? `Try item ID: ${exampleId}` : 'Paste QR URL or menu item ID'}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error ? (
          <View style={styles.qrErrorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.qrErrorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.detailActionRow}>
          <Pressable style={[styles.primaryBtn, { flex: 1 }]} onPress={() => openFromQr('detail')}>
            <Text style={styles.primaryBtnText}>Open Item</Text>
          </Pressable>

          <Pressable style={styles.secondaryIconBtn} onPress={() => openFromQr('ar')}>
            <Ionicons name="cube-outline" size={22} color="#35C989" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
