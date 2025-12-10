import * as FileSystem from 'expo-file-system';
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
    const filename = uri.split('/').pop() ?? `image-${Date.now()}.jpg`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
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
