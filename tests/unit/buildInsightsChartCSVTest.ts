import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {GroupedItem} from '@components/Search/types';

import {translate as translatePhrase} from '@libs/Localize';

import buildInsightsChartCSV from '@pages/Insights/buildInsightsChartCSV';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

const translate: LocalizedTranslate = (key, ...parameters) => translatePhrase(CONST.LOCALES.EN, key, ...parameters);
const getCurrencyDecimals = (currency: string) => (currency === 'JPY' ? 0 : 2);
const GROUP_FIELDS = {keyForList: 'group_test', count: 2, total: 12345, currency: CONST.CURRENCY.USD, transactions: []};

const TIME_GROUPS: Array<{item: GroupedItem; start: string; end: string; dates: string[]}> = [
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.DAY, day: '2026-01-02', formattedDay: 'Jan 2', shortFormattedDay: '2', lineChartFormattedDay: 'Jan 2'},
        start: '2026-01-01',
        end: '2026-01-03',
        dates: ['2026-01-01', '2026-01-02', '2026-01-03'],
    },
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.WEEK, week: '2026-01-04', formattedWeek: 'Jan 4–10', shortFormattedWeek: 'Jan 4–10', lineChartFormattedWeek: 'Jan 4'},
        start: '2026-01-01',
        end: '2026-01-11',
        dates: ['2025-12-28', '2026-01-04', '2026-01-11'],
    },
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MONTH, year: 2026, month: 2, formattedMonth: 'February 2026', shortFormattedMonth: 'Feb', sortKey: 202602},
        start: '2026-01-15',
        end: '2026-03-15',
        dates: ['2026-01-01', '2026-02-01', '2026-03-01'],
    },
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.QUARTER, year: 2026, quarter: 2, formattedQuarter: 'Q2 2026', shortFormattedQuarter: 'Q2', sortKey: 20262},
        start: '2026-02-01',
        end: '2026-08-01',
        dates: ['2026-01-01', '2026-04-01', '2026-07-01'],
    },
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.YEAR, year: 2026, formattedYear: '2026', sortKey: 2026},
        start: '2025-06-01',
        end: '2027-06-01',
        dates: ['2025-01-01', '2026-01-01', '2027-01-01'],
    },
];

describe('buildInsightsChartCSV', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
        await IntlStore.load(CONST.LOCALES.FR);
    });

    it.each(TIME_GROUPS)('includes empty $item.groupedBy periods across the selected range', ({item, start, end, dates}) => {
        // Given a filtered time range with spend only in its middle period
        const data = [item];

        // When the loaded groups are exported without fetching their expenses
        const csv = buildInsightsChartCSV({data, groupBy: item.groupedBy, dateRange: {start, end}, currency: CONST.CURRENCY.USD, getCurrencyDecimals, translate});

        // Then partial boundary periods and empty periods remain in chronological order
        expect(csv).toBe(`\uFEFFDate,Expenses,Total,Currency\r\n${dates.at(0)},0,0.00,USD\r\n${dates.at(1)},2,123.45,USD\r\n${dates.at(2)},0,0.00,USD`);
    });

    it('exports only the supplied ranking groups in chart order', () => {
        // Given the ranking rows the chart plots, rather than their individual expenses
        const data: GroupedItem[] = [
            {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant: 'Café', formattedMerchant: 'Café'},
            {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant: 'Refund', formattedMerchant: 'Refund', total: -150, count: 1},
        ];

        // When the ranking is exported for a date range that includes empty days
        const csv = buildInsightsChartCSV({
            data,
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            dateRange: {start: '2026-01-01', end: '2026-01-03'},
            currency: CONST.CURRENCY.USD,
            getCurrencyDecimals,
            translate,
        });

        // Then no empty ranking groups or expense rows are added, and refunds stay numeric
        expect(csv).toBe('\uFEFFMerchant,Expenses,Total,Currency\r\nCafé,2,123.45,USD\r\nRefund,1,-1.50,USD');
    });

    it('escapes labels and prevents spreadsheet formulas without changing numeric totals', () => {
        // Given merchant names containing CSV delimiters, line breaks and formula prefixes
        const names = ['Shop, "Central"\nBranch', '=1+1', ' @SUM(A1:A2)'];
        const data: GroupedItem[] = names.map((merchant) => ({...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant, formattedMerchant: merchant}));

        // When user-controlled names are written into the spreadsheet
        const csv = buildInsightsChartCSV({data, groupBy: CONST.SEARCH.GROUP_BY.MERCHANT, dateRange: {}, currency: CONST.CURRENCY.USD, getCurrencyDecimals, translate});

        // Then each name stays in one cell and cannot execute as a formula
        expect(csv).toBe('\uFEFFMerchant,Expenses,Total,Currency\r\n"Shop, ""Central""\nBranch",2,123.45,USD\r\n\'=1+1,2,123.45,USD\r\n\' @SUM(A1:A2),2,123.45,USD');
    });

    it('uses the group currency precision and localized category header', () => {
        // Given a category chart converted to a currency without decimal places
        const data: GroupedItem[] = [{...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY, category: 'Travel', formattedCategory: 'Travel', currency: 'JPY'}];
        const translateFrench: LocalizedTranslate = (key, ...parameters) => translatePhrase(CONST.LOCALES.FR, key, ...parameters);

        // When its grouped totals are exported
        const csv = buildInsightsChartCSV({data, groupBy: CONST.SEARCH.GROUP_BY.CATEGORY, dateRange: {}, currency: 'JPY', getCurrencyDecimals, translate: translateFrench});

        // Then amounts use currency precision, without symbols or thousands separators
        expect(csv).toBe(
            `\uFEFF${translateFrench('common.category')},${translateFrench('common.expenses')},${translateFrench('common.total')},${translateFrench('common.currency')}\r\nTravel,2,123,JPY`,
        );
    });

    it('exports the same full submitter names shown in the graph', () => {
        // Given a submitter group with a resolved display name
        const data: GroupedItem[] = [{...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.FROM, accountID: 1, formattedFrom: 'Alex Smith'}];

        // When the chart is exported
        const csv = buildInsightsChartCSV({data, groupBy: CONST.SEARCH.GROUP_BY.FROM, dateRange: {}, currency: CONST.CURRENCY.USD, getCurrencyDecimals, translate});

        // Then the CSV names the person rather than exposing only their internal account ID
        expect(csv).toBe('\uFEFFFrom,Expenses,Total,Currency\r\nAlex Smith,2,123.45,USD');
    });
});
