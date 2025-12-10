import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import IconButton from '../src/components/IconButton';
import SectionHeader from '../src/components/SectionHeader';
import TextInputField from '../src/components/TextInputField';
import { useAppData } from '../src/context/AppDataContext';
import { theme } from '../src/theme/theme';

const ContactScreen: React.FC = () => {
  const { data } = useAppData();
  const { contact, profile } = data;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (!name || !email || !message) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
    const mailto = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert('Error', 'Could not open email client.')
    );
  };

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container}>
      <SectionHeader
        title="Contact"
        subtitle="Send a quick message or reach me directly."
      />

      <Text style={styles.text}>
        This sends an email to <Text style={styles.highlight}>{contact.email}</Text>.
      </Text>

      <TextInputField label="Your Name" value={name} onChangeText={setName} />
      <TextInputField
        label="Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInputField
        label="Message"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <IconButton label="Send Message" onPress={sendMessage} />

      <SectionHeader
        title="Or connect via"
        subtitle="Social profiles & direct links"
      />

      <View style={styles.linksRow}>
        <IconButton
          label="GitHub"
          onPress={() => openLink(profile.social.github)}
          style={styles.linkButton}
        />
        <IconButton
          label="LinkedIn"
          onPress={() => openLink(profile.social.linkedin)}
          style={styles.linkButton}
        />
      </View>
    </ScrollView>
  );
};

export default ContactScreen;

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
  highlight: {
    color: theme.colors.accent
  },
  linksRow: {
    flexDirection: 'row',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4)
  },
  linkButton: {
    marginRight: theme.spacing(1)
  }
});
