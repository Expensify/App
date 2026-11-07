import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider/types';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {TransactionCategoryGroupListItemType, TransactionMonthGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import {convertToDisplayStringWithoutCurrencyForLocale, getCurrencyDecimals} from '@libs/CurrencyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSections, getSortedTransactionData, isTransactionCategoryGroupListItemType, isTransactionMonthGroupListItemType, mapFiltersFormToLabelValueList} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type SearchResults from '@src/types/onyx/SearchResults';

import {buildTransactionRow} from '../../utils/collections/searchListItems';
import createMock from '../../utils/createMock';
import currencyList from '../currencyList.json';

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
    rules: undefined,
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
    describe.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT])('%s filter chip', (key) => {
        it.each([
            {operand: '1200.00 JPY', expected: '1,200 JPY'},
            {operand: '-12.00 JPY', expected: '-12 JPY'},
            {operand: '0.00 VND', expected: '0 VND'},
            {operand: '12.00 USD', expected: '12.00 USD'},
            {operand: '1250', expected: '12.50'},
        ])('displays $operand as $expected', ({operand, expected}) => {
            // Given a saved amount whose comparison currency determines its display precision.
            const form: Partial<SearchAdvancedFiltersForm> = {type: CONST.SEARCH.DATA_TYPES.EXPENSE, [`${key}EqualTo`]: operand};
            const formatAmount = (amount: number, currency?: string) =>
                convertToDisplayStringWithoutCurrencyForLocale(CONST.LOCALES.EN, amount, currency, (currencyCode) => getCurrencyDecimals(currencyCode, currencyList));

            // When the chip uses the same localized formatter as the currency context.
            const filters = mapFiltersFormToLabelValueList(form, new Set(), undefined, translate, undefined, localeCompare, formatAmount);

            // Then zero-decimal currencies omit fractions while USD and Any currency keep their precision.
            expect(filters).toContainEqual(expect.objectContaining({key, value: `search.filters.amount.equalTo:${expected}`}));
        });
    });

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
