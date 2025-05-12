import { Text, StyleSheet, Image, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Custom hook to warm up and cool down the WebBrowser session.
 * - Prepares the WebBrowser session to speed up authentication flows.
 */
export const useWormUpBrowser = () => {
    React.useEffect(() => {
        void WebBrowser.warmUpAsync();
        return () => {
            void WebBrowser.coolDownAsync();
        };
    }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWormUpBrowser();
    const { startSSOFlow } = useSSO();
    const router = useRouter();

    /**
     * Handles the login flow when the user presses the login button.
     * - Initiates OAuth flow using Google strategy
     * - Redirects user to the home page after successful login
     */
    const onPress = async () => {
      try {
        const redirectUrl = Linking.createURL('/'); // Redirect to current screen after login
        const { createdSessionId, setActive } = await startSSOFlow({
          strategy: 'oauth_google',
          redirectUrl,
        });

        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          router.replace('/(tabs)/home'); // Redirect to the home page
        }
      } catch (err) {
        console.error('Login Error:', JSON.stringify(err, null, 2));
      }
    };

    return (
        <View 
            style={{
                display: 'flex',
                backgroundColor: '#faecdc',
                height: '100%',
            }}
        >
            <Image source={require('./../../assets/images/smart-cyprus.png')}
                style={{
                    padding: 30,
                    width: Dimensions.get('window').width - 50,
                    height: 350,
                    alignSelf: 'center',
                    marginTop: 50,
                }} 
            />
            <Pressable
                onPress={onPress}
                style={{
                    padding: 14, 
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 60,
                    marginTop: 100, 
                    backgroundColor: '#ffccab',
                    borderRadius: 10,
                    borderColor: '#e13f2a',
                    borderWidth: 2,
                }}
            >
                <Text style={{
                    color: '#e13f2a',
                    fontSize: 25,
                    textAlign: 'center',
                }}>Login</Text>
            </Pressable>
        </View>
    );
}
