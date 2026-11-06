import {hasApprovalWorkflowRules, shouldUseApprovalWorkflowRules} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/**
 * Whether the policy's approval workflows are read from and saved as approval workflow rules, see `shouldUseApprovalWorkflowRules`.
 * The rules read goes through a selector that reduces them to whether the policy has any, so a consumer only re-renders when that changes.
 */
function useShouldUseApprovalWorkflowRules(policy: OnyxEntry<Policy>): boolean {
    const {isBetaEnabled} = usePermissions();
    const policyID = policy?.id;
    const [hasRules = false] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: (rules: OnyxCollection<Rule>) => hasApprovalWorkflowRules(rules, policyID)});

    return shouldUseApprovalWorkflowRules(policy, hasRules, isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS));
}

export default useShouldUseApprovalWorkflowRules;
