/**
 * Archived and pending-delete checks, and which plan a workspace is on.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Whether the policy has been archived. archivedDate is the single source of truth
 * for the archived state; restoring the policy removes it.
 */
function isArchivedPolicy(policy: OnyxInputOrEntry<Policy>): boolean {
    return !!policy?.archivedDate;
}

/**
 * Whether the policy is archived or is optimistically pending deletion. Deleting a workspace
 * archives it on the backend, but the optimistic data only sets pendingAction, so report state
 * transitions must also treat a pending delete as archived while the request is in flight.
 */
function isArchivedOrPendingDeletePolicy(policy: OnyxInputOrEntry<Policy>): boolean {
    return isArchivedPolicy(policy) || policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function isPendingDeletePolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

/**
 * Returns true only for paid plans (Collect/Control). Use this only for billing/paid-only concerns:
 * subscriptions, payments and reimbursement, company cards, Expensify Card, Travel, Invoices, and
 * "do I own a paid workspace" checks.
 *
 * For workspace feature gating (violations, report fields, workspace chat, report creation,
 * expense-workspace usability) use `isGroupPolicy` instead, otherwise free group plans like Submit
 * (submit2026) are wrongly excluded. The report-based counterparts are `ReportUtils.isPaidGroupPolicy`
 * (paid-only) and `ReportUtils.isReportInGroupPolicy` (group).
 */
function isPaidGroupPolicy(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM || policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function isPaidGroupPolicyByType(policyType: string | undefined): boolean {
    return policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
}

function isSubmitPolicy(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.SUBMIT;
}

function isSubmitPolicyByType(policyType: string | undefined): boolean {
    return policyType === CONST.POLICY.TYPE.SUBMIT;
}

/**
 * Checks if the submitter's approval is blocked on the submit workspace.
 *
 * @param policy - The policy to check
 * @param reportOwnerAccountID - The account ID of the report owner
 * @param approverAccountID - The account ID of the approver
 * @returns True if the submitter's approval is blocked on the submit workspace, false otherwise
 */
function isSubmitterApproveBlockedOnSubmitWorkspace(policy: OnyxInputOrEntry<Policy>, reportOwnerAccountID: number | undefined, approverAccountID: number): boolean {
    return isSubmitPolicy(policy) && reportOwnerAccountID === approverAccountID;
}

/**
 * Returns true for any group workspace: paid (Collect/Control) or Submit.
 *
 * Prefer this over `isPaidGroupPolicy` whenever the check is about workspace features rather than
 * billing (violations, report fields, workspace chat, report creation, expense-workspace usability),
 * so free group plans like Submit (submit2026) are not excluded. It is a strict superset of
 * `isPaidGroupPolicy`, so switching a feature check to it never changes Collect/Control/Personal
 * behavior. Use `isPaidGroupPolicy` only when the concern is genuinely billing/paid-only.
 *
 * For report-based call sites, use `ReportUtils.isReportInGroupPolicy(report)`, which delegates here.
 */
function isGroupPolicy(policy: OnyxInputOrEntry<Policy>): boolean {
    return isPaidGroupPolicy(policy) || isSubmitPolicy(policy);
}

function isGroupPolicyByType(policyType: string | undefined): boolean {
    return isPaidGroupPolicyByType(policyType) || isSubmitPolicyByType(policyType);
}

function isControlPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

/**
 * Whether the policy can access a feature based on plan level.
 * Corporate-only features are restricted to control (Corporate) policies.
 * Rules are available on both Control and Collect.
 */
function canPolicyAccessFeature(policy: OnyxEntry<Policy>, featureName: PolicyFeatureName): boolean {
    if (!isPaidGroupPolicy(policy)) {
        return false;
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED) {
        return isControlPolicy(policy) || isCollectPolicy(policy);
    }
    const corporateOnlyFeatures = new Set<PolicyFeatureName>([
        CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED,
        CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED,
        CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED,
        CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED,
    ]);
    if (corporateOnlyFeatures.has(featureName)) {
        return isControlPolicy(policy);
    }
    return true;
}

function isCollectPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM;
}

export {
    isArchivedPolicy,
    isArchivedOrPendingDeletePolicy,
    isPendingDeletePolicy,
    isPaidGroupPolicy,
    isPaidGroupPolicyByType,
    isSubmitPolicy,
    isSubmitterApproveBlockedOnSubmitWorkspace,
    isGroupPolicy,
    isGroupPolicyByType,
    isControlPolicy,
    canPolicyAccessFeature,
    isCollectPolicy,
};
