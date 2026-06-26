import { useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ClassItem, Profile, getProfile, getSchedule, getTasks, saveSchedule } from '@/utils/storage';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DashboardScreen() {
  const [schedule, setSchedule] = useState<ClassItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', time: '', room: '', day: new Date().getDay() });

  const today = new Date().getDay();

  useFocusEffect(
    useCallback(() => {
      Promise.all([getSchedule(), getProfile(), getTasks()]).then(([s, p, t]) => {
        setSchedule(s);
        setProfile(p);
        setPendingCount(t.filter(task => !task.completed).length);
      });
    }, []),
  );

  const todayClasses = schedule
    .filter(c => c.day === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  async function addClass() {
    if (!form.name.trim() || !form.time.trim()) return;
    const newClass: ClassItem = {
      id: Date.now().toString(),
      name: form.name.trim(),
      time: form.time.trim(),
      room: form.room.trim(),
      day: form.day,
    };
    const updated = [...schedule, newClass];
    setSchedule(updated);
    await saveSchedule(updated);
    setForm({ name: '', time: '', room: '', day: today });
    setShowModal(false);
  }

  async function deleteClass(id: string) {
    const updated = schedule.filter(c => c.id !== id);
    setSchedule(updated);
    await saveSchedule(updated);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.greeting}>Hello, {profile?.name || 'Student'}</Text>
        <Text style={styles.date}>
          {DAY_NAMES[today]}, {new Date().toLocaleDateString()}
        </Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#4A90E2' }]}>
            <Text style={styles.summaryNum}>{todayClasses.length}</Text>
            <Text style={styles.summaryLabel}>Classes Today</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#E2844A' }]}>
            <Text style={styles.summaryNum}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pending Tasks</Text>
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {todayClasses.length === 0 ? (
            <Text style={styles.empty}>No classes scheduled for today</Text>
          ) : (
            todayClasses.map(item => (
              <View key={item.id} style={styles.classCard}>
                <View style={styles.timePill}>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{item.name}</Text>
                  {item.room ? <Text style={styles.classRoom}>{item.room}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => deleteClass(item.id)}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Weekly Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          {DAYS.map((day, i) => {
            const dayClasses = schedule.filter(c => c.day === i);
            return (
              <View key={i} style={styles.weekRow}>
                <Text style={[styles.dayLabel, i === today && styles.todayLabel]}>{day}</Text>
                <Text style={styles.weekClasses} numberOfLines={1}>
                  {dayClasses.length === 0 ? '—' : dayClasses.map(c => c.name).join(', ')}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Class</Text>

            <TextInput
              style={styles.input}
              placeholder="Subject name"
              value={form.name}
              onChangeText={t => setForm(f => ({ ...f, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (e.g. 09:00 AM)"
              value={form.time}
              onChangeText={t => setForm(f => ({ ...f, time: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Room (optional)"
              value={form.room}
              onChangeText={t => setForm(f => ({ ...f, room: t }))}
            />

            <Text style={styles.pickerLabel}>Day:</Text>
            <View style={styles.dayPicker}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayChip, form.day === i && styles.dayChipActive]}
                  onPress={() => setForm(f => ({ ...f, day: i }))}>
                  <Text style={[styles.dayChipText, form.day === i && styles.dayChipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addClass}>
                <Text style={styles.saveBtnText}>Add Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { padding: 20, paddingBottom: 100 },

  greeting: { fontSize: 26, fontWeight: '700', color: '#1a1a2e' },
  date: { fontSize: 14, color: '#888', marginBottom: 20, marginTop: 2 },

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  summaryNum: { fontSize: 32, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  addBtn: { backgroundColor: '#4A90E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { color: '#bbb', fontSize: 14, textAlign: 'center', paddingVertical: 16 },

  classCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  timePill: { backgroundColor: '#eef3fb', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 12 },
  timeText: { fontSize: 12, color: '#4A90E2', fontWeight: '700' },
  classInfo: { flex: 1 },
  className: { fontSize: 15, fontWeight: '500', color: '#1a1a2e' },
  classRoom: { fontSize: 12, color: '#aaa', marginTop: 2 },
  deleteText: { color: '#ff6b6b', fontSize: 18, paddingHorizontal: 4 },

  weekRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  dayLabel: { width: 38, fontSize: 13, color: '#aaa', fontWeight: '600' },
  todayLabel: { color: '#4A90E2' },
  weekClasses: { flex: 1, fontSize: 13, color: '#555' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#1a1a2e' },
  input: { borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 10, padding: 13, marginBottom: 12, fontSize: 15, backgroundColor: '#fafafa' },
  pickerLabel: { fontSize: 13, color: '#888', marginBottom: 8 },
  dayPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  dayChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, backgroundColor: '#f0f0f0' },
  dayChipActive: { backgroundColor: '#4A90E2' },
  dayChipText: { color: '#777', fontSize: 13 },
  dayChipTextActive: { color: '#fff', fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  cancelBtnText: { color: '#777', fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
