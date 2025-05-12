import React, { useEffect, useState } from 'react';
import { Text, Pressable, View, Share } from 'react-native';
import Shared from '../Shared/Shared';
import { useUser } from '@clerk/clerk-expo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

/**
 * SaveArt component allows the user to save or unsave a news article by toggling the bookmark icon.
 * 
 */
export default function SaveArt({ news }) {
    const { user } = useUser(); // Get the current user
    const [savedList, setSavedList] = useState([]); // State to track saved articles

    useEffect(() => {
        if (user) {
            GetSaved(); // Fetch the saved articles when the user is available
        }
    }, [user]);

    /**
     * Fetches the list of saved articles from the Shared component.
     */
    const GetSaved = async () => {
        const result = await Shared.GetSavedList(user); // Get the user's saved list
        setSavedList(result ? result.Saved : []); // Update state with the saved list
    };

    /**
     * Toggles the saved status of a news article.
     * If the article is already saved, it will be removed from the saved list.
     * If the article is not saved, it will be added to the saved list.
     */
    const ToggleSaved = async () => {
        let updatedSavedList;

        if (savedList.includes(news.id)) {
            updatedSavedList = savedList.filter(id => id !== news.id); // Remove from saved
        } else {
            updatedSavedList = [...savedList, news.id]; // Add to saved
        }

        setSavedList(updatedSavedList); // Update the local state
        await Shared.UpdateSavedList(user, updatedSavedList); // Update saved list in the Shared component
    };

    return (
        <View>
            {savedList.includes(news.id) ? (
                // Display a filled bookmark if the article is saved
                <Pressable onPress={ToggleSaved}>
                    <MaterialCommunityIcons name="bookmark" size={40} color="red" />
                </Pressable>
            ) : (
                // Display an outlined bookmark if the article is not saved
                <Pressable onPress={ToggleSaved}>
                    <MaterialCommunityIcons name="bookmark-outline" size={40} color="black" />
                </Pressable>
            )}
        </View>
    );
}
