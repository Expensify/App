import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {GroupedItem} from '@components/Search/types';

import {translate as translatePhrase} from '@libs/Localize';

import buildInsightsChartCSV from '@pages/Insights/buildInsightsChartCSV';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

const translate: LocalizedTranslate = (key, ...parameters) => translatePhrase(CONST.LOCALES.EN, key, ...parameters);
const getCurrencyDecimals = (currency: string) => (currency === 'JPY' ? 0 : 2);
/** A today after every exported period, so none counts as after today */
const AFTER_EVERY_PERIOD = '2030-01-01';
const GROUP_FIELDS = {keyForList: 'group_test', count: 2, total: 12345, currency: CONST.CURRENCY.USD, transactions: []};

const TIME_GROUPS: Array<{item: GroupedItem; date: string}> = [
    {item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.DAY, day: '2026-01-02', formattedDay: 'Jan 2', shortFormattedDay: '2', lineChartFormattedDay: 'Jan 2'}, date: '2026-01-02'},
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.WEEK, week: '2026-01-04', formattedWeek: 'Jan 4–10', shortFormattedWeek: 'Jan 4–10', lineChartFormattedWeek: 'Jan 4'},
        date: '2026-01-04',
    },
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MONTH, year: 2026, month: 2, formattedMonth: 'February 2026', shortFormattedMonth: 'Feb', sortKey: 202602},
        date: '2026-02-01',
    },
    {
        item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.QUARTER, year: 2026, quarter: 2, formattedQuarter: 'Q2 2026', shortFormattedQuarter: 'Q2', sortKey: 20262},
        date: '2026-04-01',
    },
    {item: {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.YEAR, year: 2026, formattedYear: '2026', sortKey: 2026}, date: '2026-01-01'},
];

function quarterGroup(year: number, quarter: number, count: number): GroupedItem {
    return {
        ...GROUP_FIELDS,
        groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
        year,
        quarter,
        formattedQuarter: `Q${quarter} ${year}`,
        shortFormattedQuarter: `Q${quarter}`,
        sortKey: year * 10 + quarter,
        keyForList: `quarter_${year}_${quarter}`,
        count,
        total: count ? GROUP_FIELDS.total : 0,
    };
}

/** Exports quarters as of October 28, 2026 */
function exportQuarters(data: GroupedItem[], shouldShowRunningTotal = false) {
    return buildInsightsChartCSV({data, groupBy: CONST.SEARCH.GROUP_BY.QUARTER, currency: CONST.CURRENCY.USD, getCurrencyDecimals, translate, today: '2026-10-28', shouldShowRunningTotal});
}

