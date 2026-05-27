import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {write} from '@libs/API';
import type {ConnectPolicyToZenefitsParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyConnectionSyncProgress} from '@src/types/onyx/Policy';

function getZenefitsSetupLink(policyID: string) {
    const params: ConnectPolicyToZenefitsParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_ZENEFITS,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function getZenefitsSyncProgressOptimisticData(policyID: string): OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS> {
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
        value: {
            stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.ZENEFITS_SYNC_TITLE,
            connectionName: CONST.POLICY.CONNECTIONS.NAME.ZENEFITS,
            timestamp: new Date().toISOString(),
        },
    };
}

function getZenefitsSyncProgressFailureData(
    policyID: string,
    currentConnectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>,
): OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS> {
    return {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
        value: currentConnectionSyncProgress ?? null,
    };
}

function updateZenefitsApprovalMode(
    policyID: string | undefined,
    approvalMode: ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE>,
    currentApprovalMode?: ValueOf<typeof CONST.ZENEFITS.APPROVAL_MODE> | null,
    currentConnectionSyncProgress?: OnyxEntry<PolicyConnectionSyncProgress>,
) {
    if (!policyID) {
        return;
    }

    const previousApprovalMode = currentApprovalMode ?? null;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    zenefits: {
                        config: {
                            approvalMode,
                            pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {approvalMode: null},
                        },
                    },
                },
            },
        },
        getZenefitsSyncProgressOptimisticData(policyID),
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    zenefits: {
                        config: {
                            pendingFields: {approvalMode: null},
                            errorFields: {approvalMode: null},
                        },
                    },
                },
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    zenefits: {
                        config: {
                            approvalMode: previousApprovalMode,
                            pendingFields: {approvalMode: null},
                            errorFields: {approvalMode: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
        getZenefitsSyncProgressFailureData(policyID, currentConnectionSyncProgress),
    ];

    write(WRITE_COMMANDS.UPDATE_ZENEFITS_APPROVAL_MODE, {policyID, approvalMode}, {optimisticData, successData, failureData});
}

function updateZenefitsFinalApprover(
    policyID: string | undefined,
    finalApprover: string | null,
    currentFinalApprover?: string | null,
    currentConnectionSyncProgress?: OnyxEntry<PolicyConnectionSyncProgress>,
) {
    if (!policyID) {
        return;
    }

    const previousFinalApprover = currentFinalApprover ?? null;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    zenefits: {
                        config: {
                            finalApprover,
                            pendingFields: {finalApprover: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {finalApprover: null},
                        },
                    },
                },
            },
        },
        getZenefitsSyncProgressOptimisticData(policyID),
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    zenefits: {
                        config: {
                            pendingFields: {finalApprover: null},
                            errorFields: {finalApprover: null},
                        },
                    },
                },
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    zenefits: {
                        config: {
                            finalApprover: previousFinalApprover,
                            pendingFields: {finalApprover: null},
                            errorFields: {finalApprover: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
        getZenefitsSyncProgressFailureData(policyID, currentConnectionSyncProgress),
    ];

    write(WRITE_COMMANDS.UPDATE_ZENEFITS_FINAL_APPROVER, {policyID, finalApprover}, {optimisticData, successData, failureData});
}

export {updateZenefitsApprovalMode, updateZenefitsFinalApprover};

export default getZenefitsSetupLink;
