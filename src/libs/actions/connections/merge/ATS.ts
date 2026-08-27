import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeATSFilters} from '@src/types/onyx/Policy';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Updates which candidates to import, by tag name, stage name and office ID.
 * Dimensions missing from `filters` are cleared, so the value passed here is always the complete selection.
 */
function updateMergeATSFilters(policyID: string, filters: MergeATSFilters, currentFilters?: MergeATSFilters | null) {
    // Onyx deep-merges objects, so every dimension is written explicitly to make sure cleared ones are removed too.
    const optimisticFilters = {
        tags: filters.tags ?? null,
        stages: filters.stages ?? null,
        offices: filters.offices ?? null,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            filters: optimisticFilters,
                            pendingFields: {filters: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {filters: null},
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            pendingFields: {filters: null},
                            errorFields: {filters: null},
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            filters: currentFilters ? {tags: currentFilters.tags ?? null, stages: currentFilters.stages ?? null, offices: currentFilters.offices ?? null} : null,
                            pendingFields: {filters: null},
                            errorFields: {filters: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
    ];

    write(WRITE_COMMANDS.UPDATE_MERGE_ATS_FILTERS, {policyID, filters: JSON.stringify(filters)}, {optimisticData, successData, failureData});
}

/** Updates the ATS field the default approver is read from. */
function updateMergeATSApproverField(policyID: string, approverField: string | null, currentApproverField?: string | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            approverField,
                            pendingFields: {approverField: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {approverField: null},
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            pendingFields: {approverField: null},
                            errorFields: {approverField: null},
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            approverField: currentApproverField ?? null,
                            pendingFields: {approverField: null},
                            errorFields: {approverField: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
    ];

    write(WRITE_COMMANDS.UPDATE_MERGE_ATS_APPROVER_FIELD, {policyID, approverField}, {optimisticData, successData, failureData});
}

function setMergeATSInitialSyncModalShown(policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_MERGE_ATS_INITIAL_SYNC_MODAL_SHOWN}${policyID}`, true);
}

export {updateMergeATSApproverField, updateMergeATSFilters, setMergeATSInitialSyncModalShown};
