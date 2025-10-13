import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestEventScreen() {
  console.log('🔴 [TestEventScreen] ==========================================');
  console.log('🔴 [TestEventScreen] TEST COMPONENT MOUNTED!');
  console.log('🔴 [TestEventScreen] This confirms navigation is working');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 TEST EVENT SCREEN 🎉</Text>
      <Text style={styles.subtitle}>Navigation is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#00ff00',
  },
});