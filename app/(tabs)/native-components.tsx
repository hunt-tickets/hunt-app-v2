import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Button,
  TextInput,
  ActivityIndicator,
  Modal,
  StatusBar,
  RefreshControl,
  Alert,
  Platform,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
// SwiftUI components removed - using Native Tabs approach instead

export default function NativeComponentsScreen() {
  const [switchValue, setSwitchValue] = useState(false);
  const [switchValue2, setSwitchValue2] = useState(true);
  const [textInputValue, setTextInputValue] = useState('');
  const [sliderValue, setSliderValue] = useState(0.5);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Note: Native Tabs approach works perfectly for iOS 26 Liquid Glass
  // This is the proven method that actually works!

  const testComponents = [
    {
      name: 'Switch',
      description: 'Maps to UISwitch - Should show iOS 26 Liquid Glass',
      component: (
        <View style={styles.componentRow}>
          <Switch
            value={switchValue}
            onValueChange={setSwitchValue}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={switchValue ? '#f5dd4b' : '#f4f3f4'}
          />
          <Switch
            value={switchValue2}
            onValueChange={setSwitchValue2}
            trackColor={{ false: '#333333', true: '#4CAF50' }}
            thumbColor={switchValue2 ? '#ffffff' : '#cccccc'}
          />
        </View>
      )
    },
    {
      name: 'Button',
      description: 'Maps to UIButton - Should show iOS 26 Liquid Glass',
      component: (
        <View style={styles.componentRow}>
          <Button
            title="iOS Button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Native Button', 'This is a native UIButton!');
            }}
            color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'}
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Secondary"
            onPress={() => Alert.alert('Secondary Button')}
            color={Platform.OS === 'ios' ? '#FF3B30' : '#F44336'}
          />
        </View>
      )
    },
    {
      name: 'TextInput',
      description: 'Maps to UITextField - Should show iOS 26 Liquid Glass',
      component: (
        <TextInput
          style={styles.textInput}
          value={textInputValue}
          onChangeText={setTextInputValue}
          placeholder="Native iOS TextField..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          returnKeyType="done"
        />
      )
    },
    {
      name: 'ActivityIndicator',
      description: 'Maps to UIActivityIndicatorView - Should show iOS 26 style',
      component: (
        <View style={styles.componentRow}>
          <ActivityIndicator size="small" color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'} />
          <ActivityIndicator size="large" color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'} />
          <ActivityIndicator size="small" color="#FF3B30" />
        </View>
      )
    },
    {
      name: 'Slider',
      description: 'Maps to UISlider - Should show iOS 26 Liquid Glass',
      component: (
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={sliderValue}
            onValueChange={setSliderValue}
            minimumTrackTintColor={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'}
            maximumTrackTintColor="#CCCCCC"
            thumbTintColor={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'}
          />
          <Text style={styles.sliderValue}>{Math.round(sliderValue * 100)}%</Text>
        </View>
      )
    },
    {
      name: 'Pressable',
      description: 'Modern TouchableOpacity replacement - System press behavior',
      component: (
        <Pressable
          style={({ pressed }) => [
            styles.pressableButton,
            pressed && Platform.select({
              ios: { opacity: 0.6, transform: [{ scale: 0.98 }] },
              android: { backgroundColor: 'rgba(0, 122, 255, 0.1)' }
            })
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Pressable', 'Native press behavior!');
          }}
          android_ripple={{
            color: 'rgba(0, 122, 255, 0.3)',
            borderless: false
          }}
        >
          <Ionicons name="finger-print" size={24} color="#007AFF" />
          <Text style={styles.pressableText}>Native Pressable</Text>
        </Pressable>
      )
    },
    {
      name: 'Modal',
      description: 'Native Modal presentation - iOS/Android system modal',
      component: (
        <View style={styles.componentRow}>
          <Button
            title="Show Modal"
            onPress={() => setModalVisible(true)}
            color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'}
          />
        </View>
      )
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Native iOS Components</Text>
        <Text style={styles.subtitle}>Testing iOS 26 Liquid Glass Effects</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            title="Testing native refresh..."
          />
        }
      >
        <View style={styles.note}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.noteText}>
            Los componentes marcados con ✅ deberían mostrar automáticamente el efecto Liquid Glass de iOS 26
          </Text>
        </View>

        {/* Success Note */}
        <View style={[styles.note, styles.successNote]}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.noteText}>
            ✅ ¡Native Tabs funcionan perfectamente! Ahora apliquemos el mismo enfoque a los botones del header.
          </Text>
        </View>

        {/* React Native Components Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚛️ React Native Components</Text>
          <Text style={styles.sectionSubtitle}>Mapean a UIKit nativos</Text>
        </View>

        {testComponents.map((test, index) => (
          <View key={index} style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.componentName}>{test.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Native</Text>
              </View>
            </View>
            <Text style={styles.componentDescription}>{test.description}</Text>
            <View style={styles.componentContainer}>
              {test.component}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Compare estos componentes nativos con versiones personalizadas para ver la diferencia en iOS 26
          </Text>
        </View>
      </ScrollView>

      {/* Native Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Native iOS Modal</Text>
            <Text style={styles.modalText}>
              Este modal usa la presentación nativa del sistema iOS/Android
            </Text>
            <Button
              title="Cerrar"
              onPress={() => setModalVisible(false)}
              color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  noteText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  testCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  componentDescription: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  componentContainer: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    minHeight: 60,
    justifyContent: 'center',
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 16,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  sliderContainer: {
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 8,
  },
  pressableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  pressableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  buttonSpacer: {
    width: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888888',
  },
  swiftUICard: {
    borderColor: '#00D4AA',
    borderWidth: 2,
  },
  swiftUIBadge: {
    backgroundColor: '#00D4AA',
  },
  successNote: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
});