"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAccount = closeAccount;
exports.dismissReferralBanner = dismissReferralBanner;
exports.dismissTrackTrainingModal = dismissTrackTrainingModal;
exports.dismissASAPSubmitExplanation = dismissASAPSubmitExplanation;
exports.resendValidateCode = resendValidateCode;
exports.requestContactMethodValidateCode = requestContactMethodValidateCode;
exports.updateNewsletterSubscription = updateNewsletterSubscription;
exports.deleteContactMethod = deleteContactMethod;
exports.clearContactMethodErrors = clearContactMethodErrors;
exports.clearContactMethod = clearContactMethod;
exports.addNewContactMethod = addNewContactMethod;
exports.validateSecondaryLogin = validateSecondaryLogin;
exports.isBlockedFromConcierge = isBlockedFromConcierge;
exports.subscribeToUserEvents = subscribeToUserEvents;
exports.updatePreferredSkinTone = updatePreferredSkinTone;
exports.setShouldUseStagingServer = setShouldUseStagingServer;
exports.togglePlatformMute = togglePlatformMute;
exports.joinScreenShare = joinScreenShare;
exports.clearScreenShareRequest = clearScreenShareRequest;
exports.generateStatementPDF = generateStatementPDF;
exports.updateChatPriorityMode = updateChatPriorityMode;
exports.setContactMethodAsDefault = setContactMethodAsDefault;
exports.updateTheme = updateTheme;
exports.resetContactMethodValidateCodeSentState = resetContactMethodValidateCodeSentState;
exports.updateCustomStatus = updateCustomStatus;
exports.clearCustomStatus = clearCustomStatus;
exports.updateDraftCustomStatus = updateDraftCustomStatus;
exports.clearDraftCustomStatus = clearDraftCustomStatus;
exports.requestRefund = requestRefund;
exports.clearUnvalidatedNewContactMethodAction = clearUnvalidatedNewContactMethodAction;
exports.clearPendingContactActionErrors = clearPendingContactActionErrors;
exports.requestValidateCodeAction = requestValidateCodeAction;
exports.addPendingContactMethod = addPendingContactMethod;
exports.clearValidateCodeActionError = clearValidateCodeActionError;
exports.setIsDebugModeEnabled = setIsDebugModeEnabled;
exports.resetValidateActionCodeSent = resetValidateActionCodeSent;
exports.lockAccount = lockAccount;
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var date_fns_1 = require("date-fns");
var debounce_1 = require("lodash/debounce");
var react_native_onyx_1 = require("react-native-onyx");
var ActiveClientManager = require("@libs/ActiveClientManager");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NetworkStore_1 = require("@libs/Network/NetworkStore");
var SequentialQueue = require("@libs/Network/SequentialQueue");
var NumberUtils = require("@libs/NumberUtils");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var Pusher_1 = require("@libs/Pusher");
var PusherUtils_1 = require("@libs/PusherUtils");
var ReportActionsUtils = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var Sound_1 = require("@libs/Sound");
var Visibility_1 = require("@libs/Visibility");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var App_1 = require("./App");
var applyOnyxUpdatesReliably_1 = require("./applyOnyxUpdatesReliably");
var Link_1 = require("./Link");
var Report_1 = require("./Report");
var Session_1 = require("./Session");
var Timing_1 = require("./Timing");
var currentUserAccountID = -1;
var currentEmail = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        var _a, _b;
        currentUserAccountID = (_a = value === null || value === void 0 ? void 0 : value.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
        currentEmail = (_b = value === null || value === void 0 ? void 0 : value.email) !== null && _b !== void 0 ? _b : '';
    },
});
var myPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) {
        var _a;
        if (!value || currentUserAccountID === -1) {
            return;
        }
        myPersonalDetails = (_a = value[currentUserAccountID]) !== null && _a !== void 0 ? _a : undefined;
    },
});
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
/**
 * Attempt to close the user's account
 */
function closeAccount(reason) {
    // Note: successData does not need to set isLoading to false because if the CloseAccount
    // command succeeds, a Pusher response will clear all Onyx data.
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.CLOSE_ACCOUNT_FORM,
            value: { isLoading: true },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.CLOSE_ACCOUNT_FORM,
            value: { isLoading: false },
        },
    ];
    var parameters = { message: reason };
    API.write(types_1.WRITE_COMMANDS.CLOSE_ACCOUNT, parameters, {
        optimisticData: optimisticData,
        failureData: failureData,
    });
}
/**
 * Resend a validation link to a given login
 */
function resendValidateCode(login) {
    (0, Session_1.resendValidateCode)(login);
}
/**
 * Requests a new validate code be sent for the passed contact method
 *
 * @param contactMethod - the new contact method that the user is trying to verify
 */
