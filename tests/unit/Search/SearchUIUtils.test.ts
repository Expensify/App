import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSections, getSortedTransactionData} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

import {buildTransactionRow} from '../../utils/collections/searchListItems';

const localeCompare = (a: string, b: string) => a.localeCompare(b);
const translate = (key: string) => key;
const formatPhoneNumber = (phoneNumber: string) => phoneNumber;

describe('SearchUIUtils', () => {
    it('resets grouped child queries to date-desc sorting', () => {
        const queryJSON = {
            ...buildSearchQueryJSON('type:expense'),
            groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY,
            sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
        };
        const data = {
            [`${CONST.SEARCH.GROUP_PREFIX}food`]: {
                category: 'Food',
                count: 1,
                currency: CONST.CURRENCY.USD,
                total: 100,
            },
        } as SearchResults['data'];

        const [sections] = getSections({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data,
            queryJSON,
            groupBy: queryJSON.groupBy,
            translate,
            formatPhoneNumber,
        });

        expect(sections[0].transactionsQueryJSON?.groupBy).toBeUndefined();
        expect(sections[0].transactionsQueryJSON).toMatchObject({
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        });
    });

    it('resets date-range grouped child queries to date-desc sorting', () => {
        const queryJSON = {
            ...buildSearchQueryJSON('type:expense'),
            groupBy: CONST.SEARCH.GROUP_BY.MONTH,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
            sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
        };
        const data = {
            [`${CONST.SEARCH.GROUP_PREFIX}january`]: {
                month: 1,
                year: 2024,
            },
        } as SearchResults['data'];

        const [sections] = getSections({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data,
            queryJSON,
            groupBy: queryJSON.groupBy,
            dateFnsLocale: undefined,
        });

        expect(sections[0].transactionsQueryJSON?.groupBy).toBeUndefined();
        expect(sections[0].transactionsQueryJSON).toMatchObject({
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        });
    });

    it('sorts grouped transactions newest first', () => {
        const olderTransaction = buildTransactionRow(1, 'older', {date: '2024-01-01', created: '2024-01-01'});
        const newerTransaction = buildTransactionRow(2, 'newer', {date: '2024-02-01', created: '2024-02-01'});
        const transactions = [olderTransaction, newerTransaction];

        const sortedTransactions = getSortedTransactionData(transactions, localeCompare, translate, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.SORT_ORDER.DESC);

        expect(sortedTransactions.map((transaction) => transaction.keyForList)).toEqual(['newer', 'older']);
    });
});