describe('buildInsightsChartCSV', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
        await IntlStore.load(CONST.LOCALES.FR);
    });

    it.each(TIME_GROUPS)('names $item.groupedBy rows by the date their period starts', ({item, date}) => {
        // Given a time group the chart plots
        const data = [item];

        // When it is exported
        const csv = buildInsightsChartCSV({data, groupBy: item.groupedBy, currency: CONST.CURRENCY.USD, getCurrencyDecimals, translate, today: AFTER_EVERY_PERIOD});

        // Then its row is named by a date a spreadsheet can sort, rather than by its display label
        expect(csv).toBe(`\uFEFFDate,Expenses,Total,Currency\r\n${date},2,123.45,USD`);
    });

    it('exports the empty periods up to today as the chart plots them', () => {
        // Given an empty Q1, a Q2 with expenses and an empty Q3, all before today
        const data = [quarterGroup(2026, 1, 0), quarterGroup(2026, 2, 2), quarterGroup(2026, 3, 0)];

        // When the quarters are exported
        const csv = exportQuarters(data);

        // Then the empty quarters stay as $0 rows, like the chart's $0 points
        expect(csv).toBe('\uFEFFDate,Expenses,Total,Currency\r\n2026-01-01,0,0.00,USD\r\n2026-04-01,2,123.45,USD\r\n2026-07-01,0,0.00,USD');
    });

    it('leaves out the empty periods after today that no period with expenses comes after', () => {
        // Given Q4 in progress, followed by two quarters of next year with no expenses yet
        const data = [quarterGroup(2026, 4, 2), quarterGroup(2027, 1, 0), quarterGroup(2027, 2, 0)];

        // When the quarters are exported
        const csv = exportQuarters(data);

        // Then the export ends at Q4, where the chart's line ends
        expect(csv).toBe('\uFEFFDate,Expenses,Total,Currency\r\n2026-10-01,2,123.45,USD');
    });

    it('leaves out the empty periods after today from a running total', () => {
        // Given Q3 and Q4 with expenses, followed by a quarter of next year with no expenses yet
        const data = [quarterGroup(2026, 3, 2), quarterGroup(2026, 4, 2), quarterGroup(2027, 1, 0)];

        // When the quarters are exported as a running total, whose counts carry earlier expenses forward
        const csv = exportQuarters(data, true);

        // Then the export ends at Q4 with the totals so far, where the chart's line ends
        expect(csv).toBe('\uFEFFDate,Expenses,Total,Currency\r\n2026-07-01,2,123.45,USD\r\n2026-10-01,4,246.90,USD');
    });

    it('keeps an empty period after today that comes before a period with expenses', () => {
        // Given an empty Q1 of next year followed by a Q2 holding future-dated expenses
        const data = [quarterGroup(2026, 4, 2), quarterGroup(2027, 1, 0), quarterGroup(2027, 2, 2)];

        // When the quarters are exported
        const csv = exportQuarters(data);

        // Then Q1 stays as a $0 row, since the chart's line passes through it
        expect(csv).toBe('\uFEFFDate,Expenses,Total,Currency\r\n2026-10-01,2,123.45,USD\r\n2027-01-01,0,0.00,USD\r\n2027-04-01,2,123.45,USD');
    });

    it('exports only the supplied ranking groups in chart order', () => {
        // Given the ranking rows the chart plots, rather than their individual expenses
        const data: GroupedItem[] = [
            {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant: 'Café', formattedMerchant: 'Café'},
            {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant: 'Refund', formattedMerchant: 'Refund', total: -150, count: 1},
        ];

        // When the ranking is exported
        const csv = buildInsightsChartCSV({
            data,
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            currency: CONST.CURRENCY.USD,
            getCurrencyDecimals,
            translate,
            today: AFTER_EVERY_PERIOD,
        });

        // Then no empty ranking groups or expense rows are added, and refunds stay numeric
        expect(csv).toBe('\uFEFFMerchant,Expenses,Total,Currency\r\nCafé,2,123.45,USD\r\nRefund,1,-1.50,USD');
    });

    it('escapes labels and prevents spreadsheet formulas without changing numeric totals', () => {
        // Given merchant names containing CSV delimiters, line breaks and formula prefixes
        const names = ['Shop, "Central"\nBranch', '=1+1', ' @SUM(A1:A2)'];
        const data: GroupedItem[] = names.map((merchant) => ({...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant, formattedMerchant: merchant}));

        // When user-controlled names are written into the spreadsheet
        const csv = buildInsightsChartCSV({
            data,
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            currency: CONST.CURRENCY.USD,
            getCurrencyDecimals,
            translate,
            today: AFTER_EVERY_PERIOD,
        });

        // Then each name stays in one cell and cannot execute as a formula
        expect(csv).toBe('\uFEFFMerchant,Expenses,Total,Currency\r\n"Shop, ""Central""\nBranch",2,123.45,USD\r\n\'=1+1,2,123.45,USD\r\n\' @SUM(A1:A2),2,123.45,USD');
    });

    it('uses the group currency precision and localized category header', () => {
        // Given a category chart converted to a currency without decimal places
        const data: GroupedItem[] = [{...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY, category: 'Travel', formattedCategory: 'Travel', currency: 'JPY'}];
        const translateFrench: LocalizedTranslate = (key, ...parameters) => translatePhrase(CONST.LOCALES.FR, key, ...parameters);

        // When its grouped totals are exported
        const csv = buildInsightsChartCSV({
            data,
            groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
            currency: 'JPY',
            getCurrencyDecimals,
            translate: translateFrench,
            today: AFTER_EVERY_PERIOD,
        });

        // Then amounts use currency precision, without symbols or thousands separators
        expect(csv).toBe(
            `\uFEFF${translateFrench('common.category')},${translateFrench('common.expenses')},${translateFrench('common.total')},${translateFrench('common.currency')}\r\nTravel,2,123,JPY`,
        );
    });

    it('exports the same full submitter names shown in the graph', () => {
        // Given a submitter group with a resolved display name
        const data: GroupedItem[] = [{...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.FROM, accountID: 1, formattedFrom: 'Alex Smith'}];

        // When the chart is exported
        const csv = buildInsightsChartCSV({data, groupBy: CONST.SEARCH.GROUP_BY.FROM, currency: CONST.CURRENCY.USD, getCurrencyDecimals, translate, today: AFTER_EVERY_PERIOD});

        // Then the CSV names the person rather than exposing only their internal account ID
        expect(csv).toBe('\uFEFFFrom,Expenses,Total,Currency\r\nAlex Smith,2,123.45,USD');
    });

    it('exports full tag combinations and the no-tag label under the tag header', () => {
        // Given tag rows with the same display labels as the chart
        const data: GroupedItem[] = [
            {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.TAG, tag: 'Engineering:Backend', formattedTag: 'Engineering, Backend'},
            {...GROUP_FIELDS, groupedBy: CONST.SEARCH.GROUP_BY.TAG, tag: '(untagged)', formattedTag: 'No tag'},
        ];

        // When the tag ranking is exported
        const csv = buildInsightsChartCSV({data, groupBy: CONST.SEARCH.GROUP_BY.TAG, currency: CONST.CURRENCY.USD, getCurrencyDecimals, translate, today: AFTER_EVERY_PERIOD});

        // Then the header identifies tags and each full label stays intact
        expect(csv).toBe('\uFEFFTag,Expenses,Total,Currency\r\n"Engineering, Backend",2,123.45,USD\r\nNo tag,2,123.45,USD');
    });
});
