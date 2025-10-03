import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontFamily } from '../../../constants/fonts';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allEvents = [
    {
      id: 1,
      title: 'María Helena Amador',
      subtitle: 'Tour Acústico 2024',
      date: '29',
      month: 'SEP',
      time: '8:00 PM',
      location: 'Gimnasio Moderno',
      price: '₡25,000',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      category: 'Música',
      rating: 4.8,
      attendees: 1250,
    },
    {
      id: 2,
      title: 'Inside Presenta',
      subtitle: 'Obra de Teatro Original',
      date: '20',
      month: 'SEP',
      time: '7:30 PM',
      location: 'Teatro Nacional',
      price: '₡18,000',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      category: 'Teatro',
      rating: 4.6,
      attendees: 800,
    },
    {
      id: 3,
      title: 'Festival de Música',
      subtitle: 'Rock & Folk Nacional',
      date: '15',
      month: 'OCT',
      time: '4:00 PM',
      location: 'Parque Central',
      price: '₡15,000',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      category: 'Festival',
      rating: 4.9,
      attendees: 2500,
    },
    {
      id: 4,
      title: 'Stand Up Comedy',
      subtitle: 'Noche de Risas',
      date: '22',
      month: 'OCT',
      time: '9:00 PM',
      location: 'Teatro Libre',
      price: '₡12,000',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      category: 'Comedia',
      rating: 4.7,
      attendees: 300,
    },
    {
      id: 5,
      title: 'Exposición de Arte',
      subtitle: 'Arte Contemporáneo CR',
      date: '05',
      month: 'NOV',
      time: '10:00 AM',
      location: 'Museo de Arte',
      price: '₡8,000',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
      category: 'Arte',
      rating: 4.5,
      attendees: 150,
    },
    {
      id: 6,
      title: 'Partido de Fútbol',
      subtitle: 'Liga Deportiva Municipal',
      date: '18',
      month: 'NOV',
      time: '3:00 PM',
      location: 'Estadio Nacional',
      price: '₡6,000',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
      category: 'Deporte',
      rating: 4.3,
      attendees: 15000,
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase()) ||
        event.category.toLowerCase().includes(query.toLowerCase()) ||
        event.subtitle.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  useEffect(() => {
    if (params.q) {
      const query = params.q as string;
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [params.q]);

  const filters = [
    { id: 'all', name: 'Todo', icon: 'apps' },
    { id: 'Música', name: 'Música', icon: 'musical-notes' },
    { id: 'Teatro', name: 'Teatro', icon: 'library' },
    { id: 'Festival', name: 'Festival', icon: 'star' },
    { id: 'Comedia', name: 'Comedia', icon: 'happy' },
    { id: 'Arte', name: 'Arte', icon: 'color-palette' },
    { id: 'Deporte', name: 'Deporte', icon: 'football' },
  ];

  const featuredCategories = [
    {
      title: 'Música en Vivo',
      subtitle: '12 eventos esta semana',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop',
      color: ['#667eea', '#764ba2'],
    },
    {
      title: 'Teatro Nacional',
      subtitle: '8 obras en cartelera',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
      color: ['#f093fb', '#f5576c'],
    },
    {
      title: 'Festivales',
      subtitle: '5 festivales próximos',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop',
      color: ['#4facfe', '#00f2fe'],
    },
  ];

  const getFilteredResults = () => {
    if (selectedFilter === 'all') return searchResults;
    return searchResults.filter(event => event.category === selectedFilter);
  };

  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => router.push(`/(tabs)/event/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <BlurView intensity={20} style={styles.gridOverlay}>
        <View style={styles.gridDateBadge}>
          <Text style={styles.gridDate}>{item.date}</Text>
          <Text style={styles.gridMonth}>{item.month}</Text>
        </View>
        <View style={styles.gridContent}>
          <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.gridSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={styles.gridMeta}>
            <View style={styles.gridMetaItem}>
              <Ionicons name="location" size={12} color="#ffffff80" />
              <Text style={styles.gridMetaText}>{item.location}</Text>
            </View>
            <Text style={styles.gridPrice}>{item.price}</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => router.push(`/(tabs)/event/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.listImage} />
      <View style={styles.listContent}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{item.title}</Text>
          <Text style={styles.listPrice}>{item.price}</Text>
        </View>
        <Text style={styles.listSubtitle}>{item.subtitle}</Text>
        <View style={styles.listMeta}>
          <View style={styles.listMetaItem}>
            <Ionicons name="calendar" size={14} color="#ffffff60" />
            <Text style={styles.listMetaText}>{item.date} {item.month} • {item.time}</Text>
          </View>
          <View style={styles.listMetaItem}>
            <Ionicons name="location" size={14} color="#ffffff60" />
            <Text style={styles.listMetaText}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.listFooter}>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.attendees}>{item.attendees} asistentes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Empty State / Featured Categories */}
        {searchQuery.length === 0 && (
          <>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Descubre Eventos</Text>
              <Text style={styles.welcomeSubtitle}>
                Encuentra los mejores eventos cerca de ti
              </Text>
            </View>

            {/* Featured Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorías Destacadas</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredCategories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.featuredCard}
                    onPress={() => handleSearch(category.title)}
                  >
                    <LinearGradient
                      colors={category.color}
                      style={styles.featuredGradient}
                    >
                      <Image source={{ uri: category.image }} style={styles.featuredImage} />
                      <BlurView intensity={40} style={styles.featuredOverlay}>
                        <Text style={styles.featuredTitle}>{category.title}</Text>
                        <Text style={styles.featuredSubtitle}>{category.subtitle}</Text>
                      </BlurView>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quick Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Explorar por Categoría</Text>
              <View style={styles.filtersGrid}>
                {filters.slice(1).map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={styles.filterCard}
                    onPress={() => handleSearch(filter.name)}
                  >
                    <View style={styles.filterIcon}>
                      <Ionicons name={filter.icon as any} size={24} color="#007AFF" />
                    </View>
                    <Text style={styles.filterText}>{filter.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.resultsTitle}>
                  {getFilteredResults().length} resultados
                </Text>
                <Text style={styles.resultsSubtitle}>
                  para "{searchQuery}"
                </Text>
              </View>
              <View style={styles.viewModeToggle}>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeActive]}
                  onPress={() => setViewMode('grid')}
                >
                  <Ionicons name="grid" size={18} color={viewMode === 'grid' ? '#007AFF' : '#666666'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeActive]}
                  onPress={() => setViewMode('list')}
                >
                  <Ionicons name="list" size={18} color={viewMode === 'list' ? '#007AFF' : '#666666'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.id && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={selectedFilter === filter.id ? '#007AFF' : '#666666'}
                  />
                  <Text style={[
                    styles.filterChipText,
                    selectedFilter === filter.id && styles.filterChipTextActive
                  ]}>
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Results */}
            {getFilteredResults().length > 0 ? (
              <FlatList
                data={getFilteredResults()}
                renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                numColumns={viewMode === 'grid' ? 2 : 1}
                key={viewMode}
                columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
                scrollEnabled={false}
                contentContainerStyle={styles.resultsContainer}
              />
            ) : (
              <View style={styles.noResults}>
                <View style={styles.noResultsIcon}>
                  <Ionicons name="search-outline" size={48} color="#666666" />
                </View>
                <Text style={styles.noResultsTitle}>Sin resultados</Text>
                <Text style={styles.noResultsText}>
                  No encontramos eventos que coincidan con tu búsqueda
                </Text>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSelectedFilter('all');
                  }}
                >
                  <Text style={styles.clearButtonText}>Limpiar búsqueda</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Welcome Section
  welcomeSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: FontFamily.Bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF80',
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FontFamily.SemiBold,
    color: '#FFFFFF',
    marginBottom: 16,
  },

  // Featured Categories
  featuredCard: {
    width: 200,
    height: 120,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredGradient: {
    flex: 1,
    position: 'relative',
  },
  featuredImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontFamily: FontFamily.SemiBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF80',
  },

  // Filter Grid
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterCard: {
    width: (width - 64) / 3,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF20',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  filterText: {
    fontSize: 12,
    fontFamily: FontFamily.Medium,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontFamily: FontFamily.SemiBold,
    color: '#FFFFFF',
  },
  resultsSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF60',
    marginTop: 2,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewModeActive: {
    backgroundColor: '#007AFF20',
  },

  // Filters
  filtersContainer: {
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterChipActive: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: FontFamily.Medium,
    color: '#FFFFFF80',
  },
  filterChipTextActive: {
    color: '#007AFF',
  },

  // Grid Layout
  resultsContainer: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCard: {
    width: (width - 52) / 2,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  gridDateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  gridDate: {
    fontSize: 16,
    fontFamily: FontFamily.Bold,
    color: '#FFFFFF',
  },
  gridMonth: {
    fontSize: 10,
    fontFamily: FontFamily.Medium,
    color: '#FFFFFF80',
  },
  gridContent: {
    marginTop: 40,
  },
  gridTitle: {
    fontSize: 14,
    fontFamily: FontFamily.SemiBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF80',
    marginBottom: 8,
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  gridMetaText: {
    fontSize: 10,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF80',
    flex: 1,
  },
  gridPrice: {
    fontSize: 12,
    fontFamily: FontFamily.SemiBold,
    color: '#007AFF',
  },

  // List Layout
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: FontFamily.SemiBold,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  listPrice: {
    fontSize: 14,
    fontFamily: FontFamily.SemiBold,
    color: '#007AFF',
  },
  listSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF80',
    marginBottom: 8,
  },
  listMeta: {
    gap: 4,
    marginBottom: 8,
  },
  listMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listMetaText: {
    fontSize: 12,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF60',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: FontFamily.Medium,
    color: '#FFFFFF80',
  },
  attendees: {
    fontSize: 12,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF60',
  },

  // No Results
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#1A1A1A',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noResultsTitle: {
    fontSize: 20,
    fontFamily: FontFamily.SemiBold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: FontFamily.Regular,
    color: '#FFFFFF60',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: FontFamily.SemiBold,
    color: '#FFFFFF',
  },
});