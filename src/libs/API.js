import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../CONST';
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
    return !_.contains([
        'Log',
        'Graphite_Timer',
        'Authenticate',
        'GetAccountStatus',
        'SetPassword',
        'User_SignUp',
        'ResendValidateCode',
    ], command);
}

/**
 * Adds default values to our request data
 *
 * @param {String} command
 * @param {Object} parameters
 * @returns {Object}
 */
function addDefaultValuesToParameters(command, parameters) {
    const finalParameters = {...parameters};

    if (isAuthTokenRequired(command) && !parameters.authToken) {
        // If we end up here with no authToken it means we are trying to make an API request before we are signed in.
        // In this case, we should cancel the current request by pausing the queue and clearing the remaining requests.
        if (!authToken) {
            redirectToSignIn();

            console.debug('A request was made without an authToken', {command, parameters});
            Network.pauseRequestQueue();
            Network.clearRequestQueue();
            return;
        }

        finalParameters.authToken = authToken;
    }

    // Always set referer to https://expensify.cash/
    finalParameters.referer = CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH;

    // This application does not save its authToken in cookies like the classic Expensify app.
    // Setting api_setCookie to false will ensure that the Expensify API doesn't set any cookies
    // and prevents interfering with the cookie authToken that Expensify classic uses.
    finalParameters.api_setCookie = false;
    return finalParameters;
}

// Tie into the network layer to add auth token to the parameters of all requests
Network.registerParameterEnhancer(addDefaultValuesToParameters);

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
 * @param {String} originalCommand
 * @param {Object} [originalParameters]
 * @param {String} [originalType]
 * @returns {Promise}
 */
function handleExpiredAuthToken(originalCommand, originalParameters, originalType) {
    // When the authentication process is running, and more API requests will be requeued and they will
    // be performed after authentication is done.
    if (isAuthenticating) {
        return Network.post(originalCommand, originalParameters, originalType);
    }

    // Prevent any more requests from being processed while authentication happens
    Network.pauseRequestQueue();
    isAuthenticating = true;

    // eslint-disable-next-line no-use-before-define
    return reauthenticate(originalCommand)
        .then(() => {
            // Now that the API is authenticated, make the original request again with the new authToken
            const params = addDefaultValuesToParameters(originalCommand, originalParameters);
            return Network.post(originalCommand, params, originalType);
        })
        .catch(() => (

            // If the request did not succeed because of a networking issue or the server did not respond requeue the
            // original request.
            Network.post(originalCommand, originalParameters, originalType)
        ));
}

Network.registerResponseHandler((queuedRequest, response) => {
    if (response.jsonCode === 407) {
        // Credentials haven't been initialized. We will not be able to re-authenticates with the API
        const unableToReauthenticate = (!credentials || !credentials.autoGeneratedLogin
            || !credentials.autoGeneratedPassword);

        // There are some API requests that should not be retried when there is an auth failure like
        // creating and deleting logins. In those cases, they should handle the original response instead
        // of the new response created by handleExpiredAuthToken.
        if (queuedRequest.data.doNotRetry || unableToReauthenticate) {
            queuedRequest.resolve(response);
            return;
        }

        handleExpiredAuthToken(queuedRequest.command, queuedRequest.data, queuedRequest.type)
            .then(queuedRequest.resolve)
            .catch(queuedRequest.reject);
        return;
    }

    queuedRequest.resolve(response);
});

