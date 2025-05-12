import { Pressable, Text } from 'react-native';
import { Link, Tabs } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Home() {
  return (
       <Tabs
       screenOptions={{
        tabBarStyle:{ backgroundColor: '#fef7f6' },
        tabBarInactiveTintColor: '#95a5a6',
        tabBarActiveTintColor: '#e13f2a',}}
       >
        <Tabs.Screen name='home'
        options={{
            title:'Home',
             headerShown: false,
            tabBarIcon: ({color}) => (
              <AntDesign name="home" size={24} color="black" />
            )
            }}
        />
        <Tabs.Screen name='alerts'
        options={{
          title:'Alerts',
           headerShown: false,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="bell-alert-outline" size={24} color="black" />
          )
          }}
        />
        <Tabs.Screen name='saved'
        options={{
          title:'Saved',
           headerShown: false,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="bookmark-outline" size={24} color="black" />
          )
          }}
        /> 
         <Tabs.Screen name='profile'
        options={{
          title:'Profile',
           headerShown: false,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="account-outline" size={24} color="black" />
          )
          }}
        />

       </Tabs>      

  );
}