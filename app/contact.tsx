import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
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

const ContactScreen: React.FC = () => {
  const { data } = useAppData();
  const { contact, profile } = data;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (!name || !email || !message) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(
      `${message}\n\nFrom: ${name} <${email}>\n\nPhone: ${contact.phone}`
    );
    const mailto = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert('Error', 'Could not open email client.')
    );
  };

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const openMail = () => {
    const mailto = `mailto:${contact.email}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert('Error', 'Could not open email client.')
    );
  };

  const openPhone = () => {
    const tel = `tel:${contact.phone}`;
    Linking.openURL(tel).catch(() =>
      Alert.alert('Error', 'Could not open dialer.')
    );
  };

  const openTelegram = () => {
    const username = 'dhiraj7kr';
    const url = `https://t.me/${username}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open Telegram.')
    );
  };

  const openMap = () => {
    const query = encodeURIComponent(profile.location || 'Hyderabad, India');
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open maps.')
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Futuristic hero card */}
        <LinearGradient
          colors={['#EEF2FF', '#EFF6FF', '#F9FAFB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>LET&apos;S CONNECT</Text>
              <Text style={styles.heroTitle}>Work with Dhiraj</Text>
              <Text style={styles.heroSubtitle}>
                Open to roles in Software Engineering, AI-powered systems, and
                full-stack development. Let&apos;s build something impactful
                together.
              </Text>
            </View>
            <Ionicons
              name="chatbubbles-outline"
              size={30}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.heroMetaText}>Response: within 24 hours</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons
                name="globe-outline"
                size={18}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.heroMetaText}>Timezone: IST (UTC+5:30)</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Contact info + map row */}
        <View style={styles.sectionSpacing}>
          <View style={styles.infoRow}>
            {/* Direct contact card */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons
                  name="person-circle-outline"
                  size={22}
                  color={theme.colors.primary}
                />
                <Text style={styles.infoCardTitle}>Direct Contact</Text>
              </View>

              <Text style={styles.infoLabel}>Email</Text>
              <TouchableOpacity onPress={openMail}>
                <Text style={[styles.infoValue, styles.infoLink]}>
                  {contact.email}
                </Text>
              </TouchableOpacity>

              <Text style={styles.infoLabel}>Phone</Text>
              <TouchableOpacity onPress={openPhone}>
                <Text style={[styles.infoValue, styles.infoLink]}>
                  {contact.phone}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Map card */}
            <TouchableOpacity
              style={styles.mapCard}
              onPress={openMap}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#DBEAFE', '#EFF6FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mapGradient}
              >
                <View style={styles.infoCardHeader}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={theme.colors.primaryDark}
                  />
                  <Text style={styles.infoCardTitle}>Location & Map</Text>
                </View>
                <Text style={styles.infoLabel}>Base Location</Text>
                <Text style={styles.infoValue}>{profile.location}</Text>

                <View style={styles.mapPreview}>
                  <View style={styles.mapLineHorizontal} />
                  <View style={styles.mapLineVertical} />
                  <View style={styles.mapPin}>
                    <Ionicons name="pin" size={18} color="#EF4444" />
                  </View>
                </View>
                <Text style={styles.mapHint}>Tap to open in Google Maps</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact form */}
        <View style={styles.sectionSpacing}>
          <SectionHeader
            title="Send a message"
            subtitle="Share a bit about your project or role, and I’ll get back to you."
          />

          <View style={styles.formCard}>
            <TextInputField label="Your Name" value={name} onChangeText={setName} />
            <TextInputField
              label="Your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInputField
              label="Message"
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <IconButton label="Send Message" onPress={sendMessage} />
          </View>
        </View>

        {/* Social / connect grid */}
        <View style={styles.sectionSpacing}>
          <SectionHeader
            title="Connect via"
            subtitle="Choose the channel that works best for you."
          />

          <View style={styles.iconGrid}>
            {/* LinkedIn */}
            <TouchableOpacity
              style={styles.iconButtonCard}
              onPress={() => openLink(profile.social.linkedin)}
            >
              <FontAwesome name="linkedin-square" size={24} color="#0A66C2" />
              <Text style={styles.iconLabel}>LinkedIn</Text>
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity style={styles.iconButtonCard} onPress={openMail}>
              <Feather name="mail" size={24} color="#EA4335" />
              <Text style={styles.iconLabel}>Email</Text>
            </TouchableOpacity>

            {/* Call */}
            <TouchableOpacity style={styles.iconButtonCard} onPress={openPhone}>
              <Feather name="phone-call" size={24} color="#16A34A" />
              <Text style={styles.iconLabel}>Call</Text>
            </TouchableOpacity>

            {/* Medium */}
            <TouchableOpacity
              style={styles.iconButtonCard}
              onPress={() => openLink(profile.social.medium)}
            >
              <FontAwesome name="medium" size={24} color="#111827" />
              <Text style={styles.iconLabel}>Medium</Text>
            </TouchableOpacity>

            {/* YouTube */}
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

            {/* Telegram */}
            <TouchableOpacity style={styles.iconButtonCard} onPress={openTelegram}>
              <FontAwesome name="telegram" size={24} color="#0088cc" />
              <Text style={styles.iconLabel}>Telegram</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer text with comfy bottom space */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prefer async communication? Drop me an email or Telegram message anytime.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  // Full-screen background
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  // ScrollView
  container: {
    flex: 1
  },
  // Inner spacing for content
  contentContainer: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(10), // distance from top
    paddingBottom: theme.spacing(4) // distance from bottom/footer
  },

  sectionSpacing: {
    marginTop: theme.spacing(3)
  },

  // Hero card
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
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5)
  },
  heroLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    marginTop: 2
  },
  heroSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: 4
  },
  heroMetaRow: {
    flexDirection: 'row',
    marginTop: theme.spacing(1)
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing(2)
  },
  heroMetaText: {
    marginLeft: 4,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  },

  // Info + map row
  infoRow: {
    flexDirection: 'row',
    marginTop: theme.spacing(1.5)
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(2),
    marginRight: theme.spacing(1),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  infoCardTitle: {
    marginLeft: 6,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.fontSize.sm
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    marginBottom: 4
  },
  infoLink: {
    textDecorationLine: 'underline'
  },

  // Map card
  mapCard: {
    flex: 1,
    marginLeft: theme.spacing(1)
  },
  mapGradient: {
    flex: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  mapPreview: {
    marginTop: theme.spacing(1),
    marginBottom: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    height: 70,
    overflow: 'hidden',
    backgroundColor: '#EFF6FF'
  },
  mapLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#BFDBFE'
  },
  mapLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#BFDBFE'
  },
  mapPin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -10,
    marginTop: -14
  },
  mapHint: {
    marginTop: 4,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  },

  // Form
  formCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(2),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    marginTop: theme.spacing(1.5)
  },

  // Social icon grid (2 rows × 4 icons)
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1.5)
  },
  iconButtonCard: {
    width: '23%', // 4 per row
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

  footer: {
    marginTop: theme.spacing(3),
    alignItems: 'center'
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textAlign: 'center'
  }
});
