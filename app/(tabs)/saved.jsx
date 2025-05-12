import { Pressable, Text, View, FlatList } from 'react-native';
import { Link } from 'expo-router';
import Shared from '../../Shared/Shared'; 
import { useUser } from '@clerk/clerk-expo'; 
import { useEffect, useState, useCallback } from 'react'; 
import { query, collection, where, getDocs } from 'firebase/firestore'; 
import { db } from '../../config/FirebaseConfig'; 
import { useIsFocused, useFocusEffect } from '@react-navigation/native'; 
import NewsListComponent from '../../components/Home/NewsListComponent'; 
import styles from '../styles';

/**
 * Displays a list of saved news for the authenticated user.
 */
export default function Saved() {
  const { user } = useUser();
  const [savedIds, setSavedIds] = useState([]);
  const [savedNewsList, setSavedNewsList] = useState([]);

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getSavedNews().then((ids) => getSavedNewsList(ids));
      }
    }, [user])
  );

  useEffect(() => {
    if (user && isFocused) {
      getSavedNews();
    }
  }, [user, isFocused]);

  /**
   * Fetches the list of saved news for the authenticated user.
   */
  const getSavedNews = async () => {
    const savedList = await Shared.GetSavedList(user);
    const ids = savedList?.Saved || [];
    setSavedIds(ids);
    return ids;
  };

  /**
   * Breaks the saved news IDs array into chunks of a specified size for efficient querying.
   */
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  /**
   * Fetches the details of the saved news based on the provided IDs.
   */
  const getSavedNewsList = async (savedIds_) => {
    setSavedNewsList([]);
    if (!savedIds_ || savedIds_.length === 0) return;

    const chunks = chunkArray(savedIds_, 10);
    const allNews = [];

    for (const chunk of chunks) {
      const q = query(
        collection(db, 'News'),
        where('id', 'in', chunk)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        allNews.push(doc.data());
      });
    }

    setSavedNewsList(allNews);
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fef7f6' }}>
      <Text style={styles.h1}>Saved News:</Text>
      <FlatList
        data={savedNewsList}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => <NewsListComponent news={item} />}
      />
    </View>
  );
}
