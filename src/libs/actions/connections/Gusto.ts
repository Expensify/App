import {buildDeleteApprovalWorkflowRulesOnyxData} from '@libs/actions/Workflow';
import {write} from '@libs/API';
import type {ConnectPolicyToGustoParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

function getGustoSetupLink(policyID: string) {
    const params: ConnectPolicyToGustoParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_GUSTO,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function updateGustoApprovalMode(
    policyID: string | undefined,
    approvalMode: ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>,
    currentApprovalMode: ValueOf<typeof CONST.GUSTO.APPROVAL_MODE> | null | undefined,
    rules: OnyxCollection<Rule>,
) {
    if (!policyID) {
        return;
    }

    // In every mode but custom, Gusto's syncs set the approvers, so the backend deletes the workspace's approval workflow rules
    const approvalWorkflowRulesOnyxData = approvalMode === CONST.GUSTO.APPROVAL_MODE.CUSTOM ? undefined : buildDeleteApprovalWorkflowRulesOnyxData(policyID, rules);
    const previousApprovalMode = currentApprovalMode ?? null;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.RULE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    gusto: {
                        config: {
                            approvalMode,
                            pendingFields: {approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {approvalMode: null},
                        },
                    },
                },
            },
        },
        ...(approvalWorkflowRulesOnyxData?.optimisticData ?? []),
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.RULE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    gusto: {
                        config: {
                            pendingFields: {approvalMode: null},
                            errorFields: {approvalMode: null},
                        },
                    },
                },
            },
        },
        ...(approvalWorkflowRulesOnyxData?.successData ?? []),
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.RULE>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    gusto: {
                        config: {
                            approvalMode: previousApprovalMode,
                            pendingFields: {approvalMode: null},
                            errorFields: {approvalMode: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        },
                    },
                },
            },
        },
        ...(approvalWorkflowRulesOnyxData?.failureData ?? []),
    ];

    write(WRITE_COMMANDS.UPDATE_GUSTO_APPROVAL_MODE, {policyID, approvalMode}, {optimisticData, successData, failureData});
}

function updateGustoFinalApprover(policyID: string | undefined, finalApprover: string | null, currentFinalApprover?: string | null) {
    if (!policyID) {
        return;
    }

    const previousFinalApprover = currentFinalApprover ?? null;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    gusto: {
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
                    gusto: {
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
                    gusto: {
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

    write(WRITE_COMMANDS.UPDATE_GUSTO_FINAL_APPROVER, {policyID, finalApprover}, {optimisticData, successData, failureData});
}

export {updateGustoApprovalMode, updateGustoFinalApprover};

export default getGustoSetupLink;
