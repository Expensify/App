import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import CONST from '../CONST';
import CONFIG from '../CONFIG';
import ONYXKEYS from '../ONYXKEYS';
import getPlaidLinkTokenParameters from './getPlaidLinkTokenParameters';
import redirectToSignIn from './actions/SignInRedirect';
import isViaExpensifyCashNative from './isViaExpensifyCashNative';
import requireParameters from './requireParameters';
import Log from './Log';
import * as Network from './Network';
import updateSessionAuthTokens from './actions/Session/updateSessionAuthTokens';
import setSessionLoadingAndError from './actions/Session/setSessionLoadingAndError';

let isAuthenticating;
let credentials;
let authToken;

function checkRequiredDataAndSetNetworkReady() {
    if (_.isUndefined(authToken) || _.isUndefined(credentials)) {
        return;
    }

    Network.setIsReady(true);
}

Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: (val) => {
        credentials = val || null;
        checkRequiredDataAndSetNetworkReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        authToken = lodashGet(val, 'authToken', null);
        checkRequiredDataAndSetNetworkReady();
    },
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
        'ResetPassword',
        'User_ReopenAccount',
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
function addDefaultValuesToParameters(command, parameters) {
    const finalParameters = {...parameters};

    if (isAuthTokenRequired(command) && !parameters.authToken) {
        finalParameters.authToken = authToken;
    }

    finalParameters.referer = CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER;

    // This application does not save its authToken in cookies like the classic Expensify app.
    // Setting api_setCookie to false will ensure that the Expensify API doesn't set any cookies
    // and prevents interfering with the cookie authToken that Expensify classic uses.
    finalParameters.api_setCookie = false;
    return finalParameters;
}

// Tie into the network layer to add auth token to the parameters of all requests
Network.registerParameterEnhancer(addDefaultValuesToParameters);

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

Network.registerRequestHandler((queuedRequest, finalParameters) => {
    if (queuedRequest.command === 'Log') {
        return;
    }

    Log.info('Making API request', false, {
        command: queuedRequest.command,
        type: queuedRequest.type,
        shouldUseSecure: queuedRequest.type,
        rvl: finalParameters.returnValueList,
    });
});

Network.registerRequestSkippedHandler((parameters) => {
    Log.hmmm('Trying to make a request when Network is not ready', parameters);
});

Network.registerResponseHandler((queuedRequest, response) => {
    if (queuedRequest.command !== 'Log') {
        Log.info('Finished API request', false, {
            command: queuedRequest.command,
            type: queuedRequest.type,
            shouldUseSecure: queuedRequest.shouldUseSecure,
            jsonCode: response.jsonCode,
            requestID: response.requestID,
        });
    }

    if (response.jsonCode === 407) {
        // Credentials haven't been initialized. We will not be able to re-authenticates with the API
        const unableToReauthenticate = (!credentials || !credentials.autoGeneratedLogin
            || !credentials.autoGeneratedPassword);

        // There are some API requests that should not be retried when there is an auth failure like
        // creating and deleting logins. In those cases, they should handle the original response instead
        // of the new response created by handleExpiredAuthToken.
        const shouldRetry = lodashGet(queuedRequest, 'data.shouldRetry');
        if (!shouldRetry || unableToReauthenticate) {
            queuedRequest.resolve(response);
            return;
        }

        handleExpiredAuthToken(queuedRequest.command, queuedRequest.data, queuedRequest.type)
            .then(queuedRequest.resolve)
            .catch(queuedRequest.reject);
        return;
    }

    if (response.jsonCode === 405 || response.jsonCode === 404) {
        // IOU Split & Request money transactions failed due to invalid amount(405) or unable to split(404)
        // It's a failure, so reject the queued request
        queuedRequest.reject(response);
        return;
    }

    queuedRequest.resolve(response);
});

Network.registerErrorHandler((queuedRequest, error) => {
    if (queuedRequest.command !== 'Log') {
        Log.hmmm('[API] Handled error when making request', error);
    } else {
        console.debug('[API] There was an error in the Log API command, unable to log to server!', error);
    }

    // Set an error state and signify we are done loading
    setSessionLoadingAndError(false, 'Cannot connect to server');

    // Reject the queued request with an API offline error so that the original caller can handle it.
    queuedRequest.reject(new Error(CONST.ERROR.API_OFFLINE));
});

