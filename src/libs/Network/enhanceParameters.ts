import {AUTHENTICATION_COMMAND} from '@libs/API/types';
import * as Environment from '@libs/Environment/Environment';
import getPlatform from '@libs/getPlatform';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import pkg from '../../../package.json';
import {getAuthToken, getCurrentUserEmail} from './NetworkStore';

// For all requests, we'll send the lastUpdateID that is applied to this client. This will
// allow us to calculate previousUpdateID faster.
let lastUpdateIDAppliedToClient = -1;
// `lastUpdateIDAppliedToClient` is not dependent on any changes on the UI,
// so it is okay to use `connectWithoutView` here.
Onyx.connectWithoutView({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => {
        if (value) {
            lastUpdateIDAppliedToClient = value;
        } else {
            lastUpdateIDAppliedToClient = -1;
        }
    },
});

// Check if the user is logged in as a delegate and send that if so
let delegate = '';
// To enhance the API parameters, we do not need to depend on the UI,
// so it is okay to use `connectWithoutView` here.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (val) => {
        delegate = val?.delegatedAccess?.delegate ?? '';
    },
});

let stashedSupportLogin = '';
// To enhance the API parameters, we do not need to depend on the UI,
// so it is okay to use `connectWithoutView` here.
Onyx.connectWithoutView({
    key: ONYXKEYS.STASHED_CREDENTIALS,
    callback: (val) => {
        stashedSupportLogin = val?.login ?? '';
    },
});

/**
 * Does this command require an authToken?
 */
function isAuthTokenRequired(command: string): boolean {
    return !['Log', AUTHENTICATION_COMMAND, 'BeginSignIn', 'SetPassword'].includes(command);
}

/**
 * Returns request metadata shared by every API call (including Authenticate).
 */
function getBaseRequestParameters(email?: unknown) {
    return {
        referer: CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER,
        platform: getPlatform(),
        // This application does not save its authToken in cookies like the classic Expensify app.
        // Setting api_setCookie to false will ensure that the Expensify API doesn't set any cookies
        // and prevents interfering with the cookie authToken that Expensify classic uses.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        api_setCookie: false,
        // Include current user's email in every request and the server logs
        email: email ?? getCurrentUserEmail(),
        isFromDevEnv: Environment.isDevelopment(),
        appversion: pkg.version,
    };
}

/**
 * Adds default values to our request data
 */
export default function enhanceParameters(command: string, parameters: Record<string, unknown>): Record<string, unknown> {
    const finalParameters: Record<string, unknown> = {...parameters, ...getBaseRequestParameters(parameters.email)};

    if (isAuthTokenRequired(command) && !parameters.authToken) {
        finalParameters.authToken = getAuthToken() ?? null;
    }

    finalParameters.clientUpdateID = lastUpdateIDAppliedToClient;
    if (delegate) {
        finalParameters.delegate = delegate;
    }
    if (stashedSupportLogin) {
        finalParameters.stashedSupportLogin = stashedSupportLogin;
    }

    return finalParameters;
}

export {getBaseRequestParameters};
