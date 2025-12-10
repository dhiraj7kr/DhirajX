import React, { useState } from 'react';
import {
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
import ProjectCard from '../src/components/ProjectCard';
import SectionHeader from '../src/components/SectionHeader';
import TextInputField from '../src/components/TextInputField';
import { useAppData } from '../src/context/AppDataContext';
import { theme } from '../src/theme/theme';

const HomeScreen: React.FC = () => {
  const { data, pickProfileImage, updateProfile } = useAppData();
  const { profile, projects } = data;
  const featured = projects[0];

  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [tagline, setTagline] = useState(profile.tagline);

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const saveProfile = () => {
    updateProfile({ ...profile, name, role, tagline });
    setEditVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
          <View style={{ marginLeft: theme.spacing(2) }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.role}>{profile.role}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setEditVisible(true)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tagline}>{profile.tagline}</Text>

      <SectionHeader
        title="Featured Project"
        subtitle="A highlight from your work"
      />
      {featured ? (
        <ProjectCard
          project={featured}
          onPress={() => {
            // Real navigation via Projects tab
            alert('Open this project from the Projects tab to see details.');
          }}
        />
      ) : (
        <Text style={styles.emptyText}>No projects yet. Add some!</Text>
      )}

      <SectionHeader title="Connect" subtitle="Quick links to your profiles" />
      <View style={styles.socialRow}>
        <IconButton
          label="GitHub"
          onPress={() => openLink(profile.social.github)}
          style={styles.socialButton}
        />
        <IconButton
          label="LinkedIn"
          onPress={() => openLink(profile.social.linkedin)}
          style={styles.socialButton}
        />
        {!!profile.social.website && (
          <IconButton
            label="Website"
            onPress={() => openLink(profile.social.website)}
            style={styles.socialButton}
          />
        )}
      </View>

      {/* Edit profile modal */}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  avatarInitials: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '700'
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: '700'
  },
  role: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.base
  },
  editText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.sm,
    fontWeight: '500'
  },
  tagline: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(2)
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(2)
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(4)
  },
  socialButton: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: theme.spacing(2)
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(2)
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
