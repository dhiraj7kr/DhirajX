import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ProjectCard from '../../src/components/ProjectCard';
import SectionHeader from '../../src/components/SectionHeader';
import { useAppData } from '../../src/context/AppDataContext';
import { theme } from '../../src/theme/theme';

const ProjectsScreen: React.FC = () => {
  const { data } = useAppData();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Projects"
        subtitle="A list of your work with tech tags"
      />
      <FlatList
        data={data.projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => router.push(`/projects/${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: theme.spacing(4) }}
      />
    </View>
  );
};

export default ProjectsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing(2)
  }
});
