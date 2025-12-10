import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionHeader from '../src/components/SectionHeader';
import SkillTag from '../src/components/SkillTag';
import { useAppData } from '../src/context/AppDataContext';
import { theme } from '../src/theme/theme';

const AboutScreen: React.FC = () => {
  const { data } = useAppData();
  const { profile, skills, education, experience } = data;

  return (
    <ScrollView style={styles.container}>
      <SectionHeader title="About" />
      <Text style={styles.text}>
        Hi, I&apos;m {profile.name}, a {profile.role}. I enjoy building clean,
        scalable apps and learning new tools to ship value quickly.
      </Text>

      <SectionHeader title="Skills" subtitle="Grouped by category" />
      {skills.map((cat) => (
        <View key={cat.id} style={styles.skillCategory}>
          <Text style={styles.skillCategoryTitle}>{cat.name}</Text>
          <View style={styles.skillRow}>
            {cat.skills.map((s) => (
              <SkillTag key={s} label={s} style={styles.skillTag} />
            ))}
          </View>
        </View>
      ))}

      <SectionHeader title="Education" />
      {education.map((e) => (
        <View key={e.id} style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>{e.title}</Text>
            <Text style={styles.timelineSubtitle}>{e.institution}</Text>
            <Text style={styles.timelinePeriod}>{e.period}</Text>
          </View>
        </View>
      ))}

      <SectionHeader title="Experience" />
      {experience.map((ex) => (
        <View key={ex.id} style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>{ex.role}</Text>
            <Text style={styles.timelineSubtitle}>{ex.company}</Text>
            <Text style={styles.timelinePeriod}>{ex.period}</Text>
            <Text style={styles.text}>{ex.details}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing(2)
  },
  text: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(2)
  },
  skillCategory: {
    marginBottom: theme.spacing(2)
  },
  skillCategoryTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    marginBottom: 4
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skillTag: {
    marginRight: 4,
    marginBottom: 4
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing(2)
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
    marginTop: 4,
    marginRight: theme.spacing(1)
  },
  timelineContent: {
    flex: 1
  },
  timelineTitle: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  timelineSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm
  },
  timelinePeriod: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 4
  }
});
