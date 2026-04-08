import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {ConnectPolicyToGustoParams, UpdateGustoApprovalModeParams, UpdateGustoFinalApproverParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getCommandURL} from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import {openLink} from '@libs/actions/Link';
import {syncConnection} from '@libs/actions/connections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

function getGustoSetupLink(policyID: string) {
    const params: ConnectPolicyToGustoParams = {policyID};
    const commandURL = getCommandURL({
        command: READ_COMMANDS.CONNECT_POLICY_TO_GUSTO,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}

function connectPolicyToGusto(policyID: string, environmentURL: string) {
    openLink(getGustoSetupLink(policyID), environmentURL);
}

function syncGusto(policy: Policy | undefined) {
    syncConnection(policy, CONST.POLICY.CONNECTIONS.NAME.GUSTO);
}

function updateGustoApprovalMode(
    policyID: string,
    approvalMode: ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>,
    currentApprovalMode: ValueOf<typeof CONST.GUSTO.APPROVAL_MODE> | null,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                        config: {
                            approvalMode,
                            pendingFields: {
                                approvalMode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                approvalMode: null,
                            },
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
                    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                        config: {
                            pendingFields: {
                                approvalMode: null,
                            },
                            errorFields: {
                                approvalMode: null,
                            },
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
                    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                        config: {
                            approvalMode: currentApprovalMode,
                            pendingFields: {
                                approvalMode: null,
                            },
                            errorFields: {
                                approvalMode: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateGustoApprovalModeParams = {
        policyID,
        approvalMode,
    };

    API.write(WRITE_COMMANDS.UPDATE_GUSTO_APPROVAL_MODE, parameters, {optimisticData, successData, failureData});
}

function updateGustoFinalApprover(policyID: string, finalApprover: string | null, currentFinalApprover: string | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                        config: {
                            finalApprover,
                            pendingFields: {
                                finalApprover: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                finalApprover: null,
                            },
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
                    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                        config: {
                            pendingFields: {
                                finalApprover: null,
                            },
                            errorFields: {
                                finalApprover: null,
                            },
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
                    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: {
                        config: {
                            finalApprover: currentFinalApprover,
                            pendingFields: {
                                finalApprover: null,
                            },
                            errorFields: {
                                finalApprover: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: UpdateGustoFinalApproverParams = {
        policyID,
        finalApprover,
    };

    API.write(WRITE_COMMANDS.UPDATE_GUSTO_FINAL_APPROVER, parameters, {optimisticData, successData, failureData});
}

export {connectPolicyToGusto, getGustoSetupLink, syncGusto, updateGustoApprovalMode, updateGustoFinalApprover};