function requestContactMethodValidateCode(contactMethod) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_a = {},
                _a[contactMethod] = {
                    validateCodeSent: false,
                    errorFields: {
                        validateCodeSent: null,
                        validateLogin: null,
                    },
                    pendingFields: {
                        validateCodeSent: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_b = {},
                _b[contactMethod] = {
                    validateCodeSent: true,
                    pendingFields: {
                        validateCodeSent: null,
                    },
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_c = {},
                _c[contactMethod] = {
                    validateCodeSent: false,
                    errorFields: {
                        validateCodeSent: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.requestContactMethodValidateCode'),
                    },
                    pendingFields: {
                        validateCodeSent: null,
                    },
                },
                _c),
        },
    ];
    var parameters = { email: contactMethod };
    API.write(types_1.WRITE_COMMANDS.REQUEST_CONTACT_METHOD_VALIDATE_CODE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Sets whether the user account is subscribed to Expensify news
 */
function updateNewsletterSubscription(isSubscribed) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: { isSubscribedToNewsletter: isSubscribed },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: { isSubscribedToNewsletter: !isSubscribed },
        },
    ];
    var parameters = { isSubscribed: isSubscribed };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NEWSLETTER_SUBSCRIPTION, parameters, {
        optimisticData: optimisticData,
        failureData: failureData,
    });
}
/**
 * Delete a specific contact method
 * @param contactMethod - the contact method being deleted
 * @param loginList
 */
function deleteContactMethod(contactMethod, loginList, backTo) {
    var _a, _b, _c;
    var oldLoginData = loginList[contactMethod];
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_a = {},
                _a[contactMethod] = {
                    partnerUserID: '',
                    errorFields: null,
                    pendingFields: {
                        deletedLogin: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_b = {},
                _b[contactMethod] = null,
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_c = {},
                _c[contactMethod] = __assign(__assign({}, oldLoginData), { errorFields: __assign(__assign({}, oldLoginData === null || oldLoginData === void 0 ? void 0 : oldLoginData.errorFields), { deletedLogin: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.deleteContactMethod') }), pendingFields: {
                        deletedLogin: null,
                    } }),
                _c),
        },
    ];
    var parameters = { partnerUserID: contactMethod };
    API.write(types_1.WRITE_COMMANDS.DELETE_CONTACT_METHOD, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(backTo));
}
/**
 * Clears a contact method optimistically. this is used when the contact method fails to be added to the backend
 */
function clearContactMethod(contactMethod) {
    var _a;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.LOGIN_LIST, (_a = {},
        _a[contactMethod] = null,
        _a));
}
/**
 * Clears error for a specific field on validate action code.
 */
function clearValidateCodeActionError(fieldName) {
    var _a;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.VALIDATE_ACTION_CODE, {
        errorFields: (_a = {},
            _a[fieldName] = null,
            _a),
    });
}
/**
 * Reset validateCodeSent on validate action code.
 */
function resetValidateActionCodeSent() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.VALIDATE_ACTION_CODE, {
        validateCodeSent: false,
    });
}
/**
 * Clears any possible stored errors for a specific field on a contact method
 */
function clearContactMethodErrors(contactMethod, fieldName) {
    var _a, _b, _c;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.LOGIN_LIST, (_a = {},
        _a[contactMethod] = {
            errorFields: (_b = {},
                _b[fieldName] = null,
                _b),
            pendingFields: (_c = {},
                _c[fieldName] = null,
                _c),
        },
        _a));
}
/**
 * Resets the state indicating whether a validation code has been sent to a specific contact method.
 *
 * @param contactMethod - The identifier of the contact method to reset.
 */
function resetContactMethodValidateCodeSentState(contactMethod) {
    var _a;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.LOGIN_LIST, (_a = {},
        _a[contactMethod] = {
            validateCodeSent: false,
        },
        _a));
}
/**
 * Clears unvalidated new contact method action
 */
function clearUnvalidatedNewContactMethodAction() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PENDING_CONTACT_ACTION, null);
}
function clearPendingContactActionErrors() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PENDING_CONTACT_ACTION, {
        errorFields: null,
    });
}
/**
 * When user adds a new contact method, they need to verify the magic code first
 * So we add the temporary contact method to Onyx to use it later, after user verified magic code.
 */
function addPendingContactMethod(contactMethod) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PENDING_CONTACT_ACTION, {
        contactMethod: contactMethod,
    });
}
/**
 * Adds a secondary login to a user's account
 */
