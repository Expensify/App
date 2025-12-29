import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CancelBillingSubscriptionParams, UpdateSubscriptionAddNewUsersAutomaticallyParams, UpdateSubscriptionAutoRenewParams, UpdateSubscriptionTypeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import type {FeedbackSurveyOptionID, SubscriptionType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

/**
 * Fetches data when the user opens the SubscriptionSettingsPage
 */
function openSubscriptionPage() {
    API.read(READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE, null);
}

function updateSubscriptionType(type: SubscriptionType) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type,
                pendingFields: {
                    type: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type,
                pendingFields: {
                    type: null,
                },
                errors: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type: type === CONST.SUBSCRIPTION.TYPE.ANNUAL ? CONST.SUBSCRIPTION.TYPE.PAY_PER_USE : CONST.SUBSCRIPTION.TYPE.ANNUAL,
                pendingFields: {
                    type: null,
                },
            },
        },
    ];

    const parameters: UpdateSubscriptionTypeParams = {
        type,
    };

    API.write(WRITE_COMMANDS.UPDATE_SUBSCRIPTION_TYPE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function updateSubscriptionAutoRenew(autoRenew: boolean, disableAutoRenewReason?: FeedbackSurveyOptionID, disableAutoRenewAdditionalNote?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                autoRenew,
                pendingFields: {
                    autoRenew: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                pendingFields: {
                    autoRenew: null,
                },
                errors: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                autoRenew: !autoRenew,
                pendingFields: {
                    autoRenew: null,
                },
            },
        },
    ];

    const parameters: UpdateSubscriptionAutoRenewParams = {
        autoRenew,
        disableAutoRenewReason,
        disableAutoRenewAdditionalNote,
    };

    API.write(WRITE_COMMANDS.UPDATE_SUBSCRIPTION_AUTO_RENEW, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function updateSubscriptionAddNewUsersAutomatically(addNewUsersAutomatically: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                addNewUsersAutomatically,
                pendingFields: {
                    addNewUsersAutomatically: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                pendingFields: {
                    addNewUsersAutomatically: null,
                },
                errors: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                addNewUsersAutomatically: !addNewUsersAutomatically,
                pendingFields: {
                    addNewUsersAutomatically: null,
                },
            },
        },
    ];

    const parameters: UpdateSubscriptionAddNewUsersAutomaticallyParams = {
        addNewUsersAutomatically,
    };

    API.write(WRITE_COMMANDS.UPDATE_SUBSCRIPTION_ADD_NEW_USERS_AUTOMATICALLY, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function updateSubscriptionSize(newSubscriptionSize: number, currentSubscriptionSize: number) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
                value: {
                    userCount: newSubscriptionSize,
                    errorFields: {
                        userCount: null,
                    },
                    pendingFields: {
                        userCount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
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
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
                value: {
                    userCount: currentSubscriptionSize,
                    pendingFields: {
                        userCount: null,
                    },
                },
            },
        ],
    };

    API.write(WRITE_COMMANDS.UPDATE_SUBSCRIPTION_SIZE, {userCount: newSubscriptionSize}, onyxData);
}

function clearUpdateSubscriptionSizeError() {
    Onyx.merge(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {
        errorFields: {
            userCount: null,
        },
    });
}

function clearOutstandingBalance() {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
                value: true,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
                value: false,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
                value: true,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
                value: false,
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING,
                value: false,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
                value: false,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
                value: true,
            },
        ],
    };

    API.write(WRITE_COMMANDS.CLEAR_OUTSTANDING_BALANCE, null, onyxData);
}

function cancelBillingSubscription(cancellationReason: FeedbackSurveyOptionID, cancellationNote: string) {
    const parameters: CancelBillingSubscriptionParams = {
        cancellationReason,
        cancellationNote,
    };

    API.write(WRITE_COMMANDS.CANCEL_BILLING_SUBSCRIPTION, parameters);
}

function requestTaxExempt() {
    API.write(WRITE_COMMANDS.REQUEST_TAX_EXEMPTION, null);
}

export {
    openSubscriptionPage,
    updateSubscriptionAutoRenew,
    updateSubscriptionAddNewUsersAutomatically,
    updateSubscriptionSize,
    clearUpdateSubscriptionSizeError,
    updateSubscriptionType,
    clearOutstandingBalance,
    cancelBillingSubscription,
    requestTaxExempt,
};