/**
 * @param {Object} parameters
 * @param {Boolean} [parameters.useExpensifyLogin]
 * @param {String} parameters.partnerName
 * @param {String} parameters.partnerPassword
 * @param {String} parameters.partnerUserID
 * @param {String} parameters.partnerUserSecret
 * @param {String} [parameters.twoFactorAuthCode]
 * @param {String} [parameters.email]
 * @param {String} [parameters.authToken]
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
        authToken: parameters.authToken,
        shouldRetry: false,

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
                        throw new Error('passwordForm.error.incorrectLoginOrPassword');
                    case 402:
                        // If too few characters are passed as the password, the WAF will pass it to the API as an empty
                        // string, which results in a 402 error from Auth.
                        if (response.message === '402 Missing partnerUserSecret') {
                            throw new Error('passwordForm.error.incorrectLoginOrPassword');
                        }
                        throw new Error('passwordForm.error.twoFactorAuthenticationEnabled');
                    case 403:
                        throw new Error('passwordForm.error.invalidLoginOrPassword');
                    case 404:
                        throw new Error('passwordForm.error.unableToResetPassword');
                    case 405:
                        throw new Error('passwordForm.error.noAccess');
                    case 413:
                        throw new Error('passwordForm.error.accountLocked');
                    default:
                        throw new Error('passwordForm.error.fallback');
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
            updateSessionAuthTokens(response.authToken, response.encryptedAuthToken);
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

            Log.hmmm('Redirecting to Sign In because we failed to reauthenticate', {
                command,
                error: error.message,
            });
        });
}

/**
 * Calls the command=Authenticate API with an accountID, validateCode, and optional 2FA code. This is used specifically
 * for sharing sessions between e.com and this app. It will return an authToken that is used for initiating a session
 * in this app. This API call doesn't have any special handling (like retries or special error handling).
 *
 * @param {Object} parameters
 * @param {String} parameters.accountID
 * @param {String} parameters.validateCode
 * @param {String} [parameters.twoFactorAuthCode]
 * @returns {Promise<unknown>}
 */
function AuthenticateWithAccountID(parameters) {
    const commandName = 'Authenticate';

    requireParameters([
        'accountID',
        'validateCode',
    ], parameters, commandName);

    return Network.post(commandName, {
        accountID: parameters.accountID,
        validateCode: parameters.validateCode,
        twoFactorAuthCode: parameters.twoFactorAuthCode,
        shouldRetry: false,
    });
}

/**
 * @param {Object} parameters
 * @returns {Promise}
 */
function AddBillingCard(parameters) {
    const commandName = 'User_AddBillingCard';
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, true);
}


/**
 * @param {Object} parameters
 * @param {String} parameters.oldPassword
 * @param {String} parameters.password
 * @returns {Promise}
 */
