import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

/**
 * NewsListComponent displays a news item in a card-like format with an image, title, and
 * a clickable area that navigates to the fullscreen news page when tapped.
 * 

 */
export default function NewsListComponent({news}) {
  const router = useRouter(); // Router for navigation

  return (
    <TouchableOpacity
      onPress={() => {
        console.log(news.DateTime); // Log the date/time of the news when clicked
        router.push({
          pathname: '/news_fullscreen', // Navigate to the full-screen news page
          params: news // Pass the news data to the next screen
        });
      }}
      style={{
        height: 210,
        borderRadius: 16,
        marginBottom: 10,
        backgroundColor: "rgb(35, 39, 46)",
        justifyContent: "flex-end",
      }}
    >
      <Image
        source={{ uri: news.imageUrl }}
        style={{
          width: "100%",
          height: "210",
          borderRadius: 16,
          position: "absolute",
        }}
      ></Image>
      <Text
        style={{
          backgroundColor: "rgba(35, 39, 46, 0.74)",
          
          borderRadius: 16,
          borderRadiusTopLeft: 0,
          borderRadiusTopRight: 0,
          fontSize: 25,
          fontWeight: "Manrope-Bold",
          color: "#fff",
          paddingLeft: 10,
          paddingTop: 5,
          paddingBottom: 5,
        }}
      >
        {news.Title}
      </Text>
      
    </TouchableOpacity>
  );
}
