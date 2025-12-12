import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppData } from '../../context/AppDataContext';
import { theme } from '../../theme/theme';

export const ProjectsView: React.FC = () => {
  const { data } = useAppData();
  const { projects } = data;

  const openLink = (url?: string) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Featured Projects</Text>
        <Text style={styles.sectionSubtitle}>
          A selection of my recent work in AI and Mobile Dev.
        </Text>

        {projects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            {/* Project Header */}
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Feather name="box" size={24} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectShortDesc}>
                  {project.shortDescription}
                </Text>
              </View>
            </View>

            {/* Tech Stack Tags */}
            <View style={styles.techRow}>
              {project.techStack.map((tech) => (
                <View key={tech} style={styles.techTag}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
            </View>

            {/* Problem & Solution (Optional - keeps it clean) */}
            <View style={styles.detailSection}>
              <Text style={styles.label}>PROBLEM</Text>
              <Text style={styles.bodyText} numberOfLines={3}>
                {project.problem}
              </Text>
            </View>

            {/* Links */}
            <View style={styles.footerRow}>
              {project.githubUrl ? (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => openLink(project.githubUrl)}
                >
                  <Ionicons name="logo-github" size={18} color={theme.colors.text} />
                  <Text style={styles.linkText}>Code</Text>
                </TouchableOpacity>
              ) : null}
              {project.liveUrl ? (
                <TouchableOpacity
                  style={[styles.linkButton, styles.liveButton]}
                  onPress={() => openLink(project.liveUrl)}
                >
                  <Ionicons name="globe-outline" size={18} color="#fff" />
                  <Text style={[styles.linkText, { color: '#fff' }]}>Live Demo</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}
        {/* Bottom spacer */}
        <View style={{ height: theme.spacing(4) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(8)
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(2),
    marginTop: 4
  },
  projectCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  projectTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: theme.colors.text
  },
  projectShortDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  techTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6
  },
  techText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  detailSection: { marginTop: 12 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 4
  },
  bodyText: { fontSize: 13, color: theme.colors.text, lineHeight: 20 },
  footerRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 12
  },
  liveButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  linkText: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginLeft: 6 }
});