function addNewContactMethod(contactMethod, validateCode) {
    var _a;
    if (validateCode === void 0) { validateCode = ''; }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_a = {},
                _a[contactMethod] = {
                    partnerUserID: contactMethod,
                    validatedDate: '',
                    errorFields: {
                        addedLogin: null,
                    },
                },
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: { isLoading: true },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PENDING_CONTACT_ACTION,
            value: {
                contactMethod: null,
                validateCodeSent: null,
                actionVerified: true,
                errorFields: {
                    actionVerified: null,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: { isLoading: false },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: { isLoading: false },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_ACTION_CODE,
            value: { validateCodeSent: null },
        },
    ];
    var parameters = { partnerUserID: contactMethod, validateCode: validateCode };
    API.write(types_1.WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Requests a magic code to verify current user
 */
function requestValidateCodeAction() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_ACTION_CODE,
            value: {
                isLoading: true,
                pendingFields: {
                    actionVerified: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                errorFields: {
                    actionVerified: null,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_ACTION_CODE,
            value: {
                validateCodeSent: true,
                isLoading: false,
                errorFields: {
                    actionVerified: null,
                },
                pendingFields: {
                    actionVerified: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_ACTION_CODE,
            value: {
                validateCodeSent: null,
                isLoading: false,
                errorFields: {
                    actionVerified: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.requestContactMethodValidateCode'),
                },
                pendingFields: {
                    actionVerified: null,
                },
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.RESEND_VALIDATE_CODE, null, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Validates a secondary login / contact method
 */
function validateSecondaryLogin(loginList, contactMethod, validateCode, shouldResetActionCode) {
    var _a, _b, _c, _d;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_a = {},
                _a[contactMethod] = {
                    errorFields: {
                        validateLogin: null,
                        validateCodeSent: null,
                    },
                    pendingFields: {
                        validateLogin: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: __assign(__assign({}, CONST_1.default.DEFAULT_ACCOUNT_DATA), { isLoading: true }),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_b = {},
                _b[contactMethod] = {
                    validatedDate: DateUtils_1.default.getDBTime(),
                    pendingFields: {
                        validateLogin: null,
                    },
                    errorFields: {
                        validateCodeSent: null,
                    },
                },
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                validated: true,
            },
        },
    ];
    // If the primary login isn't validated yet, set the secondary login as the primary login
    if (!(loginList === null || loginList === void 0 ? void 0 : loginList[currentEmail].validatedDate)) {
        successData.push.apply(successData, [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.ACCOUNT,
                value: {
                    primaryLogin: contactMethod,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SESSION,
                value: {
                    email: contactMethod,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                value: (_c = {},
                    _c[currentUserAccountID] = {
                        login: contactMethod,
                        displayName: PersonalDetailsUtils.createDisplayName(contactMethod, myPersonalDetails),
                    },
                    _c),
            },
        ]);
        Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).forEach(function (policy) {
            var _a;
            if (!policy) {
                return;
            }
            var optimisticPolicyDataValue;
            if (policy.employeeList) {
                var currentEmployee = policy.employeeList[currentEmail];
                optimisticPolicyDataValue = {
                    employeeList: (_a = {},
                        _a[currentEmail] = null,
                        _a[contactMethod] = currentEmployee,
                        _a),
                };
            }
            if (policy.ownerAccountID === currentUserAccountID) {
                optimisticPolicyDataValue = __assign(__assign({}, optimisticPolicyDataValue), { owner: contactMethod });
            }
            if (optimisticPolicyDataValue) {
                successData.push({
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                    value: optimisticPolicyDataValue,
                });
            }
        });
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_d = {},
                _d[contactMethod] = {
                    errorFields: {
                        validateLogin: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.validateSecondaryLogin'),
                        validateCodeSent: null,
                    },
                    pendingFields: {
                        validateLogin: null,
                    },
                },
                _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: { isLoading: false },
        },
    ];
    // Sometimes we will also need to reset the validateCodeSent of ONYXKEYS.VALIDATE_ACTION_CODE in order to receive the magic code next time we open the ValidateCodeActionModal.
    if (shouldResetActionCode) {
        var optimisticResetActionCode = {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.VALIDATE_ACTION_CODE,
            value: {
                validateCodeSent: null,
            },
        };
        successData.push(optimisticResetActionCode);
        failureData.push(optimisticResetActionCode);
    }
    var parameters = { partnerUserID: contactMethod, validateCode: validateCode };
    API.write(types_1.WRITE_COMMANDS.VALIDATE_SECONDARY_LOGIN, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Checks the blockedFromConcierge object to see if it has an expiresAt key,
 * and if so whether the expiresAt date of a user's ban is before right now
 *
 */
function isBlockedFromConcierge(blockedFromConciergeNVP) {
    if ((0, EmptyObject_1.isEmptyObject)(blockedFromConciergeNVP)) {
        return false;
    }
    if (!(blockedFromConciergeNVP === null || blockedFromConciergeNVP === void 0 ? void 0 : blockedFromConciergeNVP.expiresAt)) {
        return false;
    }
    return (0, date_fns_1.isBefore)(new Date(), new Date(blockedFromConciergeNVP.expiresAt));
}
function triggerNotifications(onyxUpdates) {
    onyxUpdates.forEach(function (update) {
        var _a;
        if (!update.shouldNotify && !update.shouldShowPushNotification) {
            return;
        }
        var reportID = update.key.replace(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, '');
        var reportActions = Object.values((_a = update.value) !== null && _a !== void 0 ? _a : {});
        reportActions.forEach(function (action) { return action && ReportActionsUtils.isNotifiableReportAction(action) && (0, Report_1.showReportActionNotification)(reportID, action); });
    });
}
var isChannelMuted = function (reportId) {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportId),
            callback: function (report) {
                var _a, _b;
                react_native_onyx_1.default.disconnect(connection);
                var notificationPreference = (_b = (_a = report === null || report === void 0 ? void 0 : report.participants) === null || _a === void 0 ? void 0 : _a[currentUserAccountID]) === null || _b === void 0 ? void 0 : _b.notificationPreference;
                resolve(!notificationPreference || notificationPreference === CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.MUTE || ReportUtils.isHiddenForCurrentUser(notificationPreference));
            },
        });
    });
};
function playSoundForMessageType(pushJSON) {
    var reportActionsOnly = pushJSON.filter(function (update) { var _a; return (_a = update.key) === null || _a === void 0 ? void 0 : _a.includes('reportActions_'); });
    // "reportActions_5134363522480668" -> "5134363522480668"
    var reportID = reportActionsOnly
        .map(function (value) { return value.key.split('_').at(1); })
        .find(function (reportKey) { return reportKey === Navigation_1.default.getTopmostReportId() && Visibility_1.default.isVisible() && Visibility_1.default.hasFocus(); });
    if (!reportID) {
        return;
    }
    isChannelMuted(reportID).then(function (isSoundMuted) {
        if (isSoundMuted) {
            return;
        }
        try {
            var flatten = reportActionsOnly.flatMap(function (update) {
                var value = update.value;
                if (!value) {
                    return [];
                }
                return Object.values(value);
            });
            for (var _i = 0, flatten_1 = flatten; _i < flatten_1.length; _i++) {
                var data = flatten_1[_i];
                // Someone completes a task
                if (data.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.TASK_COMPLETED) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
                }
            }
            var types = flatten.map(function (data) { return ReportActionsUtils.getOriginalMessage(data); }).filter(Boolean);
            for (var _a = 0, types_2 = types; _a < types_2.length; _a++) {
                var message = types_2[_a];
                if (!message) {
                    return;
                }
                // Pay someone flow
                if ('IOUDetails' in message) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
                }
                // mention user
                if ('html' in message && typeof message.html === 'string' && message.html.includes("<mention-user>@".concat(currentEmail, "</mention-user>"))) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.ATTENTION);
                }
                // mention @here
                if ('html' in message && typeof message.html === 'string' && message.html.includes('<mention-here>')) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.ATTENTION);
                }
                // assign a task
                if ('taskReportID' in message) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.ATTENTION);
                }
                // Submit expense flow
                if ('IOUTransactionID' in message) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.ATTENTION);
                }
                // Someone reimburses an expense
                if ('IOUReportID' in message) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
                }
                // plain message
                if ('html' in message) {
                    return (0, Sound_1.default)(Sound_1.SOUNDS.RECEIVE);
                }
            }
        }
        catch (e) {
            var errorMessage = String(e);
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            Log_1.default.client("Unexpected error occurred while parsing the data to play a sound: ".concat(errorMessage));
        }
    });
}
var pongHasBeenMissed = false;
var lastPingSentTimestamp = Date.now();
var lastPongReceivedTimestamp = Date.now();
function subscribeToPusherPong() {
    // If there is no user accountID yet (because the app isn't fully setup yet), the channel can't be subscribed to so return early
    if (currentUserAccountID === -1) {
        return;
    }
    PusherUtils_1.default.subscribeToPrivateUserChannelEvent(Pusher_1.default.TYPE.PONG, currentUserAccountID.toString(), function (pushJSON) {
        Log_1.default.info("[Pusher PINGPONG] Received a PONG event from the server", false, pushJSON);
        lastPongReceivedTimestamp = Date.now();
        // Calculate the latency between the client and the server
        var pongEvent = pushJSON;
        var latency = Date.now() - Number(pongEvent.pingTimestamp);
        Log_1.default.info("[Pusher PINGPONG] The event took ".concat(latency, " ms"));
        Timing_1.default.end(CONST_1.default.TIMING.PUSHER_PING_PONG);
        // When any PONG event comes in, reset this flag so that checkForLatePongReplies will resume looking for missed PONGs
        pongHasBeenMissed = false;
    });
}
// Specify how long between each PING event to the server
var PING_INTERVAL_LENGTH_IN_SECONDS = 30;
// Specify how long between each check for missing PONG events
var CHECK_LATE_PONG_INTERVAL_LENGTH_IN_SECONDS = 60;
// Specify how long before a PING event is considered to be missing a PONG event in order to put the application in offline mode
var NO_EVENT_RECEIVED_TO_BE_OFFLINE_THRESHOLD_IN_SECONDS = 2 * PING_INTERVAL_LENGTH_IN_SECONDS;
function pingPusher() {
    if ((0, NetworkStore_1.isOffline)()) {
        Log_1.default.info('[Pusher PINGPONG] Skipping PING because the client is offline');
        return;
    }
    // Send a PING event to the server with a specific ID and timestamp
    // The server will respond with a PONG event with the same ID and timestamp
    // Then we can calculate the latency between the client and the server (or if the server never replies)
    var pingID = NumberUtils.rand64();
    var pingTimestamp = Date.now();
    // In local development, there can end up being multiple intervals running because when JS code is replaced with hot module replacement, the old interval is not cleared
    // and keeps running. This little bit of logic will attempt to keep multiple pings from happening.
    if (pingTimestamp - lastPingSentTimestamp < PING_INTERVAL_LENGTH_IN_SECONDS * 1000) {
        return;
    }
    lastPingSentTimestamp = pingTimestamp;
    var parameters = { pingID: pingID, pingTimestamp: pingTimestamp };
    API.writeWithNoDuplicatesConflictAction(types_1.WRITE_COMMANDS.PUSHER_PING, parameters);
    Log_1.default.info("[Pusher PINGPONG] Sending a PING to the server: ".concat(pingID, " timestamp: ").concat(pingTimestamp));
    Timing_1.default.start(CONST_1.default.TIMING.PUSHER_PING_PONG);
}
function checkForLatePongReplies() {
    if ((0, NetworkStore_1.isOffline)()) {
        Log_1.default.info('[Pusher PINGPONG] Skipping checkForLatePongReplies because the client is offline');
        return;
    }
    if (pongHasBeenMissed) {
        Log_1.default.info("[Pusher PINGPONG] Skipped checking for late PONG events because a PONG has already been missed");
        return;
    }
    Log_1.default.info("[Pusher PINGPONG] Checking for late PONG events");
    var timeSinceLastPongReceived = Date.now() - lastPongReceivedTimestamp;
    // If the time since the last pong was received is more than 2 * PING_INTERVAL_LENGTH_IN_SECONDS, then record it in the logs
    if (timeSinceLastPongReceived > NO_EVENT_RECEIVED_TO_BE_OFFLINE_THRESHOLD_IN_SECONDS * 1000) {
        Log_1.default.info("[Pusher PINGPONG] The server has not replied to the PING event in ".concat(timeSinceLastPongReceived, " ms so going offline"));
        // When going offline, reset the pingpong state so that when the network reconnects, the client will start fresh
        lastPingSentTimestamp = Date.now();
        pongHasBeenMissed = true;
    }
    else {
        Log_1.default.info("[Pusher PINGPONG] Last PONG event was ".concat(timeSinceLastPongReceived, " ms ago so not going offline"));
    }
}
var pingPusherIntervalID;
var checkForLatePongRepliesIntervalID;
function initializePusherPingPong() {
    // Only run the ping pong from the leader client
    if (!ActiveClientManager.isClientTheLeader()) {
        Log_1.default.info("[Pusher PINGPONG] Not starting PING PONG because this instance isn't the leader client");
        return;
    }
    Log_1.default.info("[Pusher PINGPONG] Starting Pusher PING PONG and pinging every ".concat(PING_INTERVAL_LENGTH_IN_SECONDS, " seconds"));
    // Subscribe to the pong event from Pusher. Unfortunately, there is no way of knowing when the client is actually subscribed
    // so there could be a little delay before the client is actually listening to this event.
    subscribeToPusherPong();
    // If things are initializing again (which is fine because it will reinitialize each time Pusher authenticates), clear the old intervals
    if (pingPusherIntervalID) {
        clearInterval(pingPusherIntervalID);
    }
    // Send a ping to pusher on a regular interval
    pingPusherIntervalID = setInterval(pingPusher, PING_INTERVAL_LENGTH_IN_SECONDS * 1000);
    // Delay the start of this by double the length of PING_INTERVAL_LENGTH_IN_SECONDS to give a chance for the first
    // events to be sent and received
    setTimeout(function () {
        // If things are initializing again (which is fine because it will reinitialize each time Pusher authenticates), clear the old intervals
        if (checkForLatePongRepliesIntervalID) {
            clearInterval(checkForLatePongRepliesIntervalID);
        }
        // Check for any missing pong events on a regular interval
        checkForLatePongRepliesIntervalID = setInterval(checkForLatePongReplies, CHECK_LATE_PONG_INTERVAL_LENGTH_IN_SECONDS * 1000);
    }, PING_INTERVAL_LENGTH_IN_SECONDS * 2);
}
/**
 * Handles the newest events from Pusher where a single mega multipleEvents contains
 * an array of singular events all in one event
 */
