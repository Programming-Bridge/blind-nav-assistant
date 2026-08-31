import { StyleSheet, Text, View, Image, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { Grid, GridItem } from '@/components/ui/grid'
import { Card } from '@/components/ui/card'
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon'
import { Button, ButtonText } from "@/components/ui/button"
import { Link, useRouter } from 'expo-router';
import { auth, db } from '@/components/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore'
import { Spinner } from '@/components/ui/spinner'

// 🖼️ Correct relative path from app/(auth)/register.tsx
const appLogo = require('../../assets/icon.png');

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form States
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleState = () => setShowPassword((showState) => !showState)

  // 🛡️ Real-time Security Logic
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleCreateAccount = async () => {
    // Basic Validation
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields to continue.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Map Auth UID to Firestore Document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email.toLowerCase().trim(),
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber || 'N/A',
        profilePic: null, // Initialized for the Profile Screen
        createdAt: new Date().toISOString()
      });

      // 3. Store local session indicator
      await AsyncStorage.setItem('userEmail', email);
      
      // 4. Redirect to main dashboard
      router.replace('/');
      
    } catch (error: any) {
      let msg = "Could not create account.";
      if (error.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      Alert.alert("Registration Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingCenter}>
        <Spinner size="large" color={'#fe2238'} />
        <Text style={styles.loadingText}>Securing Your Account...</Text>
      </View>
    )
  }

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{backgroundColor: '#F4F6F8'}}>
      <Grid _extra={{ className: 'flex-1' }}>
        <GridItem _extra={{ className: 'col-span-12' }}>
          <Card size='lg' variant='filled' className='bg-white mt-10 mb-10 mx-4' style={styles.card}>
            
            <View style={styles.logoSection}>
              <Image source={appLogo} style={styles.logo} />
              <Text style={styles.title}>QuickFirstAid</Text>
            </View>

            <Text style={styles.subtitle}>Create Your Profile</Text>

            <FormControl size='lg' isRequired={true}>
              <FormControlLabel><FormControlLabelText>First Name</FormControlLabelText></FormControlLabel>
              <Input><InputField placeholder='First name' value={firstName} onChangeText={setFirstName} /></Input>

              <FormControlLabel className='mt-4'><FormControlLabelText>Last Name</FormControlLabelText></FormControlLabel>
              <Input><InputField placeholder='Last name' value={lastName} onChangeText={setLastName} /></Input>

              <FormControlLabel className='mt-4'><FormControlLabelText>Email Address</FormControlLabelText></FormControlLabel>
              <Input>
                <InputField 
                  placeholder='email@example.com' 
                  autoCapitalize='none' 
                  keyboardType="email-address"
                  value={email} 
                  onChangeText={setEmail} 
                />
              </Input>

              {/* 🔐 Password Logic */}
              <FormControlLabel className='mt-4'><FormControlLabelText>Password</FormControlLabelText></FormControlLabel>
              <Input>
                <InputField 
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 8 characters" 
                  value={password} 
                  onChangeText={setPassword} 
                />
                <InputSlot className="pr-3" onPress={handleState}>
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
              
              <View style={styles.securityHintRow}>
                <View style={[styles.strengthBar, { backgroundColor: isPasswordValid ? '#27ae60' : '#ccc' }]} />
                <Text style={[styles.hintText, { color: isPasswordValid ? '#27ae60' : '#999' }]}>
                  {isPasswordValid ? 'Strength: OK' : 'Must be 8+ characters'}
                </Text>
              </View>

              <FormControlLabel className='mt-4'><FormControlLabelText>Confirm Password</FormControlLabelText></FormControlLabel>
              <Input>
                <InputField 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Repeat password" 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                />
              </Input>

              {password !== '' && confirmPassword !== '' && (
                <Text style={[styles.matchText, { color: passwordsMatch ? '#27ae60' : '#fe2238' }]}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
              )}
            </FormControl>

            <View style={{ marginTop: 30 }}>
              <Button 
                size="lg" 
                style={{ backgroundColor: (isPasswordValid && passwordsMatch) ? '#fe2238' : '#ccc', borderRadius: 12 }} 
                onPress={handleCreateAccount}
                disabled={!isPasswordValid || !passwordsMatch}
              >
                <ButtonText style={{ fontWeight: 'bold' }}>Register Now</ButtonText>
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={{color: '#666'}}>Already a member? </Text>
              <Link href="/(auth)/login" style={styles.linkText}>Login</Link>
            </View>
          </Card>
        </GridItem>
      </Grid>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  card: { padding: 25, borderRadius: 25, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  logoSection: { alignItems: 'center', marginBottom: 5 },
  logo: { width: 70, height: 70, borderRadius: 15, marginBottom: 10 },
  title: { color: '#fe2238', fontSize: 28, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20, fontWeight: '600' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 15, color: '#fe2238', fontWeight: 'bold', fontSize: 16 },
  securityHintRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  strengthBar: { width: 25, height: 5, borderRadius: 2, marginRight: 8 },
  hintText: { fontSize: 12, fontWeight: '500' },
  matchText: { fontSize: 13, marginTop: 8, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  linkText: { color: '#fe2238', fontWeight: 'bold', textDecorationLine: 'underline' },
})