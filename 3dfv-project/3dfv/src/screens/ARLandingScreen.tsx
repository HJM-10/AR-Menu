import React from 'react';
import { Alert, Image, Linking, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { MenuItem } from '../types';
import { styles } from '../styles/styles';

function openModelUrl(item: MenuItem, mode: '3D' | 'AR') {
  if (!item.model_3d_url) {
    Alert.alert(`${mode} model`, '3D model not available yet.');
    return;
  }

  Linking.openURL(item.model_3d_url).catch(() => {
    Alert.alert(`${mode} model`, 'Unable to open this model link right now.');
  });
}

export default function ARLandingScreen({
  item,
  onBack,
  onScanQr,
}: {
  item: MenuItem;
  onBack: () => void;
  onScanQr: () => void;
}) {
  const hasModel = Boolean(item.model_3d_url);
  const arReady = Boolean(item.ar_enabled && item.model_3d_url);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="AR / 3D View" onBack={onBack} />

        <Image source={{ uri: item.image }} style={styles.detailHeroImage} />

        <View style={styles.detailHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bigTitle}>{item.name}</Text>
            <Text style={styles.mutedText}>{item.category}</Text>
          </View>
          <View style={styles.arBadge}>
            <Ionicons name={hasModel ? 'cube-outline' : 'cube'} size={18} color="#A86B24" />
            <Text style={styles.arBadgeText}>{hasModel ? 'Model linked' : 'Preview only'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.detailBodyText}>
          {item.description || 'No description is available for this item yet.'}
        </Text>

        <View style={styles.arStatusCard}>
          <View style={styles.arStatusRow}>
            <Ionicons
              name={hasModel ? 'checkmark-circle-outline' : 'information-circle-outline'}
              size={22}
              color={hasModel ? '#35C989' : '#A86B24'}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.arStatusTitle}>
                {hasModel ? '3D model available' : '3D model not available yet'}
              </Text>
              <Text style={styles.arStatusText}>
                {arReady
                  ? 'This item is ready for AR viewing when the device supports it.'
                  : hasModel
                    ? 'A 3D model URL is linked. AR can be enabled from backend item settings.'
                    : 'The landing page is ready and will open the model as soon as a URL is added.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.arActionGrid}>
          <Pressable
            style={[styles.arActionBtn, !hasModel && styles.arActionBtnDisabled]}
            onPress={() => openModelUrl(item, '3D')}
          >
            <Ionicons name="cube-outline" size={22} color={hasModel ? '#35C989' : '#999'} />
            <Text style={styles.arActionText}>View in 3D</Text>
          </Pressable>

          <Pressable
            style={[styles.arActionBtn, !arReady && styles.arActionBtnDisabled]}
            onPress={() => openModelUrl(item, 'AR')}
          >
            <Ionicons name="scan-outline" size={22} color={arReady ? '#35C989' : '#999'} />
            <Text style={styles.arActionText}>View in AR</Text>
          </Pressable>

          <Pressable style={styles.arActionBtn} onPress={onScanQr}>
            <Ionicons name="qr-code-outline" size={22} color="#35C989" />
            <Text style={styles.arActionText}>Scan QR</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
