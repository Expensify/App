import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';

/**
 * Lightweight hook that returns the default search query for the Reports tab.
 * All users land on Reports > Explore > Reports (type:expense-report).
 */
function useDefaultSearchQuery(): string {
    return buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT});
}

export default useDefaultSearchQuery;
