import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, StyleSheet, Platform } from "react-native";
import { collection, getDocs,  doc, setDoc } from "firebase/firestore";
import { db } from '../../config/FirebaseConfig';
import AlertComponent from "../../components/Alerts/AlertComponent";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from "@clerk/clerk-expo";

const STORAGE_KEY = "seenAlertIds";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Notification configuration for displaying push notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// async function savePushTokenToFirestore(token) {
//   const userId = useUser().user.emailAddresses; // change to real user id if you have auth
//   await setDoc(doc(db, "users", userId), {
//     expoPushToken: token,
//   }, { merge: true });
// }

export default function AlertScreen() {
  const [alerts, setAlerts] = useState([]);
  const [seenAlertIds, setSeenAlertIds] = useState(new Set());
  const seenAlertIdsRef = useRef(seenAlertIds); // Ref to hold the latest seen IDs

  const updateSeenAlertIds = (newSet) => {
    setSeenAlertIds(newSet);
    seenAlertIdsRef.current = newSet;
    saveSeenAlerts(newSet); // Save seen alerts to storage
  };

  // Load previously seen alerts from AsyncStorage
  const loadSeenAlerts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = new Set(JSON.parse(stored));
        setSeenAlertIds(parsed);
        seenAlertIdsRef.current = parsed;
      }
    } catch (err) {
      console.warn("Failed to load seen alerts:", err);
    }
  };

  // Save the list of seen alerts to AsyncStorage
  const saveSeenAlerts = async (ids) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch (err) {
      console.warn("Failed to save seen alerts:", err);
    }
  };

  // Register the device for push notifications
  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for notifications!');
        return;
      }
    } else {
      alert('Must use physical device for notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('alerts', {
        name: 'Alerts',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  }

  // Format the time difference between now and the alert time
  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const alertTime = timestamp.toDate().getTime();
    const diffMs = now - alertTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours < 1 ? "Now" : `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  };

  // Send a local notification for a new alert
  const sendLocalNotification = async (alert) => {
    const title = alert.Title || alert.title || "New Alert";
    const body = `${formatTimeAgo(alert.Time)}\n${alert.City || "Unknown City"} - ${alert.Description || ""}`;

    console.log("Sending notification for:", title);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  };

  // Fetch alerts from the Firestore database
  const fetchAlerts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Alerts"));
      const now = Date.now();

      const fetchedAlerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newSeenIds = new Set(seenAlertIdsRef.current);
      const freshAlerts = [];

      // Process fetched alerts, filtering recent ones and sending notifications
      for (const alert of fetchedAlerts) {
        if (!alert.Time || !alert.id) continue;

        const time = alert.Time.toDate().getTime();
        const isRecent = now - time < ONE_DAY_MS;
        const isUnseen = !newSeenIds.has(alert.id);

        if (isRecent && isUnseen) {
          await sendLocalNotification(alert); // Send notification if recent and unseen
          newSeenIds.add(alert.id);
        }

        freshAlerts.push(alert);
      }

      setAlerts(freshAlerts);
      updateSeenAlertIds(newSeenIds); // Update seen alerts in state and storage
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadSeenAlerts();
      await registerForPushNotificationsAsync();
      await fetchAlerts();
    };

    init();

    const interval = setInterval(fetchAlerts, 60000); // Fetch alerts every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertComponent alert={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef7f6",
    padding: 20,
  },
});
