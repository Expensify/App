import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider/types';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {TransactionCategoryGroupListItemType, TransactionMonthGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSections, getSortedTransactionData, isTransactionCategoryGroupListItemType, isTransactionMonthGroupListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type SearchResults from '@src/types/onyx/SearchResults';

import {buildTransactionRow} from '../../utils/collections/searchListItems';
import createMock from '../../utils/createMock';

const localeCompare = (a: string, b: string) => a.localeCompare(b);
const translate: LocalizedTranslate = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>) => {
    return parameters.length ? `${path}:${String(parameters.at(0))}` : path;
};
const formatPhoneNumber: LocaleContextProps['formatPhoneNumber'] = (phoneNumber) => phoneNumber;
const convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'] = (amount) => String(amount);

const baseGetSectionsParams = {
    currentAccountID: 1,
    currentUserEmail: '',
    bankAccountList: undefined,
    conciergeReportID: undefined,
    convertToDisplayString,
    reportAttributesDerivedValue: undefined,
};

const buildGroupedQueryJSON = (groupBy: SearchQueryJSON['groupBy'], sortBy: SearchQueryJSON['sortBy']): SearchQueryJSON => {
    const queryJSON = buildSearchQueryJSON('type:expense');
    if (!queryJSON) {
        throw new Error('Expected expense query to parse');
    }
    return {...queryJSON, groupBy, sortBy, sortOrder: CONST.SEARCH.SORT_ORDER.ASC};
};

describe('SearchUIUtils', () => {
    it('resets grouped child queries to date-desc sorting', () => {
        const queryJSON = buildGroupedQueryJSON(CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY);
        const data = createMock<SearchResults['data']>({});
        data[`${CONST.SEARCH.GROUP_PREFIX}food`] = {category: 'Food', count: 1, currency: CONST.CURRENCY.USD, total: 100};

        const [sections] = getSections({
            ...baseGetSectionsParams,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data,
            queryJSON,
            groupBy: queryJSON.groupBy,
            dateFnsLocale: undefined,
            translate,
            formatPhoneNumber,
        });

        if (!isTransactionCategoryGroupListItemType(sections[0])) {
            throw new Error('Expected category group section');
        }
        const categorySection: TransactionCategoryGroupListItemType = sections[0];
        expect(categorySection.transactionsQueryJSON?.groupBy).toBeUndefined();
        expect(categorySection.transactionsQueryJSON).toMatchObject({
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        });
    });

    it('resets date-range grouped child queries to date-desc sorting', () => {
        const queryJSON = buildGroupedQueryJSON(CONST.SEARCH.GROUP_BY.MONTH, CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH);
        const data = createMock<SearchResults['data']>({});
        data[`${CONST.SEARCH.GROUP_PREFIX}january`] = {month: 1, year: 2024, count: 1, total: 100, currency: CONST.CURRENCY.USD};

        const [sections] = getSections({
            ...baseGetSectionsParams,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data,
            queryJSON,
            groupBy: queryJSON.groupBy,
            dateFnsLocale: undefined,
            translate,
            formatPhoneNumber,
        });

        if (!isTransactionMonthGroupListItemType(sections[0])) {
            throw new Error('Expected month group section');
        }
        const monthSection: TransactionMonthGroupListItemType = sections[0];
        expect(monthSection.transactionsQueryJSON?.groupBy).toBeUndefined();
        expect(monthSection.transactionsQueryJSON).toMatchObject({
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
