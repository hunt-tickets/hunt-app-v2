import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const allEvents = [
    {
      id: 1,
      title: 'MARÍA HELENA AMADOR',
      date: '29',
      month: 'sep',
      location: 'Gimnasio Moderno',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      category: 'Música',
    },
    {
      id: 2,
      title: 'INSIDE PRESENTA',
      date: '20',
      month: 'sep', 
      location: 'Teatro Nacional',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      category: 'Teatro',
    },
    {
      id: 3,
      title: 'FESTIVAL DE MÚSICA',
      date: '15',
      month: 'oct',
      location: 'Parque Central',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      category: 'Festival',
    },
    {
      id: 4,
      title: 'STAND UP COMEDY',
      date: '22',
      month: 'oct',
      location: 'Teatro Libre',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      category: 'Comedia',
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
        event.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const categories = ['Música', 'Teatro', 'Festival', 'Comedia', 'Arte', 'Deporte'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos, lugares..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryChip}
                  onPress={() => handleSearch(category)}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchResults.length} resultados para "{searchQuery}"
            </Text>
            {searchResults.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.resultCard}
                onPress={() => router.push(`/(tabs)/event/${event.id}`)}
              >
                <Image source={{ uri: event.image }} style={styles.resultImage} />
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle}>{event.title}</Text>
                  <Text style={styles.resultLocation}>
                    {event.date} {event.month} • {event.location}
                  </Text>
                  <Text style={styles.resultCategory}>{event.category}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </TouchableOpacity>
            ))}
            
            {searchResults.length === 0 && (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color="#333333" />
                <Text style={styles.noResultsTitle}>No se encontraron eventos</Text>
                <Text style={styles.noResultsText}>
                  Intenta con otros términos de búsqueda
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Popular searches */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Búsquedas populares</Text>
            {['Conciertos', 'Teatro', 'Stand up', 'Arte'].map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularSearch}
                onPress={() => handleSearch(term)}
              >
                <Ionicons name="trending-up" size={16} color="#666666" />
                <Text style={styles.popularSearchText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  content: {
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
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  resultLocation: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 12,
    color: '#666666',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
  popularSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  popularSearchText: {
    fontSize: 16,
    color: '#cccccc',
  },
});