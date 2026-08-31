import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '@/components/firebase'; // Ensure this path is 100% correct
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserProfile() {
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phoneNumber || '');
        setProfileImage(data.profilePic || null);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Enable gallery access in settings.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1, // High compression to stay under 1MB Firestore limit
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Img);
      // If we aren't in edit mode, save the photo immediately
      if (!isEditing) {
        saveProfileToFirebase(base64Img);
      }
    }
  };

  const saveProfileToFirebase = async (passedImg?: string) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      const userRef = doc(db, "users", user.uid);
      
      // Map state to your exact Firebase field names
      const updateData: any = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phone,
        profilePic: passedImg || profileImage || ""
      };

      await updateDoc(userRef, updateData);
      
      // Update local UI state
      setUserData({ ...userData, ...updateData });
      setIsEditing(false);
      Alert.alert("Updated", "Profile changes saved!");
    } catch (error: any) {
      console.error("Save Error:", error);
      Alert.alert("Error", error.message || "Could not save changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Confirm Logout?", [
      { text: "Cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          try {
            await signOut(auth);
            await AsyncStorage.clear();
          } catch (e) {
            Alert.alert("Error", "Logout failed.");
          }
        } 
      }
    ]);
  };

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fe2238" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, styles.placeholder]}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {isEditing ? (
          <View style={styles.editForm}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={() => saveProfileToFirebase()}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setIsEditing(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.userName}>{userData?.firstName} {userData?.lastName}</Text>
            <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditing(true)}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!isEditing && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={styles.row}>
              <Ionicons name="log-out-outline" size={24} color="#fe2238" />
              <Text style={[styles.settingText, { color: '#fe2238' }]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 5 },
  imageWrapper: { position: 'relative', marginBottom: 15 },
  profilePic: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#f4f6f8' },
  placeholder: { backgroundColor: '#fe2238', justifyContent: 'center', alignItems: 'center' },
  cameraBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#333', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777' },
  editProfileBtn: { marginTop: 20, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 25, borderWidth: 1.5, borderColor: '#fe2238' },
  editBtnText: { color: '#fe2238', fontWeight: 'bold' },
  editForm: { width: '85%' },
  label: { fontSize: 12, color: '#999', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#f4f6f8', padding: 14, borderRadius: 12, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', flex: 0.48 },
  saveBtn: { backgroundColor: '#27ae60' },
  cancelBtn: { backgroundColor: '#999' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  section: { padding: 25 },
  settingRow: { backgroundColor: '#fff', padding: 18, borderRadius: 18, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingText: { fontSize: 16, marginLeft: 15, fontWeight: '600' }
});