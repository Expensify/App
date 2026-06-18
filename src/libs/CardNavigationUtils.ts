import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import Navigation from './Navigation/Navigation';
import {buildCannedSearchQuery} from './SearchQueryUtils';

function navigateToCardTransactions(cardID: string) {
    Navigation.navigate(
        ROUTES.SEARCH_ROOT.getRoute({
            query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL, cardID}),
        }),
    );
}

export default navigateToCardTransactions;
