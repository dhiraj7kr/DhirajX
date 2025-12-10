import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SUMMARY */}
        <LinearGradient
          colors={['#EEF2FF', '#EFF6FF', '#F9FAFB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>ABOUT DHIRAJ</Text>
              <Text style={styles.heroTitle}>{profile.role}</Text>
              <Text style={styles.heroSubTitle}>{profile.location}</Text>
            </View>
            <Ionicons
              name="person-outline"
              size={32}
              color={theme.colors.primary}
            />
          </View>

          <Text style={styles.heroBody}>
            I&apos;m {profile.name}, a {profile.role} focused on building
            AI-powered systems, scalable backends, and polished frontends. I love
            turning complex workflows into simple, automated, user-friendly
            experiences.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>2+ yrs</Text>
              <Text style={styles.heroStatLabel}>Industry Experience</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>AI · Full-stack</Text>
              <Text style={styles.heroStatLabel}>Core Focus</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>Open</Text>
              <Text style={styles.heroStatLabel}>Roles & Collabs</Text>
            </View>
          </View>
        </LinearGradient>

        {/* SKILLS CARD */}
        <View style={styles.sectionSpacing}>
          <SectionHeader
            title="Technical Skills"
            subtitle="Grouped by strengths"
          />
          <View style={styles.skillsCard}>
            {skills.map((cat) => (
              <View key={cat.id} style={styles.skillCategory}>
                <View style={styles.skillCategoryHeader}>
                  <View style={styles.skillDot} />
                  <Text style={styles.skillCategoryTitle}>{cat.name}</Text>
                </View>
                <View style={styles.skillRow}>
                  {cat.skills.map((s) => (
                    <SkillTag key={s} label={s} style={styles.skillTag} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* EXPERIENCE + EDUCATION TIMELINE */}
        <View style={styles.sectionSpacing}>
          <SectionHeader
            title="Experience & Education"
            subtitle="A quick timeline of what I’ve done so far"
          />

          <View style={styles.timelineContainer}>
            <View style={styles.timelineBar} />

            <View style={styles.timelineContent}>
              {/* Experience */}
              {experience.map((ex) => (
                <View key={ex.id} style={styles.timelineItem}>
                  <View style={styles.timelineDotOuter}>
                    <View style={styles.timelineDotInner} />
                  </View>
                  <View style={styles.timelineItemBody}>
                    <Text style={styles.timelineTitle}>
                      {ex.role} · {ex.company}
                    </Text>
                    <Text style={styles.timelineMeta}>
                      {ex.location} · {ex.period}
                    </Text>
                    {ex.details.map((d, idx) => (
                      <Text key={idx} style={styles.timelineText}>
                        • {d}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}

              {/* Education */}
              {education.map((e) => (
                <View key={e.id} style={styles.timelineItem}>
                  <View style={styles.timelineDotOuter}>
                    <View
                      style={[styles.timelineDotInner, styles.timelineDotEdu]}
                    />
                  </View>
                  <View style={styles.timelineItemBody}>
                    <Text style={styles.timelineTitle}>{e.title}</Text>
                    <Text style={styles.timelineMeta}>{e.institution}</Text>
                    <Text style={styles.timelineMeta}>{e.period}</Text>
                    {e.score && (
                      <Text style={styles.timelineText}>{e.score}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* CERTIFICATIONS CARD */}
        <View style={styles.sectionSpacing}>
          <SectionHeader title="Certifications" />
          <View style={styles.certCard}>
            <View style={styles.certRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.certText}>
                C# Basics for Beginners: Learn C# Fundamentals by Coding — Udemy
              </Text>
            </View>
            <View style={styles.certRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.certText}>
                Java 8+ Essential Training: Objects and APIs — LinkedIn Learning
              </Text>
            </View>
            <View style={styles.certRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.certText}>
                Oracle Fusion Cloud Applications HCM Certified Foundations
                Associate — Oracle University
              </Text>
            </View>
          </View>
        </View>

        {/* bottom spacer so content doesn't hug screen edge */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  // full screen bg
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  // scroll view
  container: {
    flex: 1
  },
  // inner padding & spacing
  contentContainer: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(10),     // distance from top
    paddingBottom: theme.spacing(4)   // distance from bottom
  },

  sectionSpacing: {
    marginTop: theme.spacing(3)
  },

  // HERO
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
  heroSubTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing(1),
    lineHeight: 20
  },
  heroStatsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing(2),
    justifyContent: 'space-between'
  },
  heroStatItem: {
    flex: 1,
    marginRight: theme.spacing(1)
  },
  heroStatValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    fontWeight: '700'
  },
  heroStatLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs
  },

  // SKILLS
  skillsCard: {
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
  skillCategory: {
    marginBottom: theme.spacing(2)
  },
  skillCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginRight: 6
  },
  skillCategoryTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    fontWeight: '600'
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skillTag: {
    marginRight: 4,
    marginBottom: 4
  },

  // TIMELINE
  timelineContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing(1.5)
  },
  timelineBar: {
    width: 2,
    backgroundColor: '#E5E7EB',
    marginRight: theme.spacing(2),
    marginTop: 4,
    borderRadius: 999
  },
  timelineContent: {
    flex: 1
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing(2)
  },
  timelineDotOuter: {
    width: 18,
    alignItems: 'center'
  },
  timelineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent
  },
  timelineDotEdu: {
    backgroundColor: theme.colors.primary
  },
  timelineItemBody: {
    flex: 1
  },
  timelineTitle: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  timelineMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginBottom: 2
  },
  timelineText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm
  },

  // CERTIFICATIONS
  certCard: {
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
  certRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  certText: {
    marginLeft: 6,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    flex: 1
  },

  footerSpace: {
    height: theme.spacing(1.5)
  }
});
