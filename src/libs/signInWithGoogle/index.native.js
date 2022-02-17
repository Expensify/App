import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com',
});

/**
 * Function to signIn the user with their Google account
 *
 * @returns {Promise<{ token: string, email: string }>}
 */
export default function signInWithGoogle() {
    return GoogleSignin.signIn().then(res => ({
        token: res.idToken,
        email: res.user.email,
    }));
}
