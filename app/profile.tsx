import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Linking, // Added Linking import
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppData } from '../src/context/AppDataContext';
import { theme } from '../src/theme/theme';

// --- CONSTANTS & PATHS ---
const PLANNER_KEY = 'plannerTasks_v3';
const FOCUS_KEY = 'focus_of_day_v1';
const WATER_KEY = 'water_tracker_v1';

// @ts-ignore
const DOC_DIR = FileSystem.documentDirectory;
const EXPENSE_FILE = DOC_DIR + 'app_data_expenses_v5.json';
const NOTES_FILE = DOC_DIR + 'app_data_notes_v12.json';

// Helper to check dates
const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const occursOnDate = (task: any, targetDateStr: string): boolean => {
    const base = new Date(task.date + 'T00:00:00');
    const current = new Date(targetDateStr + 'T00:00:00');
    
    if (task.repeat === 'none') {
        return base.getFullYear() === current.getFullYear() &&
               base.getMonth() === current.getMonth() &&
               base.getDate() === current.getDate();
    }
    if (current.getTime() < base.getTime()) return false;
    
    switch (task.repeat) {
      case 'daily': return true;
      case 'weekly': return base.getDay() === current.getDay();
      case 'monthly': return base.getDate() === current.getDate();
      case 'yearly': return base.getDate() === current.getDate() && base.getMonth() === current.getMonth();
      default: return false;
    }
};

