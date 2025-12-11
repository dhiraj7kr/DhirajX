import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { AppData, defaultData, Profile, Project } from '../data/defaultData';
import { loadAppData, saveAppData } from '../storage/storage';

type AppDataContextType = {
  data: AppData;
  loading: boolean;
  updateProfile: (profile: Profile) => void;
  updateProject: (projectId: string, updated: Partial<Project>) => void;
  pickProfileImage: () => Promise<void>;
  pickProjectScreenshot: (projectId: string) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadAppData();
      if (stored) setData(stored);
      setLoading(false);
    })();
  }, []);

  const persist = (next: AppData) => {
    setData(next);
    saveAppData(next);
  };

  const updateProfile = (profile: Profile) => {
    persist({ ...data, profile });
  };

  const updateProject = (projectId: string, updated: Partial<Project>) => {
    const projects = data.projects.map((p) =>
      p.id === projectId ? { ...p, ...updated } : p
    );
    persist({ ...data, projects });
  };

  const ensurePermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access gallery is required!');
      return false;
    }
    return true;
  };

  const copyToAppStorage = async (uri: string): Promise<string> => {
  try {
    const fileName =
      uri.split('/').pop() ?? `avatar-${Date.now().toString()}.jpg`;

    const dir = `${FileSystem.documentDirectory}profile`;

    // Ensure profile/ directory exists
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const destUri = `${dir}/${fileName}`;

    // This is the legacy copyAsync, now safely imported from expo-file-system/legacy
    await FileSystem.copyAsync({ from: uri, to: destUri });

    return destUri;
  } catch (error) {
    console.log('copyToAppStorage error', error);
    // Fallback: just return the original uri if something fails
    return uri;
  }
};


  const pickProfileImage = async () => {
    const allowed = await ensurePermissions();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7
    });

    if (result.canceled || !result.assets?.length) return;

    const localUri = await copyToAppStorage(result.assets[0].uri);
    updateProfile({ ...data.profile, avatarUri: localUri });
  };

  const pickProjectScreenshot = async (projectId: string) => {
    const allowed = await ensurePermissions();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7
    });

    if (result.canceled || !result.assets?.length) return;

    const localUri = await copyToAppStorage(result.assets[0].uri);
    updateProject(projectId, { screenshotUri: localUri });
  };

  return (
    <AppDataContext.Provider
      value={{
        data,
        loading,
        updateProfile,
        updateProject,
        pickProfileImage,
        pickProjectScreenshot
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};
