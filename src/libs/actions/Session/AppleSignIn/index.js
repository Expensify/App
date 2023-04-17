/* eslint-disable @lwc/lwc/no-async-await */
import * as API from '../../../API';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as Localize from '../../../Localize';
import DateUtils from '../../../DateUtils';

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

const ONYX_DATA = {
    optimisticData,
    successData,
    failureData,
};

async function beginAppleSignIn() {
    // performs login request

    try {
        console.log('😀starting sign-in');
        const response = await window.AppleID.auth.signIn();

        // handle successful sign-in
        if (response && response.authorization && response.authorization.code) {
            console.log('😀Sign-in successful! Code:', response.authorization.code);

            // login the user
            console.log('😀Making API request', response);
            const idToken = response.authorization.id_token;
            const newFailureData = [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {
                    isLoading: false,
                    errors: {
                        [DateUtils.getMicroseconds()]: `Got idToken: ${idToken}`,
                    },
                },
            }];

            const result = await API.makeRequestWithSideEffects('AuthenticateApple', {idToken}, {optimisticData, successData, failureData: newFailureData});
            console.log('😀RESULT: ', result);
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
