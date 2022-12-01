import _ from 'underscore';
import requireParameters from './requireParameters';
import * as Request from './Request';
import * as Network from './Network';
import * as Middleware from './Middleware';
import CONST from '../CONST';

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Retry. Errors thrown in one middleware will bubble to the next e.g. an error thrown in
// Logging or Reauthenticate logic would be caught by the Retry logic (which is why it is the last one used).

// Logging - Logs request details and errors.
Request.use(Middleware.Logging);

// RecheckConnection - Sets a  timer for a request that will "recheck" if we are connected to the internet if time runs out. Also triggers the connection recheck when we encounter any error.
Request.use(Middleware.RecheckConnection);

// Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
Request.use(Middleware.Reauthentication);

// Retry - Handles retrying any failed requests.
Request.use(Middleware.Retry);

// SaveResponseInOnyx - Merges either the successData or failureData into Onyx depending on if the call was successful or not
Request.use(Middleware.SaveResponseInOnyx);

/**
 * @param {{password: String, oldPassword: String}} parameters
 * @param {String} parameters.authToken
 * @param {String} parameters.password
 * @returns {Promise}
 */
function ChangePassword(parameters) {
    const commandName = 'ChangePassword';
    requireParameters(['password'], parameters, commandName);
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

    // Non-cancellable request: during logout, when requests are cancelled, we don't want to cancel the actual logout request
    return Network.post(commandName, {...parameters, canCancel: false});
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
 * @param {String} parameters.debtorEmail
 * @returns {Promise}
 */
function GetIOUReport(parameters) {
    const commandName = 'GetIOUReport';
    requireParameters(['debtorEmail'], parameters, commandName);
    return Network.post(commandName, parameters);
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
 * @param {String} parameters.password
 * @param {String} parameters.validateCode
 * @param {Number} parameters.accountID
 * @returns {Promise}
 */
function SetPassword(parameters) {
    const commandName = 'SetPassword';
    requireParameters(['accountID', 'password', 'validateCode'], parameters, commandName);
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
 * @param {Object} parameters
 * @param {String} parameters.currentStep
 * @param {String} [parameters.onfidoData] - JSON string
 * @param {String} [parameters.personalDetails] - JSON string
 * @param {String} [parameters.idologyAnswers] - JSON string
 * @param {Boolean} [parameters.hasAcceptedTerms]
 * @returns {Promise}
 */
function Wallet_Activate(parameters) {
    const commandName = 'Wallet_Activate';
    requireParameters(['currentStep'], parameters, commandName);
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, true);
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
 * Transfer Wallet balance and takes either the bankAccoundID or fundID
 * @param {Object} parameters
 * @param {String} [parameters.bankAccountID]
 * @param {String} [parameters.fundID]
 * @returns {Promise}
 */
function TransferWalletBalance(parameters) {
    const commandName = 'TransferWalletBalance';
    if (!parameters.bankAccountID && !parameters.fundID) {
        throw new Error('Must pass either bankAccountID or fundID to TransferWalletBalance');
    }
    return Network.post(commandName, parameters);
}

/**
 * Fetches the filename of the user's statement
 * @param {Object} parameters
 * @param {String} [parameters.period]
 * @return {Promise}
 */
function GetStatementPDF(parameters) {
    const commandName = 'GetStatementPDF';
    return Network.post(commandName, parameters);
}

export {
    BankAccount_SetupWithdrawal,
    ChangePassword,
    CreateLogin,
    DeleteLogin,
    Get,
    GetStatementPDF,
    GetIOUReport,
    Graphite_Timer,
    PersonalDetails_GetForEmails,
    PersonalDetails_Update,
    ResendValidateCode,
    SetNameValuePair,
    SetPassword,
    User_SignUp,
    User_SecondaryLogin_Send,
    ValidateEmail,
    Wallet_Activate,
    TransferWalletBalance,
};