export default function ProfileScreen() {
  const { data, updateProfile } = useAppData();
  const { profile, contact } = data; // Destructured contact for email
  const router = useRouter();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempRole, setTempRole] = useState(profile.role);
  const [stats, setStats] = useState({ tasksDone: 0, streak: 0, focusHrs: 0 });
  const [loading, setLoading] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // --- 1. LOAD STATS ---
  const loadStats = async () => {
    try {
        const json = await AsyncStorage.getItem(PLANNER_KEY);
        if (json) {
            const allTasks = JSON.parse(json);
            
            let completedCount = 0;
            allTasks.forEach((t: any) => {
                if (t.repeat === 'none' && t.isCompleted) completedCount++;
                if (t.completedExceptions) completedCount += t.completedExceptions.length;
            });

            const history = [];
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dStr = getLocalDateString(d); 
                let count = 0;
                allTasks.forEach((t: any) => {
                    const occurs = occursOnDate(t, dStr);
                    const isRecurringDone = t.completedExceptions && t.completedExceptions.includes(dStr);
                    const isOneTimeDone = t.repeat === 'none' && t.isCompleted && t.date === dStr;
                    if (occurs && (isRecurringDone || isOneTimeDone)) count++;
                });
                history.push({ date: dStr, count });
            }

            let tempStreak = 0;
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].count > 0) tempStreak++;
                else if (i !== history.length - 1) break;
            }

            setStats({
                tasksDone: completedCount,
                streak: tempStreak,
                focusHrs: Math.round(completedCount * 0.5)
            });
        }
    } catch (e) { console.log('Error loading stats', e); }
  };

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  // --- 2. BACKUP FUNCTION ---
  const handleBackup = async () => {
    setLoading(true);
    try {
        // 1. Gather AsyncStorage Data
        const plannerData = await AsyncStorage.getItem(PLANNER_KEY);
        const focusData = await AsyncStorage.getItem(FOCUS_KEY);
        const waterData = await AsyncStorage.getItem(WATER_KEY);

        // 2. Gather FileSystem Data
        let expensesData = null;
        let notesData = null;

        const expenseInfo = await FileSystem.getInfoAsync(EXPENSE_FILE);
        if (expenseInfo.exists) {
            expensesData = await FileSystem.readAsStringAsync(EXPENSE_FILE);
        }

        const notesInfo = await FileSystem.getInfoAsync(NOTES_FILE);
        if (notesInfo.exists) {
            notesData = await FileSystem.readAsStringAsync(NOTES_FILE);
        }

        // 3. Create Backup Object
        const backupObject = {
            metadata: {
                version: '1.0',
                date: new Date().toISOString(),
                platform: 'DuperApp'
            },
            data: {
                planner: plannerData ? JSON.parse(plannerData) : [],
                focus: focusData,
                water: waterData,
                expenses: expensesData ? JSON.parse(expensesData) : null,
                notes: notesData ? JSON.parse(notesData) : null,
                profile: { name: profile.name, role: profile.role } // We don't backup image files
            }
        };

        // 4. Save to Temp File
        const fileName = `Duper_Backup_${getLocalDateString()}.json`;
        // @ts-ignore
        const fileUri = (FileSystem.documentDirectory || '') + fileName;
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupObject, null, 2));

        // 5. Share
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            Alert.alert('Error', 'Sharing is not available on this device');
        }

    } catch (error) {
        Alert.alert('Backup Failed', 'An error occurred while creating backup.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // --- 3. RESTORE FUNCTION ---
  const handleRestore = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
        
        if (result.canceled) return;
        
        setLoading(true);
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const backupObject = JSON.parse(fileContent);

        // Basic Validation
        if (!backupObject.metadata || backupObject.metadata.platform !== 'DuperApp') {
            Alert.alert('Invalid File', 'This file is not a valid Duper backup.');
            setLoading(false);
            return;
        }

        const { data } = backupObject;

        // 1. Restore AsyncStorage
        if (data.planner) await AsyncStorage.setItem(PLANNER_KEY, JSON.stringify(data.planner));
        if (data.focus) await AsyncStorage.setItem(FOCUS_KEY, data.focus);
        if (data.water) await AsyncStorage.setItem(WATER_KEY, data.water);

        // 2. Restore FileSystem
        if (data.expenses) await FileSystem.writeAsStringAsync(EXPENSE_FILE, JSON.stringify(data.expenses));
        if (data.notes) await FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify(data.notes));

        // 3. Restore Profile Text
        if (data.profile) {
            updateProfile({ ...profile, name: data.profile.name, role: data.profile.role });
        }

        Alert.alert('Success', 'Data restored successfully! Please restart the app or pull to refresh other tabs.', [
            { text: 'OK', onPress: () => loadStats() }
        ]);

    } catch (error) {
        Alert.alert('Restore Failed', 'Could not parse or restore this file.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const clearAllData = async () => {
      try {
          await AsyncStorage.multiRemove([PLANNER_KEY, FOCUS_KEY, WATER_KEY]);
          await FileSystem.deleteAsync(EXPENSE_FILE, { idempotent: true });
          await FileSystem.deleteAsync(NOTES_FILE, { idempotent: true });
          Alert.alert('Reset Complete', 'All data has been cleared.');
          loadStats(); // Reset stats to 0
      } catch(e) {
          Alert.alert('Error', 'Could not clear all data');
      }
  };

  // --- ACTIONS ---
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) {
        updateProfile({ ...profile, avatarUri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const saveProfile = () => {
    updateProfile({ ...profile, name: tempName, role: tempRole });
    setEditModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => Alert.alert('Settings', 'More settings coming soon!')}>
             <Ionicons name="ellipsis-horizontal-circle-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
           <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{profile.name?.[0] || 'U'}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
           </TouchableOpacity>
           
           <View style={{alignItems:'center', marginTop: 12}}>
             <Text style={styles.userName}>{profile.name || 'User Name'}</Text>
             <Text style={styles.userRole}>{profile.role || 'Productivity Enthusiast'}</Text>
           </View>

           <TouchableOpacity style={styles.editBtn} onPress={() => { setTempName(profile.name); setTempRole(profile.role); setEditModalVisible(true); }}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
           </TouchableOpacity>
        </View>

        {/* DYNAMIC STATS */}
        <View style={styles.statsRow}>
           <StatItem label="Tasks Done" value={stats.tasksDone.toString()} icon="checkbox-outline" color="#10B981" />
           <StatItem label="Streak" value={stats.streak.toString()} icon="flame" color="#F59E0B" />
           <StatItem label="Est. Focus Hrs" value={stats.focusHrs.toString()} icon="time-outline" color="#3B82F6" />
        </View>

        {/* APP SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingRow 
            icon="notifications-outline" 
            label="Notifications" 
            color="#6366F1"
            rightElement={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{true: theme.colors.primary}} />}
          />
          <SettingRow 
            icon="moon-outline" 
            label="Dark Mode" 
            color="#334155"
            rightElement={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{true: theme.colors.primary}} />}
          />
        </View>

        {/* DATA MANAGEMENT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <SettingRow 
            icon="cloud-upload-outline" 
            label={loading ? "Processing..." : "Backup Data"} 
            color="#0EA5E9"
            onPress={loading ? undefined : handleBackup}
          />
          <SettingRow 
            icon="cloud-download-outline" 
            label={loading ? "Processing..." : "Restore Data"} 
            color="#0EA5E9"
            onPress={loading ? undefined : handleRestore}
          />
          <SettingRow 
            icon="trash-outline" 
            label="Clear All Data" 
            color="#EF4444"
            isDestructive
            onPress={() => Alert.alert('Reset', 'Are you sure? This will delete all tasks, notes, and expenses permanently.', [
                {text:'Cancel'}, 
                {text:'Delete Everything', style:'destructive', onPress: clearAllData}
            ])}
          />
        </View>

        {/* ABOUT & DEVELOPER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Duper</Text>
          
          <SettingRow 
            icon="logo-github" 
            label="Star on GitHub" 
            subLabel="Support DhirajX"
            color="#F59E0B"
            onPress={() => WebBrowser.openBrowserAsync('https://github.com/dhiraj7kr/DhirajX')}
          />

          <Text style={[styles.sectionTitle, {marginTop: 16, marginBottom: 8}]}>Connect with Developer</Text>

          <SettingRow 
            icon="logo-github" 
            label="GitHub" 
            subLabel="@dhiraj7kr"
            color="#111827"
            onPress={() => WebBrowser.openBrowserAsync('https://github.com/dhiraj7kr')}
          />

          <SettingRow 
            icon="logo-linkedin" 
            label="LinkedIn" 
            color="#0A66C2"
            onPress={() => WebBrowser.openBrowserAsync('https://www.linkedin.com/in/dhiraj7kr/')}
          />

          <SettingRow 
            icon="mail-outline" 
            label="Email" 
            subLabel={contact?.email}
            color="#EA4335"
            onPress={() => Linking.openURL(`mailto:${contact?.email || ''}`)}
          />

          <View style={{alignItems:'center', marginTop: 20}}>
            <Text style={{color: '#94A3B8', fontSize: 12}}>Version 1.0.0 (Build 2025.1)</Text>
          </View>
        </View>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <Text style={styles.modalTitle}>Update Profile</Text>
               <Text style={styles.inputLabel}>Display Name</Text>
               <TextInput style={styles.input} value={tempName} onChangeText={setTempName} />
               <Text style={styles.inputLabel}>Tagline / Role</Text>
               <TextInput style={styles.input} value={tempRole} onChangeText={setTempRole} />
               <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                     <Text style={{color: '#666', fontWeight:'600'}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveProfile} style={styles.saveBtn}>
                     <Text style={{color: '#FFF', fontWeight:'600'}}>Save Changes</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---
const StatItem = ({ label, value, icon, color }: any) => (
  <View style={styles.statCard}>
     <View style={[styles.statIconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
     </View>
     <Text style={styles.statValue}>{value}</Text>
     <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SettingRow = ({ icon, label, subLabel, color, rightElement, onPress, isDestructive }: any) => (
  <TouchableOpacity 
    style={styles.settingRow} 
    onPress={onPress} 
    disabled={!onPress && !rightElement}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.settingIcon, { backgroundColor: color + '15' }]}>
       <Ionicons name={icon} size={20} color={isDestructive ? '#EF4444' : color} />
    </View>
    <View style={{flex: 1, marginLeft: 12}}>
       <Text style={[styles.settingLabel, isDestructive && { color: '#EF4444' }]}>{label}</Text>
       {subLabel && <Text style={styles.settingSubLabel}>{subLabel}</Text>}
    </View>
    {rightElement ? rightElement : <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />}
  </TouchableOpacity>
);

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: theme.colors.text },
  profileCard: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 36, fontWeight: '700', color: '#64748B' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#fff' },
  userName: { fontSize: 22, fontWeight: '700', color: theme.colors.text, marginTop: 4 },
  userRole: { fontSize: 14, color: '#64748B' },
  editBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#F1F5F9', borderRadius: 20 },
  editBtnText: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: {width:0,height:2}, elevation:1 },
  statIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth:1, borderColor: '#F1F5F9' },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  settingSubLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, marginRight: 10 },
  saveBtn: { flex: 1, padding: 14, alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 12 },
});