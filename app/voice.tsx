import 'react-native-url-polyfill/auto'; 
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Switch, Alert, ScrollView 
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer'; 
import OpenAI from "openai"; 

// 🛑 PASTE YOUR NEW KEY HERE (Starts with gsk_...)
const GROQ_API_KEY = "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"; 

const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

type LanguageKey = 'en' | 'ur' | 'pb';

export default function AudioAssistant() {
  const [lang, setLang] = useState<LanguageKey>('en'); 
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("Hold to Speak");
  const [aiText, setAiText] = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
    return () => { if (sound) sound.unloadAsync(); };
  }, [sound]);

  const getTranslation = (key: string) => {
    const translations: any = {
      idle: { en: 'Hold to Speak', ur: 'بولنے کے لیے دبائیں', pb: 'بولن لئی دباؤ' },
      thinking: { en: 'Thinking...', ur: 'سوچ رہا ہے...', pb: 'سوچ ریا اے...' },
      listening: { en: 'Listening...', ur: 'سن رہا ہوں...', pb: 'سن ریا واں...' },
    };
    return translations[key][lang];
  };

  async function stopPlayback() {
    if (sound) { await sound.stopAsync(); setIsPlaying(false); }
    Speech.stop();
  }

  async function startRecording() {
    try {
      await stopPlayback();
      setStatus(getTranslation('listening'));
      setAiText("");
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) { Alert.alert("Error", "Check microphone permissions."); }
  }

  async function stopRecording() {
    if (!recording) return;
    setStatus(getTranslation('thinking'));
    setIsProcessing(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    setRecording(null);
    if (uri) processQuery(uri);
  }

  const processQuery = async (audioUri: string) => {
    try {
      // 1. SPEECH TO TEXT
      const formData = new FormData();
      formData.append('file', { uri: audioUri, name: 'audio.m4a', type: 'audio/m4a' } as any);
      formData.append('model', 'whisper-large-v3-turbo');
      if (lang !== 'en') formData.append('language', 'ur'); // Whisper uses 'ur' for both Urdu and Punjabi Shahmukhi

      const sttRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: formData,
      });
      
      const sttData = await sttRes.json();
      if (!sttData.text) throw new Error("STT_FAILED");
      setStatus(`"${sttData.text}"`);

      // 2. LLM BRAIN (Doctor Persona)
      let systemPrompt = "You are a concise first aid doctor. 1 short sentence.";
      if (lang === 'ur') systemPrompt = "آپ ایک طبی ماہر ہیں۔ صرف اردو زبان اور اردو رسم الخط میں جواب دیں۔ جواب ایک جملے میں دیں۔";
      if (lang === 'pb') systemPrompt = "تسی ایک ماہر ڈاکٹر او۔ پنجابی زبان تے شاہ مکھی (اردو) رسم الخط وچ جواب دیو۔ جواب ایک جملے وچ دیو۔";

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: sttData.text }
        ],
        model: "llama-3.3-70b-versatile",
      });
      const answer = chatCompletion.choices[0].message.content || "";
      setAiText(answer);

      // 3. VOICE OUTPUT
      handleVoiceOutput(answer);

      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      setStatus("Error. Try again.");
      setIsProcessing(false);
    }
  };

  const handleVoiceOutput = async (text: string) => {
    try {
      // Orpheus English for English mode
      if (lang === 'en') {
        const ttsRes = await fetch("https://api.groq.com/openai/v1/audio/speech", {
          method: "POST",
          headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "canopylabs/orpheus-v1-english",
            input: text,
            voice: "hannah", 
            response_format: "mp3"
          }),
        });

        if (!ttsRes.ok) throw new Error();

        const arrayBuffer = await ttsRes.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        const filePath = `${FileSystem.cacheDirectory}speech.mp3`;
        await FileSystem.writeAsStringAsync(filePath, base64Audio, { encoding: FileSystem.EncodingType.Base64 });

        const { sound: newSound } = await Audio.Sound.createAsync({ uri: filePath }, { shouldPlay: true });
        setSound(newSound);
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((s: AVPlaybackStatus) => { 
          if (s.isLoaded && s.didJustFinish) setIsPlaying(false); 
        });
      } else {
        throw new Error("Using Native for Urdu/Punjabi");
      }
    } catch (e) {
      // 🚀 FALLBACK: Native Speech (Perfect for Urdu/Punjabi script)
      setIsPlaying(true);
      Speech.speak(text, {
        language: lang === 'en' ? 'en-US' : 'ur-PK',
        rate: 0.9,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Language Switcher */}
      <View style={styles.langRow}>
        {(['en', 'ur', 'pb'] as LanguageKey[]).map((l) => (
          <TouchableOpacity key={l} style={[styles.langBtn, lang === l && styles.activeLang]} onPress={() => setLang(l)}>
            <Text style={[styles.langText, lang === l && styles.activeLangText]}>
                {l === 'en' ? 'ENGLISH' : l === 'ur' ? 'اردو' : 'پنجابی'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mainContent}>
        {/* Animated Icon */}
        <View style={[styles.circleBtn, (isProcessing || isPlaying) && { borderColor: "#fe2238" }]}>
            <Ionicons name={isProcessing ? "hourglass" : isPlaying ? "volume-high" : "pulse"} size={50} color="#fe2238" />
        </View>

        <ScrollView contentContainerStyle={styles.textContainer}>
            <Text style={styles.statusText}>{status}</Text>
            {aiText ? <Text style={styles.aiText}>{aiText}</Text> : null}
        </ScrollView>

        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.micBtn, recording && styles.recording]} 
            onPressIn={startRecording} 
            onPressOut={stopRecording}
          >
              <Ionicons name={recording ? "mic" : "mic-outline"} size={50} color="white" />
          </TouchableOpacity>

          {isPlaying && (
            <TouchableOpacity onPress={stopPlayback}>
              <Ionicons name="stop-circle" size={70} color="#fe2238" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.hint}>{getTranslation('idle')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  langRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 },
  langBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f0f0f0' },
  activeLang: { backgroundColor: '#fe2238' },
  langText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  activeLangText: { color: '#fff' },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circleBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#f0f0f0', elevation: 4, marginBottom: 20 },
  textContainer: { paddingHorizontal: 30, marginVertical: 20, alignItems: 'center', width: '100%' },
  statusText: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  aiText: { color: '#333', fontSize: 22, fontWeight: 'bold', textAlign: 'center', lineHeight: 32 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 30, height: 100 },
  micBtn: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fe2238', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  recording: { backgroundColor: '#333', transform: [{ scale: 1.1 }] },
  hint: { color: '#aaa', marginTop: 10, fontSize: 12, textTransform: 'uppercase' }
});