import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import IconButton from '../../src/components/IconButton';
import SectionHeader from '../../src/components/SectionHeader';
import SkillTag from '../../src/components/SkillTag';
import TextInputField from '../../src/components/TextInputField';
import { useAppData } from '../../src/context/AppDataContext';
import { theme } from '../../src/theme/theme';

const ProjectDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, pickProjectScreenshot, updateProject } = useAppData();

  const project = useMemo(
    () => data.projects.find((p) => p.id === id),
    [data.projects, id]
  );

  const [editVisible, setEditVisible] = useState(false);

  // Local edit state for all fields
  const [title, setTitle] = useState(project?.title ?? '');
  const [shortDescription, setShortDescription] = useState(
    project?.shortDescription ?? ''
  );
  const [problem, setProblem] = useState(project?.problem ?? '');
  const [solution, setSolution] = useState(project?.solution ?? '');
  const [techStackText, setTechStackText] = useState(
    project?.techStack?.join(', ') ?? ''
  );
  const [featuresText, setFeaturesText] = useState(
    project?.features?.join(', ') ?? ''
  );
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '');
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '');

  // Sync local state if project changes (e.g. after reload)
  useEffect(() => {
    if (!project) return;
    setTitle(project.title);
    setShortDescription(project.shortDescription);
    setProblem(project.problem);
    setSolution(project.solution);
    setTechStackText(project.techStack.join(', '));
    setFeaturesText(project.features.join(', '));
    setGithubUrl(project.githubUrl ?? '');
    setLiveUrl(project.liveUrl ?? '');
  }, [project]);

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Project not found.</Text>
      </View>
    );
  }

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open the link.')
    );
  };

  const saveProject = () => {
    const techStack = techStackText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const features = featuresText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateProject(project.id, {
      title,
      shortDescription,
      problem,
      solution,
      techStack,
      features,
      githubUrl: githubUrl || undefined,
      liveUrl: liveUrl || undefined
    });

    setEditVisible(false);
    Alert.alert('Saved', 'Project details have been updated.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Futuristic header with gradient */}
      <LinearGradient
        colors={['#EEF2FF', '#EFF6FF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>PROJECT DETAIL</Text>
            <Text style={styles.title}>{project.title}</Text>
            <View style={styles.tagsRow}>
              {project.techStack.map((t) => (
                <SkillTag key={t} label={t} style={styles.tag} />
              ))}
            </View>
          </View>
          <View style={styles.heroActions}>
            {project.githubUrl ? (
              <IconButton
                label="GitHub"
                onPress={() => openLink(project.githubUrl)}
                style={styles.heroSmallButton}
              />
            ) : null}
            <IconButton
              label="Edit"
              onPress={() => setEditVisible(true)}
              style={styles.heroSmallButton}
            />
          </View>
        </View>

        <View style={styles.heroMetaRow}>
          {project.githubUrl ? (
            <View style={styles.heroMetaItem}>
              <Ionicons
                name="logo-github"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.heroMetaText}>GitHub linked</Text>
            </View>
          ) : (
            <View style={styles.heroMetaItem}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.heroMetaText}>Add GitHub URL for this project</Text>
            </View>
          )}
          {project.liveUrl ? (
            <View style={styles.heroMetaItem}>
              <Ionicons
                name="cloud-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.heroMetaText}>Live demo available</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      {/* Screenshot */}
      {project.screenshotUri ? (
        <Image source={{ uri: project.screenshotUri }} style={styles.image} />
      ) : null}
      <IconButton
        label={project.screenshotUri ? 'Change Screenshot' : 'Add Screenshot'}
        onPress={() => pickProjectScreenshot(project.id)}
        style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(2) }}
      />

      {/* Overview */}
      <SectionHeader title="Overview" />
      <Text style={styles.text}>{project.shortDescription}</Text>

      {/* Problem */}
      <SectionHeader title="Problem" />
      <Text style={styles.text}>{project.problem}</Text>

      {/* Solution */}
      <SectionHeader title="Solution" />
      <Text style={styles.text}>{project.solution}</Text>

      {/* Features */}
      {project.features.length ? (
        <>
          <SectionHeader title="Key Features" />
          {project.features.map((f) => (
            <Text key={f} style={styles.text}>
              • {f}
            </Text>
          ))}
        </>
      ) : null}

      {/* Links */}
      <SectionHeader title="Links" />
      <View style={styles.linksRow}>
        <IconButton
          label="GitHub"
          onPress={() => openLink(project.githubUrl)}
          style={styles.linkButton}
        />
        <IconButton
          label="Live Demo"
          onPress={() => openLink(project.liveUrl)}
          style={styles.linkButton}
        />
      </View>

      {/* EDIT MODAL – full project editor */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Project Details</Text>

            <ScrollView
              style={{ maxHeight: 500 }}
              contentContainerStyle={{ paddingBottom: theme.spacing(1) }}
            >
              <TextInputField
                label="Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInputField
                label="Short Description"
                value={shortDescription}
                onChangeText={setShortDescription}
                multiline
              />
              <TextInputField
                label="Problem"
                value={problem}
                onChangeText={setProblem}
                multiline
              />
              <TextInputField
                label="Solution"
                value={solution}
                onChangeText={setSolution}
                multiline
              />
              <TextInputField
                label="Tech Stack (comma separated)"
                value={techStackText}
                onChangeText={setTechStackText}
                multiline
              />
              <TextInputField
                label="Features (comma separated)"
                value={featuresText}
                onChangeText={setFeaturesText}
                multiline
              />
              <TextInputField
                label="GitHub URL"
                value={githubUrl}
                onChangeText={setGithubUrl}
                keyboardType="url"
              />
              <TextInputField
                label="Live Demo URL"
                value={liveUrl}
                onChangeText={setLiveUrl}
                keyboardType="url"
              />
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <IconButton
                label="Cancel"
                onPress={() => setEditVisible(false)}
                style={{
                  backgroundColor: theme.colors.border,
                  flex: 1,
                  marginRight: 8
                }}
              />
              <IconButton
                label="Save"
                onPress={saveProject}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProjectDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing(2)
  },
  errorText: {
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing(4)
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
    elevation: 3,
    marginBottom: theme.spacing(2)
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  heroLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    marginTop: 2
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  tag: {
    marginRight: 4,
    marginBottom: 4
  },
  heroActions: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  },
  heroSmallButton: {
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.8),
    marginBottom: 4
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
  image: {
    width: '100%',
    height: 220,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing(1)
  },
  text: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontSize: theme.fontSize.base
  },
  linksRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(1)
  },
  linkButton: {
    marginRight: theme.spacing(1)
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
