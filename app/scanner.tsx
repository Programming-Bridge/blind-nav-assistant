// 1️⃣ CRITICAL FIX: Add this import at the very top!
import 'react-native-url-polyfill/auto'; 

import React, { useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, 
  ScrollView, Alert, SafeAreaView, StatusBar 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import OpenAI from "openai"; 
import * as ImageManipulator from 'expo-image-manipulator'; 
import * as ImagePicker from 'expo-image-picker'; // 🖼️ NEW IMPORT

const HF_TOKEN = "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"; 

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN,
    dangerouslyAllowBrowser: true 
});

export default function MedicineScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={100} color="#fe2238" />
        <Text style={styles.permissionText}>We need to see the medicine box.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🛠️ SHARED IMAGE PROCESSING LOGIC
  const processImage = async (uri: string) => {
    try {
      setIsScanning(true);
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }], 
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      setPhoto(manipulatedImage.uri);

      if (manipulatedImage.base64) {
        analyzeWithQwen(manipulatedImage.base64);
      }
    } catch (error) {
      Alert.alert("Processing Error", "Could not process image.");
      setIsScanning(false);
    }
  };

  // 📸 CAPTURE FROM CAMERA
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: true, 
        });
        if (data?.uri) processImage(data.uri);
      } catch (error) {
        Alert.alert("Camera Error", "Could not take photo.");
      }
    }
  };

  // 📁 UPLOAD FROM GALLERY
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      processImage(result.assets[0].uri);
    }
  };

  const analyzeWithQwen = async (base64Image: string) => {
    setScanResult(null);
    try {
      const chatCompletion = await client.chat.completions.create({
        model: "Qwen/Qwen3-VL-8B-Instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this medicine packaging. Extract the following information and return ONLY a raw JSON object: 'name', 'usage' (max 10 words), 'dosage' (max 10 words), 'warning' (max 5 words). If info is missing, use 'Unknown'. No markdown, no conversational text.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.01,
      });

      const content = chatCompletion.choices[0].message.content;
      if (content) {
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        setScanResult(JSON.parse(cleanJson));
      }
    } catch (error: any) {
      Alert.alert("Scan Failed", "Qwen could not read this label.");
      setPhoto(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {!photo ? (
        <CameraView style={styles.camera} ref={cameraRef} facing="back">
          <View style={styles.overlay}>
            <Text style={styles.guideText}>Capture or Upload Medicine</Text>
            
            <View style={styles.buttonRow}>
              {/* GALLERY BUTTON */}
              <TouchableOpacity onPress={pickImage} style={styles.iconCircle}>
                <Ionicons name="images" size={28} color="#fff" />
              </TouchableOpacity>

              {/* SHUTTER BUTTON */}
              <TouchableOpacity onPress={takePicture} style={styles.shutter}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              {/* SPACER FOR SYMMETRY */}
              <View style={styles.iconCircle} />
            </View>
          </View>
        </CameraView>
      ) : (
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <Image source={{ uri: photo }} style={styles.preview} />
          
          {isScanning ? (
            <View style={styles.analyzingBox}>
              <ActivityIndicator size="large" color="#fe2238" />
              <Text style={styles.analyzingText}>Qwen AI is Reading...</Text>
            </View>
          ) : scanResult ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="medkit" size={32} color="#fe2238" />
                <Text style={styles.medTitle}>{scanResult.name || "Unknown"}</Text>
              </View>
              <View style={styles.divider} />
              <InfoRow icon="thermometer" color="#fe2238" title="Usage" desc={scanResult.usage} />
              <InfoRow icon="time" color="#27AE60" title="Dosage" desc={scanResult.dosage} />
              <InfoRow icon="warning" color="#E67E22" title="Warning" desc={scanResult.warning} />
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.resetBtn}>
                <Text style={styles.resetText}>New Scan</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, color, title, desc }: any) => (
  <View style={styles.visualRow}>
    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <View style={styles.textCol}>
      <Text style={styles.boldText}>{title}</Text>
      <Text style={styles.subText}>{desc || "Not found"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  guideText: { color: '#fff', fontSize: 18, marginBottom: 30, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%' },
  shutter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', padding: 5 },
  shutterInner: { flex: 1, borderRadius: 35, borderWidth: 3, borderColor: '#fe2238' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  resultScroll: { backgroundColor: '#f5f5f5', minHeight: '100%' },
  preview: { width: '100%', height: 350 },
  analyzingBox: { alignItems: 'center', marginTop: 50 },
  analyzingText: { marginTop: 15, fontSize: 18, color: '#333', fontWeight: 'bold' },
  resultCard: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 20, elevation: 5 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  medTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginLeft: 10, flexShrink: 1 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  visualRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textCol: { flex: 1 },
  boldText: { fontSize: 14, fontWeight: 'bold', color: '#888', textTransform: 'uppercase' },
  subText: { fontSize: 16, color: '#333', fontWeight: '500', lineHeight: 22 },
  resetBtn: { backgroundColor: '#333', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  resetText: { color: '#fff', fontWeight: 'bold' },
  permissionText: { fontSize: 16, marginBottom: 20 },
  btn: { backgroundColor: '#fe2238', padding: 10, borderRadius: 8 },
  btnText: { color: '#fff' }
});