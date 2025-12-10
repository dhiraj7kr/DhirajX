import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import IconButton from '../src/components/IconButton';
import SectionHeader from '../src/components/SectionHeader';
import TextInputField from '../src/components/TextInputField';
import { useAppData } from '../src/context/AppDataContext';
import { theme } from '../src/theme/theme';

// ---------- QUOTES ARRAY ----------
const QUOTES = [
  {
    text: '“One more Step at a Time”',
    author: '— Personal mantra for progress'
  },
  {
    text: '“It always seems impossible until it\'s done”',
    author: '— Nelson Mandela'
  },
  {
    text: '“Engineers are made to break the rules”',
    author: '— Dk'
  }
];

const HomeScreen: React.FC = () => {
  const { data, pickProfileImage, updateProfile } = useAppData();
  const { profile } = data;

  // profile edit
  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [tagline, setTagline] = useState(profile.tagline);

  // date/time
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000); // update every minute
    return () => clearInterval(id);
  }, []);

  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateStr = now.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  // simple demo weather (you can later replace with real API)
  const weather = {
    condition: 'Partly Cloudy',
    temperature: '27°C',
    city: profile.location || 'Your City'
  };

  // small looping animation for the cloud
  const cloudAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true
        }),
        Animated.timing(cloudAnim, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [cloudAnim]);

  const cloudTranslateX = cloudAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 4]
  });

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const openMail = () => {
    const mailto = `mailto:${profile.email}`;
    Linking.openURL(mailto).catch(() => {});
  };

  const openPhone = () => {
    const tel = `tel:${profile.phone}`;
    Linking.openURL(tel).catch(() => {});
  };

  const saveProfile = () => {
    updateProfile({ ...profile, name, role, tagline });
    setEditVisible(false);
  };

  // ---------- QUOTE ROTATION LOGIC ----------
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 20000); // 20 seconds

    return () => clearInterval(intervalId);
  }, []);

  const currentQuote = QUOTES[quoteIndex];

  return (
    <ScrollView style={styles.container}>
      {/* HERO SECTION */}
      <LinearGradient
        colors={['#EEF2FF', '#EFF6FF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTopRow}>
          <TouchableOpacity onPress={pickProfileImage}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>
                  {profile.name
                    .split(' ')
                    .map((s) => s[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.heroTextContainer}>
            <Text style={styles.smallLabel}>PORTFOLIO · DHIRAJ X</Text>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.role}>{profile.role}</Text>
            <Text style={styles.location}>{profile.location}</Text>
          </View>

          <TouchableOpacity onPress={() => setEditVisible(true)}>
            <Ionicons
              name="pencil"
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* QUICK CONTACT ICONS */}
      <View style={styles.sectionSpacing}>
        <SectionHeader
          title="Connect with me"
          // subtitle removed as requested
        />
        <View style={styles.iconGrid}>
          <TouchableOpacity
            style={styles.iconButtonCard}
            onPress={() => openLink(profile.social.github)}
          >
            <FontAwesome name="github" size={24} color="#111827" />
            <Text style={styles.iconLabel}>GitHub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButtonCard}
            onPress={() => openLink(profile.social.linkedin)}
          >
            <FontAwesome name="linkedin-square" size={24} color="#0A66C2" />
            <Text style={styles.iconLabel}>LinkedIn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButtonCard} onPress={openMail}>
            <Feather name="mail" size={24} color="#EA4335" />
            <Text style={styles.iconLabel}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButtonCard} onPress={openPhone}>
            <Feather name="phone-call" size={24} color="#16A34A" />
            <Text style={styles.iconLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButtonCard}
            onPress={() => openLink(profile.social.medium)}
          >
            <FontAwesome name="medium" size={24} color="#111827" />
            <Text style={styles.iconLabel}>Medium</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButtonCard}
            onPress={() => openLink(profile.social.youtube)}
          >
            <FontAwesome name="youtube-play" size={24} color="#FF0000" />
            <Text style={styles.iconLabel}>YouTube</Text>
          </TouchableOpacity>

          {/* X (Twitter) */}
          <TouchableOpacity
            style={styles.iconButtonCard}
            onPress={() => openLink('https://x.com/dhiraj7kr')}
          >
            <Ionicons name="logo-twitter" size={24} color="#111827" />
            <Text style={styles.iconLabel}>X:Twitter</Text>
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity
            style={styles.iconButtonCard}
            onPress={() => openLink('https://instagram.com/dhiraj7kr')}
          >
            <FontAwesome name="instagram" size={24} color="#111827" />
            <Text style={styles.iconLabel}>Instagram</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DATE & TIME + WEATHER */}
      <View style={styles.sectionSpacing}>
        <SectionHeader
          title="Today at a glance"
          // subtitle removed as requested
        />
        <View style={styles.infoRow}>
          {/* Calendar / Time card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.infoCardTitle}>Calendar</Text>
            </View>
            <Text style={styles.dayName}>{dayName}</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
            <View style={styles.timeRow}>
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.timeText}>{timeStr}</Text>
            </View>
          </View>

          {/* Weather card */}
          <LinearGradient
            colors={['#DBEAFE', '#F9FAFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.infoCard, styles.weatherCard]}
          >
            <View style={styles.infoCardHeader}>
              <Ionicons
                name="partly-sunny-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.infoCardTitle}>Weather</Text>
            </View>

            <View style={styles.weatherRow}>
              <View>
                <Text style={styles.temperature}>{weather.temperature}</Text>
                <Text style={styles.weatherCondition}>
                  {weather.condition}
                </Text>
                <Text style={styles.cityText}>{weather.city}</Text>
              </View>

              <View style={styles.weatherIconArea}>
                <Ionicons name="sunny" size={30} color="#FDBA74" />
                <Animated.View
                  style={[
                    styles.cloudIconWrapper,
                    { transform: [{ translateX: cloudTranslateX }] }
                  ]}
                >
                  <Ionicons name="cloud" size={30} color="#9CA3AF" />
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* QUOTE AT BOTTOM (CYCLING) */}
      <View style={styles.bottomQuoteWrapper}>
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>{currentQuote.text}</Text>
          <Text style={styles.quoteSub}>{currentQuote.author}</Text>
        </View>
      </View>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInputField label="Name" value={name} onChangeText={setName} />
            <TextInputField label="Role" value={role} onChangeText={setRole} />
            <TextInputField
              label="Tagline"
              value={tagline}
              onChangeText={setTagline}
              multiline
            />
            <View style={styles.modalButtonsRow}>
              <IconButton
                label="Cancel"
                onPress={() => setEditVisible(false)}
                style={{ backgroundColor: theme.colors.border, flex: 1, marginRight: 8 }}
              />
              <IconButton
                label="Save"
                onPress={saveProfile}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing(2)
  },
  sectionSpacing: {
    marginTop: theme.spacing(3)
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  avatarInitials: {
    color: theme.colors.primaryDark,
    fontSize: theme.fontSize.lg,
    fontWeight: '700'
  },
  heroTextContainer: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  smallLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '800'
  },
  role: {
    color: theme.colors.primaryDark,
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    marginTop: 2
  },
  location: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm
  },
  // reused quote styles, now only for bottom section
  quoteBox: {
    marginTop: theme.spacing(2),
    borderRadius: theme.radius.lg,
    padding: theme.spacing(1.5),
    backgroundColor: 'rgba(255,255,255,0.8)'
  },
  quoteText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600'
  },
  quoteSub: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: 4
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  iconButtonCard: {
    width: '23%', // 4 cards per row → 2 rows for 8 options
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(1.5),
    paddingHorizontal: theme.spacing(1),
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  iconLabel: {
    marginTop: 6,
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    textAlign: 'center'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(1.5),
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing(1),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  weatherCard: {
    marginRight: 0,
    marginLeft: theme.spacing(1)
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  infoCardTitle: {
    marginLeft: 6,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.fontSize.sm
  },
  dayName: {
    color: theme.colors.primaryDark,
    fontSize: theme.fontSize.lg,
    fontWeight: '700'
  },
  dateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  timeText: {
    marginLeft: 4,
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    fontWeight: '600'
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  temperature: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700'
  },
  weatherCondition: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm
  },
  cityText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  },
  weatherIconArea: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cloudIconWrapper: {
    position: 'absolute',
    bottom: 0
  },
  bottomQuoteWrapper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    padding: theme.spacing(2)
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing(1)
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing(1)
  }
});
