import {retireMerchantRuleSuggestion} from '@libs/actions/MerchantRuleSuggestion';
import {isMerchantRuleSuggestionLive} from '@libs/MerchantRuleSuggestionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef} from 'react';

import useOnyx from './useOnyx';

const selectLiveSeenInReportID = (suggestion: OnyxEntry<MerchantRuleSuggestion>) => (isMerchantRuleSuggestionLive(suggestion) ? suggestion?.seenInReportID : undefined);

/**
 * Ends the "Create a rule" offer once the user has seen it and left the report showing it.
 *
 * Owned by the report, not the callout: the callout unmounts whenever the layout crosses the narrow breakpoint or the
 * composer expands, and retiring on those would silence an offer the user is still looking at.
 *
 * @param reportID - the report this list belongs to, matched against the one the callout recorded itself in
 */
function useRetireMerchantRuleSuggestionOnLeave(reportID: string | undefined) {
    // Selected down to the one field this needs. The report actions list hosting this hook re-renders often, and
    // subscribing to the whole record would wake it on every write the feature makes, in every report.
    //
    // Tracks the live value rather than latching, so an offer dismissed on the way out is not retired as well.
    const [liveSeenInReportID] = useOnyx(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {selector: selectLiveSeenInReportID});
    const hasBeenSeenRef = useRef(false);

    // Compared against this report rather than taken as a bare flag. Several report screens stay mounted at once, in a
    // split pane or behind an RHP, and every one of them runs this hook. Without the match, any of them unmounting
    // would retire an offer the user is still looking at somewhere else.
    //
    // The callout reports which report it rendered in, because the report cannot tell: an expense report holding a
    // single expense renders the detail view under its own reportID, not the transaction thread's.
    useEffect(() => {
        hasBeenSeenRef.current = !!reportID && liveSeenInReportID === reportID;
    }, [liveSeenInReportID, reportID]);

    useEffect(
        () => () => {
            if (!hasBeenSeenRef.current) {
                return;
            }
            retireMerchantRuleSuggestion();
        },
        [],
    );
}

export default useRetireMerchantRuleSuggestionOnLeave;
