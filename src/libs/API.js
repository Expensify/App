import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'js-libs/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import HttpUtils from './HttpUtils';
import NetworkConnection from './NetworkConnection';
import CONFIG from '../CONFIG';
import * as Pusher from './Pusher/pusher';
import ROUTES from '../ROUTES';
import redirectToSignIn from './actions/SignInRedirect';
import PushNotification from './Notification/PushNotification';

// Queue for network requests so we don't lose actions done by the user while offline
let networkRequestQueue = [];

// Indicates if we're in the process of re-authenticating. When an API call returns jsonCode 407 indicating that the
// authToken expired, we set this to true, pause all API calls, re-authenticate, and then use the authToken fromm the
// response in the subsequent API calls
let reauthenticating = false;

let authToken;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => authToken = val ? val.authToken : null,
});

// We subscribe to changes to the online/offline status of the network to determine when we should fire off API calls
// vs queueing them for later.
let isOffline;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: val => isOffline = val && val.isOffline,
});

// When the user authenticates for the first time we create a login and store credentials in Onyx.
// When the user's authToken expires we use this login to re-authenticate and get a new authToken
// and use that new authToken in subsequent API calls
let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: ionCredentials => credentials = ionCredentials,
});

// If we are ever being redirected to the sign in page, the user is currently unauthenticated, so we should clear the
// network request queue, to prevent DDoSing our own API
Onyx.connect({
    key: ONYXKEYS.APP_REDIRECT_TO,
    callback: (redirectTo) => {
        if (redirectTo && redirectTo.startsWith(ROUTES.SIGNIN)) {
            networkRequestQueue = [];
        }
    }
});

