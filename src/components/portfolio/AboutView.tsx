import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '../../context/AppDataContext';
import { theme } from '../../theme/theme';

export const AboutView: React.FC = () => {
  const { data } = useAppData();
  const { profile, experience, education, skills } = data;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Text style={styles.bioText}>{profile.tagline}</Text>

        {/* EXPERIENCE */}
        <View style={styles.sectionHeader}>
          <Ionicons name="briefcase-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Experience</Text>
        </View>

        <View style={styles.timeline}>
          {experience.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              {/* Vertical line logic could go here, simplified for now */}
              <View style={styles.timelineContent}>
                <Text style={styles.role}>{item.role}</Text>
                <Text style={styles.company}>
                  {item.company} · {item.period}
                </Text>
                <Text style={styles.details} numberOfLines={4}>
                  {item.details[0]}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* EDUCATION */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Ionicons name="school-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Education</Text>
        </View>
        {education.map((edu) => (
          <View key={edu.id} style={styles.card}>
            <Text style={styles.role}>{edu.title}</Text>
            <Text style={styles.company}>{edu.institution}</Text>
            <Text style={styles.date}>{edu.period}</Text>
            {edu.score && <Text style={styles.score}>{edu.score}</Text>}
          </View>
        ))}

        {/* SKILLS */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Ionicons name="code-slash-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Technical Skills</Text>
        </View>

        {skills.map((cat) => (
          <View key={cat.id} style={{ marginBottom: 16 }}>
            <Text style={styles.skillCatName}>{cat.name}</Text>
            <View style={styles.skillRow}>
              {cat.skills.map((s) => (
                <View key={s} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: theme.spacing(6) }} />
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
  bioText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: 8
  },
  timeline: { paddingLeft: 8 },
  timelineItem: {
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 16
  },
  timelineContent: {},
  role: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  company: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  details: { fontSize: 13, color: '#475569', marginTop: 6, lineHeight: 20 },
  date: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  score: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary
  },
  skillCatName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap' },
  skillBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  skillText: { fontSize: 12, color: theme.colors.primaryDark, fontWeight: '500' }
});