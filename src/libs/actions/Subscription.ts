import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

/**
 * Fetches data when the user opens the SubscriptionSettingsPage
 */
function openSubscriptionPage() {
    API.read(READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE, null);
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
                    errorFields: {
                        userCount: ErrorUtils.getMicroSecondOnyxError('common.genericErrorMessage'),
                    },
                    pendingFields: {
                        userCount: null,
                    },
                },
            },
        ],
    };

    API.write(WRITE_COMMANDS.UPDATE_SUBSCRIPTION_SIZE, {userCount: newSubscriptionSize}, onyxData);
}

export {openSubscriptionPage, updateSubscriptionSize};
