import {
    convertApprovalWorkflowRulesToWorkflows,
    convertPolicyEmployeesToApprovalWorkflows,
    filterRulesForPolicy,
    getApprovalWorkflowRulesForPolicy,
    getEnforcedApprovalWorkflowsForMembers,
} from '@libs/WorkflowUtils';
import type {PolicyConversionResult} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PersonalDetailsList} from '@src/types/onyx';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useMemo} from 'react';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

const policyRulesSelector = (policyID: string | undefined) => (rules: OnyxCollection<Rule>) => filterRulesForPolicy(rules, policyID);

type UseApprovalWorkflowsParams = {
    /** Policy to derive the approval workflows from */
    policy: OnyxEntry<Policy>;

    /** Personal details of all users, already in scope on every current call site */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** Current user's login, used to decide whether Expensify team members are filtered out */
    currentUserLogin?: string;
};

type UseApprovalWorkflowsResult = PolicyConversionResult & {
    /**
     * The workflows the workspace's approval mode actually enforces, with every member on the workflow that governs
     * them. Read this wherever a member's approver is surfaced, so a workflow the workspace has stopped enforcing
     * isn't presented as if it still applied.
     */
    enforcedApprovalWorkflows: ApprovalWorkflow[];
};

/** Derives the policy's approval workflows, from rules or from `employeeList` depending on the `MULTIPLE_APPROVERS` beta. */
function useApprovalWorkflows({policy, personalDetails, currentUserLogin}: UseApprovalWorkflowsParams): UseApprovalWorkflowsResult {
    const {localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const policyID = policy?.id;
    const isMultipleApproversBetaEnabled = isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);

    // `rules` is resolved inside the beta branch below, so the collection is not traversed on the default path.
    // Memoized because `policyRulesSelector` is a factory, so calling it inline would hand `useOnyx` a new selector
    // on every render.
    const rulesSelector = useMemo(() => policyRulesSelector(policyID), [policyID]);
    const [rulesCollection] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: rulesSelector});

    const params = {policy, personalDetails: personalDetails ?? {}, localeCompare, currentUserLogin};

    const result = isMultipleApproversBetaEnabled
        ? convertApprovalWorkflowRulesToWorkflows({...params, rules: getApprovalWorkflowRulesForPolicy(rulesCollection, policyID)})
        : convertPolicyEmployeesToApprovalWorkflows(params);

    return {...result, enforcedApprovalWorkflows: getEnforcedApprovalWorkflowsForMembers(result.approvalWorkflows, policy, isMultipleApproversBetaEnabled)};
}

export default useApprovalWorkflows;
