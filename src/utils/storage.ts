import AsyncStorage from '@react-native-async-storage/async-storage';

export type ClassItem = {
  id: string;
  name: string;
  time: string;
  room: string;
  day: number; // 0=Sunday … 6=Saturday
};

export type Task = {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  notificationId?: string;
};

export type Profile = {
  name: string;
  studentId: string;
  year: string;
  gpa: string;
  creditsEarned: string;
  creditsTotal: string;
};

const KEYS = {
  SCHEDULE: '@sc_schedule',
  TASKS: '@sc_tasks',
  PROFILE: '@sc_profile',
};

export async function getSchedule(): Promise<ClassItem[]> {
  const data = await AsyncStorage.getItem(KEYS.SCHEDULE);
  return data ? JSON.parse(data) : [];
}

export async function saveSchedule(items: ClassItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(items));
}

export async function getTasks(): Promise<Task[]> {
  const data = await AsyncStorage.getItem(KEYS.TASKS);
  return data ? JSON.parse(data) : [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

export async function getProfile(): Promise<Profile> {
  const data = await AsyncStorage.getItem(KEYS.PROFILE);
  return data
    ? JSON.parse(data)
    : { name: '', studentId: '', year: '1st Year', gpa: '0.00', creditsEarned: '0', creditsTotal: '120' };
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}