function subscribeToUserEvents() {
    // If we don't have the user's accountID yet (because the app isn't fully setup yet) we can't subscribe so return early
    if (currentUserAccountID === -1) {
        return;
    }
    // Handles the mega multipleEvents from Pusher which contains an array of single events.
    // Each single event is passed to PusherUtils in order to trigger the callbacks for that event
    PusherUtils_1.default.subscribeToPrivateUserChannelEvent(Pusher_1.default.TYPE.MULTIPLE_EVENTS, currentUserAccountID.toString(), function (pushJSON) {
        var _a, _b, _c;
        var pushEventData = pushJSON;
        // If this is not the main client, we shouldn't process any data received from pusher.
        if (!ActiveClientManager.isClientTheLeader()) {
            Log_1.default.info('[Pusher] Received updates, but ignoring it since this is not the active client');
            return;
        }
        // The data for the update is an object, containing updateIDs from the server and an array of onyx updates (this array is the same format as the original format above)
        // Example: {lastUpdateID: 1, previousUpdateID: 0, updates: [{onyxMethod: 'whatever', key: 'foo', value: 'bar'}]}
        var updates = {
            type: CONST_1.default.ONYX_UPDATE_TYPES.PUSHER,
            lastUpdateID: Number((_a = pushEventData.lastUpdateID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID),
            updates: (_b = pushEventData.updates) !== null && _b !== void 0 ? _b : [],
            previousUpdateID: Number((_c = pushJSON.previousUpdateID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID),
        };
        Log_1.default.info('[subscribeToUserEvents] Applying Onyx updates');
        (0, applyOnyxUpdatesReliably_1.default)(updates);
    });
    // Debounce the playSoundForMessageType function to avoid playing sounds too often, for example when a user comeback after offline and a lot of messages come in
    // See https://github.com/Expensify/App/issues/57961 for more details
    var debouncedPlaySoundForMessageType = (0, debounce_1.default)(function (pushJSONMessage) {
        playSoundForMessageType(pushJSONMessage);
    }, CONST_1.default.TIMING.PLAY_SOUND_MESSAGE_DEBOUNCE_TIME, { trailing: true });
    // Handles Onyx updates coming from Pusher through the mega multipleEvents.
    PusherUtils_1.default.subscribeToMultiEvent(Pusher_1.default.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE, function (pushJSON) {
        debouncedPlaySoundForMessageType(pushJSON);
        return SequentialQueue.getCurrentRequest().then(function () {
            // If we don't have the currentUserAccountID (user is logged out) or this is not the
            // main client we don't want to update Onyx with data from Pusher
            if (currentUserAccountID === -1) {
                return;
            }
            if (!ActiveClientManager.isClientTheLeader()) {
                Log_1.default.info('[Pusher] Received updates, but ignoring it since this is not the active client');
                return;
            }
            var onyxUpdatePromise = react_native_onyx_1.default.update(pushJSON).then(function () {
                triggerNotifications(pushJSON);
            });
            // Return a promise when Onyx is done updating so that the OnyxUpdatesManager can properly apply all
            // the onyx updates in order
            return onyxUpdatePromise;
        });
    });
    // We have an event to reconnect the App. It is triggered when we detect that the user passed updateID
    // is not in the DB
    PusherUtils_1.default.subscribeToMultiEvent(Pusher_1.default.TYPE.MULTIPLE_EVENT_TYPE.RECONNECT_APP, function () {
        (0, App_1.reconnectApp)();
        return Promise.resolve();
    });
    initializePusherPingPong();
}
/**
 * Sync preferredSkinTone with Onyx and Server
 */
function updatePreferredSkinTone(skinTone) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.PREFERRED_EMOJI_SKIN_TONE,
            value: skinTone,
        },
    ];
    var parameters = { value: skinTone };
    API.write(types_1.WRITE_COMMANDS.UPDATE_PREFERRED_EMOJI_SKIN_TONE, parameters, { optimisticData: optimisticData });
}
/**
 * Sync user chat priority mode with Onyx and Server
 * @param mode
 * @param [automatic] if we changed the mode automatically
 */
