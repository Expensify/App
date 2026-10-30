/**
 * Hook that derives a workspace's approval workflows from the source of truth and reports whether the workspace
 * actually has a custom (advanced) approval workflow, so callers don't trust the stale `policy.approvalMode` flag.
 */
import {isControlPolicy} from '@libs/PolicyUtils';
import {
    convertApprovalWorkflowRulesToWorkflows,
    convertPolicyEmployeesToApprovalWorkflows,
    filterRulesForPolicy,
    getApprovalWorkflowRulesForPolicy,
    getApproverPendingActionByMemberEmail,
    getEnforcedApprovalWorkflows,
    getEnforcedApprovalWorkflowsForMembers,
} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {Member} from '@src/types/onyx/ApprovalWorkflow';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {useAllPersonalDetails} from './usePersonalDetails';

type UseApprovalWorkflowsResult = {
    /** Every approval workflow the workspace's data describes, derived from the policy employees or the approval-workflow rules */
    approvalWorkflows: ApprovalWorkflow[];

    /** The subset of `approvalWorkflows` the Workflows tab displays: only the default workflow unless the workspace uses advanced approvals */
    filteredApprovalWorkflows: ApprovalWorkflow[];

    /**
     * The workflows the workspace's approval mode actually enforces, with every member on the workflow that governs
     * them. Read this wherever a member's approver is surfaced, so a workflow the workspace has stopped enforcing
     * isn't presented as if it still applied.
     */
    enforcedApprovalWorkflows: ApprovalWorkflow[];

    /** List of available members that can be selected in a workflow */
    availableMembers: Member[];

    /** Emails that are already used as approvers in the configured workflows */
    usedApproverEmails: string[];

    /** Whether the workspace has a custom (advanced) approval workflow on top of the plain default one */
    isAdvanceApproval: boolean;

    /**
     * The pending state of each member's approver while a change to it is in flight, keyed by member email. Read this
     * alongside the approver itself, since the change lands in a different place depending on the beta.
     */
    approverPendingActionByMemberEmail: Record<string, PendingAction>;

    /** The workspace's approval-workflow rules, exposed so consumers don't need a second `RULE` subscription */
    rulesCollection: OnyxCollection<Rule>;

    /** Personal details, exposed so consumers don't need a second `PERSONAL_DETAILS_LIST` subscription */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

/**
 * Derives approval workflows from policy employees or approval rules when `MULTIPLE_APPROVERS` is enabled.
 *
 * Prefer `isAdvanceApproval` over `policy.approvalMode`: the stored value is updated optimistically and can drift from the actual workflow structure.
 */
function useApprovalWorkflows(policy: OnyxEntry<Policy>): UseApprovalWorkflowsResult {
    const policyID = policy?.id;
    const {localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [personalDetails] = useAllPersonalDetails();
    const [rulesCollection] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: (rules: OnyxCollection<Rule>) => filterRulesForPolicy(rules, policyID)});

    const isMultipleApproversBetaEnabled = isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);
    const params = {
        policy,
        personalDetails: personalDetails ?? {},
        localeCompare,
        currentUserLogin,
        rules: getApprovalWorkflowRulesForPolicy(rulesCollection, policyID),
    };
    const {approvalWorkflows, availableMembers, usedApproverEmails} = isMultipleApproversBetaEnabled
        ? convertApprovalWorkflowRulesToWorkflows(params)
        : convertPolicyEmployeesToApprovalWorkflows(params);

    const isAdvanceApproval = (approvalWorkflows.length > 1 || (approvalWorkflows?.at(0)?.approvers ?? []).length > 1) && isControlPolicy(policy);

    const filteredApprovalWorkflows = getEnforcedApprovalWorkflows(approvalWorkflows, policy, isMultipleApproversBetaEnabled);
    const enforcedApprovalWorkflows = getEnforcedApprovalWorkflowsForMembers(approvalWorkflows, policy, isMultipleApproversBetaEnabled);

    return {
        approvalWorkflows,
        filteredApprovalWorkflows,
        enforcedApprovalWorkflows,
        availableMembers,
        usedApproverEmails,
        isAdvanceApproval,
        approverPendingActionByMemberEmail: getApproverPendingActionByMemberEmail(policy, enforcedApprovalWorkflows, isMultipleApproversBetaEnabled ? rulesCollection : undefined),
        rulesCollection,
        personalDetails,
    };
}

export default useApprovalWorkflows;
