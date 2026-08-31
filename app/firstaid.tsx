import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Enable animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TOPICS = [
  {
    id: 1,
    title: "CPR (Cardiopulmonary Resuscitation)",
    icon: "heart",
    color: "#e74c3c",
    steps: [
      "1. Check if the person is breathing.",
      "2. Place heel of hand on center of chest.",
      "3. Place other hand on top and interlock fingers.",
      "4. Push hard and fast (100-120 compressions/minute).",
      "5. Continue until ambulance arrives."
    ]
  },
  {
    id: 2,
    title: "Severe Bleeding",
    icon: "water",
    color: "#c0392b",
    steps: [
      "1. Apply direct pressure to the wound with a clean cloth.",
      "2. Keep pressure until bleeding stops.",
      "3. Do NOT remove the cloth if it soaks through; add more on top.",
      "4. Raise the injured limb above heart level if possible.",
      "5. Call 1122 immediately."
    ]
  },
  {
    id: 3,
    title: "Burns & Scalds",
    icon: "flame",
    color: "#e67e22",
    steps: [
      "1. Cool the burn under cool running water for 10-20 minutes.",
      "2. Do NOT use ice, butter, or toothpaste.",
      "3. Cover with a sterile bandage or cling film.",
      "4. Take painkillers like Paracetamol if needed."
    ]
  },
  {
    id: 4,
    title: "Choking (Adult)",
    icon: "body",
    color: "#8e44ad",
    steps: [
      "1. Stand behind the person.",
      "2. Lean them slightly forward.",
      "3. Give 5 sharp back blows between shoulder blades.",
      "4. If that fails, perform abdominal thrusts (Heimlich Maneuver).",
      "5. Call emergency help if blockage persists."
    ]
  },
  {
    id: 5,
    title: "Snake Bite",
    icon: "alert-circle",
    color: "#27ae60",
    steps: [
      "1. Keep the patient calm and still.",
      "2. Keep the bitten limb BELOW heart level.",
      "3. Do NOT cut the wound or suck the venom.",
      "4. Do NOT apply ice or a tourniquet.",
      "5. Transport to hospital immediately."
    ]
  },
  {
    id: 6,
    title: "Stroke (FAST Guide)",
    icon: "sad",
    color: "#34495e",
    steps: [
      "1. F (Face): Ask them to smile. Does one side droop?",
      "2. A (Arms): Ask to raise both arms. Does one drift down?",
      "3. S (Speech): Is speech slurred or strange?",
      "4. T (Time): Call 1122 immediately if you see these signs."
    ]
  },
  {
    id: 7,
    title: "Heart Attack",
    icon: "pulse",
    color: "#c0392b",
    steps: [
      "1. Call 1122 immediately.",
      "2. Have the person sit down and rest.",
      "3. Loosen tight clothing.",
      "4. If they have Aspirin (Disprin) and are not allergic, have them chew one.",
      "5. Begin CPR if they become unconscious."
    ]
  },
  {
    id: 8,
    title: "Fracture (Broken Bone)",
    icon: "fitness",
    color: "#7f8c8d",
    steps: [
      "1. Do not move the injured part.",
      "2. Support the limb with a cushion or sling.",
      "3. Apply an ice pack wrapped in cloth to reduce swelling.",
      "4. Stop any bleeding by applying pressure around the wound.",
      "5. Go to the hospital for an X-ray."
    ]
  },
  {
    id: 9,
    title: "Head Injury / Concussion",
    icon: "medkit",
    color: "#2c3e50",
    steps: [
      "1. Sit the person down and apply a cold pack to the injury.",
      "2. Monitor for dizziness, vomiting, or confusion.",
      "3. If they become drowsy or vomit repeatedly, call 1122.",
      "4. Do not let them return to sports/activity immediately."
    ]
  },
  {
    id: 10,
    title: "Hypothermia (Freezing)",
    icon: "snow",
    color: "#3498db",
    steps: [
      "1. Move the person to a warm, dry place.",
      "2. Remove wet clothing.",
      "3. Wrap them in blankets.",
      "4. Give warm (not hot) sweet drinks if they are conscious.",
      "5. Do NOT rub their skin or apply direct heat."
    ]
  },
  {
    id: 11,
    title: "Heat Stroke",
    icon: "sunny",
    color: "#f1c40f",
    steps: [
      "1. Move to a cool, shaded place.",
      "2. Remove heavy clothing.",
      "3. Sponge skin with cool water.",
      "4. Fan the person to cool them down.",
      "5. Give small sips of water if conscious."
    ]
  },
  {
    id: 12,
    title: "Diabetic Emergency (Low Sugar)",
    icon: "water",
    color: "#9b59b6",
    steps: [
      "1. Look for shaking, sweating, or confusion.",
      "2. Give them something sugary (fruit juice, candy, or glucose).",
      "3. If they do not improve in 10 minutes, call 1122.",
      "4. If unconscious, do not give anything by mouth. Place in recovery position."
    ]
  },
  {
    id: 13,
    title: "Poisoning",
    icon: "flask",
    color: "#16a085",
    steps: [
      "1. Identify what was swallowed (keep the bottle/container).",
      "2. Do NOT try to make them vomit.",
      "3. Call 1122 or Poison Control immediately.",
      "4. If unconscious, check breathing and prepare for CPR."
    ]
  },
  {
    id: 14,
    title: "Electric Shock",
    icon: "flash",
    color: "#f39c12",
    steps: [
      "1. Do NOT touch the person if they are still in contact with electricity.",
      "2. Turn off the power source immediately.",
      "3. Use a wooden stick to push the wire away.",
      "4. Check breathing and start CPR if needed.",
      "5. Treat any burns."
    ]
  },
  {
    id: 15,
    title: "Asthma Attack",
    icon: "cloud",
    color: "#2980b9",
    steps: [
      "1. Sit the person upright (do not lie down).",
      "2. Help them use their inhaler (usually blue).",
      "3. One puff every minute for 4 minutes.",
      "4. Keep them calm.",
      "5. If no improvement, call 1122 immediately."
    ]
  }
];

export default function FirstAidManual() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>First Aid Manual 📖</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subTitle}>Offline Emergency Guide</Text>

        {TOPICS.map((item) => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity 
              style={styles.cardHeader} 
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                {/* Cast icon name to 'any' to satisfy TypeScript strict checks */}
                <Ionicons name={item.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Ionicons 
                name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>

            {expandedId === item.id && (
              <View style={styles.cardBody}>
                {item.steps.map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <Text style={styles.stepBullet}>•</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        
        <View style={styles.footerNote}>
          <Text style={styles.noteText}>Note: This guide works without internet.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#333' },
  scrollContent: { padding: 15, paddingBottom: 40 },
  subTitle: { fontSize: 16, color: '#666', marginBottom: 15, marginLeft: 5 },
  
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#333' },
  
  cardBody: { padding: 15, paddingTop: 0, backgroundColor: '#fafafa' },
  stepRow: { flexDirection: 'row', marginBottom: 8 },
  stepBullet: { fontSize: 18, color: '#666', marginRight: 10, lineHeight: 24 },
  stepText: { flex: 1, fontSize: 15, color: '#444', lineHeight: 22 },

  footerNote: { alignItems: 'center', marginTop: 20 },
  noteText: { color: '#999', fontSize: 12, fontStyle: 'italic' }
});