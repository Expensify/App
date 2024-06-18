import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {UpdateSubscriptionTypeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import type {SubscriptionType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

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

export {openSubscriptionPage, updateSubscriptionType, updateSubscriptionSize, clearUpdateSubscriptionSizeError};
