/**
 * Reads backend-served agent templates from Onyx for the add-agent Suggestions.
 */
import ONYXKEYS from '@src/ONYXKEYS';
import type SuggestedAgent from '@src/types/onyx/SuggestedAgent';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import useOnyx from './useOnyx';

type UseSuggestedAgentsResult = {
    /** Agent templates from Onyx, or an empty array while loading or when no templates exist */
    data: SuggestedAgent[];

    /** Whether Onyx is hydrating or the templates request is fetching data */
    isLoading: boolean;
};

function useSuggestedAgents(): UseSuggestedAgentsResult {
    const [suggestions, metadata] = useOnyx(ONYXKEYS.AGENT_TEMPLATES);
    const [isFetchingTemplates = true] = useOnyx(ONYXKEYS.IS_LOADING_AGENT_TEMPLATES);
    const isLoading = isLoadingOnyxValue(metadata) || isFetchingTemplates;

    return {
        data: suggestions ?? [],
        isLoading,
    };
}

export default useSuggestedAgents;
