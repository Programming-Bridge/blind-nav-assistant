import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView,
  StatusBar, Alert, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// 🛑 REPLACE with your actual image path
const doctorIcon = require('../assets/images/doctor.png'); 

const API_KEY = "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";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Request Mic Permissions on load
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();

    setMessages([{
      id: "1",
      text: "Welcome! I am your AI Medical Assistant. I can listen and speak. How can I help?",
      isUser: false,
    }]);
  }, []);

  // --- 1. VOICE INPUT (Whisper) ---
  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!recording) return;
    setIsLoading(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setRecording(null);

    if (!uri) {
        setIsLoading(false);
        return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('model', 'whisper-large-v3-turbo'); 

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setInputText(data.text);
        sendMessage(data.text); 
      }
    } catch (error) {
      Alert.alert("Transcription Failed", "Could not understand audio.");
      setIsLoading(false);
    }
  };

  // --- 2. AI BRAIN (Llama) ---
  const sendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (textToSend.trim() === "") return;

    const userMsg: Message = { id: Date.now().toString(), text: textToSend, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a helpful, concise medical assistant. Keep answers brief for voice output." },
            { role: "user", content: textToSend }
          ]
        })
      });

      const data = await response.json();
      const aiResponseText = data.choices?.[0]?.message?.content || "No response.";

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
      }]);

      playTextToSpeech(aiResponseText);

    } catch (error) {
      Alert.alert("Connection Error", "AI is currently busy.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. VOICE OUTPUT (Orpheus) ---
  const playTextToSpeech = async (text: string) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "canopylabs/orpheus-v1-english",
          input: text,
          voice: "alloy",
        }),
      });

      if (!response.ok) throw new Error("TTS Failed");

      const fileUri = FileSystem.documentDirectory + 'speech.mp3';
      const audioBlob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
        
        const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        setSound(sound);
        await sound.playAsync();
      };

    } catch (error) {
      console.log("TTS Error:", error); 
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.isUser ? styles.userRow : styles.aiRow]}>
      {!item.isUser && <Image source={doctorIcon} style={styles.avatar} />}
      <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔹 CHANGED: Status bar to dark content (black text) because background is white */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Voice Doctor</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
            <TouchableOpacity 
                style={[styles.micBtn, recording && styles.micBtnActive]} 
                onPressIn={startRecording}
                onPressOut={stopRecordingAndTranscribe}
            >
                <Ionicons name={recording ? "mic" : "mic-outline"} size={24} color={recording ? "white" : "#666"} />
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type or hold mic..."
            />
          
            <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={20} color="white" />}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 🔹 UPDATED STYLES FOR WHITE THEME
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" }, // Changed Blue to White
  
  header: { 
    padding: 15, 
    backgroundColor: '#ffffff', // Changed Blue to White
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0' // Light grey border separator
  },
  
  headerTitle: { 
    color: '#333333', // Changed White text to Dark Grey
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  
  listContent: { padding: 15, paddingBottom: 30 },
  
  messageRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },

  avatar: { width: 35, height: 35, borderRadius: 17.5, marginRight: 8, backgroundColor: '#f0f0f0' },
  
  bubble: { maxWidth: "75%", padding: 12, borderRadius: 18 },
  
  // User Bubble (Red)
  userBubble: { backgroundColor: "#fe2238", borderBottomRightRadius: 2 },
  
  // 🔹 CHANGED: AI Bubble to Light Grey (since background is white, white bubble wouldn't show)
  aiBubble: { 
    backgroundColor: "#f2f2f2", // Light Grey for contrast
    borderBottomLeftRadius: 2 
  },

  messageText: { fontSize: 15, lineHeight: 20 },
  userText: { color: "white" },
  aiText: { color: "#333" },

  inputContainer: { 
      flexDirection: "row", 
      padding: 10, 
      backgroundColor: "#fff", 
      borderTopWidth: 1, 
      borderColor: "#eee",
      alignItems: 'center' 
  },
  micBtn: { 
      padding: 10, 
      marginRight: 5, 
      backgroundColor: '#f0f0f0', 
      borderRadius: 25,
      width: 45, height: 45,
      justifyContent: 'center', alignItems: 'center'
  },
  micBtnActive: {
      backgroundColor: '#fe2238', 
  },
  input: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 20, paddingHorizontal: 15, height: 40, marginRight: 10 },
  sendBtn: { backgroundColor: '#fe2238', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }
});