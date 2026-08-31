import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HospitalMap() {

  const openMap = (query: string) => {
    // 🌍 Creates a universal map link
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`
    });
    
    // If geo scheme fails, fallback to web URL
    Linking.openURL(url || `https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Find Nearby Help</Text>
        <Text style={styles.subtitle}>Locate services using Google Maps</Text>
      </View>

      <View style={styles.grid}>
        
        {/* 🏥 HOSPITALS */}
        <TouchableOpacity style={styles.card} onPress={() => openMap('Hospitals near me')}>
          <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="medkit" size={32} color="#D32F2F" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Hospitals</Text>
            <Text style={styles.cardDesc}>Emergency Rooms & Trauma Centers</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={30} color="#D32F2F" />
        </TouchableOpacity>

        {/* 💊 PHARMACIES */}
        <TouchableOpacity style={styles.card} onPress={() => openMap('Pharmacy near me')}>
          <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="flask" size={32} color="#388E3C" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Pharmacies</Text>
            <Text style={styles.cardDesc}>Medicine & Medical Stores</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={30} color="#388E3C" />
        </TouchableOpacity>

        {/* 🩸 BLOOD BANKS */}
        <TouchableOpacity style={styles.card} onPress={() => openMap('Blood Bank near me')}>
          <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="water" size={32} color="#C62828" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Blood Banks</Text>
            <Text style={styles.cardDesc}>Donation Centers</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={30} color="#C62828" />
        </TouchableOpacity>

        {/* 🦷 DENTISTS */}
        <TouchableOpacity style={styles.card} onPress={() => openMap('Dentist near me')}>
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="person" size={32} color="#1976D2" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Clinics</Text>
            <Text style={styles.cardDesc}>General Physicians</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={30} color="#1976D2" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  
  grid: { gap: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#eee',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardDesc: { fontSize: 13, color: '#888' }
});