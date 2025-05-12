import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ToastAndroid,
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../config/FirebaseConfig';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import styles from '../styles';
import { serverTimestamp } from 'firebase/firestore';
/**
 * Component to add a new article, including title, category, city, image, and text.
 * - Allows image upload via Cloudinary.
 * - Saves article data to Firebase Firestore.
 */
export default function AddNew() {
  const navigation = useNavigation();
  const [data, setData] = useState({});
  const [cityList, setCityList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [image, setImage] = useState();
  const { user } = useUser();
  const router = useRouter();

  // Function to upload an image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', 'usersImg'); 
    data.append('cloud_name', '*****'); 

    const res = await fetch('https://api.cloudinary.com/v1_1/****/image/upload', {
      method: 'POST',
      body: data,
    });

    const json = await res.json();
    return json.secure_url;
  };

  // Fetch cities from Firestore
  const GetCities = async () => {
    const snapshot = await getDocs(collection(db, 'Cities'));
    const cities = snapshot.docs.map(doc => doc.data());
    setCityList(cities);
  };

  // Fetch categories from Firestore
  const GetCategories = async () => {
    const snapshot = await getDocs(collection(db, 'Categories'));
    const categories = snapshot.docs.map(doc => doc.data());
    setCategoriesList(categories);
  };

  // Function to pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      try {
        const uploadedUrl = await uploadToCloudinary(uri);
        setImage(uploadedUrl);
        handleInputChange('imageUrl', uploadedUrl); // store image URL in data
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        ToastAndroid.show('Image upload failed', ToastAndroid.SHORT);
      }
    }
  };

  // Set screen options for the navigation header
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Add New Article',
      headerBackTitle: 'Back',
      headerStyle: {
        backgroundColor: '#fef7f6',
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontFamily: 'Manrope-Bold',
        fontSize: 20,
      },
    });
    GetCities(); // Load cities when the component is mounted
    GetCategories(); // Load categories when the component is mounted
    handleInputChange('Approved', false); 
  }, []);

  // Handle input changes and update state
  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save article data to Firestore
  const SaveData = async () => {
    const docId = user?.emailAddresses[0].emailAddress + Date.now().toString();
    await setDoc(doc(db, 'News', docId), {
      ...data,
      userEmail: user?.emailAddresses[0].emailAddress,
      id: docId,
      DateTime: serverTimestamp(),
    });
  };

  // Handle form submission
  const onSubmit = () => {
    if (Object.keys(data).length !== 6) {
      ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
      return;
    }
    console.log(data);
    SaveData()
      .then(() => {
        ToastAndroid.show('Article sent for approval', ToastAndroid.SHORT);
        router.replace('/(tabs)/home'); // Redirect to home after success
      })
      .catch((error) => {
        console.error('Error adding article:', error);
        ToastAndroid.show('Error adding article', ToastAndroid.SHORT);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>

        {/* Image Picker */}
        <Pressable onPress={pickImage}>
          {!image ? (
            <Image
              source={require('../../assets/images/add_image.png')}
              style={styles.image}
            />
          ) : (
            <Image source={{ uri: image }} style={styles.image} />
          )}
        </Pressable>

        {/* Article Title */}
        <View style={styles.text_container}>
          <TextInput
            style={styles.text}
            placeholder="Add Article Title"
            onChangeText={(value) => handleInputChange('Title', value)}
          />
        </View>

        {/* City Picker */}
        <View style={styles.picker_container}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={(itemValue) => {
              setSelectedCity(itemValue);
              handleInputChange('City', itemValue);
            }}
          >
            <Picker.Item label="Select a City" value={null} />
            {cityList.map((city, index) => (
              <Picker.Item label={city.name} value={city.name} key={index} />
            ))}
          </Picker>
        </View>

        {/* Category Picker */}
        <View style={styles.picker_container}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => {
              setSelectedCategory(itemValue);
              handleInputChange('Category', itemValue);
            }}
          >
            <Picker.Item label="Select a Category" value={null} />
            {categoriesList.map((category, index) => (
              <Picker.Item label={category.name} value={category.name} key={index} />
            ))}
          </Picker>
        </View>

        {/* Article Text */}
        <View style={styles.text_container_big}>
          <TextInput
            style={styles.text}
            placeholder="Add Text"
            multiline
            onChangeText={(value) => handleInputChange('Text', value)}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.button_s} onPress={onSubmit}>
          <Text style={styles.text_s}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
  );
}
