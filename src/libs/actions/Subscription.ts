import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {UpdateSubscriptionAddNewUsersAutomaticallyParams, UpdateSubscriptionAutoRenewParams, UpdateSubscriptionTypeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import type {FeedbackSurveyOptionID, SubscriptionType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Fetches data when the user opens the SubscriptionSettingsPage
 */
function openSubscriptionPage() {
    API.read(READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE, null);
}

function updateSubscriptionType(type: SubscriptionType) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type,
                pendingAction: null,
                errors: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type: type === CONST.SUBSCRIPTION.TYPE.ANNUAL ? CONST.SUBSCRIPTION.TYPE.PAYPERUSE : CONST.SUBSCRIPTION.TYPE.ANNUAL,
                pendingAction: null,
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

function updateSubscriptionAutoRenew(autoRenew: boolean, disableAutoRenewReason?: FeedbackSurveyOptionID) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                autoRenew,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                pendingAction: null,
                errors: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                autoRenew: !autoRenew,
                pendingAction: null,
            },
        },
    ];

    const parameters: UpdateSubscriptionAutoRenewParams = {
        autoRenew,
        disableAutoRenewReason,
    };

    API.write(WRITE_COMMANDS.UPDATE_SUBSCRIPTION_AUTO_RENEW, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function updateSubscriptionAddNewUsersAutomatically(addNewUsersAutomatically: boolean) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                addNewUsersAutomatically,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                pendingAction: null,
                errors: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                addNewUsersAutomatically: !addNewUsersAutomatically,
                pendingAction: null,
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

export {openSubscriptionPage, updateSubscriptionAutoRenew, updateSubscriptionAddNewUsersAutomatically, updateSubscriptionType};
