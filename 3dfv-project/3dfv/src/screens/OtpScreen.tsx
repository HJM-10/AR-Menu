import React, { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OtpScreen({
  email,
  otp,
  onBack,
  onVerify,
  onResend,
}: {
  email: string;
  otp: string;
  onBack: () => void;
  onVerify: () => void;
  onResend: () => void;
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, '');

    const newDigits = [...digits];
    newDigits[index] = cleanValue.slice(-1);
    setDigits(newDigits);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (value: string, index: number) => {
    if (value === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = () => {
    const enteredOtp = digits.join('');

    if (enteredOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6 digit OTP.');
      return;
    }

    if (enteredOtp !== otp) {
      Alert.alert('Wrong OTP', 'The OTP you entered is incorrect.');
      return;
    }

    Alert.alert('Success', 'OTP verified successfully!');
    onVerify();
  };

  const resendOtp = () => {
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    onResend();
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.container}>
        <Pressable onPress={onBack} style={s.backButton}>
          <Ionicons name="arrow-back" size={26} color="#2B3037" />
        </Pressable>

        <View style={s.iconCircle}>
          <Ionicons name="mail-open-outline" size={42} color="#fff" />
        </View>

        <Text style={s.title}>OTP Verification</Text>

        <Text style={s.subtitle}>
          Enter the 6 digit code sent to your email
        </Text>

        <Text style={s.emailText}>{email}</Text>

        <View style={s.otpRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace(digit, index);
                }
              }}
              style={s.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <Pressable style={s.verifyButton} onPress={verifyOtp}>
          <Text style={s.verifyText}>Verify OTP</Text>
        </Pressable>

        <Pressable onPress={resendOtp}>
          <Text style={s.resendText}>Resend OTP</Text>
        </Pressable>

        <Text style={s.demoText}>Demo OTP: {otp}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF7F2',
  },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 30,
    backgroundColor: '#FFF7F2',
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 35,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF3D12',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6D7C8F',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 23,
  },
  emailText: {
    fontSize: 16,
    color: '#2B3037',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 30,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D8E0',
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  verifyButton: {
    height: 62,
    backgroundColor: '#FF3D12',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  verifyText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  resendText: {
    color: '#FF3D12',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 24,
  },
  demoText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  },
});