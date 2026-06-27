import React, { useEffect } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

export default function SplashScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onStart();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onStart]);

  return (
    <SafeAreaView style={styles.splash}>
      <View style={styles.splashOuterCircle}>
        <View style={styles.splashMiddleCircle}>
          <View style={styles.splashLogoCircle}>
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={58}
              color="#26232A"
            />
          </View>
        </View>
      </View>

      <Text style={styles.splashTitle}>3DFV</Text>

      <Text style={styles.splashSub}>
        3D FOOD VISUALISATION
      </Text>

      <Text style={styles.splashTagline}>
        See your food before you order
      </Text>

      <View style={styles.splashLoadingBox}>
        <View style={styles.splashLoadingDot} />
        <View style={styles.splashLoadingDotActive} />
        <View style={styles.splashLoadingDot} />
      </View>
    </SafeAreaView>
  );
}