function updateChatPriorityMode(mode, automatic) {
    if (automatic === void 0) { automatic = false; }
    var autoSwitchedToFocusMode = mode === CONST_1.default.PRIORITY_MODE.GSD && automatic;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIORITY_MODE,
            value: mode,
        },
    ];
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: ONYXKEYS_1.default.NVP_TRY_FOCUS_MODE,
        value: true,
    });
    var parameters = {
        value: mode,
        automatic: automatic,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_CHAT_PRIORITY_MODE, parameters, { optimisticData: optimisticData });
    if (!autoSwitchedToFocusMode) {
        Navigation_1.default.goBack();
    }
}
function setShouldUseStagingServer(shouldUseStagingServer) {
    if (CONFIG_1.default.IS_HYBRID_APP) {
        react_native_hybrid_app_1.default.shouldUseStaging(shouldUseStagingServer);
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, { shouldUseStagingServer: shouldUseStagingServer });
}
function togglePlatformMute(platform, mutedPlatforms) {
    var _a, _b;
    var newMutedPlatforms = (mutedPlatforms === null || mutedPlatforms === void 0 ? void 0 : mutedPlatforms[platform])
        ? __assign(__assign({}, mutedPlatforms), (_a = {}, _a[platform] = undefined, _a)) : __assign(__assign({}, mutedPlatforms), (_b = {}, _b[platform] = true, _b)); // Add platform if it's not muted
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_MUTED_PLATFORMS,
            value: newMutedPlatforms,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.NVP_MUTED_PLATFORMS,
            value: mutedPlatforms,
        },
    ];
    var parameters = { platformToMute: platform };
    API.write(types_1.WRITE_COMMANDS.TOGGLE_PLATFORM_MUTE, parameters, {
        optimisticData: optimisticData,
        failureData: failureData,
    });
}
/**
 * Clear the data about a screen share request from Onyx.
 */
