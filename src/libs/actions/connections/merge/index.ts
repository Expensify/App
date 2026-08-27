import {write} from '@libs/API';
import type {ConnectPolicyToMergeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {HRConnectionName} from '@libs/merge/HRUtils';
import type {MergeConnectionName} from '@libs/merge/MergeUtils';
import type {RecruitingConnectionName} from '@libs/merge/RecruitingUtils';

import CONST from '@src/CONST';
import type {MergeATSProviderSlug} from '@src/CONST/MERGE_ATS_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

/** Config fields shared by the Merge-backed connections (Merge HR and Merge ATS) that can hold an update error. */
type MergeConnectionErrorFieldName = 'approvalMode' | 'finalApprover' | 'groups' | 'filters' | 'approverField';

function getMergeSetupLink(policyID: string, integration: MergeHRProviderSlug | MergeATSProviderSlug) {
    const params: ConnectPolicyToMergeParams = {policyID, integration};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_MERGE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

/**
 * Triggers a data sync for the given Merge connection (Merge HR or Merge ATS).
 */
function syncMerge(policy: OnyxEntry<Policy>, connectionName: MergeConnectionName) {
    const policyID = policy?.id;
    if (!policyID) {
        return;
    }

    const previousLastSync = policy?.connections?.[connectionName]?.lastSync;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [connectionName]: {
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
                    [connectionName]: {
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

    write(WRITE_COMMANDS.SYNC_POLICY_TO_MERGE, {policyID, connectionName}, {optimisticData, failureData});
}

/**
 * Updates the approval mode for the given Merge connection (Merge HR or Merge ATS).
 */
function updateMergeApprovalMode(
    policyID: string,
    connectionName: MergeConnectionName,
    approvalMode: ValueOf<typeof CONST.MERGE.APPROVAL_MODE>,
    currentApprovalMode?: ValueOf<typeof CONST.MERGE.APPROVAL_MODE> | null,
) {
    const previousApprovalMode = currentApprovalMode ?? null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [connectionName]: {
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
                    [connectionName]: {
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
                    [connectionName]: {
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
            connectionName,
            approvalMode,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Updates the final approver for the given Merge connection (Merge HR or Merge ATS).
 */
function updateMergeFinalApprover(policyID: string, connectionName: MergeConnectionName, finalApprover: string | null, currentFinalApprover?: string | null) {
    const previousFinalApprover = currentFinalApprover ?? null;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [connectionName]: {
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
                    [connectionName]: {
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
                    [connectionName]: {
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
            connectionName,
            finalApprover,
        },
        {optimisticData, successData, failureData},
    );
}

/** Clears the error of a single config field of an HR or recruiting connection. */
function clearMergeConnectionErrorField(policyID: string | undefined, connectionName: HRConnectionName | RecruitingConnectionName | undefined, fieldName: MergeConnectionErrorFieldName) {
    if (!policyID || !connectionName) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        connections: {
            [connectionName]: {
                config: {
                    errorFields: {[fieldName]: null},
                },
            },
        },
    });
}

export {clearMergeConnectionErrorField, getMergeSetupLink, syncMerge, updateMergeApprovalMode, updateMergeFinalApprover};
export type {MergeConnectionErrorFieldName};
