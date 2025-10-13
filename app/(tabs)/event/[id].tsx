import React from 'react';
import { View, Text } from 'react-native';

export default function EventDetailScreen() {
  console.log('🔵 [EventDetailScreen] COMPONENT MOUNTED!');
  console.log('🔵 [EventDetailScreen] This log should appear if navigation works');

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
        🎉 EVENT DETAIL SCREEN 🎉
      </Text>
      <Text style={{ color: '#00ff00', fontSize: 18, marginTop: 20 }}>
        Navigation is working!
      </Text>
    </View>
  );
}