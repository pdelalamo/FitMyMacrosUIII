import AWS from 'aws-sdk';

AWS.config.region = 'eu-west-3';

// Initialize CognitoIdentityServiceProvider
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// Function to sign up a new user
const signUpUser = async (email: string, password: string) => {
    try {
        const params = {
            ClientId: '6v7ucl1ti0g39pqnfco6r3llp0',
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        };

        await cognitoIdentityServiceProvider.signUp(params).promise();
        console.log('User signed up successfully');
    } catch (error) {
        console.error('Error signing up user:', error);
    }
};

// Function to sign in a user
const signInUser = async (email: string, password: string) => {
    try {
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: '6v7ucl1ti0g39pqnfco6r3llp0',
            AuthParameters: {
                'USERNAME': email,
                'PASSWORD': password
            }
        };

        const data = await cognitoIdentityServiceProvider.initiateAuth(params).promise();
        console.log('User signed in successfully:', data.AuthenticationResult);
    } catch (error) {
        console.error('Error signing in user:', error);
    }
};

export { signUpUser, signInUser };
