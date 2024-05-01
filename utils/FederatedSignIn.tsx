import * as GoogleAuthSession from 'expo-auth-session/providers/google';

const signInWithGoogle = async () => {
    try {
        const { type, accessToken } = await GoogleAuthSession.startAsync({
            clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
        });

        if (type === 'success') {
            // Use the accessToken to authenticate with Cognito
            await signInWithGoogle(accessToken);
        } else {
            console.log('Google sign-in canceled');
        }
    } catch (error) {
        console.error('Error signing in with Google:', error);
    }
};

export { signInWithGoogle };
