import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {OpenWorkspacePlanPageParams} from '@libs/API/parameters';
import {READ_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

function OpenWorkspacePlanPage(policyID: string) {
    if (!policyID) {
        Log.warn('OpenWorkspacePlanPage invalid params', {policyID});
        return;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: OpenWorkspacePlanPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_WORKSPACE_PLAN_PAGE, params, {optimisticData, successData, failureData});
}

export default OpenWorkspacePlanPage;
