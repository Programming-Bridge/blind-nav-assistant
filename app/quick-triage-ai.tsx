import 'react-native-url-polyfill/auto';
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, 
  ScrollView, Alert, SafeAreaView, StatusBar, Dimensions 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import OpenAI from "openai";
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const HF_TOKEN = "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"; 

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN,
    dangerouslyAllowBrowser: true 
});

export default function QuickTriageAI() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const [compareMode, setCompareMode] = useState(false);
  const [previousPhotoBase64, setPreviousPhotoBase64] = useState<string | null>(null);
  const [showGhost, setShowGhost] = useState(false);
  const [ghostUri, setGhostUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  // 1️⃣ FUNCTIONS DEFINED FIRST (Fixes Hoisting Error)
  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('scan_history');
      if (data) setHistory(JSON.parse(data));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const saveToHistory = async (uri: string, result: any, base64: string) => {
    try {
      const newEntry = { id: Date.now(), date: new Date().toLocaleDateString(), uri, result, base64 };
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      await AsyncStorage.setItem('scan_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  // 2️⃣ USEEFFECT CALLED AFTER DEFINITIONS
  useEffect(() => { 
    loadHistory(); 
  }, []);

  // 🛡️ Permission Guard
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.iconCircleLarge}>
            <Ionicons name="camera" size={60} color="#fe2238" />
        </View>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSub}>We need to see the injury or condition to provide an AI assessment.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const processAndAnalyze = async (uri: string) => {
    try {
      setIsScanning(true);
      const manip = await ImageManipulator.manipulateAsync(
        uri, [{ resize: { width: 800 } }], 
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      setPhoto(manip.uri);
      if (compareMode && previousPhotoBase64) {
        analyzeComparison(previousPhotoBase64, manip.base64!);
      } else {
        analyzeUniversal(manip.base64!, manip.uri);
      }
    } catch (e) {
      Alert.alert("Error", "Image processing failed.");
      setIsScanning(false);
    }
  };

  const analyzeUniversal = async (base64: string, uri: string) => {
    try {
      const res = await client.chat.completions.create({
        model: "Qwen/Qwen3-VL-8B-Instruct",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this body feature. Categorize type (Allergy/Injury/Infection), Status (Critical/Urgent/Stable), and First Aid steps. Return ONLY JSON: { 'type': '', 'status': '', 'finding': '', 'first_aid': [] }" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
          ]
        }]
      });
      const content = res.choices[0].message.content!.replace(/```json|```/g, "").trim();
      const result = JSON.parse(content);
      setScanResult(result);
      saveToHistory(uri, result, base64);
    } catch (e) { 
      Alert.alert("AI Error", "Failed to parse analysis results."); 
    } finally { 
      setIsScanning(false); 
    }
  };

  const analyzeComparison = async (oldB64: string, newB64: string) => {
    try {
      const res = await client.chat.completions.create({
        model: "Qwen/Qwen3-VL-8B-Instruct",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Compare these two images. Image 1 is old, Image 2 is new. Is it Healing, Worsening, or Stable? Return JSON: { 'status': '', 'observations': '', 'advice': '' }" },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${oldB64}` } },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${newB64}` } }
          ]
        }]
      });
      const content = res.choices[0].message.content!.replace(/```json|```/g, "").trim();
      setScanResult(JSON.parse(content));
    } catch (e) { 
      Alert.alert("AI Error", "Comparison failed."); 
    } finally { 
      setIsScanning(false); 
      setCompareMode(false); 
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (data?.uri) processAndAnalyze(data.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0].uri) {
      processAndAnalyze(result.assets[0].uri);
    }
  };

  const startComparison = (item: any) => {
    setPreviousPhotoBase64(item.base64);
    setGhostUri(item.uri);
    setCompareMode(true);
    setPhoto(null);
    setScanResult(null);
    Alert.alert("Ghost Mode", "Align the transparent overlay with the current condition.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {!photo ? (
        <CameraView style={styles.camera} ref={cameraRef}>
          {showGhost && ghostUri && (
            <Image source={{ uri: ghostUri }} style={[StyleSheet.absoluteFill, { opacity: 0.4 }]} />
          )}
          <View style={styles.cameraUI}>
            {compareMode && (
              <TouchableOpacity onPress={() => setShowGhost(!showGhost)} style={styles.ghostBtn}>
                <Ionicons name={showGhost ? "eye-off" : "eye"} size={22} color="white" />
                <Text style={{color: 'white', marginLeft: 5}}> Ghost Mode</Text>
              </TouchableOpacity>
            )}
            <View style={styles.controls}>
              <TouchableOpacity onPress={pickImage} style={styles.sideBtn}>
                <Ionicons name="images" size={28} color="white" />
                <Text style={styles.sideBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePicture} style={styles.shutter} />
              {compareMode ? (
                 <TouchableOpacity onPress={() => setCompareMode(false)} style={styles.sideBtn}>
                    <Ionicons name="close-circle" size={28} color="#ff4444" />
                    <Text style={[styles.sideBtnText, {color: '#ff4444'}]}>Cancel</Text>
                 </TouchableOpacity>
              ) : <View style={{width: 60}} />}
            </View>
          </View>
        </CameraView>
      ) : (
        <ScrollView style={styles.resultView}>
          <Image source={{ uri: photo }} style={styles.preview} />
          {isScanning ? (
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#fe2238" />
                <Text style={styles.loadingText}>Qwen AI Analyzing...</Text>
            </View>
          ) : scanResult && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="medical" size={24} color="#fe2238" />
                    <Text style={styles.title}>{scanResult.type || scanResult.status}</Text>
                </View>
                <Text style={styles.finding}>{scanResult.finding || scanResult.observations}</Text>
                {scanResult.first_aid && (
                    <View style={styles.aidBox}>
                        <Text style={styles.aidTitle}>Immediate Action Steps:</Text>
                        {scanResult.first_aid.map((step: string, i: number) => (
                            <Text key={i} style={styles.aidStep}>• {step}</Text>
                        ))}
                    </View>
                )}
                <TouchableOpacity onPress={() => setPhoto(null)} style={styles.resetBtn}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Start New Scan</Text>
                </TouchableOpacity>
              </View>
          )}
        </ScrollView>
      )}

      <View style={styles.history}>
        <Text style={styles.historyTitle}>Scanning History</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {history.map(item => (
            <TouchableOpacity key={item.id} onPress={() => startComparison(item)} style={styles.histItem}>
                <Image source={{ uri: item.uri }} style={styles.historyThumb} />
                <Text style={styles.histDate}>{item.date}</Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  // 🛡️ Red Themed Permission Screen
  permissionContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconCircleLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff1f2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  permissionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  permissionSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
  permissionBtn: { backgroundColor: '#fe2238', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30 },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // 📸 Camera
  camera: { flex: 2 },
  cameraUI: { flex: 1, justifyContent: 'flex-end', paddingBottom: 30 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%' },
  shutter: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: 'white', borderWidth: 6, borderColor: 'rgba(254, 34, 56, 0.6)' },
  sideBtn: { alignItems: 'center', width: 60 },
  sideBtnText: { color: 'white', fontSize: 10, marginTop: 5, fontWeight: 'bold' },
  ghostBtn: { alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 20, flexDirection: 'row', marginBottom: 20 },
  // 📝 Red Result Card
  resultView: { flex: 1, backgroundColor: '#f8f9fa' },
  preview: { width: width, height: 350, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  loadingBox: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, fontWeight: 'bold', color: '#666' },
  card: { padding: 25, backgroundColor: 'white', margin: 15, borderRadius: 20, elevation: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: '#fe2238' }, // Tab color red
  finding: { fontSize: 16, color: '#555', lineHeight: 22, marginBottom: 20 },
  aidBox: { backgroundColor: '#fff1f2', padding: 15, borderRadius: 15, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#fe2238' },
  aidTitle: { fontWeight: 'bold', color: '#fe2238', marginBottom: 8 },
  aidStep: { color: '#333', marginBottom: 5, fontSize: 14 },
  resetBtn: { backgroundColor: '#fe2238', padding: 16, borderRadius: 15, alignItems: 'center' }, // Button red
  // 🕰️ History
  history: { height: 140, backgroundColor: '#1a1a1a', padding: 15 },
  historyTitle: { color: '#888', fontSize: 11, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  histItem: { marginRight: 15, alignItems: 'center' },
  historyThumb: { width: 65, height: 65, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  histDate: { color: '#666', fontSize: 10, marginTop: 5 }
});