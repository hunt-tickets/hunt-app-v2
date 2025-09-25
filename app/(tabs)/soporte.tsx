import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SoporteScreen() {
  const supportOptions = [
    {
      id: 1,
      title: 'Chat en línea',
      subtitle: 'Respuesta inmediata',
      icon: 'chatbubble-outline',
      action: () => console.log('Chat support'),
    },
    {
      id: 2,
      title: 'WhatsApp',
      subtitle: '+57 300 123 4567',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/573001234567'),
    },
    {
      id: 3,
      title: 'Email',
      subtitle: 'soporte@hunt.com',
      icon: 'mail-outline',
      action: () => Linking.openURL('mailto:soporte@hunt.com'),
    },
    {
      id: 4,
      title: 'Teléfono',
      subtitle: '+57 (1) 234-5678',
      icon: 'call-outline',
      action: () => Linking.openURL('tel:+5712345678'),
    },
  ];

  const faqItems = [
    {
      id: 1,
      question: '¿Cómo puedo cancelar mi entrada?',
      answer: 'Puedes cancelar hasta 24 horas antes del evento.',
    },
    {
      id: 2,
      question: '¿Dónde encuentro mi código QR?',
      answer: 'En la sección "Mis Entradas" de la app.',
    },
    {
      id: 3,
      question: '¿Los precios incluyen impuestos?',
      answer: 'Sí, todos los precios mostrados incluyen impuestos.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Soporte</Text>
        <Text style={styles.subtitle}>Estamos aquí para ayudarte</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.supportCard}
              onPress={option.action}
            >
              <View style={styles.supportIcon}>
                <Ionicons name={option.icon as any} size={24} color="#ffffff" />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>{option.title}</Text>
                <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
          {faqItems.map((item) => (
            <View key={item.id} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  supportIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#333333',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#cccccc',
  },
  faqCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});