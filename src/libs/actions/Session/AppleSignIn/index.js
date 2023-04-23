/* eslint-disable @lwc/lwc/no-async-await */
import * as API from '../../../API';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as Localize from '../../../Localize';
import DateUtils from '../../../DateUtils';
import Logger from '../../../Log';

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

function beginAppleSignIn() {
    // performs login request

    Logger.warn('😀starting sign-in');
    window.AppleID.auth.signIn().then((response) => {
        // handle successful sign-in
        if (response && response.authorization && response.authorization.code) {
            Logger.warn('😀Sign-in successful! Code:', response.authorization.code);

            // login the user
            Logger.warn('😀Making API request', response);
            const idToken = response.authorization.id_token;
        } else if (response && response.error) {
            // If the response is an error, handle the error
            console.error('Sign-in failed:', response.error);
        } else {
            // If the response is missing required fields, handle the error
            console.error('Sign-in failed: Response is missing required fields');
        }
    });
}

export default beginAppleSignIn;