Network.registerErrorHandler((queuedRequest, error) => {
    console.debug('[API] Handled error when making request', error);

    // Set an error state and signify we are done loading
    Onyx.merge(ONYXKEYS.SESSION, {loading: false, error: 'Cannot connect to server'});

    // Reject the queued request with an API offline error so that the original caller can handle it.
    queuedRequest.reject(new Error(CONST.ERROR.API_OFFLINE));
});

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
 * @param {String} [parameters.email]
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
    return Network.post(commandName, {
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

        // Add email param so the first Authenticate request is logged on the server w/ this email
        email: parameters.email,
    })
        .then((response) => {
            // If we didn't get a 200 response from Authenticate we either failed to Authenticate with
            // an expensify login or the login credentials we created after the initial authentication.
            // In both cases, we need the user to sign in again with their expensify credentials
            if (response.jsonCode !== 200) {
                switch (response.jsonCode) {
                    case 401:
                        throw new Error('Incorrect login or password. Please try again.');
                    case 402:
                        // eslint-disable-next-line max-len
                        throw new Error('You have 2FA enabled on this account. Please sign in using your email or phone number.');
                    case 403:
                        throw new Error('Invalid login or password. Please try again or reset your password.');
                    case 404:
                        // eslint-disable-next-line max-len
                        throw new Error('We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.');
                    case 405:
                        // eslint-disable-next-line max-len
                        throw new Error('You do not have access to this application. Please add your GitHub username for access.');
                    case 413:
                        // eslint-disable-next-line max-len
                        throw new Error('Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.');
                    default:
                        throw new Error('Something went wrong. Please try again later.');
                }
            }
            return response;
        });
}

/**
 * Reauthenticate using the stored credentials and redirect to the sign in page if unable to do so.
 *
 * @param {String} [command] command name for loggin purposes
 * @returns {Promise}
 */
function reauthenticate(command = '') {
    return Authenticate({
        useExpensifyLogin: false,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: credentials.autoGeneratedLogin,
        partnerUserSecret: credentials.autoGeneratedPassword,
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
        })

        .catch((error) => {
            // If authentication fails, then the network can be unpaused
            Network.unpauseRequestQueue();
            isAuthenticating = false;

            // When a fetch() fails and the "API is offline" error is thrown we won't log the user out. Most likely they
            // have a spotty connection and will need to try to reauthenticate when they come back online. We will
            // re-throw this error so it can be handled by callers of reauthenticate().
            if (error.message === CONST.ERROR.API_OFFLINE) {
                throw error;
            }

            // If we experience something other than a network error then redirect the user to sign in
            redirectToSignIn(error.message);

            console.debug('Redirecting to Sign In because we failed to reauthenticate', {
                command,
                error: error.message,
            });
        });
}

/**
 * @param {Object} parameters
 * @param {String} parameters.oldPassword
 * @param {String} parameters.password
 * @returns {Promise}
 */
