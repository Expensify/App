import lodashGet from 'lodash/get';
import _ from 'underscore';
import CONFIG from '../../CONFIG';
import getPlatform from '../getPlatform';
import * as NetworkStore from './NetworkStore';

/**
 * Does this command require an authToken?
 *
 * @param {String} command
 * @return {Boolean}
 */
function isAuthTokenRequired(command) {
    return !_.contains([
        'Log',
        'Authenticate',
        'BeginSignIn',
        'SetPassword',
        'ResendValidateCode',
        'ValidateEmail',
    ], command);
}

/**
 * Adds default values to our request data
 *
 * @param {String} command
 * @param {Object} parameters
 * @returns {Object}
 */
export default function enhanceParameters(command, parameters) {
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
    finalParameters.email = lodashGet(parameters, 'email', NetworkStore.getCurrentUserEmail());

    return finalParameters;
}
