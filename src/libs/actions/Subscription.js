"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openSubscriptionPage = openSubscriptionPage;
exports.updateSubscriptionAutoRenew = updateSubscriptionAutoRenew;
exports.updateSubscriptionAddNewUsersAutomatically = updateSubscriptionAddNewUsersAutomatically;
exports.updateSubscriptionSize = updateSubscriptionSize;
exports.clearUpdateSubscriptionSizeError = clearUpdateSubscriptionSizeError;
exports.updateSubscriptionType = updateSubscriptionType;
exports.clearOutstandingBalance = clearOutstandingBalance;
exports.cancelBillingSubscription = cancelBillingSubscription;
exports.requestTaxExempt = requestTaxExempt;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Fetches data when the user opens the SubscriptionSettingsPage
 */
function openSubscriptionPage() {
    API.read(types_1.READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE, null);
}
function updateSubscriptionType(type) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type: type,
                pendingFields: {
                    type: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type: type,
                pendingFields: {
                    type: null,
                },
                errors: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type: type === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL ? CONST_1.default.SUBSCRIPTION.TYPE.PAY_PER_USE : CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL,
                pendingFields: {
                    type: null,
                },
            },
        },
    ];
    var parameters = {
        type: type,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SUBSCRIPTION_TYPE, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function updateSubscriptionAutoRenew(autoRenew, disableAutoRenewReason, disableAutoRenewAdditionalNote) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                autoRenew: autoRenew,
                pendingFields: {
                    autoRenew: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                pendingFields: {
                    autoRenew: null,
                },
                errors: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                autoRenew: !autoRenew,
                pendingFields: {
                    autoRenew: null,
                },
            },
        },
    ];
    var parameters = {
        autoRenew: autoRenew,
        disableAutoRenewReason: disableAutoRenewReason,
        disableAutoRenewAdditionalNote: disableAutoRenewAdditionalNote,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SUBSCRIPTION_AUTO_RENEW, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function updateSubscriptionAddNewUsersAutomatically(addNewUsersAutomatically) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                addNewUsersAutomatically: addNewUsersAutomatically,
                pendingFields: {
                    addNewUsersAutomatically: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                pendingFields: {
                    addNewUsersAutomatically: null,
                },
                errors: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                addNewUsersAutomatically: !addNewUsersAutomatically,
                pendingFields: {
                    addNewUsersAutomatically: null,
                },
            },
        },
    ];
    var parameters = {
        addNewUsersAutomatically: addNewUsersAutomatically,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SUBSCRIPTION_ADD_NEW_USERS_AUTOMATICALLY, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function updateSubscriptionSize(newSubscriptionSize, currentSubscriptionSize) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
                value: {
                    userCount: newSubscriptionSize,
                    errorFields: {
                        userCount: null,
                    },
                    pendingFields: {
                        userCount: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
                value: {
                    userCount: newSubscriptionSize,
                    errorFields: {
                        userCount: null,
                    },
                    pendingFields: {
                        userCount: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION,
                value: {
                    userCount: currentSubscriptionSize,
                    pendingFields: {
                        userCount: null,
                    },
                },
            },
        ],
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SUBSCRIPTION_SIZE, { userCount: newSubscriptionSize }, onyxData);
}
function clearUpdateSubscriptionSizeError() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, {
        errorFields: {
            userCount: null,
        },
    });
}
function clearOutstandingBalance() {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
                value: true,
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
                value: false,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
                value: true,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
                value: false,
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
                value: false,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
                value: false,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
                value: true,
            },
        ],
    };
    API.write(types_1.WRITE_COMMANDS.CLEAR_OUTSTANDING_BALANCE, null, onyxData);
}
function cancelBillingSubscription(cancellationReason, cancellationNote) {
    var parameters = {
        cancellationReason: cancellationReason,
        cancellationNote: cancellationNote,
    };
    API.write(types_1.WRITE_COMMANDS.CANCEL_BILLING_SUBSCRIPTION, parameters);
}
function requestTaxExempt() {
    API.write(types_1.WRITE_COMMANDS.REQUEST_TAX_EXEMPTION, null);
}
