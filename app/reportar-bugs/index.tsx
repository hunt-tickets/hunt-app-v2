import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Typography } from '../../constants/fonts';
import * as Haptics from 'expo-haptics';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const { width, height } = Dimensions.get('window');

type ReportType = 'bug' | 'feedback' | 'feature';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface ReportForm {
  type: ReportType;
  description: string;
  steps: string;
  priority: Priority;
  email: string;
  device: string;
}

export default function ReportarBugsScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [form, setForm] = useState<ReportForm>({
    type: 'bug',
    description: '',
    steps: '',
    priority: 'medium',
    email: session?.user?.email || '',
    device: Platform.OS === 'ios' ? 'iPhone' : 'Android',
  });
  const [loading, setLoading] = useState(false);

  const reportTypes = ['Bug', 'Feedback', 'Solicitud'];
  const typeMapping: ReportType[] = ['bug', 'feedback', 'feature'];

  const handleTypeChange = (index: number) => {
    setSelectedTypeIndex(index);
    setForm(prev => ({ ...prev, type: typeMapping[index] }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePriorityChange = (priority: Priority) => {
    setForm(prev => ({ ...prev, priority }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const validateForm = (): boolean => {
    if (!form.description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return false;
    }
    if (form.type === 'bug' && !form.steps.trim()) {
      Alert.alert('Error', 'Por favor describe los pasos para reproducir el bug');
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Report submitted:', form);

      Alert.alert(
        'Enviado',
        '¡Gracias por tu reporte! Lo revisaremos pronto.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setForm({
                type: 'bug',
                description: '',
                steps: '',
                priority: 'medium',
                email: session?.user?.email || '',
                device: Platform.OS === 'ios' ? 'iPhone' : 'Android',
              });
              setSelectedTypeIndex(0);
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'No se pudo enviar el reporte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'rgba(52, 199, 89, 0.8)';
      case 'medium': return 'rgba(255, 149, 0, 0.8)';
      case 'high': return 'rgba(255, 59, 48, 0.8)';
      case 'urgent': return 'rgba(175, 82, 222, 0.8)';
      default: return 'rgba(255, 149, 0, 0.8)';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'chevron-down';
      case 'medium': return 'remove';
      case 'high': return 'chevron-up';
      case 'urgent': return 'flame';
      default: return 'remove';
    }
  };

  const styles = createStyles(theme, insets);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradientOverlay}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />


      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Report Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de reporte</Text>
            <SegmentedControl
              values={reportTypes}
              selectedIndex={selectedTypeIndex}
              onChange={(event) => handleTypeChange(event.nativeEvent.selectedSegmentIndex)}
              style={styles.segmentedControl}
            />
          </View>


          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>
              {form.type === 'bug' ? 'Descripción del problema' :
               form.type === 'feedback' ? 'Describe tu feedback' :
               'Describe tu solicitud'} *
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder={
                form.type === 'bug' ? 'Describe qué está pasando y qué esperabas que pasara...' :
                form.type === 'feedback' ? 'Comparte tus comentarios y sugerencias...' :
                'Explica qué funcionalidad te gustaría que añadiéramos...'
              }
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Steps to reproduce (only for bugs) */}
          {form.type === 'bug' && (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Pasos para reproducir *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="1. Abre la app&#10;2. Ve a la sección de eventos&#10;3. Toca en un evento&#10;4. La app se cierra"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={form.steps}
                onChangeText={(text) => setForm(prev => ({ ...prev, steps: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Priority (only for bugs and feature requests) */}
          {(form.type === 'bug' || form.type === 'feature') && (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Prioridad</Text>
              <View style={styles.priorityContainer}>
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      form.priority === priority && { backgroundColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => handlePriorityChange(priority)}
                  >
                    <Ionicons
                      name={getPriorityIcon(priority) as any}
                      size={16}
                      color="#ffffff"
                    />
                    <Text style={styles.priorityText}>
                      {priority === 'low' ? 'Baja' :
                       priority === 'medium' ? 'Media' :
                       priority === 'high' ? 'Alta' : 'Urgente'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Email de contacto *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="tu@email.com"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={form.email}
              onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Device Info */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Dispositivo</Text>
            <TextInput
              style={styles.textInput}
              placeholder="iPhone 14 Pro, Android Galaxy S23, etc."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={form.device}
              onChangeText={(text) => setForm(prev => ({ ...prev, device: text }))}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <View style={styles.submitButtonContent}>
              {loading ? (
                <>
                  <Text style={styles.submitButtonText}>Enviando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#000000" />
                  <Text style={styles.submitButtonText}>
                    {form.type === 'bug' ? 'Reportar Bug' :
                     form.type === 'feedback' ? 'Enviar Feedback' :
                     'Enviar Solicitud'}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons name="information-circle-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.helpText}>
              Tu reporte nos ayuda a mejorar la app. Te contactaremos si necesitamos más información.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: insets.top + 80,
    paddingBottom: insets.bottom + 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.title3,
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: '600',
  },
  segmentedControl: {
    height: 36,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 22,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
    lineHeight: 24,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  priorityText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
});