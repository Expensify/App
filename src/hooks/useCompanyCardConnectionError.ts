/**
 * Returns the latest error from adding a company card or its newly connected feed.
 */
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import type {AddNewCompanyCardFeed, CombinedCardFeeds, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

function useCompanyCardConnectionError({
    cardFeeds,
    addNewCard,
    newFeed,
    isAddingNewCard,
}: {
    cardFeeds?: CombinedCardFeeds;
    addNewCard?: OnyxEntry<AddNewCompanyCardFeed>;
    newFeed?: CompanyCardFeedWithDomainID;
    isAddingNewCard: boolean;
}) {
    const newFeedErrors = newFeed ? cardFeeds?.[newFeed]?.errors : undefined;
    const errorMessage = (isAddingNewCard ? getLatestErrorMessage(addNewCard) : '') || getLatestErrorMessage({errors: newFeedErrors});
    const hasAddNewCardError = isAddingNewCard && !isEmptyObject(addNewCard?.errors);
    const hasNewFeedError = !isEmptyObject(newFeedErrors);
    const hasError = hasAddNewCardError || hasNewFeedError;

    return {errorMessage: errorMessage || undefined, hasError};
}

export default useCompanyCardConnectionError;
