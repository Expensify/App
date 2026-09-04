/**
 * Returns the latest error from adding a company card or its newly connected feed.
 */
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import useCardFeeds from './useCardFeeds';
import useOnyx from './useOnyx';

function useCompanyCardConnectionError({policyID, newFeed, isAddingNewCard}: {policyID?: string; newFeed?: CompanyCardFeedWithDomainID; isAddingNewCard: boolean}) {
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [cardFeeds] = useCardFeeds(policyID);
    const newFeedErrors = newFeed ? cardFeeds?.[newFeed]?.errors : undefined;
    const errorMessage = (isAddingNewCard ? getLatestErrorMessage(addNewCard) : '') || getLatestErrorMessage({errors: newFeedErrors});
    const hasError = (isAddingNewCard && !isEmptyObject(addNewCard?.errors)) || !isEmptyObject(newFeedErrors);

    return {errorMessage: errorMessage || undefined, hasError};
}

export default useCompanyCardConnectionError;
