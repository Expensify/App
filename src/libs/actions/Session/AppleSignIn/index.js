/* eslint-disable @lwc/lwc/no-async-await */
import * as API from '../../../API';

async function beginAppleSignIn() {
    // performs login request

    try {
        const response = await window.AppleID.auth.signIn();

        // handle successful sign-in
        if (response && response.authorization && response.authorization.code) {
            console.log('Sign-in successful! Code:', response.authorization.code);

            // login the user
            console.log('making API request', response);
            const idToken = response.authorization.id_token;

            const result = await API.makeRequestWithSideEffects('AuthenticateApple', {idToken}, ...ONYX_DATA);
            console.log('RESULT: ', result);
        } else if (response && response.error) {
            // If the response is an error, handle the error
            console.error('Sign-in failed:', response.error);
        } else {
            // If the response is missing required fields, handle the error
            console.error('Sign-in failed: Response is missing required fields');
        }
    } catch (error) {
        // handle error
        console.error('Error signing in:', error);
    }
}

export default beginAppleSignIn;
