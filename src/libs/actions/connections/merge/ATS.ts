import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeATSFilters} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

/**
 * Triggers a data sync for the Merge ATS connection.
 */
function syncMergeATS(policy: OnyxEntry<Policy>) {
    const policyID = policy?.id;
    if (!policyID) {
        return;
    }

    const previousLastSync = policy?.connections?.merge_ats?.lastSync;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        lastSync: {
                            syncStatus: CONST.MERGE.SYNC_STATUS.SYNCING,
                            syncType: CONST.MERGE.SYNC_TYPE.MANUAL,
                            manualSyncTimestamps: [DateUtils.getDBTime(), ...(previousLastSync?.manualSyncTimestamps ?? [])],
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
                        lastSync: {
                            syncStatus: CONST.MERGE.SYNC_STATUS.FAILED,
                            errorMessage: null,
                            manualSyncTimestamps: previousLastSync?.manualSyncTimestamps ?? null,
                        },
                    },
                },
            },
        },
    ];

    write(WRITE_COMMANDS.SYNC_POLICY_TO_MERGE, {policyID}, {optimisticData, failureData});
}

/**
 * Updates the approval mode for the Merge ATS connection.
 */
function updateMergeATSApprovalMode(policyID: string, approvalMode: ValueOf<typeof CONST.MERGE.APPROVAL_MODE>, currentApprovalMode?: ValueOf<typeof CONST.MERGE.APPROVAL_MODE> | null) {
    const previousApprovalMode = currentApprovalMode ?? null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            approvalMode,
                            pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {approvalMode: null},
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
                            pendingFields: {approvalMode: null},
                            errorFields: {approvalMode: null},
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
                            approvalMode: previousApprovalMode,
                            pendingFields: {approvalMode: null},
                            errorFields: {approvalMode: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
    ];

    write(
        WRITE_COMMANDS.UPDATE_MERGE_APPROVAL_MODE,
        {
            policyID,
            approvalMode,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Updates the final approver for the Merge ATS connection.
 */
function updateMergeATSFinalApprover(policyID: string, finalApprover: string | null, currentFinalApprover?: string | null) {
    const previousFinalApprover = currentFinalApprover ?? null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                        config: {
                            finalApprover,
                            pendingFields: {finalApprover: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {finalApprover: null},
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
                            pendingFields: {finalApprover: null},
                            errorFields: {finalApprover: null},
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
                            finalApprover: previousFinalApprover,
                            pendingFields: {finalApprover: null},
                            errorFields: {finalApprover: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
    ];

    write(
        WRITE_COMMANDS.UPDATE_MERGE_FINAL_APPROVER,
        {
            policyID,
            finalApprover,
        },
        {optimisticData, successData, failureData},
    );
}

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

type RecruitingConnectionErrorFieldName = 'approvalMode' | 'finalApprover' | 'filters' | 'approverField';

function clearRecruitingConnectionErrorField(policyID: string | undefined, fieldName: RecruitingConnectionErrorFieldName) {
    if (!policyID) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: {
                config: {
                    errorFields: {[fieldName]: null},
                },
            },
        },
    });
}

export {
    syncMergeATS,
    updateMergeATSApprovalMode,
    updateMergeATSApproverField,
    updateMergeATSFilters,
    updateMergeATSFinalApprover,
    clearRecruitingConnectionErrorField,
    setMergeATSInitialSyncModalShown,
};
export type {RecruitingConnectionErrorFieldName};
