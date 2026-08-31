import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Alert, SafeAreaView, StatusBar, Image, Switch, Linking 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function MedicalID() {
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [data, setData] = useState({
    name: '',
    dob: '',
    bloodType: '',
    weight: '',
    height: '',
    allergies: '',
    conditions: '',
    emergencyContact: '',
    isOrganDonor: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('medical_id_data');
      const savedImage = await AsyncStorage.getItem('medical_id_photo');
      if (savedData) setData(JSON.parse(savedData));
      if (savedImage) setImage(savedImage);
    } catch (e) {
      console.log('Failed to load');
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('medical_id_data', JSON.stringify(data));
      if (image) await AsyncStorage.setItem('medical_id_photo', image);
      setIsEditing(false);
      Alert.alert("Saved", "Your Medical ID is updated.");
    } catch (e) {
      Alert.alert("Error", "Could not save data.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const dialEmergency = () => {
    if (data.emergencyContact) {
      Linking.openURL(`tel:${data.emergencyContact}`);
    } else {
      Alert.alert("No Contact", "Please edit and add an emergency number.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#fe2238" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical ID</Text>
        <TouchableOpacity 
          style={styles.editBtnContainer}
          onPress={() => isEditing ? saveData() : setIsEditing(true)}
        >
          <Text style={styles.editBtn}>{isEditing ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* 🪪 DIGITAL ID CARD VISUAL */}
        <View style={styles.idCard}>
          <View style={styles.cardTopRow}>
            {/* Photo Section */}
            <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
              {image ? (
                <Image source={{ uri: image }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={40} color="#ccc" />
                  {isEditing && <Text style={styles.addPhotoText}>+ Photo</Text>}
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.cardLabel}>EMERGENCY MEDICAL ID</Text>
              <Text style={styles.nameText}>{data.name || "YOUR NAME"}</Text>
              <Text style={styles.dobText}>DOB: {data.dob || "--/--/----"}</Text>
            </View>
            
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodTitle}>BLOOD</Text>
              <Text style={styles.bloodValue}>{data.bloodType || "?"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>HEIGHT</Text>
              <Text style={styles.statValue}>{data.height || "-"}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>WEIGHT</Text>
              <Text style={styles.statValue}>{data.weight || "-"}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ORGAN DONOR</Text>
              <Text style={[styles.statValue, { color: data.isOrganDonor ? '#fe2238' : '#999' }]}>
                {data.isOrganDonor ? "YES" : "NO"}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>MEDICAL CONDITIONS</Text>
            <Text style={styles.infoValue}>{data.conditions || "None listed"}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>ALLERGIES & REACTIONS</Text>
            <Text style={[styles.infoValue, { color: '#fe2238' }]}>{data.allergies || "None listed"}</Text>
          </View>

          {/* Emergency Call Button */}
          <TouchableOpacity style={styles.callButton} onPress={dialEmergency} activeOpacity={0.8}>
            <View style={styles.callIconBox}>
               <Ionicons name="call" size={20} color="white" />
            </View>
            <View>
              <Text style={styles.callLabel}>EMERGENCY CONTACT</Text>
              <Text style={styles.callNumber}>{data.emergencyContact || "Tap Edit to Add"}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ✏️ EDIT FORM */}
        {isEditing && (
          <View style={styles.form}>
            <Text style={styles.sectionHeader}>Personal Details</Text>
            <TextInput style={styles.input} value={data.name} onChangeText={(t) => setData({...data, name: t})} placeholder="Full Name" />
            <TextInput style={styles.input} value={data.dob} onChangeText={(t) => setData({...data, dob: t})} placeholder="Date of Birth (DD/MM/YYYY)" />
            
            <View style={styles.rowInputs}>
              <TextInput style={[styles.input, {flex: 1, marginRight: 5}]} value={data.height} onChangeText={(t) => setData({...data, height: t})} placeholder="Height (e.g. 5'9)" />
              <TextInput style={[styles.input, {flex: 1, marginLeft: 5}]} value={data.weight} onChangeText={(t) => setData({...data, weight: t})} placeholder="Weight (e.g. 70kg)" />
            </View>

            <Text style={styles.sectionHeader}>Medical Info</Text>
            <TextInput style={styles.input} value={data.bloodType} onChangeText={(t) => setData({...data, bloodType: t})} placeholder="Blood Type (e.g. O+)" />
            <TextInput style={styles.input} value={data.conditions} onChangeText={(t) => setData({...data, conditions: t})} placeholder="Conditions (Diabetes, etc.)" />
            <TextInput style={styles.input} value={data.allergies} onChangeText={(t) => setData({...data, allergies: t})} placeholder="Allergies (Peanuts, Penicillin)" />

            <Text style={styles.sectionHeader}>Emergency Contact</Text>
            <TextInput style={styles.input} value={data.emergencyContact} onChangeText={(t) => setData({...data, emergencyContact: t})} placeholder="Phone Number" keyboardType="phone-pad" />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Organ Donor?</Text>
              <Switch 
                value={data.isOrganDonor} 
                onValueChange={(val) => setData({...data, isOrganDonor: val})} 
                trackColor={{ false: "#767577", true: "#fe2238" }}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveData}>
              <Text style={styles.saveText}>Save Information</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: { 
    backgroundColor: '#fe2238', padding: 20, paddingTop: 50, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  editBtnContainer: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20 },
  editBtn: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  scroll: { padding: 20 },

  // 🪪 ID CARD STYLES
  idCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 0,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 15, elevation: 5,
    marginBottom: 20, overflow: 'hidden'
  },
  cardTopRow: { flexDirection: 'row', padding: 20, paddingBottom: 15 },
  photoPlaceholder: { 
    width: 80, height: 80, borderRadius: 12, backgroundColor: '#f0f0f0', 
    justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc'
  },
  profilePhoto: { width: 80, height: 80, borderRadius: 12 },
  addPhotoText: { fontSize: 10, color: '#fe2238', marginTop: 5, fontWeight: 'bold' },
  headerInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  cardLabel: { fontSize: 10, color: '#fe2238', fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  dobText: { fontSize: 14, color: '#666', marginTop: 2 },
  bloodBadge: { 
    backgroundColor: '#fff0f1', width: 60, height: 60, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fe2238'
  },
  bloodTitle: { fontSize: 8, color: '#fe2238', fontWeight: 'bold' },
  bloodValue: { fontSize: 20, color: '#fe2238', fontWeight: '900' },

  divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 20 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fafafa' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  infoSection: { paddingHorizontal: 20, marginBottom: 15 },
  infoLabel: { fontSize: 11, color: '#999', fontWeight: 'bold', marginBottom: 4 },
  infoValue: { fontSize: 16, color: '#333', fontWeight: '500' },

  callButton: { 
    margin: 20, marginTop: 10, backgroundColor: '#fe2238', borderRadius: 15, 
    padding: 15, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#fe2238', shadowOpacity: 0.4, shadowRadius: 8, elevation: 5
  },
  callIconBox: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15 
  },
  callLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' },
  callNumber: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // ✏️ FORM STYLES
  form: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 50 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 10 },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  rowInputs: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12 },
  switchLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  saveBtn: { backgroundColor: '#333', padding: 18, borderRadius: 15, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});