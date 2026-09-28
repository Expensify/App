/**
 * Returns the latest error from adding a company card or its newly connected feed.
 */
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {CombinedCardFeeds, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import useOnyx from './useOnyx';

function useCompanyCardConnectionError({cardFeeds, newFeed, isAddingNewCard}: {cardFeeds?: CombinedCardFeeds; newFeed?: CompanyCardFeedWithDomainID; isAddingNewCard: boolean}) {
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const newFeedErrors = newFeed ? cardFeeds?.[newFeed]?.errors : undefined;
    const errorMessage = (isAddingNewCard ? getLatestErrorMessage(addNewCard) : '') || getLatestErrorMessage({errors: newFeedErrors});
    const hasAddNewCardError = isAddingNewCard && !isEmptyObject(addNewCard?.errors);
    const hasNewFeedError = !isEmptyObject(newFeedErrors);
    const hasError = hasAddNewCardError || hasNewFeedError;

    return {errorMessage: errorMessage || undefined, hasError, hasAddNewCardError, hasNewFeedError};
}

export default useCompanyCardConnectionError;
