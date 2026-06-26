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

import { Task, getTasks, saveTasks } from '@/utils/storage';
import { cancelNotification, scheduleTaskNotification } from '@/utils/notifications';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '' });

  useFocusEffect(
    useCallback(() => {
      getTasks().then(setTasks);
    }, []),
  );

  async function addTask() {
    if (!form.title.trim()) return;
    let notificationId: string | undefined;
    if (form.dueDate) {
      const id = await scheduleTaskNotification(form.title.trim(), form.dueDate);
      if (id) notificationId = id;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: form.title.trim(),
      subject: form.subject.trim(),
      dueDate: form.dueDate,
      completed: false,
      notificationId,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    await saveTasks(updated);
    setForm({ title: '', subject: '', dueDate: '' });
    setShowModal(false);
  }

  async function toggleTask(id: string) {
    const updated = tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    await saveTasks(updated);
  }

  async function deleteTask(task: Task) {
    if (task.notificationId) await cancelNotification(task.notificationId);
    const updated = tasks.filter(t => t.id !== task.id);
    setTasks(updated);
    await saveTasks(updated);
  }

  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ New Task</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Pending ({pending.length})</Text>
        {pending.length === 0 && (
          <Text style={styles.empty}>No pending tasks — great work!</Text>
        )}
        {pending.map(task => (
          <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}

        {done.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Completed ({done.length})</Text>
            {done.map(task => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </>
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task title *"
              placeholderTextColor="#000"
              value={form.title}
              onChangeText={t => setForm(f => ({ ...f, title: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Subject (optional)"
              placeholderTextColor="#000"
              value={form.subject}
              onChangeText={t => setForm(f => ({ ...f, subject: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Due date: YYYY-MM-DD (optional)"
              placeholderTextColor="#000"
              value={form.dueDate}
              onChangeText={t => setForm(f => ({ ...f, dueDate: t }))}
            />
            <Text style={styles.hint}>
              A notification will be sent at 9 AM on the due date
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addTask}>
                <Text style={styles.saveBtnText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (task: Task) => void;
}) {
  const isOverdue =
    !task.completed && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxDone]}
        onPress={() => onToggle(task.id)}>
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.taskInfo}>
        <Text style={[styles.taskTitle, task.completed && styles.taskStrike]}>
          {task.title}
        </Text>
        {task.subject ? <Text style={styles.taskSubject}>{task.subject}</Text> : null}
        {task.dueDate ? (
          <Text style={[styles.taskDue, isOverdue && styles.taskOverdue]}>
            Due: {task.dueDate} {isOverdue ? '(overdue)' : ''}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => onDelete(task)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a2e' },
  addBtn: { backgroundColor: '#4A90E2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  empty: { color: '#bbb', fontSize: 14, textAlign: 'center', paddingVertical: 24 },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkboxDone: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: '#1a1a2e' },
  taskStrike: { textDecorationLine: 'line-through', color: '#bbb' },
  taskSubject: { fontSize: 12, color: '#aaa', marginTop: 2 },
  taskDue: { fontSize: 12, color: '#E2844A', marginTop: 4, fontWeight: '500' },
  taskOverdue: { color: '#e53e3e' },
  deleteText: { color: '#ff6b6b', fontSize: 18, paddingLeft: 8, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#1a1a2e' },
  input: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    padding: 13,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  hint: { fontSize: 12, color: '#bbb', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
  cancelBtnText: { color: '#777', fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#4A90E2', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
