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
export {navigateToFeedTransactions};
