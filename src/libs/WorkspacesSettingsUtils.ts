import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyMembers, ReimbursementAccount, Report} from '@src/types/onyx';
import * as OptionsListUtils from './OptionsListUtils';
import {hasCustomUnitsError, hasPolicyError, hasPolicyMemberError} from './PolicyUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';

type CheckingMethod = () => boolean;

let allReports: OnyxCollection<Report>;

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

let allPolicies: OnyxCollection<Policy>;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

let allPolicyMembers: OnyxCollection<PolicyMembers>;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
    waitForCollectionCallback: true,
    callback: (val) => {
        allPolicyMembers = val;
    },
});

let reimbursementAccount: OnyxEntry<ReimbursementAccount>;

Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: (val) => {
        reimbursementAccount = val;
    },
});

/**
 * @param report
 * @returns BrickRoad for the policy passed as a param
 */
const getBrickRoadForPolicy = (report: Report): BrickRoad => {
    const reportActions = ReportActionsUtils.getAllReportActions(report.reportID);
    const reportErrors = OptionsListUtils.getAllReportErrors(report, reportActions);
    const doesReportContainErrors = Object.keys(reportErrors ?? {}).length !== 0 ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    if (doesReportContainErrors) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }

    // To determine if the report requires attention from the current user, we need to load the parent report action
    let itemParentReportAction = {};
    if (report.parentReportID) {
        const itemParentReportActions = ReportActionsUtils.getAllReportActions(report.parentReportID);
        itemParentReportAction = report.parentReportActionID ? itemParentReportActions[report.parentReportActionID] : {};
    }
    const reportOption = {...report, isUnread: ReportUtils.isUnread(report), isUnreadWithMention: ReportUtils.isUnreadWithMention(report)};
    const shouldShowGreenDotIndicator = ReportUtils.requiresAttentionFromCurrentUser(reportOption, itemParentReportAction);
    return shouldShowGreenDotIndicator ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : undefined;
};

function hasGlobalWorkspaceSettingsRBR(policies: OnyxCollection<Policy>, policyMembers: OnyxCollection<PolicyMembers>) {
    // When attempting to open a policy with an invalid policyID, the policy collection is updated to include policy objects with error information.
    // Only policies displayed on the policy list page should be verified. Otherwise, the user will encounter an RBR unrelated to any policies on the list.
    const cleanPolicies = Object.fromEntries(Object.entries(policies ?? {}).filter(([, policy]) => policy?.id));

    const cleanAllPolicyMembers = Object.fromEntries(Object.entries(policyMembers ?? {}).filter(([, policyMemberValues]) => !!policyMemberValues));
    const errorCheckingMethods: CheckingMethod[] = [
        () => Object.values(cleanPolicies).some(hasPolicyError),
        () => Object.values(cleanPolicies).some(hasCustomUnitsError),
        () => Object.values(cleanAllPolicyMembers).some(hasPolicyMemberError),
        () => Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
    ];

    return errorCheckingMethods.some((errorCheckingMethod) => errorCheckingMethod());
}

function hasWorkspaceSettingsRBR(policy: Policy) {
    const policyMemberError = allPolicyMembers ? hasPolicyMemberError(allPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policy.id}`]) : false;

    return Object.keys(reimbursementAccount?.errors ?? {}).length > 0 || hasPolicyError(policy) || hasCustomUnitsError(policy) || policyMemberError;
}

function getChatTabBrickRoad(policyID?: string): BrickRoad | undefined {
    if (!allReports) {
        return undefined;
    }

    // If policyID is undefined, then all reports are checked whether they contain any brick road
    const policyReports = policyID ? Object.values(allReports).filter((report) => report?.policyID === policyID) : Object.values(allReports);

    let hasChatTabGBR = false;

    const hasChatTabRBR = policyReports.some((report) => {
        const brickRoad = report ? getBrickRoadForPolicy(report) : undefined;
        if (!hasChatTabGBR && brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
            hasChatTabGBR = true;
        }
        return brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    });

    if (hasChatTabRBR) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }

    if (hasChatTabGBR) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    return undefined;
}

function checkIfWorkspaceSettingsTabHasRBR(policyID?: string) {
    if (!policyID) {
        return hasGlobalWorkspaceSettingsRBR(allPolicies, allPolicyMembers);
    }
    const policy = allPolicies ? allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : null;

    if (!policy) {
        return false;
    }

    return hasWorkspaceSettingsRBR(policy);
}

/**
 * @returns a map where the keys are policyIDs and the values are BrickRoads for each policy
 */
function getWorkspacesBrickRoads(): Record<string, BrickRoad> {
    if (!allReports) {
        return {};
    }

    // The key in this map is the workspace id
    const workspacesBrickRoadsMap: Record<string, BrickRoad> = {};
    Object.values(allPolicies ?? {}).forEach((policy) => {
        // Only policies which user has access to on the list should be checked. Policies that don't have an ID and contain only information about the errors aren't displayed anywhere.
        if (!policy?.id) {
            return;
        }

        if (hasWorkspaceSettingsRBR(policy)) {
            workspacesBrickRoadsMap[policy.id] = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        }
    });

    Object.values(allReports).forEach((report) => {
        const policyID = report?.policyID ?? CONST.POLICY.EMPTY;
        if (!report || workspacesBrickRoadsMap[policyID] === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
            return;
        }
        const workspaceBrickRoad = getBrickRoadForPolicy(report);

        if (!workspaceBrickRoad && !!workspacesBrickRoadsMap[policyID]) {
            return;
        }

        workspacesBrickRoadsMap[policyID] = workspaceBrickRoad;
    });

    return workspacesBrickRoadsMap;
}

/**
 * @returns a map where the keys are policyIDs and the values are truthy booleans if policy has unread content
 */
function getWorkspacesUnreadStatuses(): Record<string, boolean> {
    if (!allReports) {
        return {};
    }

    const workspacesUnreadStatuses: Record<string, boolean> = {};

    Object.values(allReports).forEach((report) => {
        const policyID = report?.policyID;
        if (!policyID || workspacesUnreadStatuses[policyID]) {
            return;
        }

        workspacesUnreadStatuses[policyID] = ReportUtils.isUnread(report);
    });

    return workspacesUnreadStatuses;
}

export {
    getBrickRoadForPolicy,
    getWorkspacesBrickRoads,
    getWorkspacesUnreadStatuses,
    hasGlobalWorkspaceSettingsRBR,
    checkIfWorkspaceSettingsTabHasRBR,
    hasWorkspaceSettingsRBR,
    getChatTabBrickRoad,
};
export type {BrickRoad};
