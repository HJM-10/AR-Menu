import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ThanksScreen({
  onBackHome,
}: {
  onBackHome: () => void;
}) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F8F1F3',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <View
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 34,
          padding: 28,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#E7F8EF',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
            borderWidth: 3,
            borderColor: '#35C989',
          }}
        >
          <Ionicons name="checkmark-circle" size={82} color="#35C989" />
        </View>

        <Text
          style={{
            fontSize: 34,
            fontWeight: '900',
            color: '#26232A',
            textAlign: 'center',
          }}
        >
          Order Confirmed!
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: '#777',
            textAlign: 'center',
            lineHeight: 24,
            marginTop: 12,
            marginBottom: 22,
          }}
        >
          Your 3DFV order has been placed successfully.
        </Text>

        <View
          style={{
            width: '100%',
            backgroundColor: '#FFF7F2',
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <MaterialCommunityIcons
            name="food-fork-drink"
            size={32}
            color="#35C989"
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '900',
                color: '#26232A',
              }}
            >
              3D Food Visualisation
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: '#777',
                lineHeight: 19,
                marginTop: 3,
              }}
            >
              Collect your order from the restaurant counter when it is ready.
            </Text>
          </View>
        </View>

        <Pressable
          style={{
            width: '100%',
            backgroundColor: '#35C989',
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={onBackHome}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: '900',
            }}
          >
            Back to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}