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

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD> | undefined;

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
        return CONST.BRICK_ROAD.RBR;
    }

    // To determine if the report requires attention from the current user, we need to load the parent report action
    let itemParentReportAction = {};
    if (report.parentReportID) {
        const itemParentReportActions = ReportActionsUtils.getAllReportActions(report.parentReportID);
        itemParentReportAction = report.parentReportActionID ? itemParentReportActions[report.parentReportActionID] : {};
    }
    const reportOption = {...report, isUnread: ReportUtils.isUnread(report), isUnreadWithMention: ReportUtils.isUnreadWithMention(report)};
    const shouldShowGreenDotIndicator = ReportUtils.requiresAttentionFromCurrentUser(reportOption, itemParentReportAction);
    return shouldShowGreenDotIndicator ? CONST.BRICK_ROAD.GBR : undefined;
};

function hasGlobalWorkspaceError(policies: OnyxCollection<Policy>, policyMembers: OnyxCollection<PolicyMembers>) {
    const cleanPolicies = Object.fromEntries(Object.entries(policies ?? {}).filter(([, policy]) => !!policy));

    const cleanAllPolicyMembers = Object.fromEntries(Object.entries(policyMembers ?? {}).filter(([, policyMemberValues]) => !!policyMemberValues));
    const errorCheckingMethods: CheckingMethod[] = [
        () => Object.values(cleanPolicies).some(hasPolicyError),
        () => Object.values(cleanPolicies).some(hasCustomUnitsError),
        () => Object.values(cleanAllPolicyMembers).some(hasPolicyMemberError),
        () => Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
    ];

    return errorCheckingMethods.some((errorCheckingMethod) => errorCheckingMethod());
}

function hasWorkspaceRedBrickRoad(policy: Policy) {
    const policyMemberError = allPolicyMembers ? hasPolicyMemberError(allPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policy.id}`]) : false;

    return hasPolicyError(policy) || hasCustomUnitsError(policy) || policyMemberError;
}

function checkIfWorkspaceHasError(policyID?: string) {
    // TODO: Handle reimbursmentAccount error
    if (!policyID) {
        return hasGlobalWorkspaceError(allPolicies, allPolicyMembers);
    }
    const policy = allPolicies ? allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : null;

    if (!policy) {
        return false;
    }

    return hasWorkspaceRedBrickRoad(policy);
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

    const cleanPolicies = Object.fromEntries(Object.entries(allPolicies ?? {}).filter(([, policy]) => !!policy));

    Object.values(cleanPolicies).forEach((policy) => {
        if (!policy) {
            return;
        }

        if (hasWorkspaceRedBrickRoad(policy)) {
            workspacesBrickRoadsMap[policy.id] = CONST.BRICK_ROAD.RBR;
        }
    });

    Object.keys(allReports).forEach((report) => {
        const policyID = allReports?.[report]?.policyID ?? CONST.POLICY.EMPTY;
        const policyReport = allReports ? allReports[report] : null;
        if (!policyID || !policyReport || workspacesBrickRoadsMap[policyID] === CONST.BRICK_ROAD.RBR) {
            return;
        }
        const workspaceBrickRoad = getBrickRoadForPolicy(policyReport);

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

    Object.keys(allReports).forEach((report) => {
        const policyID = allReports?.[report]?.policyID;
        const policyReport = allReports ? allReports[report] : null;
        if (!policyID || !policyReport) {
            return;
        }

        const unreadStatus = ReportUtils.isUnread(policyReport);

        if (unreadStatus) {
            workspacesUnreadStatuses[policyID] = true;
        } else {
            workspacesUnreadStatuses[policyID] = false;
        }
    });

    return workspacesUnreadStatuses;
}

export {getBrickRoadForPolicy, getWorkspacesBrickRoads, getWorkspacesUnreadStatuses, hasGlobalWorkspaceError, checkIfWorkspaceHasError, hasWorkspaceRedBrickRoad};
export type {BrickRoad};
