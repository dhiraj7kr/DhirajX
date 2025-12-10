import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '../data/defaultData';

const STORAGE_KEY = 'DHIRAJX_APP_DATA';

export async function loadAppData(): Promise<AppData | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as AppData;
  } catch (e) {
    console.warn('Error loading app data', e);
    return null;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const json = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.warn('Error saving app data', e);
  }
}
