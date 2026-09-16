import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Updates which groups to import employees from. */
function updateMergeHRGroups(policyID: string, groups: string[], currentGroups?: string[] | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                        config: {
                            groups,
                            pendingFields: {groups: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {groups: null},
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                        config: {
                            pendingFields: {groups: null},
                            errorFields: {groups: null},
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                        config: {
                            groups: currentGroups ?? null,
                            pendingFields: {groups: null},
                            errorFields: {groups: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
    ];

    write(WRITE_COMMANDS.UPDATE_MERGE_GROUPS, {policyID, groups}, {optimisticData, successData, failureData});
}

function setMergeHRInitialSyncModalShown(policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_MERGE_HR_INITIAL_SYNC_MODAL_SHOWN}${policyID}`, true);
}

export {updateMergeHRGroups, setMergeHRInitialSyncModalShown};
