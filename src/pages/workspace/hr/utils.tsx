import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyConnectionSyncProgress} from '@src/types/onyx';
import type {PersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {GustoSettingRow} from './types';

function getGustoApprovalModeLabel(policy: Policy | undefined, translate: LocaleContextProps['translate']) {
    switch (policy?.connections?.gusto?.config?.approvalMode ?? CONST.GUSTO.APPROVAL_MODE.BASIC) {
        case CONST.GUSTO.APPROVAL_MODE.MANAGER:
            return translate('workspace.hr.gusto.approvalModes.manager');
        case CONST.GUSTO.APPROVAL_MODE.CUSTOM:
            return translate('workspace.hr.gusto.approvalModes.custom');
        default:
            return translate('workspace.hr.gusto.approvalModes.basic');
    }
}

function getFinalApproverDisplayName(
    policy: Policy | undefined,
    personalDetails: Record<string, PersonalDetails> | undefined,
    translate: LocaleContextProps['translate'],
) {
    const finalApprover = policy?.connections?.gusto?.config?.finalApprover;
    if (!finalApprover) {
        return translate('workspace.hr.gusto.noFinalApprover');
    }

    const memberAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
    const accountID = memberAccountIDs[finalApprover];
    const displayName = accountID ? personalDetails?.[accountID]?.displayName : undefined;
    return displayName ?? finalApprover;
}

function getGustoConnectionMessage(
    policy: Policy | undefined,
    connectionSyncProgress: PolicyConnectionSyncProgress | null | undefined,
    isSyncInProgress: boolean,
    datetimeToRelative: string,
    translate: LocaleContextProps['translate'],
) {
    const gustoConnection = policy?.connections?.gusto;
    if (!gustoConnection) {
        return translate('workspace.hr.gusto.description');
    }
    if (isSyncInProgress && connectionSyncProgress?.stageInProgress) {
        return translate('workspace.hr.syncStageName', {stage: connectionSyncProgress.stageInProgress});
    }
    if (gustoConnection?.lastSync?.isSuccessful === false && gustoConnection?.lastSync?.errorMessage) {
        return gustoConnection.lastSync.errorMessage;
    }
    if (!gustoConnection?.lastSync?.isConnected || !datetimeToRelative) {
        return translate('workspace.accounting.notSync');
    }
    return translate('workspace.accounting.lastSync', datetimeToRelative);
}

function getGustoSettingRows(
    policyID: string,
    policy: Policy | undefined,
    personalDetails: Record<string, PersonalDetails> | undefined,
    translate: LocaleContextProps['translate'],
): GustoSettingRow[] {
    return [
        {
            title: translate('workspace.hr.gusto.approvalMode'),
            description: getGustoApprovalModeLabel(policy, translate),
            route: ROUTES.WORKSPACE_HR_GUSTO_APPROVAL_MODE.getRoute(policyID),
            pendingAction: policy?.connections?.gusto?.config?.pendingFields?.approvalMode,
            errors: policy?.connections?.gusto?.config?.errorFields?.approvalMode,
        },
        {
            title: translate('workspace.hr.gusto.finalApprover'),
            description: getFinalApproverDisplayName(policy, personalDetails, translate),
            route: ROUTES.WORKSPACE_HR_GUSTO_FINAL_APPROVER.getRoute(policyID),
            pendingAction: policy?.connections?.gusto?.config?.pendingFields?.finalApprover,
            errors: policy?.connections?.gusto?.config?.errorFields?.finalApprover,
        },
    ];
}

export {getFinalApproverDisplayName, getGustoApprovalModeLabel, getGustoConnectionMessage, getGustoSettingRows};
