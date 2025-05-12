import { View, Text, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseApp } from '../../config/FirebaseConfig'; 
import styles from '../styles';

export default function Profile() {
  const db = getFirestore(firebaseApp); // Initialize Firestore

  const Menu = [
    {
      id: 0,
      title: 'Add New Article',
      icon: 'add',
      link: '/add_article',
    },
    {
      id: 1,
      title: 'Saved',
      icon: 'bookmark',
      link: '/saved',
    },
    {
      id: 2,
      title: 'Settings',
      icon: 'settings',
      link: '/settings',
    },
    {
      id: 3,
      title: 'Logout',
      icon: 'exit',
      link: 'logout',
    },
    {
      id: 4,
      title: 'Delete Account',
      icon: 'trash',
      link: 'delete',
    },
  ];

  const { signOut } = useAuth();
  const { user } = useUser();

  const onPressMenu = async (menu) => {
    if (menu.link === 'logout') {
      await signOut();
      router.replace('/');
    } else if (menu.link === 'delete') {
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await addDoc(collection(db, 'deleteRequests'), {
                  email: user.emailAddresses[0].emailAddress,
                  requestedAt: new Date().toISOString(),
                });
                await signOut();
                router.replace('/');
              } catch (error) {
                console.error('Error sending delete request:', error);
              }
            },
          },
        ]
      );
    } else {
      router.push(menu.link);
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#fef7f6', flex: 1 }}>
      <Image
        source={{ uri: user?.imageUrl }}
        style={{
          borderWidth: 1,
          width: 100,
          height: 100,
          borderRadius: 50,
          alignSelf: 'center',
          marginBottom: 20,
        }}
      />
      <Text style={styles.h1}>{user.fullName}</Text>
      <Text style={styles.h2}>{user.emailAddresses[0].emailAddress}</Text>

      <FlatList
        style={{ marginTop: 20 }}
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPressMenu(item)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#ccc',
              marginBottom: 10,
            }}
          >
            <Ionicons name={item.icon} size={24} color="black" style={{ marginRight: 15 }} />
            <Text style={{ fontSize: 18, fontFamily: 'Manrope-Regular', color: '#333' }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
