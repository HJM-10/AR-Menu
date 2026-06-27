import React from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { ONBOARDING } from "../data/menu";
import { styles } from "../styles/styles";

type OnboardingProps = {
  index?: number;
  setIndex?: (value: number) => void;
  onDone?: () => void;
};

export default function OnboardingScreen(props: OnboardingProps = {}) {
  const {
    index = 0,
    setIndex = () => {},
    onDone = () => {},
  } = props;

  const slides = Array.isArray(ONBOARDING) ? ONBOARDING : [];

  const safeIndex =
    typeof index === "number" && index >= 0 && index < slides.length
      ? index
      : 0;

  const slide = slides[safeIndex];
  const isLast = safeIndex === slides.length - 1;

  if (!slide) {
    return (
      <SafeAreaView style={styles.onboardingScreen}>
        <View style={styles.onboardingCard}>
          <Text style={styles.onboardingTitle}>Welcome to 3DFV</Text>
          <Text style={styles.onboardingText}>
            Onboarding content is missing. Please check ONBOARDING in menu.ts.
          </Text>

          <Pressable style={styles.nextButton} onPress={onDone}>
            <Text style={styles.nextButtonText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.onboardingScreen}>
      <View style={styles.onboardingCard}>
        <Image source={slide.image} style={styles.onboardingImage} />

        <View style={styles.dotsRow}>
          {slides.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[
                styles.dot,
                dotIndex === safeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <Text style={styles.onboardingTitle}>{slide.title}</Text>

        <Text style={styles.onboardingText}>{slide.text}</Text>

        <View style={styles.onboardingButtons}>
          <Pressable onPress={onDone} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip ›</Text>
          </Pressable>

          <Pressable
            style={styles.nextButton}
            onPress={() => {
              if (!isLast) {
                setIndex(safeIndex + 1);
              } else {
                onDone();
              }
            }}
          >
            <Text style={styles.nextButtonText}>
              {isLast ? "Continue ›" : "Next ›"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}