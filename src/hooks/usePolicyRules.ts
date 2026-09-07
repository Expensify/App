import {filterRulesForPolicy} from '@libs/WorkflowUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

/**
 * Returns the rules scoped to a single policy.
 *
 * `GetRules` SETs the whole `rules_` collection, which holds every rule the user can see across every workspace,
 * so anything rendering rules has to narrow it down itself. Narrowing in a selector keeps a rule changing on
 * another workspace from re-rendering the caller.
 */
export default function usePolicyRules(policyID: string | undefined): OnyxCollection<Rule> {
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: (allRules: OnyxCollection<Rule>) => filterRulesForPolicy(allRules, policyID)});

    return rules;
}
