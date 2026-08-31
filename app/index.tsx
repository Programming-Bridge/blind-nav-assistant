import 'react-native-url-polyfill/auto'; 
import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, Image, 
  StyleSheet, SafeAreaView, ImageSourcePropType, 
  StatusBar, Alert 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from '@/components/firebase'; 
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// 🎨 VIVID MEDIUM RED COLOR CONSTANT
const THEME_RED = "#e60000"; 
const LIGHT_RED = "#fff0f0"; // Subtle background for header icons

// 🖼️ FEATURE IMAGES
const doctorImg = require('../assets/images/doctor.png');
const scanImg = require('../assets/images/scanner.png');
const mapImg = require('../assets/images/map.png');
const sosImg = require('../assets/images/sos.png');
const manualImg = require('../assets/images/manual.png');
const voiceImg = require('../assets/images/voice.png');
const triageImg = require('../assets/images/triage.png'); 
const medicalIdImg = require('../assets/images/medical_id.png'); 
const appLogo = require('../assets/icon.png');

interface FeatureCardProps {
  title: string;
  desc: string;
  imageSource: ImageSourcePropType;
  btnText: string;
  onPress: () => void;
}

export default function Index() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");

  // 👤 FETCH USER DATA
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) setUserName(snap.data().firstName || "User");
        } catch (error) { console.log("User fetch error:", error); }
      }
    };
    fetchUser();
  }, []);

  // 🚪 LOGOUT LOGIC
  const handleLogout = async () => {
    Alert.alert("Logout", "Confirm log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", onPress: async () => {
          try {
            await signOut(auth); 
            await AsyncStorage.removeItem('userEmail'); 
            router.replace('/(auth)/login' as any); 
          } catch (e) { Alert.alert("Error", "Logout failed."); }
      }, style: "destructive" }
    ]);
  };

  const FeatureCard = ({ title, desc, imageSource, btnText, onPress }: FeatureCardProps) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.featureImage} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{btnText}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerInfo} onPress={() => router.push('/profile' as any)}>
          <Image source={appLogo} style={styles.appIcon} />
          <View>
            <Text style={styles.welcomeText}>Salam, {userName}!</Text>
            <Text style={styles.subText}>Your Life-Saving Companion</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
            <Ionicons name="log-out-outline" size={24} color={THEME_RED} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          
          {/* 1. MEDICAL ID */}
          <FeatureCard 
            title="Medical ID"
            desc="Emergency info: Blood group, allergies, and contacts."
            imageSource={medicalIdImg} 
            btnText="Open ID"
            onPress={() => router.push('/medical_id' as any)}
          />

          {/* 2. AI DOCTOR */}
          <FeatureCard 
            title="AI Doctor"
            desc="Text-based AI guidance for medical symptoms."
            imageSource={doctorImg}
            btnText="Start Chat"
            onPress={() => router.push('/chat' as any)}
          />

          {/* 3. VOICE ASSISTANT */}
          <FeatureCard 
            title="Voice Assistant"
            desc="Hands-free medical help via voice interaction."
            imageSource={voiceImg}
            btnText="Voice Mode"
            onPress={() => router.push('/voice' as any)}
          />

          {/* 4. MEDICINE SCANNER */}
          <FeatureCard 
            title="Medicine Scanner"
            desc="Identify tablets and view dosages using camera."
            imageSource={scanImg}
            btnText="Scan Now"
            onPress={() => router.push('/scanner' as any)}
          />

          {/* 5. MEDICAL FACILITIES */}
          <FeatureCard 
            title="Medical Facilities"
            desc="Locate nearest hospitals and clinics on the map."
            imageSource={mapImg}
            btnText="Find Nearby"
            onPress={() => router.push('/map' as any)}
          />

          {/* 6. EMERGENCY CENTER */}
          <FeatureCard 
            title="Emergency Center"
            desc="One-tap SOS and quick dial to 1122."
            imageSource={sosImg}
            btnText="Panic Button"
            onPress={() => router.push('/emergency' as any)} 
          />

          {/* 7. QUICKTRIAGE AI */}
          <FeatureCard 
            title="QuickTriage AI"
            desc="AI scan for injuries and medical severity."
            imageSource={triageImg}
            btnText="Start Triage"
            onPress={() => router.push('/quick-triage-ai' as any)}
          />

          {/* 8. FIRST AID MANUAL */}
          <FeatureCard 
            title="First Aid Manual"
            desc="Step-by-step offline first aid instructions."
            imageSource={manualImg}
            btnText="Read Guide"
            onPress={() => router.push('/firstaid' as any)}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 30 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f0f0f0', paddingTop: 50 },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  headerActions: { flexDirection: 'row' },
  headerBtn: { padding: 10, borderRadius: 12, marginLeft: 8, backgroundColor: LIGHT_RED },
  appIcon: { width: 45, height: 45, borderRadius: 10, marginRight: 12 },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subText: { fontSize: 12, color: '#888' },
  grid: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, alignItems: 'center', elevation: 3, borderTopWidth: 5, borderTopColor: THEME_RED, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  imageContainer: { marginBottom: 10 },
  featureImage: { width: 90, height: 90, resizeMode: 'contain' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: THEME_RED },
  cardDesc: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 16 },
  button: { paddingVertical: 12, borderRadius: 25, width: '100%', alignItems: 'center', backgroundColor: THEME_RED },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});