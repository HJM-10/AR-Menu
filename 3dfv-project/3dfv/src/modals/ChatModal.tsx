import React, { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

export default function ChatModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hello! I am your AI Sommelier. Ask me what pairs well with your meal.' },
  ]);

  const send = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: 'you', text: message.trim() },
      { from: 'ai', text: 'Great choice! I recommend a citrus fizz or jasmine tea depending on spice level.' },
    ]);
    setMessage('');
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Sommelier Chat</Text>
          <Pressable onPress={onClose}><Ionicons name="close" size={26} color="#333" /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.chatList}>
          {messages.map((msg, index) => (
            <View key={index} style={[styles.bubble, msg.from === 'you' ? styles.youBubble : styles.aiBubble]}>
              <Text style={msg.from === 'you' ? styles.youBubbleText : styles.aiBubbleText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.chatInputRow}>
          <TextInput value={message} onChangeText={setMessage} placeholder="Ask Chef Jean-Pierre..." style={styles.chatInput} />
          <Pressable style={styles.sendBtn} onPress={send}><Ionicons name="send" size={20} color="#fff" /></Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
