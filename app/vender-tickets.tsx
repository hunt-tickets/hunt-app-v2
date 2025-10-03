import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { Typography } from '../constants/fonts';

const { width } = Dimensions.get('window');

export default function VenderTicketsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  // Personal dashboard data
  const personalStats = {
    entradas: 16,
    ventasEfectivo: 896000,
    ventasLink: 0,
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleGoBack}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Personal Dashboard Cards */}
        <View style={styles.dashboardCards}>
          {/* Entradas Card */}
          <View style={styles.dashboardCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Entradas</Text>
              <Ionicons name="bar-chart" size={20} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.cardValue}>{personalStats.entradas}</Text>
          </View>

          {/* Ventas Efectivo Card */}
          <View style={styles.dashboardCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Ventas Efectivo</Text>
              <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.cardValue}>$ {personalStats.ventasEfectivo.toLocaleString()}</Text>
          </View>
        </View>

        {/* Ventas por link personal - Full width */}
        <View style={styles.linkCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ventas por link personal</Text>
            <Ionicons name="globe" size={20} color={theme.colors.textSecondary} />
          </View>
          <Text style={styles.cardValue}>$ {personalStats.ventasLink}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="document-text" size={20} color={theme.colors.text} />
            <Text style={styles.actionButtonText}>Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="download" size={20} color={theme.colors.text} />
            <Text style={styles.actionButtonText}>Exportar</Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>Información de los últimos 30 días</Text>

        {/* Próximos Eventos */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>

          {/* CESA Event Card */}
          <View style={styles.eventCard}>
            <LinearGradient
              colors={['#6B46C1', '#EC4899', '#EF4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.eventGradient}
            >
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>CESA</Text>
                <View style={styles.eventDates}>
                  <Text style={styles.eventDate}>LUN 06 OCT</Text>
                  <Text style={styles.eventDate}>SÁB 11 OCT</Text>
                </View>
                <View style={styles.eventIcon}>
                  <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Selling Options */}
          <View style={styles.sellingOptions}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="link" size={20} color={theme.colors.text} />
              <Text style={styles.optionText}>Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="cash" size={20} color={theme.colors.text} />
              <Text style={styles.optionText}>Efectivo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="list" size={20} color={theme.colors.text} />
              <Text style={styles.optionText}>Listas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="gift" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {[0, 1, 2, 3, 4, 5].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: index === 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)' }
                ]}
              />
            ))}
          </View>
        </View>

        {/* FAQs Section */}
        <View style={styles.faqsSection}>
          <Text style={styles.sectionTitle}>FAQs</Text>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.faqTitle}>Información de uso</Text>
            </View>
            <Text style={styles.faqDescription}>
              En esta sección podrás vender entradas, compartir links y ver tus ventas en tiempo real.
            </Text>
            <Text style={styles.faqSubtext}>
              Consejos para aprovecharla al máximo:
            </Text>
            <Text style={styles.faqTip}>
              - En la parte superior encontrarás tu dashboard con el resumen
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 24,
    height: 140,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Typography.title1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 140,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 20,
  },
  dashboardCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  linkCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  eventsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  eventCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  eventGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  eventContent: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 16,
  },
  eventDates: {
    flexDirection: 'row',
    gap: 40,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  eventIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  sellingOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  faqsSection: {},
  faqCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  faqDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  faqSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  faqTip: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});