import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, AvatarFallbackText, AvatarImage } from './ui/avatar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Import auth
import { signOut } from 'firebase/auth';

export default function CustomHeader() {
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Direct fetch using UID is faster than a query
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching header user data:', error);
      }
    }
  };

  const handleProfileClick = () => {
    setDropdownVisible(false);
    router.push('/profile' as any);
  };

  const handleLogoutClick = () => {
    setDropdownVisible(false);
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            await AsyncStorage.clear();
            // Layout guard handles redirect
          } catch (e) {
            Alert.alert("Error", "Logout failed.");
          }
        } 
      }
    ]);
  };

  return (
    <View style={styles.header}>
      <Text style={styles.logo}>QuickFirstAid</Text>

      <View style={styles.avatarWrapper}>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          activeOpacity={0.7}
        >
          <Avatar size="md" style={styles.avatar}>
            <AvatarFallbackText>
              {userDetails?.firstName ? userDetails.firstName[0] : 'U'}
            </AvatarFallbackText>
            <AvatarImage
              source={{
                uri: userDetails?.profilePic || 'https://via.placeholder.com/150',
              }}
            />
          </Avatar>
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdown}>
            <View style={styles.userInfoArea}>
               <Text style={styles.userNameText}>{userDetails?.firstName || 'User'}</Text>
               <Text style={styles.userEmailText}>{auth.currentUser?.email}</Text>
            </View>
            <TouchableOpacity onPress={handleProfileClick} style={styles.dropdownItem}>
              <Text style={styles.dropdownText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogoutClick} style={[styles.dropdownItem, { borderBottomWidth: 0 }]}>
              <Text style={[styles.dropdownText, { color: '#fe2238', fontWeight: 'bold' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20, // Adjusted for status bar area
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 4,
    zIndex: 10,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fe2238',
  },
  avatarWrapper: {
    position: 'relative',
    zIndex: 20,
  },
  avatar: {
    backgroundColor: '#fe2238',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 5,
    width: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userInfoArea: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  userNameText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  userEmailText: {
    fontSize: 11,
    color: '#888',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 15,
    color: '#444',
  },
});