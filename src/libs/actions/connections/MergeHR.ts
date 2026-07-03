import {write} from '@libs/API';
import type {ConnectPolicyToMergeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function getMergeHRSetupLink(policyID: string, integration: MergeHRProviderSlug) {
    const params: ConnectPolicyToMergeParams = {policyID, integration};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_MERGE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

/**
 * Triggers a data sync for the Merge HR connection.
 */
function syncMergeHR(policy: OnyxEntry<Policy>) {
    const policyID = policy?.id;
    if (!policyID) {
        return;
    }

    const previousLastSync = policy?.connections?.merge_hris?.lastSync;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                        lastSync: {
                            syncStatus: CONST.MERGE_HR.SYNC_STATUS.SYNCING,
                            syncType: CONST.MERGE_HR.SYNC_TYPE.MANUAL,
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                        lastSync: previousLastSync ?? null,
                    },
                },
            },
        },
    ];

    write(WRITE_COMMANDS.SYNC_POLICY_TO_MERGE, {policyID}, {optimisticData, failureData});
}

/**
 * Updates the approval mode for the Merge HR connection.
 */
function updateMergeHRApprovalMode(policyID: string, approvalMode: ValueOf<typeof CONST.MERGE_HR.APPROVAL_MODE>, currentApprovalMode?: ValueOf<typeof CONST.MERGE_HR.APPROVAL_MODE> | null) {
    const previousApprovalMode = currentApprovalMode ?? null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
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
 * Updates the final approver for the Merge HR connection.
 */
function updateMergeHRFinalApprover(policyID: string, finalApprover: string | null, currentFinalApprover?: string | null) {
    const previousFinalApprover = currentFinalApprover ?? null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
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
                    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
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

type HRProviderName = TupleToUnion<typeof CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES>;

type HRConnectionErrorFieldName = 'approvalMode' | 'finalApprover' | 'groups';

function clearHRConnectionErrorField(policyID: string | undefined, provider: HRProviderName | undefined, fieldName: HRConnectionErrorFieldName) {
    if (!policyID || !provider) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [provider]: {
                config: {
                    errorFields: {[fieldName]: null},
                },
            },
        },
    });
}

export {syncMergeHR, updateMergeHRApprovalMode, updateMergeHRFinalApprover, updateMergeHRGroups, clearHRConnectionErrorField, setMergeHRInitialSyncModalShown};
export type {HRConnectionErrorFieldName};

export default getMergeHRSetupLink;
