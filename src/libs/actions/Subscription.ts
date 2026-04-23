import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    CancelBillingSubscriptionParams,
    UpdatePersonalKarmaParams,
    UpdateSubscriptionAddNewUsersAutomaticallyParams,
    UpdateSubscriptionAutoRenewParams,
    UpdateSubscriptionTypeParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import type {FeedbackSurveyOptionID, SubscriptionType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

/**
 * Fetches data when the user opens the SubscriptionSettingsPage
 * @param currentGracePeriods - The current billing grace period collection. If provided and non-empty,
 *                              all entries will be optimistically cleared to handle stale cache when
 *                              billing was resolved (e.g. owner changed). On failure, previous values are restored.
 */
function openSubscriptionPage(currentGracePeriods?: OnyxCollection<BillingGraceEndPeriod>) {
    type SubscriptionOnyxKeys = typeof ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END;

    const optimisticData: Array<OnyxUpdate<SubscriptionOnyxKeys>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
            value: true,
        },
    ];

    const successData: Array<OnyxUpdate<SubscriptionOnyxKeys>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
            value: false,
        },
    ];

    const failureData: Array<OnyxUpdate<SubscriptionOnyxKeys>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA,
            value: false,
        },
    ];

    // Clear ALL billing grace period keys optimistically. If the server still has active
    // grace periods, they will be restored from the response. This clears the entire
    // collection rather than a single owner's key, so stale entries from previous owners
    // are also evicted. On failure, previous values are restored.
    if (currentGracePeriods) {
        const keys = Object.keys(currentGracePeriods) as Array<`${typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}${string}`>;
        for (const key of keys) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key,
                value: null,
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.SET,
                key,
                value: currentGracePeriods[key] ?? null,
            });
        }
    }

    API.read(READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE, null, {optimisticData, successData, failureData});
}

/**
 * Fetches data when the user opens the Save The World page
 */
function openSaveTheWorldPage() {
    API.read(READ_COMMANDS.OPEN_SAVE_THE_WORLD_PAGE, null);
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

function updatePersonalKarma(enabled: boolean) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PERSONAL_OFFSETS> | OnyxUpdate<typeof ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA,
            value: true,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_PERSONAL_OFFSETS,
            value: enabled,
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA,
            value: false,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_PERSONAL_OFFSETS> | OnyxUpdate<typeof ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.IS_PENDING_UPDATE_PERSONAL_KARMA,
            value: false,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_PERSONAL_OFFSETS,
            value: !enabled,
        },
    ];

    const parameters: UpdatePersonalKarmaParams = {
        enabled,
    };

    API.write(WRITE_COMMANDS.UPDATE_PERSONAL_KARMA, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function updateSubscriptionSize(newSubscriptionSize: number, currentSubscriptionSize: number) {
    const onyxData: OnyxData<typeof ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION> = {
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
    const onyxData: OnyxData<
        typeof ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING | typeof ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL | typeof ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED
    > = {
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

function applyExpensifyCode(promoCode: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM,
            value: {
                isLoading: true,
                errors: null,
                errorFields: {
                    expensifyCode: null,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM,
            value: {
                isLoading: false,
                expensifyCode: '',
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.SUBSCRIPTION_EXPENSIFY_CODE_FORM,
            value: {
                isLoading: false,
                errorFields: {
                    expensifyCode: getMicroSecondOnyxErrorWithTranslationKey('subscription.expensifyCode.error.invalid'),
                },
            },
        },
    ];

    const parameters = {
        promoCode,
    };

    API.write(WRITE_COMMANDS.SET_PROMO_CODE, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

export {
    openSubscriptionPage,
    openSaveTheWorldPage,
    updateSubscriptionAutoRenew,
    updateSubscriptionAddNewUsersAutomatically,
    updatePersonalKarma,
    updateSubscriptionSize,
    clearUpdateSubscriptionSizeError,
    updateSubscriptionType,
    clearOutstandingBalance,
    cancelBillingSubscription,
    requestTaxExempt,
    applyExpensifyCode,
};