function ChangePassword(parameters) {
    const commandName = 'ChangePassword';
    requireParameters(['oldPassword', 'password'], parameters, commandName);
    return Network.post(commandName, parameters);
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
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.email
 * @returns {Promise}
 */
function User_SignUp(parameters) {
    const commandName = 'User_SignUp';
    requireParameters([
        'email',
    ], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.authToken
 * @param {String} parameters.partnerName
 * @param {String} parameters.partnerPassword
 * @param {String} parameters.partnerUserID
 * @param {String} parameters.partnerUserSecret
 * @param {Boolean} [parameters.doNotRetry]
 * @param {String} [parameters.email]
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
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.partnerUserID
 * @param {String} parameters.partnerName
 * @param {String} parameters.partnerPassword
 * @param {Boolean} parameters.doNotRetry
 * @returns {Promise}
 */
function DeleteLogin(parameters) {
    const commandName = 'DeleteLogin';
    requireParameters(['partnerUserID', 'partnerName', 'partnerPassword', 'doNotRetry'],
        parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.returnValueList
 * @returns {Promise}
 */
function Get(parameters) {
    const commandName = 'Get';
    requireParameters(['returnValueList'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.email
 * @returns {Promise}
 */
function GetAccountStatus(parameters) {
    const commandName = 'GetAccountStatus';
    requireParameters(['email'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @returns {Promise}
 */
function GetRequestCountryCode() {
    const commandName = 'GetRequestCountryCode';
    return Network.post(commandName);
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

    // Note: We are forcing Log to run since it requires no authToken and should only be queued when we are offline.
    return Network.post(commandName, {...parameters, forceNetworkRequest: true});
}

/**
 * @param {Object} parameters
 * @param {String} parameters.name
 * @param {Number} parameters.value
 * @returns {Promise}
 */
function Graphite_Timer(parameters) {
    const commandName = 'Graphite_Timer';
    requireParameters(['name', 'value'],
        parameters, commandName);
    return Network.post(commandName, parameters);
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
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Object} parameters.details
 * @returns {Promise}
 */
function PersonalDetails_Update(parameters) {
    const commandName = 'PersonalDetails_Update';
    requireParameters(['details'],
        parameters, commandName);
    return Network.post(commandName, parameters);
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
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.reportComment
 * @param {Number} parameters.reportID
 * @param {String} parameters.clientID
 * @param {File|Object} [parameters.file]
 * @returns {Promise}
 */
function Report_AddComment(parameters) {
    const commandName = 'Report_AddComment';
    requireParameters(['reportComment', 'reportID', 'clientID'],
        parameters, commandName);
    return Network.post(commandName, parameters);
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
    return Network.post(commandName, parameters);
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
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.accountID
 * @param {Number} parameters.reportID
 * @param {Number} parameters.sequenceNumber
 * @returns {Promise}
 */
function Report_UpdateLastRead(parameters) {
    const commandName = 'Report_UpdateLastRead';
    requireParameters(['accountID', 'reportID', 'sequenceNumber'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.email
 * @returns {Promise}
 */
function ResendValidateCode(parameters) {
    const commandName = 'ResendValidateCode';
    requireParameters(['email'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.password
 * @param {String} parameters.validateCode
 * @returns {Promise}
 */
function SetPassword(parameters) {
    const commandName = 'SetPassword';
    requireParameters(['email', 'password', 'validateCode'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.subscribed
 * @returns {Promise}
 */
function UpdateAccount(parameters) {
    const commandName = 'UpdateAccount';
    requireParameters(['subscribed'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @returns {Promise}
 */
function User_GetBetas() {
    return Network.post('User_GetBetas');
}

/**
 * @param {Object} parameters
 * @param {String} parameters.email
 * @param {String} parameters.password
 * @returns {Promise}
 */
function User_SecondaryLogin_Send(parameters) {
    const commandName = 'User_SecondaryLogin_Send';
    requireParameters(['email', 'password'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {File|Object} parameters.file
 * @returns {Promise}
 */
function User_UploadAvatar(parameters) {
    const commandName = 'User_UploadAvatar';
    requireParameters(['file'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.name
 * @param {String} parameters.value
 * @returns {Promise}
 */
function SetNameValuePair(parameters) {
    const commandName = 'SetNameValuePair';
    requireParameters(['name', 'value'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String[]} data
 * @returns {Promise}
 */
function Mobile_GetConstants(parameters) {
    const commandName = 'Mobile_GetConstants';
    requireParameters(['data'], parameters, commandName);

    // For some reason, the Mobile_GetConstants endpoint requires a JSON string, so we need to stringify the data param
    const finalParameters = parameters;
    finalParameters.data = JSON.stringify(parameters.data);

    return Network.post(commandName, finalParameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.debtorEmail
 * @returns {Promise}
 */
function GetIOUReport(parameters) {
    const commandName = 'GetIOUReport';
    requireParameters(['debtorEmail'], parameters, commandName);
    return Network.post(commandName, parameters);
}

export {
    getAuthToken,
    Authenticate,
    ChangePassword,
    CreateChatReport,
    CreateLogin,
    DeleteLogin,
    Get,
    GetAccountStatus,
    GetIOUReport,
    GetRequestCountryCode,
    Graphite_Timer,
    Log,
    Mobile_GetConstants,
    PersonalDetails_GetForEmails,
    PersonalDetails_Update,
    Push_Authenticate,
    Report_AddComment,
    Report_GetHistory,
    Report_TogglePinned,
    Report_UpdateLastRead,
    ResendValidateCode,
    SetNameValuePair,
    SetPassword,
    UpdateAccount,
    User_SignUp,
    User_GetBetas,
    User_SecondaryLogin_Send,
    User_UploadAvatar,
    reauthenticate,
};
