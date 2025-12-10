import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ProjectCard from '../../src/components/ProjectCard';
import SectionHeader from '../../src/components/SectionHeader';
import { useAppData } from '../../src/context/AppDataContext';
import { theme } from '../../src/theme/theme';

const ProjectsScreen: React.FC = () => {
  const { data } = useAppData();
  const router = useRouter();

  const goToProject = (id: string) => {
    router.push(`/projects/${id}`);
  };

  return (
    <View style={styles.container}>
      {/* Futuristic header card */}
      <LinearGradient
        colors={['#EEF2FF', '#EFF6FF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>PROJECTS DASHBOARD</Text>
            <Text style={styles.heroTitle}>Showcase & Edit</Text>
            <Text style={styles.heroSubtitle}>
              Browse your portfolio projects, view details, and update content
              instantly as your work evolves.
            </Text>
          </View>
          <Ionicons name="layers-outline" size={32} color={theme.colors.primary} />
        </View>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaItem}>
            <Ionicons
              name="code-slash-outline"
              size={18}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.heroMetaText}>
              {data.projects.length} curated project
              {data.projects.length === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={styles.heroMetaItem}>
            <Ionicons
              name="create-outline"
              size={18}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.heroMetaText}>Tap any project to view & edit</Text>
          </View>
        </View>
      </LinearGradient>

      {/* List */}
      <View style={{ marginTop: theme.spacing(3), flex: 1 }}>
        <SectionHeader
          title="Projects"
          subtitle="Select a project to see full details and edit everything."
        />
        <FlatList
          data={data.projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProjectCard
                project={item}
                onPress={() => goToProject(item.id)}
              />
              <View style={styles.cardFooterRow}>
                <TouchableOpacity
                  style={styles.cardFooterButton}
                  onPress={() => goToProject(item.id)}
                >
                  <Ionicons
                    name="eye-outline"
                    size={16}
                    color={theme.colors.primaryDark}
                  />
                  <Text style={styles.cardFooterText}>View & Edit</Text>
                </TouchableOpacity>
                {item.githubUrl ? (
                  <View style={styles.cardFooterBadge}>
                    <Ionicons
                      name="logo-github"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.cardFooterBadgeText}>GitHub linked</Text>
                  </View>
                ) : (
                  <View style={[styles.cardFooterBadge, styles.cardFooterBadgeMuted]}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.cardFooterBadgeText}>Add GitHub link</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: theme.spacing(4) }}
        />
      </View>
    </View>
  );
};

export default ProjectsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing(2)
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center'
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
    marginTop: theme.spacing(1.5)
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
  cardWrapper: {
    marginTop: theme.spacing(1.5)
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4
  },
  cardFooterButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardFooterText: {
    marginLeft: 4,
    color: theme.colors.primaryDark,
    fontSize: theme.fontSize.xs,
    fontWeight: '500'
  },
  cardFooterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB'
  },
  cardFooterBadgeMuted: {
    backgroundColor: '#F3F4F6'
  },
  cardFooterBadgeText: {
    marginLeft: 4,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  }
});
