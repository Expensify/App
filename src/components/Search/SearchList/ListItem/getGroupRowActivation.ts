import {isCashBackWithdrawalGroup} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {TransactionGroupListItemType} from './types';

type GroupRowActivation = {
    /** Pass the row to onSelectRow */
    shouldSelect: boolean;

    /** Open or close the group's expenses */
    shouldToggle: boolean;
};

/**
 * A report group opens the report, any other group opens or closes in place, and a cash back row has nothing to show.
 * An empty group with nothing to fetch also goes to onSelectRow, so selection mode can still select it.
 * A group that is pending delete does nothing, like any other Search row that is pending delete.
 */
function getGroupRowActivation(item: TransactionGroupListItemType, searchType: SearchDataTypes | undefined): GroupRowActivation {
    if (isCashBackWithdrawalGroup(item) || item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        return {shouldSelect: false, shouldToggle: false};
    }

    if (searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
        return {shouldSelect: true, shouldToggle: false};
    }

    const isEmptyGroupWithoutTransactionsQuery = item.transactions.length === 0 && !item.transactionsQueryJSON;
    return {shouldSelect: isEmptyGroupWithoutTransactionsQuery, shouldToggle: true};
}

export default getGroupRowActivation;
