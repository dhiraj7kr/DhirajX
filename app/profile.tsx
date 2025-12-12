import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AboutView } from '../src/components/portfolio/AboutView';
import { ContactView } from '../src/components/portfolio/ContactView';
import { ProjectsView } from '../src/components/portfolio/ProjectsView';
import { theme } from '../src/theme/theme';

type TabOption = 'about' | 'projects' | 'contact';

export default function ProfileScreen() {
  // Default to 'projects' as it's the most visual part of a portfolio
  const [activeTab, setActiveTab] = useState<TabOption>('projects');

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutView />;
      case 'projects':
        return <ProjectsView />;
      case 'contact':
        return <ContactView />;
      default:
        return <ProjectsView />;
    }
  };

  return (
    <View style={styles.screen}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <Text style={styles.headerSubtitle}>My work, journey, and contacts.</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.tabContainer}>
        <SegmentButton
          title="Projects"
          active={activeTab === 'projects'}
          onPress={() => setActiveTab('projects')}
        />
        <SegmentButton
          title="About"
          active={activeTab === 'about'}
          onPress={() => setActiveTab('about')}
        />
        <SegmentButton
          title="Contact"
          active={activeTab === 'contact'}
          onPress={() => setActiveTab('contact')}
        />
      </View>

      {/* Dynamic Content Area */}
      <View style={styles.contentArea}>{renderContent()}</View>
    </View>
  );
}

// Helper Button Component
const SegmentButton = ({
  title,
  active,
  onPress
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60 // Adjust based on your Status Bar
  },
  header: {
    paddingHorizontal: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  headerTitle: {
    fontSize: 28, // theme.fontSize.xxl
    fontWeight: '800',
    color: theme.colors.text
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing(2),
    backgroundColor: '#fff',
    borderRadius: 12, // theme.radius.lg
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing(1)
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8 // theme.radius.md
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  segmentTextActive: {
    color: '#FFFFFF'
  },
  contentArea: {
    flex: 1
  }
});