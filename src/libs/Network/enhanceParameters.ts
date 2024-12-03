import Onyx from 'react-native-onyx';
import * as Environment from '@libs/Environment/Environment';
import getPlatform from '@libs/getPlatform';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import pkg from '../../../package.json';
import * as NetworkStore from './NetworkStore';

// For all requests, we'll send the lastUpdateID that is applied to this client. This will
// allow us to calculate previousUpdateID faster.
let lastUpdateIDAppliedToClient = -1;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => {
        if (value) {
            lastUpdateIDAppliedToClient = value;
        } else {
            lastUpdateIDAppliedToClient = -1;
        }
    },
});

/**
 * Does this command require an authToken?
 */
function isAuthTokenRequired(command: string): boolean {
    return !['Log', 'Authenticate', 'BeginSignIn', 'SetPassword'].includes(command);
}

/**
 * Adds default values to our request data
 */
export default function enhanceParameters(command: string, parameters: Record<string, unknown>): Record<string, unknown> {
    const finalParameters = {...parameters};

    if (isAuthTokenRequired(command) && !parameters.authToken) {
        finalParameters.authToken = NetworkStore.getAuthToken() ?? null;
    }

    finalParameters.referer = CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER;

    // In addition to the referer (ecash), we pass the platform to help differentiate what device type
    // is sending the request.
    finalParameters.platform = getPlatform();

    // This application does not save its authToken in cookies like the classic Expensify app.
    // Setting api_setCookie to false will ensure that the Expensify API doesn't set any cookies
    // and prevents interfering with the cookie authToken that Expensify classic uses.
    finalParameters.api_setCookie = false;

    // Include current user's email in every request and the server logs
    finalParameters.email = parameters.email ?? NetworkStore.getCurrentUserEmail();

    finalParameters.isFromDevEnv = Environment.isDevelopment();

    finalParameters.appversion = pkg.version;

    finalParameters.clientUpdateID = lastUpdateIDAppliedToClient;

    return finalParameters;
}
