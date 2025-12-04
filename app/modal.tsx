import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quick add placeholder</Text>
      <Text style={styles.caption}>This modal will become the shared form for courses, assignments, and study logs.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput placeholder="Study sprint name" placeholderTextColor="#9BA1A6" style={styles.input} />

        <Text style={styles.label}>Course</Text>
        <TextInput placeholder="Select course" placeholderTextColor="#9BA1A6" style={styles.input} />

        <Text style={styles.label}>Deadline / start time</Text>
        <TextInput placeholder="Use date picker soon" placeholderTextColor="#9BA1A6" style={styles.input} />
      </View>

      <View style={styles.footer}>
        <Link href="/" dismissTo style={styles.closeLink}>
          <Text style={styles.closeText}>Close preview</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 24,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  caption: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F8FAFC',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  closeLink: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  closeText: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },
});
