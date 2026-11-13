import type {WorkspacesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import type {Policy, ReportAttributesDerivedValue} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {canRoleCreateExpenses, canRoleWriteMembers, canUnarchivePolicy, getConnectionExporters, isPolicyAdmin, isPolicyApprover, isPolicyAuditor} from './PolicyUtils';

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

/**
 * @returns BrickRoad for the given reportID using reportAttributes
 */
const getBrickRoadForPolicy = (reportID: string, reportAttributes: ReportAttributesDerivedValue['reports'] | undefined): BrickRoad => {
    return reportAttributes?.[reportID]?.brickRoadStatus;
};

function getChatTabBrickRoadReportID(orderedReportIDs: string[], reportAttributes: ReportAttributesDerivedValue['reports'] | undefined): string | undefined {
    if (!orderedReportIDs.length) {
        return undefined;
    }

    let reportIDWithGBR: string | undefined;

    for (const reportID of orderedReportIDs) {
        const brickRoad = getBrickRoadForPolicy(reportID, reportAttributes);
        if (brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
            reportIDWithGBR = reportID;
        }
        if (brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
            return reportID;
        }
    }

    return reportIDWithGBR;
}

function getChatTabBrickRoad(orderedReportIDs: string[], reportAttributes: ReportAttributesDerivedValue['reports'] | undefined): BrickRoad | undefined {
    const reportID = getChatTabBrickRoadReportID(orderedReportIDs, reportAttributes);
    return reportID ? getBrickRoadForPolicy(reportID, reportAttributes) : undefined;
}

/**
 * @param error workspace change owner error
 * @param translate translation function
 * @param policy policy object
 * @param accountLogin account login/email
 * @returns ownership change checks page display text's
 */
function getOwnershipChecksDisplayText(
    error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
    translate: LocaleContextProps['translate'],
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
    policy: OnyxEntry<Policy>,
    accountLogin: string | undefined,
) {
    let title;
    let text;
    let buttonText;

    const changeOwner = policy?.errorFields?.changeOwner;
    const subscription = changeOwner?.subscription as unknown as {ownerUserCount: number; totalUserCount: number};
    const ownerOwesAmount = changeOwner?.ownerOwesAmount as unknown as {ownerEmail: string; amount: number; currency: string};

    switch (error) {
        case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
            title = translate('workspace.changeOwner.amountOwedTitle');
            text = translate('workspace.changeOwner.amountOwedText');
            buttonText = translate('workspace.changeOwner.amountOwedButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
            title = translate('workspace.changeOwner.ownerOwesAmountTitle');
            text = translate('workspace.changeOwner.ownerOwesAmountText', ownerOwesAmount?.ownerEmail, convertToDisplayString(ownerOwesAmount?.amount, ownerOwesAmount?.currency));
            buttonText = translate('workspace.changeOwner.ownerOwesAmountButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
            title = translate('workspace.changeOwner.subscriptionTitle');
            text = translate('workspace.changeOwner.subscriptionText', subscription?.ownerUserCount, subscription?.totalUserCount);
            buttonText = translate('workspace.changeOwner.subscriptionButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
            title = translate('workspace.changeOwner.duplicateSubscriptionTitle');
            text = translate('workspace.changeOwner.duplicateSubscriptionText', changeOwner?.duplicateSubscription ?? '', policy?.name ?? '');
            buttonText = translate('workspace.changeOwner.duplicateSubscriptionButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
            title = translate('workspace.changeOwner.hasFailedSettlementsTitle');
            text = translate('workspace.changeOwner.hasFailedSettlementsText', accountLogin ?? '');
            buttonText = translate('workspace.changeOwner.hasFailedSettlementsButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE:
            title = translate('workspace.changeOwner.failedToClearBalanceTitle');
            text = translate('workspace.changeOwner.failedToClearBalanceText');
            buttonText = translate('workspace.changeOwner.failedToClearBalanceButtonText');
            break;
        default:
            title = '';
            text = '';
            buttonText = '';
            break;
    }

    return {title, text, buttonText};
}

type LeaveWorkspaceWarning = ValueOf<typeof CONST.POLICY.LEAVE_WORKSPACE_WARNINGS>;

function getLeaveWorkspaceWarning(policy: OnyxEntry<Policy>, userEmail: string, isApproverOfOutstandingReports = false): LeaveWorkspaceWarning {
    if (policy?.achAccount?.reimburser === userEmail) {
        return CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.PAYER;
    }

    if (policy?.technicalContact === userEmail) {
        return CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.TECHNICAL_CONTACT;
    }

    if (getConnectionExporters(policy).some((exporter) => exporter === userEmail)) {
        return CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.EXPORTER;
    }

    if (isPolicyApprover(policy, userEmail) || isApproverOfOutstandingReports) {
        return CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.APPROVER;
    }

    if (isPolicyAdmin(policy)) {
        return CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.ADMIN;
    }

    if (isPolicyAuditor(policy)) {
        return CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.AUDITOR;
    }

    return CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.MEMBER;
}

function getLeaveWorkspaceConfirmationPrompt(
    policy: OnyxEntry<Policy>,
    userEmail: string,
    ownerDisplayName: string,
    translate: LocaleContextProps['translate'],
    isApproverOfOutstandingReports = false,
): string {
    switch (getLeaveWorkspaceWarning(policy, userEmail, isApproverOfOutstandingReports)) {
        case CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.PAYER:
            return translate('common.leaveWorkspaceReimburser');
        case CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.TECHNICAL_CONTACT:
            return translate('common.leaveWorkspaceConfirmationTechContact', ownerDisplayName);
        case CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.EXPORTER:
            return translate('common.leaveWorkspaceConfirmationExporter', ownerDisplayName);
        case CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.APPROVER:
            return translate('common.leaveWorkspaceConfirmationApprover', ownerDisplayName);
        case CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.ADMIN:
            return translate('common.leaveWorkspaceConfirmationAdmin');
        case CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.AUDITOR:
            return translate('common.leaveWorkspaceConfirmationAuditor');
        case CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.MEMBER:
        default:
            return translate('common.leaveWorkspaceConfirmation');
    }
}

const BULK_LEAVE_CONSEQUENCES = [
    [CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.MEMBER, 'common.leaveWorkspacesConsequenceMember'],
    [CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.AUDITOR, 'common.leaveWorkspacesConsequenceAuditor'],
    [CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.ADMIN, 'common.leaveWorkspacesConsequenceAdmin'],
    [CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.APPROVER, 'common.leaveWorkspacesConsequenceApprover'],
    [CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.EXPORTER, 'common.leaveWorkspacesConsequenceExporter'],
    [CONST.POLICY.LEAVE_WORKSPACE_WARNINGS.TECHNICAL_CONTACT, 'common.leaveWorkspacesConsequenceTechContact'],
] as const;

type BulkLeaveWorkspace = {
    policy: OnyxEntry<Policy>;
    isApproverOfOutstandingReports: boolean;
};

/**
 * Lists what leaving the workspaces changes for the user, once per change even when several workspaces share it, so the
 * confirmation doesn't have to repeat the workspaces the user just selected.
 */
function getBulkLeaveWorkspacesConsequences(workspaces: BulkLeaveWorkspace[], userEmail: string, translate: LocaleContextProps['translate']): string[] {
    const warnings = new Set<LeaveWorkspaceWarning>(workspaces.map((workspace) => getLeaveWorkspaceWarning(workspace.policy, userEmail, workspace.isApproverOfOutstandingReports)));
    return BULK_LEAVE_CONSEQUENCES.filter(([warning]) => warnings.has(warning)).map(([, path]) => translate(path));
}

/** Tells the user how many of the selected workspaces a bulk action applies to, or returns undefined when it applies to all of them */
function getBulkActionSkippedWarning(appliedCount: number, selectedCount: number, translate: LocaleContextProps['translate']): string | undefined {
    if (appliedCount >= selectedCount) {
        return undefined;
    }
    return translate('workspace.common.bulkActionAppliesTo', appliedCount, selectedCount);
}

type BulkArchiveWorkspace = {
    /** Archiving sets the limits of the workspace's own Expensify Cards to $0 */
    hasExpensifyCards: boolean;

    /** Archiving unassigns the workspace's cards */
    hasCards: boolean;
};

/**
 * Lists what archiving the workspaces does to their cards, once per change. A workspace with Expensify Cards only adds
 * the Expensify Card changes, like the single workspace archive confirmation.
 */
function getBulkArchiveWorkspacesConsequences(workspaces: BulkArchiveWorkspace[], translate: LocaleContextProps['translate']): string[] {
    const consequences: string[] = [];
    if (workspaces.some((workspace) => workspace.hasExpensifyCards)) {
        consequences.push(translate('workspace.common.archiveConsequenceExpensifyCardLimits'), translate('workspace.common.archiveConsequenceDeclinePurchases'));
    }
    if (workspaces.some((workspace) => !workspace.hasExpensifyCards && workspace.hasCards)) {
        consequences.push(translate('workspace.common.archiveConsequenceUnassignCards'), translate('workspace.common.archiveConsequenceDeleteCardExpenses'));
    }
    return consequences;
}

type WorkspacesBulkActionRow = {
    policyID: string;
    role: ValueOf<typeof CONST.POLICY.ROLE>;
    type: ValueOf<typeof CONST.POLICY.TYPE>;
    ownerAccountID?: number;
    isArchived: boolean;
    isDefault: boolean;
    isJoinRequestPending: boolean;
    isEligibleToCopy: boolean;
    isReimburser: boolean;
};

type WorkspacesBulkActionContext = {
    currentUserAccountID: number;
    preferredPolicyID?: string;
    isRestrictedToPreferredPolicy: boolean;
    canArchivePolicies: boolean;
    canRenderTransferOwnerButton: boolean;
};

type WorkspacesBulkAction = {
    type: WorkspacesBulkActionType;

    /** The selected workspaces the action applies to. The rest of the selection is skipped. */
    policyIDs: string[];
};

const WORKSPACES_BULK_ACTIONS_ORDER: WorkspacesBulkActionType[] = [
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.SET_AS_DEFAULT,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.EXPORT_MEMBERS,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.TRANSFER_OWNER,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.COPY_SETTINGS,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DUPLICATE,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.ARCHIVE,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DELETE,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.UNARCHIVE,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE,
];

const SINGLE_WORKSPACE_BULK_ACTIONS = new Set<WorkspacesBulkActionType>([
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.SET_AS_DEFAULT,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.COPY_SETTINGS,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DUPLICATE,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DELETE,
    CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.UNARCHIVE,
]);

function canApplyWorkspacesBulkAction(type: WorkspacesBulkActionType, row: WorkspacesBulkActionRow, context: WorkspacesBulkActionContext, isSingleSelection: boolean): boolean {
    const isOwner = row.ownerAccountID === context.currentUserAccountID;
    const isAdmin = row.role === CONST.POLICY.ROLE.ADMIN;

    switch (type) {
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.SET_AS_DEFAULT:
            // Making the workspace the default would break expense creation routing for members without create-expenses permission.
            return !row.isArchived && !row.isDefault && !row.isJoinRequestPending && !context.isRestrictedToPreferredPolicy && canRoleCreateExpenses(row.role);
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.EXPORT_MEMBERS:
            return !row.isArchived && canRoleWriteMembers(row.role, row.type);
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.TRANSFER_OWNER:
            return isAdmin && !isOwner && context.canRenderTransferOwnerButton;
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.COPY_SETTINGS:
            return !row.isArchived && isAdmin && row.isEligibleToCopy;
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DUPLICATE:
            return !row.isArchived && isAdmin;
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.ARCHIVE:
            return context.canArchivePolicies && !row.isArchived && isOwner;
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DELETE:
            return !context.canArchivePolicies && !row.isArchived && isOwner;
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.UNARCHIVE:
            return canUnarchivePolicy(row.isArchived, row.ownerAccountID, context.currentUserAccountID, context.canArchivePolicies);
        case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE:
            // A single reimburser workspace still offers Leave so the leave flow can explain why it is blocked.
            return !row.isArchived && !isOwner && (row.policyID !== context.preferredPolicyID || !context.isRestrictedToPreferredPolicy) && (isSingleSelection || !row.isReimburser);
        default:
            return false;
    }
}

/**
 * The actions offered for the workspaces selected on the workspaces list, in the order they are shown. An action is
 * offered when it applies to at least one selected workspace, and runs only on those.
 */
function getWorkspacesBulkActions(selectedRows: WorkspacesBulkActionRow[], context: WorkspacesBulkActionContext): WorkspacesBulkAction[] {
    const actions: WorkspacesBulkAction[] = [];
    const isSingleSelection = selectedRows.length === 1;

    for (const type of WORKSPACES_BULK_ACTIONS_ORDER) {
        if (SINGLE_WORKSPACE_BULK_ACTIONS.has(type) && !isSingleSelection) {
            continue;
        }

        const policyIDs = selectedRows.filter((row) => canApplyWorkspacesBulkAction(type, row, context, isSingleSelection)).map((row) => row.policyID);
        if (policyIDs.length > 0) {
            actions.push({type, policyIDs});
        }
    }

    return actions;
}

export {
    getChatTabBrickRoadReportID,
    getBrickRoadForPolicy,
    getChatTabBrickRoad,
    getOwnershipChecksDisplayText,
    getLeaveWorkspaceConfirmationPrompt,
    getBulkLeaveWorkspacesConsequences,
    getBulkArchiveWorkspacesConsequences,
    getBulkActionSkippedWarning,
    getWorkspacesBulkActions,
};
export type {BrickRoad, WorkspacesBulkAction, WorkspacesBulkActionContext, WorkspacesBulkActionRow};
