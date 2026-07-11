/**
 * Reads backend-served suggested agent rules from Onyx for the add-agent-rule Suggestions tab.
 */
import ONYXKEYS from '@src/ONYXKEYS';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import useOnyx from './useOnyx';

type UseSuggestedAgentRulesResult = {
    /** Suggested rules from Onyx, or an empty array while loading or when no suggestion exist */
    data: SuggestedAgentRule[];

    /** Whether the Onyx key is loading */
    isLoading: boolean;
};

function useSuggestedAgentRules(): UseSuggestedAgentRulesResult {
    const [suggestions, metadata] = useOnyx(ONYXKEYS.AGENT_RULE_SUGGESTIONS);
    const isLoading = isLoadingOnyxValue(metadata);

    return {
        data: suggestions ?? [],
        isLoading,
    };
}

export default useSuggestedAgentRules;
export type {UseSuggestedAgentRulesResult};
