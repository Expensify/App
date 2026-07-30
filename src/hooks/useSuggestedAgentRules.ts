/**
 * Reads backend-served suggested agent rules from Onyx for the add-agent-rule Suggestions tab.
 */
import ONYXKEYS from '@src/ONYXKEYS';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import useOnyx from './useOnyx';

type UseSuggestedAgentRulesResult = {
    /** Suggested rules from Onyx, or an empty array while loading or when no suggestions exist */
    data: SuggestedAgentRule[];

    /** Whether Onyx is hydrating or the suggestions request is fetching data */
    isLoading: boolean;
};

function useSuggestedAgentRules(): UseSuggestedAgentRulesResult {
    const [suggestions, metadata] = useOnyx(ONYXKEYS.AGENT_RULE_SUGGESTIONS);
    const [isFetchingSuggestions] = useOnyx(ONYXKEYS.IS_LOADING_AGENT_RULE_SUGGESTIONS);
    const isLoading = isLoadingOnyxValue(metadata) || !!isFetchingSuggestions;

    return {
        data: suggestions ?? [],
        isLoading,
    };
}

export default useSuggestedAgentRules;
