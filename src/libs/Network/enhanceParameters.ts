import * as Environment from '@libs/Environment/Environment';
import getPlatform from '@libs/getPlatform';
import * as Pusher from '@libs/Pusher/pusher';
import CONFIG from '@src/CONFIG';
import {version as pkgVersion} from '../../../package.json';
import * as NetworkStore from './NetworkStore';

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
        finalParameters.authToken = NetworkStore.getAuthToken();
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

    // We send the pusherSocketID with all write requests so that the api can include it in push events to prevent Pusher from sending the events to the requesting client. The push event
    // is sent back to the requesting client in the response data instead, which prevents a replay effect in the UI. See https://github.com/Expensify/App/issues/12775.
    // TODO: Only send with write requests
    finalParameters.pusherSocketID = Pusher.getPusherSocketID();

    finalParameters.appversion = pkgVersion;

    return finalParameters;
}
