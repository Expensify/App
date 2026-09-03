import {convertApprovalWorkflowRulesToWorkflows, convertPolicyEmployeesToApprovalWorkflows, filterRulesForPolicy, getApprovalWorkflowRulesForPolicy} from '@libs/WorkflowUtils';
import type {PolicyConversionResult} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

const policyRulesSelector = (policyID: string | undefined) => (rules: OnyxCollection<Rule>) => filterRulesForPolicy(rules, policyID);

type UseApprovalWorkflowsParams = {
    /** Policy to derive the approval workflows from */
    policy: OnyxEntry<Policy>;

    /** Email of the first approver in the currently edited workflow */
    firstApprover?: string;

    /** Current user's login, used to decide whether Expensify team members are filtered out */
    currentUserLogin?: string;
};

/** Derives the policy's approval workflows, from rules or from `employeeList` depending on the `MULTIPLE_APPROVERS` beta. */
function useApprovalWorkflows({policy, firstApprover, currentUserLogin}: UseApprovalWorkflowsParams): PolicyConversionResult {
    const {localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const policyID = policy?.id;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [rulesCollection] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: policyRulesSelector(policyID)});

    const params = {policy, personalDetails: personalDetails ?? {}, localeCompare, firstApprover, currentUserLogin};

    // Only the rules converter reads `rules`, so the collection is not traversed on the default path.
    if (!isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS)) {
        return convertPolicyEmployeesToApprovalWorkflows(params);
    }

    return convertApprovalWorkflowRulesToWorkflows({...params, rules: getApprovalWorkflowRulesForPolicy(rulesCollection, policyID)});
}

export default useApprovalWorkflows;
