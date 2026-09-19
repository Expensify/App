import {isDirectFeed} from '@libs/CardUtils';

import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CardFeedErrorState} from '@src/types/onyx/DerivedValues';

/**
 * Whether to surface the broken card-feed connection error on the Company Cards page.
 *
 * A broken card-level scrape connection can only be fixed by logging into a bank on direct
 * OAuth/Plaid feeds, so commercial and other file-based feeds don't surface that error unless
 * the feed itself has errors. `hasFeedConnectionIssue` covers the statuses `isFeedConnectionBroken`
 * ignores, such as 434, because the wallet sends those cards here to be fixed.
 */
function getShouldShowBrokenConnectionError(feedName: CompanyCardFeedWithDomainID, feedErrors: CardFeedErrorState | undefined): boolean {
    const hasConnectionToFix = !!feedErrors?.isFeedConnectionBroken || !!feedErrors?.hasFeedConnectionIssue;
    return (hasConnectionToFix && isDirectFeed(feedName)) || !!feedErrors?.hasFeedErrors;
}

export default getShouldShowBrokenConnectionError;
