import getGroupRowActivation from '@components/Search/SearchList/ListItem/getGroupRowActivation';
import type {TransactionWithdrawalIDGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import {buildCategoryGroup, buildReportGroup, buildTransactionRow} from '../../utils/collections/searchListItems';
import {makeSettlementGroup} from '../../utils/ExpensifyCardStatementTestUtils';

const transactions = [buildTransactionRow(1, 'transaction_1')];

describe('getGroupRowActivation', () => {
    it('opens the report for a report group', () => {
        // Given a report group in an expense report search
        const group = buildReportGroup(1, 'report_1', transactions);

        // When the row is activated
        const activation = getGroupRowActivation(group, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

        // Then it goes to onSelectRow to open the report, and nothing expands because the report opens instead
        expect(activation).toEqual({shouldSelect: true, shouldToggle: false});
    });

    it('opens or closes a group that is not a report', () => {
        // Given a group with expenses in an expense search, which has no report to navigate to
        const group = buildCategoryGroup('Advertising', transactions);

        // When the row is activated
        const activation = getGroupRowActivation(group, CONST.SEARCH.DATA_TYPES.EXPENSE);

        // Then it only opens or closes in place
        expect(activation).toEqual({shouldSelect: false, shouldToggle: true});
    });

    it('opens or closes a lazily loaded group without selecting it', () => {
        // Given a group whose expenses have not been fetched yet but that has a query to fetch them
        const group = buildCategoryGroup('Advertising', [], buildSearchQueryJSON('type:expense category:Advertising'));

        // When the row is activated
        const activation = getGroupRowActivation(group, CONST.SEARCH.DATA_TYPES.EXPENSE);

        // Then it only toggles, because expanding it is what fetches its expenses
        expect(activation).toEqual({shouldSelect: false, shouldToggle: true});
    });

    it('selects and toggles an empty group that has no query', () => {
        // Given an empty group with nothing to fetch
        const group = buildCategoryGroup('Advertising');

        // When the row is activated
        const activation = getGroupRowActivation(group, CONST.SEARCH.DATA_TYPES.EXPENSE);

        // Then it also goes to onSelectRow, so mobile selection mode can still select it
        expect(activation).toEqual({shouldSelect: true, shouldToggle: true});
    });

    it('does nothing for a cash back row', () => {
        // Given a cash back withdrawal group, which has no expenses to show
        const group: TransactionWithdrawalIDGroupListItemType = {
            ...makeSettlementGroup({entryID: 2, count: 0, total: -2500, isCashBack: true}),
            groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
            transactions: [],
            keyForList: 'group_2',
        };

        // When the row is activated, in a search type that would otherwise toggle it
        const activation = getGroupRowActivation(group, CONST.SEARCH.DATA_TYPES.EXPENSE);

        // Then nothing happens
        expect(activation).toEqual({shouldSelect: false, shouldToggle: false});
    });

    it('does nothing for a group that is pending delete', () => {
        // Given a group deleted offline, which stays in the list until it syncs and may still be selected
        const group = {...buildCategoryGroup('Advertising', transactions), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        // When the row is activated, in a search type that would otherwise toggle it
        const activation = getGroupRowActivation(group, CONST.SEARCH.DATA_TYPES.EXPENSE);

        // Then nothing happens, because Search ignores taps and Enter on any row that is pending delete
        expect(activation).toEqual({shouldSelect: false, shouldToggle: false});
    });

    it('does nothing for a report group that is pending delete', () => {
        // Given a report deleted offline, which would otherwise open the report
        const group = {...buildReportGroup(1, 'report_1', transactions), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        // When the row is activated in an expense report search
        const activation = getGroupRowActivation(group, CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

        // Then nothing happens, because the pending delete check comes before opening the report
        expect(activation).toEqual({shouldSelect: false, shouldToggle: false});
    });
});
