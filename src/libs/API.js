import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONFIG from '../CONFIG';
import ONYXKEYS from '../ONYXKEYS';
import redirectToSignIn from './actions/SignInRedirect';
import * as Network from './Network';

let isAuthenticating;

let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: val => credentials = val,
});

let authToken;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => authToken = val ? val.authToken : null,
});

/**
 * Does this command require an authToken?
 *
 * @param {String} command
 * @return {Boolean}
 */
function isAuthTokenRequired(command) {
    return !_.contains(['Log', 'Authenticate'], command);
}

/**
 * Adds CSRF and AuthToken to our request data
 *
 * @param {String} command
 * @param {Object} parameters
 * @returns {Object}
 */
function addAuthTokenToParameters(command, parameters) {
    const finalParameters = {...parameters};

    if (isAuthTokenRequired(command) && !parameters.authToken) {
        // If we end up here with no authToken it means we are trying to make
        // an API request before we are signed in. In this case, we should just
        // cancel this and all other requests and set isAuthenticating to false.
        if (!authToken) {
            console.error('A request was made without an authToken', {command, parameters});
            Network.unpauseRequestQueue();
            redirectToSignIn();
            return;
        }

        finalParameters.authToken = authToken;
    }


    // This application does not save its authToken in cookies like the classic Expensify app.
    // Setting api_setCookie to false will ensure that the Expensify API doesn't set any cookies
    // and prevents interfering with the cookie authToken that Expensify classic uses.
    finalParameters.api_setCookie = false;
    return finalParameters;
}

// Tie into the network layer to add auth token to the parameters of all requests
Network.registerParameterEnhancer(addAuthTokenToParameters);

/**
 * @throws {Error} If the "parameters" object has a null or undefined value for any of the given parameterNames
 *
 * @param {String[]} parameterNames Array of the required parameter names
 * @param {Object} parameters A map from available parameter names to their values
 * @param {String} commandName The name of the API command
 */
function requireParameters(parameterNames, parameters, commandName) {
    parameterNames.forEach((parameterName) => {
        if (!_(parameters).has(parameterName)
            || parameters[parameterName] === null
            || parameters[parameterName] === undefined
        ) {
            const propertiesToRedact = ['authToken', 'password', 'partnerUserSecret', 'twoFactorAuthCode'];
            const parametersCopy = _.chain(parameters)
                .clone()
                .mapObject((val, key) => (_.contains(propertiesToRedact, key) ? '<redacted>' : val))
                .value();
            const keys = _(parametersCopy).keys().join(', ') || 'none';

            let error = `Parameter ${parameterName} is required for "${commandName}". `;
            error += `Supplied parameters: ${keys}`;
            throw new Error(error);
        }
    });
}

/**
 * Function used to handle expired auth tokens. It re-authenticates with the API and
 * then replays the original request
 *
 * @param {Object} originalResponse
 * @param {String} originalCommand
 * @param {Object} [originalParameters]
 * @param {String} [originalType]
 */
function handleExpiredAuthToken(originalResponse, originalCommand, originalParameters, originalType) {
    // There are some API requests that should not be retried when there is an auth failure
    // like creating and deleting logins
    if (originalParameters.doNotRetry) {
        return;
    }

    // When the authentication process is running, and more API requests will be requeued and they will
    // be performed after authentication is done.
    if (isAuthenticating) {
        Network.post(originalCommand, originalParameters, originalType);
        return;
    }

    // Prevent any more requests from being processed while authentication happens
    Network.pauseRequestQueue();
    isAuthenticating = true;

    // eslint-disable-next-line no-use-before-define
    Authenticate({
        useExpensifyLogin: false,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: credentials.login,
        partnerUserSecret: credentials.password,
    })
        .then((response) => {
            // If authentication fails throw so that we hit
            // the catch below and redirect to sign in
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            // Update authToken in Onyx and in our local variables so that API requests will use the
            // new authToken
            Onyx.merge(ONYXKEYS.SESSION, {authToken: response.authToken});
            authToken = response.authToken;

            // The authentication process is finished so the network can be unpaused to continue
            // processing requests
            isAuthenticating = false;
            Network.unpauseRequestQueue();

            // Now that the API is authenticated, make the original request again with the new authToken
            const params = addAuthTokenToParameters(originalCommand, originalParameters);
            Network.post(originalCommand, params, originalType);
        })

        .catch((error) => {
            // If authentication fails, then the network can be unpaused and app is redirected
            // so the sign on screen.
            Network.unpauseRequestQueue();
            isAuthenticating = false;
            redirectToSignIn(error.message);
        });
}

/**
 * @private
 *
 * @param {String} command Name of the command to run
 * @param {Object} [parameters] A map of parameter names to their values
 * @param {String} [type]
 *
 * @returns {Promise}
 */
function request(command, parameters, type = 'post') {
    const networkPromise = Network.post(command, parameters, type);

    // Setup the default handlers to work with different response codes
    networkPromise.then((response) => {
        // Handle expired auth tokens properly
        if (response.jsonCode === 407) {
            handleExpiredAuthToken(response, command, parameters, type);

            // Throw an error to prevent other handlers from being triggered on this promise
            throw new Error('A default handler was used for this request');
        }

        return response;
    });

    return networkPromise;
}

