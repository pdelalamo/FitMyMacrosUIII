import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AWS from 'aws-sdk';
import { makeRedirectUri } from 'expo-auth-session';

const config = {
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
};

class GoogleSignInUtility {

    /**
     * Tries to sign in the user with their Google account
     * @returns 
     */
    static async signInWithGoogle() {
        WebBrowser.maybeCompleteAuthSession();
        const [request, response, promptAsync] = Google.useAuthRequest({
            clientId: process.env.EXPO_PUBLIC_GOOGLE_ID!,
            iosClientId: process.env.EXPO_PUBLIC_IOS_ID!,
            redirectUri: makeRedirectUri()
        });

        if (response?.type === 'success') {
            const user = await GoogleSignInUtility.getUserInfo(response.authentication!.accessToken);
            if (user) {
                return await GoogleSignInUtility.checkCognitoUser(user.email);
            }
        }
    }

    /**
     * Gets the info from the user from the token returned by Google after authorization
     * @param token 
     * @returns 
     */
    static async getUserInfo(token: string) {
        if (!token) return;

        try {
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await response.json();
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    }

    /**
     * Checks whether the user exists in the cognito user pool
     * @param email 
     * @returns 
     */
    static async checkCognitoUser(email: string) {
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
        try {
            const params = {
                UserPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID!,
                Username: email.replace('@', '-at-'),
            };
            const user = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
            // User exists in Cognito user pool
            console.log('User exists in Cognito:', user);
            return true;
        } catch (error) {
            // User does not exist in Cognito user pool
            console.error('User does not exist in Cognito:', error);
            return false;
        }
    }

}

export default GoogleSignInUtility;
