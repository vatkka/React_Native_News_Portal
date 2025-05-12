import { Dimensions, FlatList, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import City from './City';
import Category from './Category';
import { query, collection, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import NewsListComponent from './NewsListComponent';
import { useCallback } from 'react';

/**
 * NewsByCity component displays a list of news articles filtered by selected city and category.
 * It includes:
 * 1. A city selector component.
 * 2. A category selector component.
 * 3. A list of news articles fetched from Firestore, filtered based on city and category.
 * The list is displayed in descending order based on the article's timestamp.
 */
export default function NewsByCity() {
  const [selectedCity, setSelectedCity] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [newsList, setNewsList] = useState([]); 
  const [refreshing, setRefreshing] = useState(false); 
  // Fetch news whenever the selected city or category changes
  useEffect(() => {
    getNewsList();
  }, [selectedCity, selectedCategory]);

  /**
   * Fetches the news list from Firestore, applying filters for city and category.
   * Orders the results by 'DateTime' in descending order.
   */
  const getNewsList = async () => {
    try {
      // Create filters for city and category
      const filters = [
        where('Approved', '==', true), // Only fetch approved news
        ...(selectedCity ? [where('City', '==', selectedCity)] : []), // Apply city filter if selected
        ...(selectedCategory ? [where('Category', '==', selectedCategory)] : []), // Apply category filter if selected
      ];

      // Query Firestore with the filters and order by 'DateTime'
      const q = query(
        collection(db, 'News'),
        ...filters,
        orderBy('DateTime', 'desc')
      );

      // Fetch the results from Firestore
      const querySnapshot = await getDocs(q);
      const newsData = querySnapshot.docs.map((doc, index) => ({
        ...doc.data(),
        localId: `news-${index}-${Math.random().toString(36).substr(2, 9)}` // Generate a unique local ID
      }));

      // Set the fetched news data to the state
      setNewsList(newsData);
    } catch (error) {
      console.error("Firestore query failed:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getNewsList().finally(() => setRefreshing(false));
  }, [selectedCity, selectedCategory]);

  return (
    <View>
      {/* City and Category Selectors */}
      <View
        style={{
          marginTop: 5,
          borderWidth: 5,
          borderColor: "#feeadd",
          padding: 5,
          borderRadius: 20,
        }}
      >
        {/* City Selector */}
        <City city={(value) => setSelectedCity(value)} />
        {/* Category Selector */}
        <Category category={(value) => setSelectedCategory(value)} />
      </View>

      {/* News List Display */}
      <FlatList
        style={{
          height: Dimensions.get('window').height * 0.7,
          borderWidth: 5,
          borderColor: "#fcd0b0",
          borderRadius: 24,
          padding: 10,
          paddingBottom: 0,
          marginTop: 10,
        }}
        contentContainerStyle={{
          paddingBottom: Dimensions.get('window').height * 0.12,
        }}
        data={newsList} // The news data to display
        renderItem={({ item }) => <NewsListComponent news={item} />} // Render each news item using NewsListComponent
        keyExtractor={(item) => item.localId} // Use the unique localId as the key
        refreshing={refreshing}             
        onRefresh={onRefresh}             
      />
    </View>
  );
}
