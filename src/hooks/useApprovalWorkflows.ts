import {convertApprovalWorkflowRulesToWorkflows, convertPolicyEmployeesToApprovalWorkflows, filterRulesForPolicy, getApprovalWorkflowRulesForPolicy} from '@libs/WorkflowUtils';
import type {PolicyConversionResult} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useCallback, useMemo} from 'react';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

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
    const policyRulesSelector = useCallback((rules: OnyxCollection<Rule>) => filterRulesForPolicy(rules, policyID), [policyID]);
    const [rulesCollection] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: policyRulesSelector});

    const isMultipleApproversBetaEnabled = isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);

    return useMemo(() => {
        const params = {
            policy,
            personalDetails: personalDetails ?? {},
            localeCompare,
            firstApprover,
            currentUserLogin,
            rules: getApprovalWorkflowRulesForPolicy(rulesCollection, policyID),
        };
        return isMultipleApproversBetaEnabled ? convertApprovalWorkflowRulesToWorkflows(params) : convertPolicyEmployeesToApprovalWorkflows(params);
    }, [policy, personalDetails, localeCompare, firstApprover, currentUserLogin, rulesCollection, policyID, isMultipleApproversBetaEnabled]);
}

export default useApprovalWorkflows;
