import AWS from 'aws-sdk';
import { t } from 'i18next';
import { Alert } from 'react-native';

AWS.config.region = 'eu-west-3';
AWS.config.update({
    accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY,
    region: process.env.EXPO_PUBLIC_AWS_REGION
});


// Initialize CognitoIdentityServiceProvider
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// Function to sign up a new user
const signUpUser = async (email: string, password: string) => {
    try {
        const params = {
            ClientId: process.env.EXPO_PUBLIC_AWS_CLIENT_ID!,
            Username: toUsername(email),
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email.toLowerCase()
                }
            ]
        };

        await cognitoIdentityServiceProvider.signUp(params).promise();
        console.log('User signed up successfully');
    } catch (error) {
        console.error('Error signing up user:', error);
    }
    await verifyEmail(email);
    await confirmAccount(email);
};

// Function to sign in a user
const signInUser = async (email: string, password: string) => {
    try {
        console.log('email: ' + email + ' password: ' + password);
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.EXPO_PUBLIC_AWS_CLIENT_ID!,
            AuthParameters: {
                'USERNAME': toUsername(email),
                'PASSWORD': password
            }
        };

        const data = await cognitoIdentityServiceProvider.initiateAuth(params).promise();
        console.log('User signed in successfully:', data.AuthenticationResult);
        return 'ok';
    } catch (error) {
        console.error('Error signing in user:', error);
        return error;
    }
};

function toUsername(email: string) {
    return email.replace('@', '-at-').toLowerCase();
}

function toEmail(email: string) {
    return email.replace('-at-', '@').toLowerCase();
}

/**
* Checks whether the user exists in the cognito user pool
* @param email 
* @returns 
*/
async function checkCognitoUser(email: string) {
    try {
        const params = {
            UserPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID!,
            Username: toUsername(email),
        };
        const user = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
        // User exists in Cognito user pool
        console.log('User exists in Cognito:', user);
        return true;
    } catch (error) {
        // User does not exist in Cognito user pool
        console.log('User does not exist in Cognito:', error);
        return false;
    }
}

const verifyEmail = async (email: any) => {
    const params = {
        UserPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID!,
        Username: toUsername(email),
        UserAttributes: [
            {
                Name: 'email_verified',
                Value: 'true'
            }
        ]
    };

    try {
        await cognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise();
        console.log('Email verified successfully');
        return true;
    } catch (error) {
        console.error('Error verifying email:', error);
        return false;
    }
};

const confirmAccount = async (email: any) => {
    const params = {
        UserPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID!,
        Username: toUsername(email),
    };

    try {
        await cognitoIdentityServiceProvider.adminConfirmSignUp(params).promise();
        console.log('User account confirmed successfully');
        return true;
    } catch (error) {
        console.error('Error confirming user account:', error);
        return false;
    }
};


export { signUpUser, signInUser, checkCognitoUser, verifyEmail };
