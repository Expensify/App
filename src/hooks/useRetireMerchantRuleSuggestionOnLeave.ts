import {retireMerchantRuleSuggestion} from '@libs/actions/MerchantRuleSuggestion';
import {isMerchantRuleSuggestionLive} from '@libs/MerchantRuleSuggestionUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useOnyx from './useOnyx';

/**
 * Ends the "Create a rule" offer once the user has seen it on this report and left it behind.
 *
 * This belongs to the report rather than to the callout itself. The callout mounts and unmounts whenever the layout
 * crosses the narrow breakpoint or the composer is expanded, and retiring on any of those would silence an offer the
 * user is still looking at, with no way back until they edit the expense again.
 */
function useRetireMerchantRuleSuggestionOnLeave(reportID: string | undefined) {
    const [suggestion] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION);
    const hasBeenShownRef = useRef(false);
    const isOfferedHere = !!reportID && suggestion?.reportID === reportID && isMerchantRuleSuggestionLive(suggestion);

    useEffect(() => {
        if (!isOfferedHere) {
            return;
        }
        hasBeenShownRef.current = true;
    }, [isOfferedHere]);

    useEffect(
        () => () => {
            if (!hasBeenShownRef.current) {
                return;
            }
            retireMerchantRuleSuggestion();
        },
        [],
    );
}

export default useRetireMerchantRuleSuggestionOnLeave;