function clearScreenShareRequest() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.SCREEN_SHARE_REQUEST, null);
}
/**
 * Open an OldDot tab linking to a screen share request.
 * @param accessToken Access token required to join a screen share room, generated by the backend
 * @param roomName Name of the screen share room to join
 */
function joinScreenShare(accessToken, roomName) {
    (0, Link_1.openOldDotLink)("inbox?action=screenShare&accessToken=".concat(accessToken, "&name=").concat(roomName));
    clearScreenShareRequest();
}
/**
 * Downloads the statement PDF for the provided period
 * @param period YYYYMM format
 */
function generateStatementPDF(period) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_STATEMENT,
            value: {
                isGenerating: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_STATEMENT,
            value: {
                isGenerating: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_STATEMENT,
            value: {
                isGenerating: false,
            },
        },
    ];
    var parameters = { period: period };
    API.read(types_1.READ_COMMANDS.GET_STATEMENT_PDF, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Sets a contact method / secondary login as the user's "Default" contact method.
 */
function setContactMethodAsDefault(newDefaultContactMethod, backTo) {
    var _a, _b, _c, _d, _e;
    var oldDefaultContactMethod = currentEmail;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                primaryLogin: newDefaultContactMethod,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.SESSION,
            value: {
                email: newDefaultContactMethod,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_a = {},
                _a[newDefaultContactMethod] = {
                    pendingFields: {
                        defaultLogin: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        defaultLogin: null,
                    },
                },
                _a),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_b = {},
                _b[currentUserAccountID] = {
                    login: newDefaultContactMethod,
                    displayName: PersonalDetailsUtils.createDisplayName(newDefaultContactMethod, myPersonalDetails),
                },
                _b),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_c = {},
                _c[newDefaultContactMethod] = {
                    pendingFields: {
                        defaultLogin: null,
                    },
                },
                _c),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                primaryLogin: oldDefaultContactMethod,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.SESSION,
            value: {
                email: oldDefaultContactMethod,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.LOGIN_LIST,
            value: (_d = {},
                _d[newDefaultContactMethod] = {
                    pendingFields: {
                        defaultLogin: null,
                    },
                    errorFields: {
                        defaultLogin: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('contacts.genericFailureMessages.setDefaultContactMethod'),
                    },
                },
                _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_e = {},
                _e[currentUserAccountID] = __assign({}, myPersonalDetails),
                _e),
        },
    ];
    Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).forEach(function (policy) {
        var _a, _b;
        if (!policy) {
            return;
        }
        var optimisticPolicyDataValue;
        var failurePolicyDataValue;
        if (policy.employeeList) {
            var currentEmployee = policy.employeeList[oldDefaultContactMethod];
            optimisticPolicyDataValue = {
                employeeList: (_a = {},
                    _a[oldDefaultContactMethod] = null,
                    _a[newDefaultContactMethod] = currentEmployee,
                    _a),
            };
            failurePolicyDataValue = {
                employeeList: (_b = {},
                    _b[oldDefaultContactMethod] = currentEmployee,
                    _b[newDefaultContactMethod] = null,
                    _b),
            };
        }
        if (policy.ownerAccountID === currentUserAccountID) {
            optimisticPolicyDataValue = __assign(__assign({}, optimisticPolicyDataValue), { owner: newDefaultContactMethod });
            failurePolicyDataValue = __assign(__assign({}, failurePolicyDataValue), { owner: policy.owner });
        }
        if (optimisticPolicyDataValue && failurePolicyDataValue) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: optimisticPolicyDataValue,
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: failurePolicyDataValue,
            });
        }
    });
    var parameters = {
        partnerUserID: newDefaultContactMethod,
    };
    API.write(types_1.WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
    Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(backTo));
}
function updateTheme(theme) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.PREFERRED_THEME,
            value: theme,
        },
    ];
    var parameters = {
        value: theme,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_THEME, parameters, { optimisticData: optimisticData });
    Navigation_1.default.goBack();
}
/**
 * Sets a custom status
 */
