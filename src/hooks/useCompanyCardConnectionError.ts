/**
 * Returns the latest error from adding a company card or its newly connected feed.
 */
import useCardFeeds from '@hooks/useCardFeeds';
import useOnyx from '@hooks/useOnyx';

import {getLatestErrorMessage} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

function useCompanyCardConnectionError({policyID, newFeed}: {policyID?: string; newFeed?: CompanyCardFeedWithDomainID}) {
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [cardFeeds] = useCardFeeds(policyID);
    const errorMessage = getLatestErrorMessage(addNewCard) || getLatestErrorMessage(newFeed ? cardFeeds?.[newFeed] : undefined);

    return {errorMessage: errorMessage || undefined, hasError: !!errorMessage};
}

export default useCompanyCardConnectionError;
