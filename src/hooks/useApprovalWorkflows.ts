import {isControlPolicy} from '@libs/PolicyUtils';
import {convertApprovalWorkflowRulesToWorkflows, convertPolicyEmployeesToApprovalWorkflows, filterRulesForPolicy, getApprovalWorkflowRulesForPolicy} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {Member} from '@src/types/onyx/ApprovalWorkflow';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type UseApprovalWorkflowsResult = {
    /** The workspace's approval workflows, derived from the policy employees or the approval-workflow rules */
    approvalWorkflows: ApprovalWorkflow[];

    /** List of available members that can be selected in a workflow */
    availableMembers: Member[];

    /** Emails that are already used as approvers in the configured workflows */
    usedApproverEmails: string[];

    /** Whether the workspace has a custom (advanced) approval workflow on top of the default one */
    isAdvanceApproval: boolean;
};

/**
 * Derives a workspace's approval workflows from the source of truth (the policy employees, or the
 * approval-workflow rules when the `MULTIPLE_APPROVERS` beta is on) and reports whether the workspace actually
 * has a custom (advanced) approval workflow.
 *
 * Prefer `isAdvanceApproval` over reading `policy.approvalMode === ADVANCED`: the stored flag is written
 * optimistically by many code paths and drifts from the real workflow structure, so it can say ADVANCED for a
 * workspace with no custom workflow (e.g. right after an upgrade) and stay BASIC for one that has several.
 */
function useApprovalWorkflows(policy: OnyxEntry<Policy>, policyID: string | undefined, firstApprover?: string): UseApprovalWorkflowsResult {
    const {localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [rulesCollection] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: (rules: OnyxCollection<Rule>) => filterRulesForPolicy(rules, policyID)});

    const params = {
        policy,
        personalDetails: personalDetails ?? {},
        firstApprover,
        localeCompare,
        currentUserLogin,
        rules: getApprovalWorkflowRulesForPolicy(rulesCollection, policyID),
    };
    const {approvalWorkflows, availableMembers, usedApproverEmails} = isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS)
        ? convertApprovalWorkflowRulesToWorkflows(params)
        : convertPolicyEmployeesToApprovalWorkflows(params);

    const isAdvanceApproval = (approvalWorkflows.length > 1 || (approvalWorkflows.at(0)?.approvers ?? []).length > 1) && isControlPolicy(policy);

    return {approvalWorkflows, availableMembers, usedApproverEmails, isAdvanceApproval};
}

export default useApprovalWorkflows;
