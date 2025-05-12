import { Pressable, Text, View, Image, TouchableOpacity } from 'react-native';
import Header from '../../components/Home/Header.jsx';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import NewsByCity from '../../components/Home/NewsByCity.jsx';

/**
 * Home screen component that displays the main news feed, category news, and allows the user
 * to add a new article.
 */
export default function Home() {
  const router = useRouter(); 
  const { user } = useUser(); 

  // Log the user's email on the first render
  useEffect(() => {
    console.log(user?.emailAddresses[0]?.emailAddress);
  }, [user]);

  return (
    <View style={{ padding: 10, backgroundColor: '#fef7f6', flex: 1 }}>
     
      {/* <Header /> */}

      <NewsByCity />

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '../add_article',
          })
        }
        style={{
          position: 'absolute', // Positioned at the bottom-right of the screen
          bottom: 80,
          right: 20,
          backgroundColor: '#fef7f6',
          borderRadius: 50,
          width: 60,
          height: 60,
          borderWidth: 3,
          borderColor: '#e13f2a',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000', // Add shadow for a floating effect
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Image
          source={require('../../assets/images/plus.png')}
          style={{
            width: 30,
            height: 30,
          }}
        />
      </TouchableOpacity>
    </View>
  );
}
