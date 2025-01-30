import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {clearAllFilters} from './actions/Search';
import Navigation from './Navigation/Navigation';
import {buildCannedSearchQuery} from './SearchQueryUtils';

function viewCardTransactions(cardID: string) {
    clearAllFilters();
    Navigation.dismissModal();
    Navigation.navigate(
        ROUTES.SEARCH_CENTRAL_PANE.getRoute({
            query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL, cardID}),
        }),
    );
}

// eslint-disable-next-line import/prefer-default-export
export {viewCardTransactions};