/**
 * Access the current authToken
 *
 * @returns {String}
 */
function getAuthToken() {
    return authToken;
}

/**
 * @param {Object} parameters
 * @param {String} [parameters.useExpensifyLogin]
 * @param {String} parameters.partnerName
 * @param {String} parameters.partnerPassword
 * @param {String} parameters.partnerUserID
 * @param {String} parameters.partnerUserSecret
 * @param {String} [parameters.twoFactorAuthCode]
 * @returns {Promise}
 */
function Authenticate(parameters) {
    const commandName = 'Authenticate';

    requireParameters([
        'partnerName',
        'partnerPassword',
        'partnerUserID',
        'partnerUserSecret',
    ], parameters, commandName);

    // eslint-disable-next-line no-use-before-define
    return request(commandName, {
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check
        // for credentials for the expensify partnerID to let users Authenticate with their expensify user
        // and password.
        useExpensifyLogin: parameters.useExpensifyLogin,
        partnerName: parameters.partnerName,
        partnerPassword: parameters.partnerPassword,
        partnerUserID: parameters.partnerUserID,
        partnerUserSecret: parameters.partnerUserSecret,
        twoFactorAuthCode: parameters.twoFactorAuthCode,
        doNotRetry: true,

        // Force this request to be made because the network queue is paused when re-authentication is happening
        forceNetworkRequest: true,
    })
        .then((response) => {
            // If we didn't get a 200 response from Authenticate we either failed to Authenticate with
            // an expensify login or the login credentials we created after the initial authentication.
            // In both cases, we need the user to sign in again with their expensify credentials
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }
            return response;
        });
}

/**
 * @param {object} parameters
 * @param {string} parameters.emailList
 * @returns {Promise}
 */
function CreateChatReport(parameters) {
    const commandName = 'CreateChatReport';
    requireParameters(['emailList'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.authToken
 * @param {String} parameters.partnerName
 * @param {String} parameters.partnerPassword
 * @param {String} parameters.partnerUserID
 * @param {String} parameters.partnerUserSecret
 * @returns {Promise}
 */
function CreateLogin(parameters) {
    const commandName = 'CreateLogin';
    requireParameters([
        'authToken',
        'partnerName',
        'partnerPassword',
        'partnerUserID',
        'partnerUserSecret',
    ], parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.partnerUserID
 * @param {String} parameters.partnerName
 * @param {String} parameters.partnerPassword
 * @param {String} parameters.doNotRetry
 * @returns {Promise}
 */
function DeleteLogin(parameters) {
    const commandName = 'DeleteLogin';
    requireParameters(['partnerUserID', 'partnerName', 'partnerPassword', 'doNotRetry'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.returnValueList
 * @returns {Promise}
 */
function Get(parameters) {
    const commandName = 'Get';
    requireParameters(['returnValueList'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.message
 * @param {Object} parameters.parameters
 * @param {String} parameters.expensifyCashAppVersion
 * @param {String} [parameters.email]
 * @returns {Promise}
 */
function Log(parameters) {
    const commandName = 'Log';
    requireParameters(['message', 'parameters', 'expensifyCashAppVersion'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.emailList
 * @returns {Promise}
 */
function PersonalDetails_GetForEmails(parameters) {
    const commandName = 'PersonalDetails_GetForEmails';
    requireParameters(['emailList'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.socket_id
 * @param {String} parameters.channel_name
 * @returns {Promise}
 */
function Push_Authenticate(parameters) {
    const commandName = 'Push_Authenticate';
    requireParameters(['socket_id', 'channel_name'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.reportComment
 * @param {Number} parameters.reportID
 * @param {Object} [parameters.file]
 * @returns {Promise}
 */
function Report_AddComment(parameters) {
    const commandName = 'Report_AddComment';
    requireParameters(['reportComment', 'reportID'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.reportID
 * @returns {Promise}
 */
function Report_GetHistory(parameters) {
    const commandName = 'Report_GetHistory';
    requireParameters(['reportID'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.reportID
 * @param {Boolean} parameters.pinnedValue
 * @returns {Promise}
 */
function Report_TogglePinned(parameters) {
    const commandName = 'Report_TogglePinned';
    requireParameters(['reportID', 'pinnedValue'],
        parameters, commandName);
    return request(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.accountID
 * @param {Number} parameters.reportID
 * @param {Number} parameters.sequenceNumber
 * @returns {Promise}
 */
function Report_SetLastReadActionID(parameters) {
    const commandName = 'Report_SetLastReadActionID';
    requireParameters(['accountID', 'reportID', 'sequenceNumber'],
        parameters, commandName);
    return request(commandName, parameters);
}

export {
    getAuthToken,
    Authenticate,
    CreateChatReport,
    CreateLogin,
    DeleteLogin,
    Get,
    Log,
    PersonalDetails_GetForEmails,
    Push_Authenticate,
    Report_AddComment,
    Report_GetHistory,
    Report_TogglePinned,
    Report_SetLastReadActionID
};
