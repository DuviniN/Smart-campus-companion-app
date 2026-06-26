import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { Profile, getProfile, saveProfile } from '@/utils/storage';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    studentId: '',
    year: '1st Year',
    gpa: '0.00',
    creditsEarned: '0',
    creditsTotal: '120',
  });

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
    }, []),
  );

  async function save() {
    await saveProfile(profile);
    Alert.alert('Saved', 'Profile updated successfully!');
  }

  const earned = parseFloat(profile.creditsEarned) || 0;
  const total = parseFloat(profile.creditsTotal) || 120;
  const progress = Math.min(earned / total, 1);

  const avatarLetter = profile.name ? profile.name[0].toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
            <Text style={styles.avatarName}>{profile.name || 'Your Name'}</Text>
            <Text style={styles.avatarId}>{profile.studentId || 'Student ID'}</Text>
          </View>

          {/* Academic Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{profile.gpa || '0.00'}</Text>
              <Text style={styles.statLabel}>GPA</Text>
            </View>
            <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#eee' }]}>
              <Text style={styles.statValue}>{earned}/{total}</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>
            <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#eee' }]}>
              <Text style={styles.statValue}>{profile.year.replace(' Year', '')}</Text>
              <Text style={styles.statLabel}>Year</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}% of degree completed</Text>
          </View>

          {/* Personal Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Info</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={t => setProfile(p => ({ ...p, name: t }))}
              placeholder="Enter your name"
              placeholderTextColor="#000"
            />

            <Text style={styles.label}>Student ID</Text>
            <TextInput
              style={styles.input}
              value={profile.studentId}
              onChangeText={t => setProfile(p => ({ ...p, studentId: t }))}
              placeholder="e.g. SC2024001"
              placeholderTextColor="#000"
            />

            <Text style={styles.label}>Year of Study</Text>
            <View style={styles.yearRow}>
              {YEARS.map(y => (
                <TouchableOpacity
                  key={y}
                  style={[styles.yearChip, profile.year === y && styles.yearChipActive]}
                  onPress={() => setProfile(p => ({ ...p, year: y }))}>
                  <Text style={[styles.yearChipText, profile.year === y && styles.yearChipTextActive]}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Academic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Academic Progress</Text>

            <Text style={styles.label}>GPA (0.00 – 4.00)</Text>
            <TextInput
              style={styles.input}
              value={profile.gpa}
              onChangeText={t => setProfile(p => ({ ...p, gpa: t }))}
              placeholder="e.g. 3.50"
              placeholderTextColor="#000"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Credits Earned</Text>
            <TextInput
              style={styles.input}
              value={profile.creditsEarned}
              onChangeText={t => setProfile(p => ({ ...p, creditsEarned: t }))}
              placeholder="e.g. 60"
              placeholderTextColor="#000"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Total Credits Required</Text>
            <TextInput
              style={styles.input}
              value={profile.creditsTotal}
              onChangeText={t => setProfile(p => ({ ...p, creditsTotal: t }))}
              placeholder="e.g. 120"
              placeholderTextColor="#000"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { padding: 20, paddingBottom: 100 },

  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarLetter: { fontSize: 38, color: '#fff', fontWeight: '800' },
  avatarName: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  avatarId: { fontSize: 13, color: '#aaa', marginTop: 2 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#4A90E2' },
  statLabel: { fontSize: 11, color: '#aaa', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },

  progressSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressTrack: { height: 10, backgroundColor: '#eef3fb', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: '#4A90E2', borderRadius: 5 },
  progressText: { fontSize: 12, color: '#aaa', marginTop: 8, textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 14 },
  label: { fontSize: 13, color: '#888', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  yearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  yearChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f0f0' },
  yearChipActive: { backgroundColor: '#4A90E2' },
  yearChipText: { color: '#777', fontSize: 13 },
  yearChipTextActive: { color: '#fff', fontWeight: '600' },

  saveBtn: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