export default function API(network, args) {
    /**
     * @private
     *
     * Maps jsonCode => array of callback functions
     */
    const defaultHandlers = {};

    if (!network) {
        throw new Error('Cannot instantiate API without a Network object');
    }

    /**
     * @private
     *
     * @param {String} command Name of the command to run
     * @param {Object} [parameters] A map of parameter names to their values
     * @param {String} [returnedPropertyName] The value of the property that you want to return if you don't want to
     *                      return the whole response JSON
     * @param {Boolean} [keepalive] Whether or not the request should be kept alive if the browser is closed in the
     *                      middle of the request
     * @param {Boolean} [checkCodeRevision] Whether or not the code revision should be validated
     *
     * @returns {APIDeferred} An APIDeferred representing the promise of this request
     */
    function performPOSTRequest(command, parameters) {
        let newParameters = {...parameters, command};

        // If there was an enhanceParameters() method supplied in our args, then we will call that here
        if (args && _.isFunction(args.enhanceParameters)) {
            newParameters = args.enhanceParameters(newParameters);
        }

        return network.post(newParameters);
    }

    /**
     * @throws {Error} If the "parameters" object has a null or undefined value for any of the given parameterNames
     *
     * @private
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
                const parametersCopy = _.clone(parameters);
                if (_(parametersCopy).has('authToken')) {
                    parametersCopy.authToken = '<redacted>';
                }
                if (_(parametersCopy).has('password')) {
                    parametersCopy.password = '<redacted>';
                }
                const keys = _(parametersCopy).keys().join(', ') || 'none';
                throw new Error(`Parameter ${parameterName} is required for "${commandName}". Supplied parameters: ${keys}`);
            }
        });
    }

    return {

    };
}

/**
 * Does this command require an authToken?
 *
 * @param {String} command
 * @return {Boolean}
 */
function isAuthTokenRequired(command) {
    return !_.contains(['Log'], command);
}

/**
 * Adds a request to networkRequestQueue
 *
 * @param {string} command
 * @param {mixed} data
 * @returns {Promise}
 */
function queueRequest(command, data) {
    return new Promise((resolve, reject) => {
        // Add the write request to a queue of actions to perform
        networkRequestQueue.push({
            command,
            data,
            resolve,
            reject,
        });

        // Try to fire off the request as soon as it's queued so we don't add a delay to every queued command
        // eslint-disable-next-line no-use-before-define
        processNetworkRequestQueue();
    });
}

/**
 * @param {object} parameters
 * @param {string} parameters.partnerUserID
 * @returns {Promise}
 */
function deleteLogin(parameters) {
    return queueRequest('DeleteLogin', {
        authToken,
        partnerUserID: parameters.partnerUserID,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        doNotRetry: true,
    })
        .catch(error => Onyx.merge(ONYXKEYS.SESSION, {error: error.message}));
}

/**
 * @param {string} login
 * @param {string} password
 * @returns {Promise}
 */
function createLogin(login, password) {
    if (!authToken) {
        throw new Error('createLogin() can\'t be called when there is no authToken');
    }

    // Using xhr instead of request becasue request has logic to re-try API commands when we get a 407 authToken expired
    // in the response, and we call CreateLogin after getting a successful resposne to Authenticate so it's unlikely
    // that we'll get a 407.
    return HttpUtils.xhr('CreateLogin', {
        authToken,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            if (credentials && credentials.login) {
                // If we have an old login for some reason, we should delete it before storing the new details
                deleteLogin({partnerUserID: credentials.login});
            }

            Onyx.merge(ONYXKEYS.CREDENTIALS, {login, password});
        });
}


/**
 * Sets API data in the store when we make a successful "Authenticate"/"CreateLogin" request
 *
 * @param {object} data
 * @param {string} exitTo
 */
function setSuccessfulSignInData(data, exitTo) {
    PushNotification.register(data.accountID);

    const redirectTo = exitTo ? Str.normalizeUrl(exitTo) : ROUTES.ROOT;
    Onyx.multiSet({
        [ONYXKEYS.SESSION]: _.pick(data, 'authToken', 'accountID', 'email'),
        [ONYXKEYS.APP_REDIRECT_TO]: redirectTo
    });
}

/**
 * Makes an API request.
 *
 * For most API commands if we get a 407 jsonCode in the response, which means the authToken
 * expired, this function automatically makes an API call to Authenticate and get a fresh authToken, and retries the
 * original API command
 *
 * @param {string} command
 * @param {object} parameters
 * @param {string} [type]
 * @returns {Promise}
 */
function request(command, parameters, type = 'post') {
    // If we're in the process of re-authenticating, queue this request for after we're done re-authenticating
    if (reauthenticating) {
        return queueRequest(command, parameters);
    }

    // If we end up here with no authToken it means we are trying to make
    // an API request before we are signed in. In this case, we should just
    // cancel this and all other requests and set reauthenticating to false.
    if (!authToken && isAuthTokenRequired(command)) {
        console.error('A request was made without an authToken', {command, parameters});
        reauthenticating = false;
        redirectToSignIn();
        return Promise.resolve();
    }

    // Add authToken automatically to all commands
    const parametersWithAuthToken = {...parameters, authToken};

    // Make the http request, and if we get 407 jsonCode in the response,
    // re-authenticate to get a fresh authToken and make the original http request again
    return HttpUtils.xhr(command, parametersWithAuthToken, type)
        .then((responseData) => {
            // We can end up here if we have queued up many
            // requests and have an expired authToken. In these cases,
            // we just need to requeue the request
            if (reauthenticating) {
                return queueRequest(command, parametersWithAuthToken);
            }

            // If we're not re-authenticating and we get 407 (authToken expired)
            // we re-authenticate and then re-try the original request
            if (responseData.jsonCode === 407 && parametersWithAuthToken.doNotRetry !== true) {
                reauthenticating = true;
                return HttpUtils.xhr('Authenticate', {
                    useExpensifyLogin: false,
                    partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
                    partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
                    partnerUserID: credentials.login,
                    partnerUserSecret: credentials.password,
                    twoFactorAuthCode: ''
                })
                    .then((response) => {
                        reauthenticating = false;

                        // If authentication fails throw so that we hit
                        // the catch below and redirect to sign in
                        if (response.jsonCode !== 200) {
                            throw new Error(response.message);
                        }

                        // Update the authToken that will be used to retry the command since the one we have is expired
                        parametersWithAuthToken.authToken = response.authToken;

                        // Update authToken in Onyx store otherwise subsequent API calls will use the expired one
                        Onyx.merge(ONYXKEYS.SESSION, _.pick(response, 'authToken'));
                        return response;
                    })
                    .then(() => HttpUtils.xhr(command, parametersWithAuthToken, type))
                    .catch((error) => {
                        reauthenticating = false;
                        redirectToSignIn(error.message);
                        return Promise.reject();
                    });
            }
            return responseData;
        })
        .catch((error) => {
            // If the request failed, we need to put the request object back into the queue as long as there is no
            // doNotRetry option set in the parametersWithAuthToken
            if (parametersWithAuthToken.doNotRetry !== true) {
                queueRequest(command, parametersWithAuthToken);
            }

            // If we already have an error, throw that so we do not swallow it
            if (error instanceof Error) {
                throw error;
            }

            // Throw a generic error so we can pass the error up the chain
            throw new Error(`API Command ${command} failed`);
        });
}

/**
 * Process the networkRequestQueue by looping through the queue and attempting to make the requests
 */
function processNetworkRequestQueue() {
    if (isOffline) {
        // Two things will bring the app online again...
        // 1. Pusher reconnecting (see registerSocketEventCallback in this file)
        // 2. Getting a 200 response back from the API (happens right below)

        // Make a simple request every second to see if the API is online again
        HttpUtils.xhr('Get', {doNotRetry: true})
            .then(() => NetworkConnection.setOfflineStatus(false));
        return;
    }

    // Don't make any requests until we're done re-authenticating since we'll use the new authToken
    // from that response for the subsequent network requests
    if (reauthenticating || networkRequestQueue.length === 0) {
        return;
    }

    _.each(networkRequestQueue, (queuedRequest) => {
        request(queuedRequest.command, queuedRequest.data)
            .then(queuedRequest.resolve)
            .catch(queuedRequest.reject);
    });

    networkRequestQueue = [];
}

// Process our write queue very often
setInterval(processNetworkRequestQueue, 1000);

/**
 * Pusher.reconnect() calls disconnect and connect on the
 * Pusher socket. In some cases, the authorizer might fail
 * or an error will be returned due to an out of date authToken.
 * Reconnect will preserve our existing subscriptions and retry
 * connecting until it succeeds. We're throttling this call so
 * that we retry as few times as possible.
 */
const reconnectToPusher = _.throttle(Pusher.reconnect, 1000);

/**
 * When authTokens expire they will automatically be refreshed.
 * The authorizer helps make sure that we are always passing the
 * current valid token to generate the signed auth response
 * needed to subscribe to Pusher channels.
 */
Pusher.registerCustomAuthorizer((channel, {authEndpoint}) => ({
    authorize: (socketID, callback) => {
        console.debug('[Network] Attempting to authorize Pusher');

        const formData = new FormData();
        formData.append('socket_id', socketID);
        formData.append('channel_name', channel.name);
        formData.append('authToken', authToken);

        return fetch(authEndpoint, {
            method: 'POST',
            body: formData,
        })
            .then(authResponse => authResponse.json())
            .then(data => callback(null, data))
            .catch((error) => {
                reconnectToPusher();
                console.debug('[Network] Failed to authorize Pusher');
                callback(new Error(`Error calling auth endpoint: ${error.message}`));
            });
    },
}));

/**
 * Events that happen on the pusher socket are used to determine if the app is online or offline. The offline setting
 * is stored in Onyx so the rest of the app has access to it.
 *
 * @params {string} eventName
 */
Pusher.registerSocketEventCallback((eventName) => {
    switch (eventName) {
        case 'error':
            reconnectToPusher();
            break;
        default:
            break;
    }
});

/**
 * Get the authToken that the network uses
 * @returns {string}
 */
function getAuthToken() {
    return authToken;
}

/**
 * @param {object} parameters
 * @param {string} parameters.partnerUserID
 * @param {string} parameters.partnerUserSecret
 * @param {string} parameters.twoFactorAuthCode
 * @param {string} [parameters.exitTo]
 * @returns {Promise}
 */
function authenticate(parameters) {
    Onyx.merge(ONYXKEYS.SESSION, {loading: true, error: ''});

    // We treat Authenticate in a special way because unlike other commands, this one can't fail
    // with 407 authToken expired. When other api commands fail with this error we call Authenticate
    // to get a new authToken and then fire the original api command again
    return HttpUtils.xhr('Authenticate', {
        // When authenticating for the first time, we pass useExpensifyLogin as true so we check for credentials for
        // the expensify partnerID to let users authenticate with their expensify user and password.
        useExpensifyLogin: true,
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: parameters.partnerUserID,
        partnerUserSecret: parameters.partnerUserSecret,
        twoFactorAuthCode: parameters.twoFactorAuthCode,
        exitTo: parameters.exitTo,
    })
        .then((response) => {
            // If we didn't get a 200 response from authenticate we either failed to authenticate with
            // an expensify login or the login credentials we created after the initial authentication.
            // In both cases, we need the user to sign in again with their expensify credentials
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            // Update the authToken so it's used in the call to createLogin below
            authToken = response.authToken;
            return response;
        })

        // After the user authenticates, create a new login for the user so that we can reauthenticate when the
        // authtoken expires
        .then(response => (
            createLogin(Str.guid('react-native-chat-'), Str.guid())
                .then(() => setSuccessfulSignInData(response, parameters.exitTo))
        ))
        .catch((error) => {
            console.error(error);
            console.debug('[SIGNIN] Request error');
            Onyx.merge(ONYXKEYS.SESSION, {error: error.message});
        })
        .finally(() => Onyx.merge(ONYXKEYS.SESSION, {loading: false}));
}

/**
 * @param {object} parameters
 * @param {number} parameters.accountID
 * @param {number} parameters.reportID
 * @param {number} parameters.sequenceNumber
 * @returns {Promise}
 */
function setLastReadActionID(parameters) {
    return queueRequest('Report_SetLastReadActionID', {
        authToken,
        accountID: parameters.accountID,
        reportID: parameters.reportID,
        sequenceNumber: parameters.sequenceNumber,
    });
}

/**
 * @param {object} parameters
 * @param {number} parameters.reportID
 * @returns {Promise}
 */
function getReportHistory(parameters) {
    return queueRequest('Report_GetHistory', {
        authToken,
        reportID: parameters.reportID,
    });
}

/**
 * @param {object} parameters
 * @param {string} parameters.emailList
 * @returns {Promise}
 */
function createChatReport(parameters) {
    return queueRequest('CreateChatReport', {
        authToken,
        emailList: parameters.emailList,
    });
}

/**
 * @param {object} parameters
 * @param {string} parameters.reportComment
 * @param {object} parameters.file
 * @param {number} parameters.reportID
 * @returns {Promise}
 */
function addReportComment(parameters) {
    return queueRequest('Report_AddComment', {
        authToken,
        reportComment: parameters.reportComment,
        file: parameters.file,
        reportID: parameters.reportID,
    });
}

/**
 * @param {object} parameters
 * @param {string} parameters.returnValueList
 * @returns {Promise}
 */
function get(parameters) {
    return queueRequest('Get', {
        authToken,
        ...parameters,
    });
}

/**
 * @param {object} parameters
 * @param {string} parameters.emailList
 * @returns {Promise}
 */
function getPersonalDetails(parameters) {
    return queueRequest('PersonalDetails_GetForEmails', {
        authToken,
        emailList: parameters,
    });
}

/**
 * @param {object} parameters
 * @param {string} parameters.name
 * @param {mixed} parameters.value
 * @returns {Promise}
 */
function setNameValuePair(parameters) {
    return queueRequest('SetNameValuePair', {
        authToken,
        name: parameters.name,
        value: parameters.value,
    });
}

/**
 * @param {object} parameters
 * @param {number} parameters.reportID
 * @param {boolean} parameters.pinnedValue
 * @returns {Promise}
 */
function togglePinnedReport(parameters) {
    return queueRequest('Report_TogglePinned', {
        authToken,
        reportID: parameters.reportID,
        pinnedValue: parameters.pinnedValue,
    });
}

/**
 * @param {Object} parameters
 * @param {String} parameters.message
 * @param {Object} parameters.parameters
 * @param {String} parameters.expensifyCashAppVersion
 * @param {String} [parameters.email]
 * @returns {Promise}
 */
function logToServer(parameters) {
    return queueRequest('Log', parameters);
}

export {
    authenticate,
    addReportComment,
    createChatReport,
    deleteLogin,
    get,
    getAuthToken,
    getPersonalDetails,
    getReportHistory,
    setLastReadActionID,
    setNameValuePair,
    togglePinnedReport,
    logToServer,
};
