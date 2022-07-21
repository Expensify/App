import _ from 'underscore';
import isViaExpensifyCashNative from './isViaExpensifyCashNative';
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
 * @param {Object} parameters
 * @returns {Promise}
 */
function AddBillingCard(parameters) {
    const commandName = 'User_AddBillingCard';
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, true);
}

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
 * @param {string} parameters.email
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
 * @param {String} parameters.message
 * @returns {Promise}
 */
function User_Delete(parameters) {
    const commandName = 'User_Delete';
    return Network.post(commandName, parameters);
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
 * Runs command that will fix malformed data in a users account and also run migrations.
 *
 * @returns {Promise}
 */
function User_FixAccount() {
    const commandName = 'User_FixAccount';
    return Network.post(commandName);
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
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} dob
 * @returns {Promise}
 */
function Wallet_GetOnfidoSDKToken(firstName, lastName, dob) {
    return Network.post('Wallet_GetOnfidoSDKToken', {
        // We need to pass this so we can request a token with the correct referrer
        // This value comes from a cross-platform module which returns true for native
        // platforms and false for non-native platforms.
        isViaExpensifyCashNative,
        firstName,
        lastName,
        dob,
    }, CONST.NETWORK.METHOD.POST, true);
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
 * @param {String} parameters.policyID
 * @param {String} parameters.value
 * @returns {Promise}
 */
function Policy_CustomUnit_Update(parameters) {
    const commandName = 'Policy_CustomUnit_Update';
    requireParameters(['policyID', 'customUnit'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.policyID
 * @param {String} parameters.customUnitID
 * @param {String} parameters.value
 * @returns {Promise}
 */
function Policy_CustomUnitRate_Update(parameters) {
    const commandName = 'Policy_CustomUnitRate_Update';
    requireParameters(['policyID', 'customUnitID', 'customUnitRate'], parameters, commandName);
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
 * Renames a user-created policy room
 * @param {Object} parameters
 * @param {String} parameters.reportID
 * @param {String} parameters.reportName
 * @return {Promise}
 */
function RenameReport(parameters) {
    const commandName = 'RenameReport';
    requireParameters(['reportID', 'reportName'], parameters, commandName);
    return Network.post(commandName, parameters);
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
    AddBillingCard,
    BankAccount_SetupWithdrawal,
    BankAccount_Validate,
    ChangePassword,
    CreateChatReport,
    CreateLogin,
    CreatePolicyRoom,
    RenameReport,
    DeleteFund,
    DeleteLogin,
    DeleteBankAccount,
    Get,
    GetAccountStatus,
    GetStatementPDF,
    GetIOUReport,
    GetFullPolicy,
    GetPolicySummaryList,
    GetReportSummaryList,
    GetRequestCountryCode,
    Graphite_Timer,
    Inbox_CallUser,
    PayIOU,
    PayWithWallet,
    PersonalDetails_GetForEmails,
    PersonalDetails_Update,
    Policy_Employees_Merge,
    RejectTransaction,
    Report_GetHistory,
    Report_EditComment,
    ResendValidateCode,
    ResetPassword,
    SetNameValuePair,
    SetPassword,
    UpdatePolicy,
    User_SignUp,
    User_Delete,
    User_IsUsingExpensifyCard,
    User_ReopenAccount,
    User_SecondaryLogin_Send,
    User_UploadAvatar,
    User_FixAccount,
    CreateIOUTransaction,
    CreateIOUSplit,
    ValidateEmail,
    Wallet_Activate,
    Wallet_GetOnfidoSDKToken,
    TransferWalletBalance,
    GetLocalCurrency,
    Policy_Create,
    Policy_CustomUnit_Update,
    Policy_CustomUnitRate_Update,
    Policy_Employees_Remove,
    PreferredLocale_Update,
    Policy_Delete,
};
