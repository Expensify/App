import {write} from '@libs/API';
import type {ConnectPolicyToMergeParams, UpdateMergeApprovalModeParams} from '@libs/API/parameters';
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
import type {MergeApprovalMode, MergeATSApproverField} from '@src/types/onyx/Policy';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

type HRConnectionErrorFieldName = 'approvalMode' | 'finalApprover' | 'groups';
type RecruitingConnectionErrorFieldName = 'approvalMode' | 'finalApprover' | 'filters' | 'approverField';
type MergeConnectionErrorFieldName = HRConnectionErrorFieldName | RecruitingConnectionErrorFieldName;

/** Client-side "initial sync modal shown" flag for each Merge connection, cleared when the connection is removed. */
const MERGE_INITIAL_SYNC_MODAL_SHOWN_KEYS = {
    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: ONYXKEYS.COLLECTION.POLICY_MERGE_HR_INITIAL_SYNC_MODAL_SHOWN,
    [CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS]: ONYXKEYS.COLLECTION.POLICY_MERGE_ATS_INITIAL_SYNC_MODAL_SHOWN,
} as const;

function getMergeSetupLink(policyID: string, integration: MergeHRProviderSlug | MergeATSProviderSlug, category: ValueOf<typeof CONST.MERGE.CATEGORY>) {
    const params: ConnectPolicyToMergeParams = {policyID, integration, category};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_MERGE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

/** Remembers that the initial sync modal has been shown for the given Merge connection, so it is only shown once. */
function setMergeInitialSyncModalShown(policyID: string, connectionName: MergeConnectionName) {
    Onyx.set(`${MERGE_INITIAL_SYNC_MODAL_SHOWN_KEYS[connectionName]}${policyID}`, true);
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

type MergeApprovalConfigUpdate = {
    approvalMode?: MergeApprovalMode | null;
    approverField?: MergeATSApproverField | null;
    finalApprover?: string | null;
};

type UpdateMergeApprovalModeOptions = {
    policyID: string;
    connectionName: MergeConnectionName;
    approvalMode: MergeApprovalMode;
    currentApprovalMode: MergeApprovalMode | undefined;

    /**
     * Merge ATS only
     */
    approverField?: MergeATSApproverField;
    currentApproverField?: MergeATSApproverField;
    finalApprover?: string;
    currentFinalApprover?: string;
};

/**
 * Updates the approval mode for the given Merge connection (Merge HR or Merge ATS).
 * Merge ATS saves its whole approval setup in one request, so `approverField` and `finalApprover` can ride along.
 */
function updateMergeApprovalMode({
    policyID,
    connectionName,
    approvalMode,
    currentApprovalMode,
    approverField,
    currentApproverField,
    finalApprover,
    currentFinalApprover,
}: UpdateMergeApprovalModeOptions) {
    const updatedConfig: MergeApprovalConfigUpdate = {approvalMode};
    const rolledBackConfig: MergeApprovalConfigUpdate = {approvalMode: currentApprovalMode ?? null};

    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS) {
        updatedConfig.approverField = approverField ?? null;
        rolledBackConfig.approverField = currentApproverField ?? null;
        updatedConfig.finalApprover = finalApprover ?? null;
        rolledBackConfig.finalApprover = currentFinalApprover ?? null;
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [connectionName]: {
                        config: {
                            ...updatedConfig,
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
                            ...rolledBackConfig,
                            pendingFields: {approvalMode: null},
                            errorFields: {approvalMode: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateMergeApprovalModeParams = {
        policyID,
        connectionName,
        approvalMode,
    };

    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.MERGE_ATS) {
        parameters.approverField = approverField;
        parameters.finalApprover = finalApprover;
    }

    write(WRITE_COMMANDS.UPDATE_MERGE_APPROVAL_MODE, parameters, {optimisticData, successData, failureData});
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

export {MERGE_INITIAL_SYNC_MODAL_SHOWN_KEYS, clearMergeConnectionErrorField, getMergeSetupLink, setMergeInitialSyncModalShown, syncMerge, updateMergeApprovalMode, updateMergeFinalApprover};
export type {MergeConnectionErrorFieldName};
