/* eslint-disable @lwc/lwc/no-async-await */
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import Log from '../../Log';

GoogleSignin.configure({
    webClientId: '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com',
    iosClientId: '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com',
    offlineAccess: false,
});

export default async function signInWithGoogle(apiCallback) {
    // await GoogleSignin.revokeAccess().catch(error => Log.error('Google revoke access error: ', error));

    await GoogleSignin.signOut();
    GoogleSignin.signIn()
        .then((response) => {
            apiCallback({token: response.idToken, email: response.user.email}).then(
                (apiResponse => Log.error('API response: ', apiResponse)).catch(apiError => Log.error('API Callback error: ', apiError)),
            );
        })
        .catch((error) => {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Log.error('Google sign in cancelled', true, {error});
                console.log('Google sign in cancelled', error);
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Log.error('Google sign in already in progress', true, {error});
                console.log('Google sign in already in progress', error);
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Log.error('Google play services not available or outdated', true, {error});
                console.log('Google play services not available or outdated', error);
            } else {
                Log.error('Unknown Google sign in error', true, {error});
                console.log('Unknown Google sign in error', error);
            }
        });
}
