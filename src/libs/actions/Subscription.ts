import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {UpdateSubscriptionTypeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import type {SubscriptionType} from '@src/CONST';
import CONST from '@src/CONST';
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
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION,
            value: {
                type,
                pendingAction: null,
            },
        },
    ];

    const parameters: UpdateSubscriptionTypeParams = {
        type,
    };

    API.write(WRITE_COMMANDS.UPDATE_SUBSCRIPTION_TYPE, parameters, {
        optimisticData,
        finallyData,
    });
}

export {openSubscriptionPage, updateSubscriptionType};
