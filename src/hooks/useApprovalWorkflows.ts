import {isHRAdvancedMode} from '@libs/merge/HRUtils';
import {isControlPolicy} from '@libs/PolicyUtils';
import {convertApprovalWorkflowRulesToWorkflows, convertPolicyEmployeesToApprovalWorkflows, filterRulesForPolicy, getApprovalWorkflowRulesForPolicy} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {Member} from '@src/types/onyx/ApprovalWorkflow';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseApprovalWorkflowsResult = {
    /** Every approval workflow the workspace's data describes, derived from the policy employees or the approval-workflow rules */
    approvalWorkflows: ApprovalWorkflow[];

    /**
     * The subset of `approvalWorkflows` the workspace is actually configured to use. A workspace that has not opted
     * into advanced approvals only ever uses its default workflow, so any extra workflow the raw data still describes
     * is dropped here. Consumers must read this list rather than `approvalWorkflows`, or their surfaces disagree.
     */
    filteredApprovalWorkflows: ApprovalWorkflow[];

    /** List of available members that can be selected in a workflow */
    availableMembers: Member[];

    /** Emails that are already used as approvers in the configured workflows */
    usedApproverEmails: string[];

    /** Whether the workspace has a custom (advanced) approval workflow on top of the plain default one */
    isAdvanceApproval: boolean;

    /** The workspace's approval-workflow rules, exposed so consumers don't need a second `RULE` subscription */
    rulesCollection: OnyxCollection<Rule>;

    /** Personal details, exposed so consumers don't need a second `PERSONAL_DETAILS_LIST` subscription */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

/**
 * Derives a workspace's approval workflows from the source of truth (the policy employees, or the
 * approval-workflow rules when the `MULTIPLE_APPROVERS` beta is on) and reports whether the workspace actually
 * has a custom (advanced) approval workflow.
 *
 * Prefer `isAdvanceApproval` over reading `policy.approvalMode === ADVANCED`: the stored flag is written
 * optimistically by many code paths and drifts from the real workflow structure, so it can say ADVANCED for a
 * workspace with no custom workflow (e.g. right after an upgrade) and stay BASIC for one that has several.
 *
 * Under the `MULTIPLE_APPROVERS` beta the workflows live only in the `RULE` collection, so a collection that was
 * never fetched looks exactly like a workspace with no custom workflow. Callers reached without going through the
 * Workflows page must fetch the rules themselves (see `openPolicyWorkflowsPage`) before trusting the result.
 */
function useApprovalWorkflows(policy: OnyxEntry<Policy>, policyID: string | undefined): UseApprovalWorkflowsResult {
    const {localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
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

    // Outside advanced approvals a workspace only uses its default workflow, so drop any extra workflow the employee
    // list still describes. Without this the invite page would offer an approver for a workflow the Workflows tab
    // refuses to display.
    const filteredApprovalWorkflows =
        isMultipleApproversBetaEnabled ||
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.ADVANCED ||
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL ||
        isHRAdvancedMode(policy)
            ? approvalWorkflows
            : approvalWorkflows.filter((workflow) => workflow.isDefault);

    // An "Approves to" user set above an approval limit is a custom workflow too, but it hangs off
    // `overLimitForwardsTo` instead of extending the approver chain, so counting approvers alone misses it.
    const hasOverLimitApprover = filteredApprovalWorkflows.some((workflow) => workflow.approvers.some((approver) => !!approver.overLimitForwardsTo));
    const isAdvanceApproval =
        (filteredApprovalWorkflows.length > 1 || (filteredApprovalWorkflows.at(0)?.approvers ?? []).length > 1 || hasOverLimitApprover) && isControlPolicy(policy);

    return {approvalWorkflows, filteredApprovalWorkflows, availableMembers, usedApproverEmails, isAdvanceApproval, rulesCollection, personalDetails};
}

export default useApprovalWorkflows;
