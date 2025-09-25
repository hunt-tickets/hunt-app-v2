import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Typography, FontFamily } from '../../constants/fonts';

export default function EntradasScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingTickets = [
    {
      id: 1,
      title: 'MARÍA HELENA AMADOR',
      date: '29',
      month: 'SEP',
      location: 'Gimnasio Moderno',
      time: '8:00 PM',
      seat: 'Fila A - Asiento 12',
      qrCode: 'QR123456',
      status: 'valid',
      price: '$75.000',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'INSIDE PRESENTA',
      date: '20',
      month: 'SEP',
      location: 'Teatro Nacional',
      time: '7:30 PM',
      seat: 'General',
      qrCode: 'QR789012',
      status: 'valid',
      price: '$45.000',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    },
  ];

  const pastTickets = [
    {
      id: 3,
      title: 'CONCIERTO ROCK 2024',
      date: '15',
      month: 'AGO',
      location: 'Movistar Arena',
      time: '9:00 PM',
      seat: 'Platea B - 45',
      status: 'used',
      price: '$120.000',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
    },
  ];

  const handleTicketPress = (ticket: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Código QR',
      `Código: ${ticket.qrCode || 'N/A'}\n\n¿Mostrar código QR completo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Mostrar QR', onPress: () => console.log('Show QR') },
      ]
    );
  };

  const handleTabChange = (tab: string) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const renderTicket = (ticket: any) => (
    <TouchableOpacity
      key={ticket.id}
      style={[
        styles.ticketCard,
        ticket.status === 'used' && styles.ticketCardUsed,
      ]}
      onPress={() => handleTicketPress(ticket)}
    >
      <Image source={{ uri: ticket.image }} style={styles.ticketImage} />
      <View style={styles.ticketContent}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketDateBadge}>
            <Text style={styles.ticketDate}>{ticket.date}</Text>
            <Text style={styles.ticketMonth}>{ticket.month}</Text>
          </View>
          <View style={styles.ticketStatus}>
            <Ionicons 
              name={ticket.status === 'valid' ? 'checkmark-circle' : 'time-outline'} 
              size={16} 
              color={ticket.status === 'valid' ? '#4CAF50' : '#666666'} 
            />
            <Text style={[
              styles.statusText,
              ticket.status === 'valid' ? styles.statusValid : styles.statusUsed
            ]}>
              {ticket.status === 'valid' ? 'Válido' : 'Usado'}
            </Text>
          </View>
        </View>

        <Text style={styles.ticketTitle}>{ticket.title}</Text>
        <View style={styles.ticketDetails}>
          <View style={styles.ticketDetailRow}>
            <Ionicons name="location-outline" size={14} color="#cccccc" />
            <Text style={styles.ticketDetailText}>{ticket.location}</Text>
          </View>
          <View style={styles.ticketDetailRow}>
            <Ionicons name="time-outline" size={14} color="#cccccc" />
            <Text style={styles.ticketDetailText}>{ticket.time}</Text>
          </View>
          <View style={styles.ticketDetailRow}>
            <Ionicons name="person-outline" size={14} color="#cccccc" />
            <Text style={styles.ticketDetailText}>{ticket.seat}</Text>
          </View>
        </View>

        <View style={styles.ticketFooter}>
          <Text style={styles.ticketPrice}>{ticket.price}</Text>
          <TouchableOpacity style={styles.qrButton}>
            <Ionicons name="qr-code-outline" size={18} color="#ffffff" />
            <Text style={styles.qrButtonText}>QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Entradas</Text>
        <TouchableOpacity 
          style={styles.walletButton}
          onPress={() => console.log('Wallet pressed')}
        >
          <Ionicons name="wallet-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => handleTabChange('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Próximos ({upcomingTickets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => handleTabChange('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Pasados ({pastTickets.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'upcoming' ? (
          upcomingTickets.length > 0 ? (
            upcomingTickets.map(renderTicket)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={64} color="#333333" />
              <Text style={styles.emptyTitle}>No hay entradas próximas</Text>
              <Text style={styles.emptySubtitle}>
                Cuando compres tickets aparecerán aquí
              </Text>
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/')}
              >
                <Text style={styles.browseButtonText}>Explorar Eventos</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          pastTickets.length > 0 ? (
            pastTickets.map(renderTicket)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#333333" />
              <Text style={styles.emptyTitle}>No hay entradas pasadas</Text>
              <Text style={styles.emptySubtitle}>
                Tus eventos anteriores aparecerán aquí
              </Text>
            </View>
          )
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    ...Typography.title2,
    color: '#ffffff',
  },
  walletButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1a1a1a',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#333333',
  },
  tabText: {
    ...Typography.subheadline,
    color: '#666666',
    textAlign: 'center',
  },
  activeTabText: {
    ...Typography.subheadline,
    fontFamily: FontFamily.SemiBold,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  ticketCardUsed: {
    opacity: 0.7,
  },
  ticketImage: {
    width: 80,
    height: 120,
    resizeMode: 'cover',
  },
  ticketContent: {
    flex: 1,
    padding: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketDateBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  ticketDate: {
    ...Typography.body,
    fontFamily: FontFamily.Bold,
    color: '#ffffff',
  },
  ticketMonth: {
    ...Typography.caption,
    color: '#cccccc',
    textTransform: 'uppercase',
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    ...Typography.caption,
  },
  statusValid: {
    color: '#4CAF50',
  },
  statusUsed: {
    color: '#666666',
  },
  ticketTitle: {
    ...Typography.body,
    fontFamily: FontFamily.Bold,
    color: '#ffffff',
    marginBottom: 8,
  },
  ticketDetails: {
    gap: 4,
    marginBottom: 12,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketDetailText: {
    ...Typography.caption,
    color: '#cccccc',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketPrice: {
    ...Typography.body,
    fontFamily: FontFamily.SemiBold,
    color: '#ffffff',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  qrButtonText: {
    ...Typography.caption,
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...Typography.title3,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    ...Typography.body,
    fontFamily: FontFamily.SemiBold,
    color: '#ffffff',
  },
});