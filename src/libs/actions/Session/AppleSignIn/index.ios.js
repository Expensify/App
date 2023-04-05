/* eslint-disable @lwc/lwc/no-async-await */
import _ from 'underscore';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import * as API from '../../../API';
import * as ONYX_DATA from './ONYX_DATA';

async function beginAppleSignIn() {
    // performs login request
    console.log('starting login request');
    const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,

        // Note: it appears putting FULL_NAME first is important, see issue #293
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    console.log('finished login request', appleAuthRequestResponse);

    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
    console.log('credentialState', credentialState);

    // use credentialState response to ensure the user is authenticated
    const idToken = appleAuthRequestResponse.identityToken;

    if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
        console.log('making API request');
        const result = await API.makeRequestWithSideEffects('AuthenticateApple', {idToken}, ...ONYX_DATA);
        console.log('RESULT: ', result);
    } else {
        throw new Error('sign in failed');
    }
}

export default beginAppleSignIn;
