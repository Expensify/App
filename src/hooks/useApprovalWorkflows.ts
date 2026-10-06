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
import {useAllPersonalDetails} from './usePersonalDetails';

type UseApprovalWorkflowsResult = {
    /** Every approval workflow the workspace's data describes, derived from the policy employees or the approval-workflow rules */
    approvalWorkflows: ApprovalWorkflow[];

    /** The subset of `approvalWorkflows` the Workflows tab displays: only the default workflow unless the workspace uses advanced approvals */
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

    const filteredApprovalWorkflows =
        isMultipleApproversBetaEnabled ||
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.ADVANCED ||
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL ||
        isHRAdvancedMode(policy)
            ? approvalWorkflows
            : approvalWorkflows.filter((workflow) => workflow.isDefault);

    return {approvalWorkflows, filteredApprovalWorkflows, availableMembers, usedApproverEmails, isAdvanceApproval, rulesCollection, personalDetails};
}

export default useApprovalWorkflows;
