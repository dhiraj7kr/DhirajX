import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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
  const [title, setTitle] = useState(project?.title ?? '');
  const [shortDescription, setShortDescription] = useState(
    project?.shortDescription ?? ''
  );

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Project not found.</Text>
      </View>
    );
  }

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const saveProject = () => {
    updateProject(project.id, { title, shortDescription });
    setEditVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.tagsRow}>
            {project.techStack.map((t) => (
              <SkillTag key={t} label={t} style={styles.tag} />
            ))}
          </View>
        </View>
        <IconButton
          label="Edit"
          onPress={() => {
            setTitle(project.title);
            setShortDescription(project.shortDescription);
            setEditVisible(true);
          }}
        />
      </View>

      {project.screenshotUri ? (
        <Image source={{ uri: project.screenshotUri }} style={styles.image} />
      ) : null}
      <IconButton
        label={project.screenshotUri ? 'Change Screenshot' : 'Add Screenshot'}
        onPress={() => pickProjectScreenshot(project.id)}
        style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(2) }}
      />

      <SectionHeader title="Overview" />
      <Text style={styles.text}>{project.shortDescription}</Text>

      <SectionHeader title="Problem" />
      <Text style={styles.text}>{project.problem}</Text>

      <SectionHeader title="Solution" />
      <Text style={styles.text}>{project.solution}</Text>

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

      <SectionHeader title="Links" />
      <View style={styles.linksRow}>
        {project.githubUrl && (
          <IconButton
            label="GitHub"
            onPress={() => openLink(project.githubUrl)}
            style={styles.linkButton}
          />
        )}
        {project.liveUrl && (
          <IconButton
            label="Live Demo"
            onPress={() => openLink(project.liveUrl)}
            style={styles.linkButton}
          />
        )}
      </View>

      {/* Edit project modal */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Project</Text>
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
            <View style={styles.modalButtonsRow}>
              <IconButton
                label="Cancel"
                onPress={() => setEditVisible(false)}
                style={{ backgroundColor: theme.colors.border, flex: 1, marginRight: 8 }}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: '700'
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
