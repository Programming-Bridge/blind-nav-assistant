import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert, Share, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';

// 🇵🇰 CALIBRATED EMERGENCY CONTACTS
const EMERGENCY_CONTACTS = [
  { id: 1, name: "Rescue (Ambulance)", number: "1122", icon: "medical", color: "#fe2238" },
  { id: 2, name: "Police Emergency", number: "15", icon: "shield", color: "#34495e" },
  { id: 3, name: "Edhi Ambulance", number: "115", icon: "bandage", color: "#e67e22" },
  { id: 4, name: "Fire Brigade", number: "16", icon: "flame", color: "#c0392b" },
];

export default function EmergencyScreen() {
  const router = useRouter();
  const [locationLoading, setLocationLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [lastShake, setLastShake] = useState(0);

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const _subscribe = () => {
    // 100ms interval for fast detection
    Accelerometer.setUpdateInterval(100);
    setSubscription(
      Accelerometer.addListener(data => {
        const { x, y, z } = data;
        // Calculate G-Force magnitude
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        
        // CALIBRATION: 2.7 ignores slow movement but catches firm shakes
        const SHAKE_THRESHOLD = 2.7; 
        const now = Date.now();

        if (magnitude > SHAKE_THRESHOLD && (now - lastShake > 2000)) {
          setLastShake(now);
          handleShakeDetected();
        }
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const handleShakeDetected = () => {
    Vibration.vibrate([0, 500, 200, 500]); // Pattern: Wait, long, short, long
    Alert.alert(
      "🚨 SOS SHAKE DETECTED",
      "Would you like to call Rescue 1122 immediately?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "CALL 1122", onPress: () => makeCall("1122"), style: "destructive" }
      ]
    );
  };

  const makeCall = (number: string) => {
    const url = `tel:${number}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Dialer could not be opened."));
  };

  const shareLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is needed to share SOS.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      // ✅ FIXED: Correct Google Maps link format
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${loc.coords.latitude},${loc.coords.longitude}`;
      const message = `🚨 EMERGENCY! I need help. My current location: ${mapUrl}`;

      await Share.share({ message });
    } catch (error) {
      Alert.alert("Error", "Could not fetch GPS data.");
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SOS Button Area */}
        <TouchableOpacity style={styles.sosButton} onPress={() => makeCall("1122")}>
          <View style={styles.sosCircle}>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubText}>SHAKE OR TAP</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Emergency Helplines</Text>
        {EMERGENCY_CONTACTS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => makeCall(item.number)}>
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={[styles.cardNumber, { color: item.color }]}>{item.number}</Text>
            </View>
            <Ionicons name="call" size={24} color="#4cd137" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shared Location Footer */}
      <TouchableOpacity style={styles.footerBtn} onPress={shareLocation} disabled={locationLoading}>
        <Ionicons name="location" size={24} color="white" />
        <Text style={styles.footerBtnText}>{locationLoading ? "Fetching GPS..." : "Share Live Location"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fe2238' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: 'white' },
  content: { padding: 20, paddingBottom: 100 },
  sosButton: { alignSelf: 'center', marginBottom: 30 },
  sosCircle: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#fe2238', justifyContent: 'center', alignItems: 'center',
    elevation: 8, borderWidth: 5, borderColor: '#ffcccc'
  },
  sosText: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  sosSubText: { fontSize: 10, color: 'white', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2
  },
  iconBox: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardName: { fontSize: 15, fontWeight: 'bold' },
  cardNumber: { fontSize: 17, fontWeight: 'bold' },
  footerBtn: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: '#fe2238', padding: 18, borderRadius: 30,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  footerBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});