function updateCustomStatus(status) {
    var _a;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_a = {},
                _a[currentUserAccountID] = {
                    status: status,
                },
                _a),
        },
    ];
    var parameters = { text: status.text, emojiCode: status.emojiCode, clearAfter: status.clearAfter };
    API.write(types_1.WRITE_COMMANDS.UPDATE_STATUS, parameters, {
        optimisticData: optimisticData,
    });
}
/**
 * Clears the custom status
 */
function clearCustomStatus() {
    var _a;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_a = {},
                _a[currentUserAccountID] = {
                    status: null, // Clearing the field
                },
                _a),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.CLEAR_STATUS, null, { optimisticData: optimisticData });
}
/**
 * Sets a custom status
 *
 * @param status.text
 * @param status.emojiCode
 * @param status.clearAfter - ISO 8601 format string, which represents the time when the status should be cleared
 */
function updateDraftCustomStatus(status) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.CUSTOM_STATUS_DRAFT, status);
}
/**
 * Clear the custom draft status
 */
function clearDraftCustomStatus() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.CUSTOM_STATUS_DRAFT, { text: '', emojiCode: '', clearAfter: '' });
}
function dismissReferralBanner(type) {
    var _a;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_DISMISSED_REFERRAL_BANNERS,
            value: (_a = {},
                _a[type] = true,
                _a),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.DISMISS_REFERRAL_BANNER, { type: type }, {
        optimisticData: optimisticData,
    });
}
function dismissTrackTrainingModal() {
    var parameters = {
        name: ONYXKEYS_1.default.NVP_HAS_SEEN_TRACK_TRAINING,
        value: true,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_HAS_SEEN_TRACK_TRAINING,
            value: true,
        },
    ];
    API.write(types_1.WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {
        optimisticData: optimisticData,
    });
}
/**
 * Dismiss the Auto-Submit explanation modal
 * @param shouldDismiss Whether the user selected "Don't show again"
 */
function dismissASAPSubmitExplanation(shouldDismiss) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_DISMISSED_ASAP_SUBMIT_EXPLANATION, shouldDismiss);
}
function requestRefund() {
    API.write(types_1.WRITE_COMMANDS.REQUEST_REFUND, null);
}
function setIsDebugModeEnabled(isDebugModeEnabled) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ACCOUNT, { isDebugModeEnabled: isDebugModeEnabled });
}
function lockAccount() {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: true,
                lockAccount: {
                    errors: null,
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                lockAccount: {
                    errors: null,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.ACCOUNT,
            value: {
                isLoading: false,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('failedToLockAccountPage.failedToLockAccountDescription'),
            },
        },
    ];
    var params = {
        accountID: currentUserAccountID,
    };
    // We need to know if this command fails so that we can navigate the user to a failure page.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.LOCK_ACCOUNT, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
