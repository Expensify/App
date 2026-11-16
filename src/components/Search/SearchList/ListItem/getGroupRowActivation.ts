/**
 * Decides what activating a grouped Search row does. A click and Enter on the focused row both read it, so the two cannot drift apart.
 */
import {isCashBackWithdrawalGroup} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {TransactionGroupListItemType} from './types';

type GroupRowActivation = {
    /** Hand the row to onSelectRow, which opens the report, or toggles the row's selection in mobile selection mode */
    shouldSelect: boolean;

    /** Open or close the group's expenses */
    shouldToggle: boolean;
};

/**
 * A report group opens the report. Any other group opens or closes in place, because there is no report to navigate to.
 * A cash back row has no expenses to show, so it does nothing.
 *
 * An empty group that has no query to fetch its expenses also goes to onSelectRow, so mobile selection mode can still
 * select it even though there is nothing to expand.
 */
function getGroupRowActivation(item: TransactionGroupListItemType, searchType: SearchDataTypes | undefined): GroupRowActivation {
    if (isCashBackWithdrawalGroup(item)) {
        return {shouldSelect: false, shouldToggle: false};
    }

    if (searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return {shouldSelect: true, shouldToggle: false};
    }

    const isEmptyGroupWithoutTransactionsQuery = item.transactions.length === 0 && !item.transactionsQueryJSON;
    return {shouldSelect: isEmptyGroupWithoutTransactionsQuery, shouldToggle: true};
}

export default getGroupRowActivation;
