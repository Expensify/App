/* eslint-disable @lwc/lwc/no-async-await */
import _ from 'underscore';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as Localize from '../../../Localize';
import * as API from '../../../API';
import DateUtils from '../../../DateUtils';

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
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                ...CONST.DEFAULT_ACCOUNT_DATA,
                isLoading: true,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.CREDENTIALS,
            value: {
                validateCode: null,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {
                isLoading: false,
                errors: {
                    [DateUtils.getMicroseconds()]: Localize.translateLocal('loginForm.cannotGetAccountDetails'),
                },
            },
        },
    ];

    if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
        console.log('making API request');
        const result = await API.makeRequestWithSideEffects('AuthenticateApple', {idToken}, {optimisticData, successData, failureData});
        console.log('RESULT: ', result);
    } else {
        throw new Error('sign in failed');
    }
}

export default beginAppleSignIn;
