import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';
import {write} from '@libs/API';
import type {ConnectPolicyToMergeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ONYXKEYS from '@src/ONYXKEYS';

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
function syncMergeHR(policyID: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: {
                stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.MERGE_HR_SYNC_TITLE,
                connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_HR,
                timestamp: new Date().toISOString(),
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
            value: null,
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

type HRProviderName = TupleToUnion<typeof CONST.POLICY.CONNECTIONS.HR_CONNECTION_NAMES>;

type HRConnectionErrorFieldName = 'approvalMode' | 'finalApprover';

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

export {syncMergeHR, updateMergeHRApprovalMode, updateMergeHRFinalApprover, clearHRConnectionErrorField};

export default getMergeHRSetupLink;