function ChangePassword(parameters) {
    const commandName = 'ChangePassword';
    requireParameters(['password'], parameters, commandName);
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
 * @param {Boolean} [parameters.shouldRetry]
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
 * @param {Number} parameters.fundID
 * @returns {Promise}
 */
function DeleteFund(parameters) {
    const commandName = 'DeleteFund';
    requireParameters(['fundID'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.partnerUserID
 * @param {String} parameters.partnerName
 * @param {String} parameters.partnerPassword
 * @param {Boolean} parameters.shouldRetry
 * @returns {Promise}
 */
function DeleteLogin(parameters) {
    const commandName = 'DeleteLogin';
    requireParameters(['partnerUserID', 'partnerName', 'partnerPassword', 'shouldRetry'],
        parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.returnValueList
 * @param {Boolean} shouldUseSecure
 * @returns {Promise}
 */
function Get(parameters, shouldUseSecure = false) {
    const commandName = 'Get';
    requireParameters(['returnValueList'], parameters, commandName);
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, shouldUseSecure);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.email
 * @param {Boolean} parameters.forceNetworkRequest
 * @returns {Promise}
 */
function GetAccountStatus(parameters) {
    const commandName = 'GetAccountStatus';
    requireParameters(['email'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * Returns a short lived authToken for this account
 * @returns {Promise}
 */
function GetShortLivedAuthToken() {
    const commandName = 'GetShortLivedAuthToken';
    return Network.post(commandName);
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

/**
 * @returns {Promise}
 * @param {String} policyID
 */
function GetFullPolicy(policyID) {
    if (!_.isString(policyID)) {
        throw new Error('[API] Must include a single policyID with calls to API.GetFullPolicy');
    }

    const commandName = 'Get';
    const parameters = {
        returnValueList: 'policyList',
        policyIDList: policyID,
    };
    return Network.post(commandName, parameters);
}

/**
 * @returns {Promise}
 */
function GetPolicySummaryList() {
    const commandName = 'Get';
    const parameters = {
        returnValueList: 'policySummaryList',
    };
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
 * @param {Number} parameters.reportID
 * @param {String} parameters.paymentMethodType
 * @param {Object} [parameters.newIOUReportDetails]
 * @returns {Promise}
 */
function PayIOU(parameters) {
    const commandName = 'PayIOU';
    requireParameters(['reportID', 'paymentMethodType'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.reportID
 * @param {Object} [parameters.newIOUReportDetails]
 * @returns {Promise}
 */
function PayWithWallet(parameters) {
    const commandName = 'PayWithWallet';
    requireParameters(['reportID'], parameters, commandName);
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
 * @param {Object} parameters.name
 * @param {Object} parameters.value
 * @returns {Promise}
 */
function PreferredLocale_Update(parameters) {
    const commandName = 'PreferredLocale_Update';
    requireParameters(['name', 'value'],
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
 * @param {Number} parameters.reportID
 * @param {String} parameters.transactionID
 * @returns {Promise}
 */
function RejectTransaction(parameters) {
    const commandName = 'RejectTransaction';
    requireParameters(['reportID', 'transactionID'], parameters, commandName);
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
 * @param {Number} parameters.reportID
 * @param {Number} parameters.reportActionID
 * @param {String} parameters.reportComment
 * @returns {Promise}
 */
function Report_EditComment(parameters) {
    const commandName = 'Report_EditComment';
    requireParameters(['reportID', 'reportActionID', 'reportComment'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.reportID
 * @param {Number} parameters.sequenceNumber
 * @returns {Promise}
 */
function Report_UpdateLastRead(parameters) {
    const commandName = 'Report_UpdateLastRead';
    requireParameters(['reportID', 'sequenceNumber'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.reportID
 * @param {String} parameters.notificationPreference
 * @returns {Promise}
 *
 */
function Report_UpdateNotificationPreference(parameters) {
    const commandName = 'Report_UpdateNotificationPreference';
    requireParameters(['reportID', 'notificationPreference'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.email
 * @returns {Promise}
 */
function ResendValidateCode(parameters) {
    const commandName = 'ResendValidateCode';
    requireParameters(['email'], parameters, commandName);
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
 * @param {Number} parameters.email
 * @returns {Promise}
 */
function ResetPassword(parameters) {
    const commandName = 'ResetPassword';
    requireParameters(['email'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.password
 * @param {String} parameters.validateCode
 * @param {String} parameters.accountID
 * @returns {Promise}
 */
function SetPassword(parameters) {
    const commandName = 'SetPassword';
    requireParameters(['accountID', 'password', 'validateCode'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.password
 * @param {String|null} parameters.bankAccountID
 * @param {String|null} parameters.fundID
 * @returns {Promise}
 */
function SetWalletLinkedAccount(parameters) {
    const commandName = 'SetWalletLinkedAccount';
    requireParameters(['password'], parameters, commandName);
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
 * @param {Object} parameters
 * @param {String} parameters.message
 * @returns {Promise}
 */
function User_Delete(parameters) {
    const commandName = 'User_Delete';
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
 * @param {Boolean} [parameters.requireCertainty]
 * @returns {Promise}
 */
function User_IsFromPublicDomain(parameters) {
    const commandName = 'User_IsFromPublicDomain';
    requireParameters(['email'], parameters, commandName);
    return Network.post(commandName, {
        ...{requireCertainty: true},
        ...parameters,
    });
}

/**
 * @param {Object} parameters
 * @param {String} parameters.email
 * @returns {Promise}
 */
function User_ReopenAccount(parameters) {
    const commandName = 'User_ReopenAccount';
    requireParameters(['email'], parameters, commandName);
    return Network.post(commandName, parameters);
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
 * @param {Number} parameters.accountID
 * @param {String} parameters.validateCode
 * @returns {Promise}
 */
function ValidateEmail(parameters) {
    const commandName = 'ValidateEmail';
    requireParameters(['accountID', 'validateCode'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * Create a new IOUTransaction
 *
 * @param {Object} parameters
 * @param {String} parameters.comment
 * @param {Array} parameters.debtorEmail
 * @param {String} parameters.currency
 * @param {String} parameters.amount
 * @returns {Promise}
 */
function CreateIOUTransaction(parameters) {
    const commandName = 'CreateIOUTransaction';
    requireParameters(['comment', 'debtorEmail', 'currency', 'amount'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * Create a new IOU Split
 *
 * @param {Object} parameters
 * @param {String} parameters.splits
 * @param {String} parameters.currency
 * @param {String} parameters.reportID
 * @param {String} parameters.amount
 * @param {String} parameters.comment
 * @returns {Promise}
 */
function CreateIOUSplit(parameters) {
    const commandName = 'CreateIOUSplit';
    requireParameters(['splits', 'currency', 'amount', 'reportID'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @returns {Promise}
 */
function Wallet_GetOnfidoSDKToken() {
    return Network.post('Wallet_GetOnfidoSDKToken', {
        // We need to pass this so we can request a token with the correct referrer
        // This value comes from a cross-platform module which returns true for native
        // platforms and false for non-native platforms.
        isViaExpensifyCashNative,
    }, CONST.NETWORK.METHOD.POST, true);
}

/**
 * @returns {Promise}
 */
function Plaid_GetLinkToken() {
    return Network.post('Plaid_GetLinkToken', getPlaidLinkTokenParameters(), CONST.NETWORK.METHOD.POST, true);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.currentStep
 * @param {String} [parameters.onfidoData] - JSON string
 * @param {String} [parameters.personalDetails] - JSON string
 * @param {Boolean} [parameters.hasAcceptedTerms]
 * @returns {Promise}
 */
function Wallet_Activate(parameters) {
    const commandName = 'Wallet_Activate';
    requireParameters(['currentStep'], parameters, commandName);
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, true);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.publicToken
 * @param {Boolean} parameters.allowDebit
 * @param {String} parameters.bank
 * @returns {Promise}
 */
function BankAccount_Get(parameters) {
    const commandName = 'BankAccount_Get';
    requireParameters(['publicToken', 'allowDebit', 'bank'], parameters, commandName);
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, true);
}

/**
 * @param {Object} parameters
 * @param {Object[]} parameters.employees
 * @param {String} parameters.welcomeNote
 * @param {String} parameters.policyID
 * @returns {Promise}
 */
function Policy_Employees_Merge(parameters) {
    const commandName = 'Policy_Employees_Merge';
    requireParameters(['employees', 'welcomeNote', 'policyID'], parameters, commandName);

    // Always include returnPersonalDetails to ensure we get the employee's personal details in the response
    return Network.post(commandName, {...parameters, returnPersonalDetails: true});
}

/**
 * @param {Object} parameters
 * @param {String} parameters.accountNumber
 * @param {String} parameters.addressName
 * @param {Boolean} parameters.allowDebit
 * @param {Boolean} parameters.confirm
 * @param {Boolean} parameters.isSavings
 * @param {String} parameters.password
 * @param {String} parameters.routingNumber
 * @param {String} parameters.setupType
 * @param {String} parameters.additionalData additional JSON data
 * @returns {Promise}
 */
function BankAccount_Create(parameters) {
    const commandName = 'BankAccount_Create';
    requireParameters([
        'accountNumber',
        'addressName',
        'allowDebit',
        'confirm',
        'isSavings',
        'password',
        'routingNumber',
        'setupType',
        'additionalData',
    ], parameters, commandName);
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, true);
}

function BankAccount_Validate(parameters) {
    const commandName = 'ValidateBankAccount';
    requireParameters(['bankAccountID', 'validateCode'], parameters, commandName);
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST);
}

/**
 * @param {*} parameters
 * @returns {Promise}
 */
function BankAccount_SetupWithdrawal(parameters) {
    const commandName = 'BankAccount_SetupWithdrawal';
    let allowedParameters = [
        'currentStep', 'policyID', 'bankAccountID', 'useOnfido', 'errorAttemptsCount', 'enableCardAfterVerified',

        // data from bankAccount step:
        'setupType', 'routingNumber', 'accountNumber', 'addressName', 'plaidAccountID', 'mask', 'ownershipType', 'isSavings',
        'acceptTerms', 'bankName', 'plaidAccessToken', 'alternateRoutingNumber',

        // data from company step:
        'companyName', 'companyTaxID', 'addressStreet', 'addressCity', 'addressState', 'addressZipCode',
        'hasNoConnectionToCannabis', 'incorporationType', 'incorporationState', 'incorporationDate', 'industryCode',
        'website', 'companyPhone', 'ficticiousBusinessName',

        // data from requestor step:
        'firstName', 'lastName', 'dob', 'requestorAddressStreet', 'requestorAddressCity', 'requestorAddressState',
        'requestorAddressZipCode', 'isOnfidoSetupComplete', 'onfidoData', 'isControllingOfficer', 'ssnLast4',

        // data from ACHContract step (which became the "Beneficial Owners" step, but the key is still ACHContract as
        // it's used in several logic:
        'ownsMoreThan25Percent', 'beneficialOwners', 'acceptTermsAndConditions', 'certifyTrueInformation',
    ];

    if (!parameters.useOnfido) {
        allowedParameters = allowedParameters.concat(['passport', 'answers']);
    }

    // Only keep allowed parameters in the additionalData object
    const additionalData = _.pick(parameters, allowedParameters);

    requireParameters(['currentStep'], parameters, commandName);
    return Network.post(
        commandName, {additionalData: JSON.stringify(additionalData)},
        CONST.NETWORK.METHOD.POST,
        true,
    );
}

/**
 * @param {Object} parameters
 * @param {Number} parameters.bankAccountID
 * @param {String} parameters.ownerEmail
 * @returns {Promise}
 */
function DeleteBankAccount(parameters) {
    const commandName = 'DeleteBankAccount';
    requireParameters(['bankAccountID'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @returns {Promise}
 */
function Mobile_GetConstants(parameters) {
    const commandName = 'Mobile_GetConstants';
    requireParameters(['data'], parameters, commandName);

    // Stringify the parameters object as we cannot send an object via FormData
    const finalParameters = parameters;
    finalParameters.data = JSON.stringify(parameters.data);

    return Network.post(commandName, finalParameters);
}

/**
 * @param {Object} parameters
 * @param {Number} [parameters.latitude]
 * @param {Number} [parameters.longitude]
 * @returns {Promise}
 */
function GetLocalCurrency(parameters) {
    const commandName = 'GetLocalCurrency';
    return Network.post(commandName, parameters);
}

/**
 * @returns {Promise}
 */
function GetCurrencyList() {
    return Mobile_GetConstants({data: ['currencyList']});
}

/**
 * @returns {Promise}
 */
function User_IsUsingExpensifyCard() {
    return Network.post('User_IsUsingExpensifyCard', {});
}

/**
 * @param {Object} parameters
 * @param {String} [parameters.type]
 * @param {String} [parameters.policyName]
 * @returns {Promise}
 */
function Policy_Create(parameters) {
    const commandName = 'Policy_Create';
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} [parameters.policyID]
 * @returns {Promise}
 */
function Policy_Delete(parameters) {
    const commandName = 'Policy_Delete';
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.policyID
 * @param {Array} parameters.emailList
 * @returns {Promise}
 */
function Policy_Employees_Remove(parameters) {
    const commandName = 'Policy_Employees_Remove';
    requireParameters(['policyID', 'emailList'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.taskID
 * @param {String} parameters.policyID
 * @param {String} parameters.firstName
 * @param {String} parameters.lastName
 * @param {String} parameters.phoneNumber
 * @returns {Promise}
 */
function Inbox_CallUser(parameters) {
    const commandName = 'Inbox_CallUser';
    requireParameters(['taskID', 'policyID', 'firstName', 'lastName', 'phoneNumber'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * Get the current wait time in minutes for an inbox call
 * @returns {Promise}
 */
function Inbox_CallUser_WaitTime() {
    const commandName = 'Inbox_CallUser_WaitTime';
    return Network.post(commandName);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.reportIDList
 * @returns {Promise}
 */
function GetReportSummaryList(parameters) {
    const commandName = 'Get';
    requireParameters(['reportIDList'], parameters, commandName);
    return Network.post(commandName, {...parameters, returnValueList: 'reportSummaryList'});
}

/**
 * @param {Object} parameters
 * @param {String} parameters.policyID
 * @param {String} parameters.value - Must be a JSON stringified object
 * @returns {Promise}
 */
function UpdatePolicy(parameters) {
    const commandName = 'UpdatePolicy';
    requireParameters(['policyID', 'value'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.policyID
 * @param {String} parameters.reportName
 * @param {String} parameters.visibility
 * @return {Promise}
 */
function CreatePolicyRoom(parameters) {
    const commandName = 'CreatePolicyRoom';
    requireParameters(['policyID', 'reportName', 'visibility'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * Transfer Wallet balance and takes either the bankAccoundID or fundID
 * @param {Object} parameters
 * @param {String} [parameters.bankAccountID]
 * @param {String} [parameters.fundID]
 * @returns {Promise}
 */
function Wallet_TransferBalance(parameters) {
    const commandName = 'TransferWalletBalance';
    if (!parameters.bankAccountID && !parameters.fundID) {
        throw new Error('Must pass either bankAccountID or fundID to TransferWalletBalance');
    }
    return Network.post(commandName, parameters);
}

export {
    Authenticate,
    AuthenticateWithAccountID,
    AddBillingCard,
    BankAccount_Create,
    BankAccount_Get,
    BankAccount_SetupWithdrawal,
    BankAccount_Validate,
    ChangePassword,
    CreateChatReport,
    CreateLogin,
    CreatePolicyRoom,
    DeleteFund,
    DeleteLogin,
    DeleteBankAccount,
    Get,
    GetAccountStatus,
    GetShortLivedAuthToken,
    GetIOUReport,
    GetFullPolicy,
    GetPolicySummaryList,
    GetReportSummaryList,
    GetRequestCountryCode,
    Graphite_Timer,
    Inbox_CallUser,
    Inbox_CallUser_WaitTime,
    PayIOU,
    PayWithWallet,
    PersonalDetails_GetForEmails,
    PersonalDetails_Update,
    Plaid_GetLinkToken,
    Policy_Employees_Merge,
    Push_Authenticate,
    RejectTransaction,
    Report_AddComment,
    Report_GetHistory,
    Report_TogglePinned,
    Report_EditComment,
    Report_UpdateLastRead,
    Report_UpdateNotificationPreference,
    ResendValidateCode,
    ResetPassword,
    SetNameValuePair,
    SetPassword,
    SetWalletLinkedAccount,
    UpdateAccount,
    UpdatePolicy,
    User_SignUp,
    User_Delete,
    User_GetBetas,
    User_IsFromPublicDomain,
    User_IsUsingExpensifyCard,
    User_ReopenAccount,
    User_SecondaryLogin_Send,
    User_UploadAvatar,
    reauthenticate,
    CreateIOUTransaction,
    CreateIOUSplit,
    ValidateEmail,
    Wallet_Activate,
    Wallet_GetOnfidoSDKToken,
    Wallet_TransferBalance,
    GetLocalCurrency,
    GetCurrencyList,
    Policy_Create,
    Policy_Employees_Remove,
    PreferredLocale_Update,
    Policy_Delete,
};
