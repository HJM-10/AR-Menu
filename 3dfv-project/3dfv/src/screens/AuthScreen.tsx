import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

export default function AuthScreen({
  authTab,
  setAuthTab,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isAdmin,
  loading,
  errorMessage,
  promptMessage,
  onContinue,
  onGoogleContinue,
  onCancel,
  googleLoading,
  googleDisabled,
}: {
  authTab: 'login' | 'signup';
  setAuthTab: (tab: 'login' | 'signup') => void;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  isAdmin: boolean;
  loading?: boolean;
  errorMessage?: string;
  promptMessage?: string;
  onContinue: () => void;
  onGoogleContinue: () => void;
  onCancel?: () => void;
  googleLoading?: boolean;
  googleDisabled?: boolean;
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authWrap}>
          <Text style={styles.bigTitle}>{authTab === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.mutedText}>
            {promptMessage || 'Login to start ordering.'}
          </Text>
          
          {!!errorMessage && (
            <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginTop: 10 }}>
              <Text style={{ color: '#EF4444' }}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.tabs}>
            <Pressable style={[styles.tab, authTab === 'login' && styles.activeTab]} onPress={() => setAuthTab('login')}>
              <Text style={[styles.tabText, authTab === 'login' && styles.activeTabText]}>Login</Text>
            </Pressable>
            <Pressable style={[styles.tab, authTab === 'signup' && styles.activeTab]} onPress={() => setAuthTab('signup')}>
              <Text style={[styles.tabText, authTab === 'signup' && styles.activeTabText]}>Signup</Text>
            </Pressable>
          </View>
          {authTab === 'signup' && <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />}
          <TextInput value={email} onChangeText={setEmail} placeholder="Email address" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
          <View style={styles.passwordWrap}>
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPassword} style={styles.passwordInput} />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
            </Pressable>
          </View>
          <Pressable
            style={[styles.googleBtn, (googleLoading || googleDisabled) && styles.disabledBtn]}
            onPress={onGoogleContinue}
            disabled={googleLoading || googleDisabled}
          >
            {googleLoading ? (
              <ActivityIndicator color="#333" />
            ) : (
              <Ionicons name="logo-google" size={20} color="#333" />
            )}
            <Text style={styles.googleText}>
              {googleDisabled ? 'Configure Google client ID' : 'Continue with Google'}
            </Text>
          </Pressable>
          <Pressable style={[styles.primaryBtn, loading && styles.disabledBtn]} onPress={onContinue} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>{isAdmin ? 'Continue as Admin' : 'Continue'}</Text>
            )}
          </Pressable>
          {!!onCancel && (
            <Pressable style={styles.secondaryBtn} onPress={onCancel}>
              <Text style={styles.secondaryBtnText}>Continue browsing</Text>
            </Pressable>
          )}
          {isAdmin && <Text style={styles.adminHint}>Admin access detected for this email.</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
