import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import Navigation from './Navigation/Navigation';
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues} from './SearchQueryUtils';

function navigateToCardTransactions(cardID: string) {
    Navigation.navigate(
        ROUTES.SEARCH_ROOT.getRoute({
            query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE, cardID}),
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
        }),
    );
}

/** Builds the Spend search for the card expenses deleted when their cards are unassigned. */
function getUnsubmittedCardTransactionsRoute(cardIDs: number[]) {
    if (cardIDs.length === 0) {
        return undefined;
    }

    return ROUTES.SEARCH_ROOT.getRoute({
        query: buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED, CONST.SEARCH.STATUS.EXPENSE.DRAFTS],
            cardID: cardIDs.map(String),
        }),
        searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    });
}

/**
 * Opens every expense on a card feed, including the ones on cards that are no longer assigned. No withdrawal status
 * filter is applied because, unlike the Expensify Card link, this is not scoped to a balance.
 *
 * @param feedKey the feed as the Search `feed` filter identifies it, `<fundID>_<feed>`
 */
function navigateToFeedTransactions(feedKey: string) {
    Navigation.navigate(
        ROUTES.SEARCH_ROOT.getRoute({
            query: buildQueryStringFromFilterFormValues({type: CONST.SEARCH.DATA_TYPES.EXPENSE, feed: [feedKey]}),
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
        }),
    );
}

export default navigateToCardTransactions;
export {getUnsubmittedCardTransactionsRoute, navigateToFeedTransactions};
