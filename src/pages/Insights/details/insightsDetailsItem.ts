/** Converts a clicked chart group to the URL params the Details panel names it by, and back to its title and Spend filter. */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {GroupedItem, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import DateUtils from '@libs/DateUtils';
import {adjustTimeRangeToDateFilters} from '@libs/SearchUIUtils';
import {isInvalidMerchantValue, isValidDate} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';

import {getMonth, getQuarter, getYear, parseISO} from 'date-fns';

type InsightsDetailsItem = {
    /** Name of the item, or the label of the period */
    title: string;

    /** Search filter narrowing the chart's query to the item */
    filterQuery: string;
};

type InsightsDetailsItemParams = {
    /** The member's account ID, the merchant, the category, or the first day of the period */
    itemKey: string;

    /** Last day of the period, trimmed to the date range like the chart's label */
    periodEnd?: string;
};

type ResolveInsightsDetailsItemParams = InsightsDetailsItemParams & {
    groupBy: SearchGroupBy;

    /** The member a Top spenders item names */
    member: OnyxEntry<PersonalDetails>;
    dateFnsLocale: DateFnsLocale | undefined;
    translate: LocalizedTranslate;
};

/** Returns the URL params the Details panel names a clicked group by. A period is trimmed to the chart's date range, as the chart labels it. */
function getInsightsDetailsItemParams(item: GroupedItem, queryJSON: Readonly<SearchQueryJSON>): InsightsDetailsItemParams | undefined {
    switch (item.groupedBy) {
        case CONST.SEARCH.GROUP_BY.FROM:
            return {itemKey: String(item.accountID)};
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return {itemKey: item.merchant};
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return {itemKey: item.category};
        default:
            break;
    }

    const range = CHART_GROUP_BY_CONFIG[item.groupedBy].getDateRange?.(item);
    if (!range) {
        return undefined;
    }
    const {start, end} = adjustTimeRangeToDateFilters(
        range,
        queryJSON.flatFilters.filter((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE),
    );
    return {itemKey: start, periodEnd: end};
}

/** Returns the label of a period, worded like the chart's tooltip. */
function getPeriodTitle(groupBy: SearchGroupBy, range: {start: string; end: string}, dateFnsLocale: DateFnsLocale | undefined): string {
    const date = parseISO(range.start);
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.DAY:
            return DateUtils.formatToReadableString(range.start, dateFnsLocale);
        case CONST.SEARCH.GROUP_BY.MONTH:
            return DateUtils.getFormattedMonthForSearch(getYear(date), getMonth(date) + 1, dateFnsLocale);
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return DateUtils.getFormattedQuarterForSearch(getYear(date), getQuarter(date), dateFnsLocale);
        case CONST.SEARCH.GROUP_BY.YEAR:
            return String(getYear(date));
        default:
            return DateUtils.getFormattedDateRangeForSearch(range.start, range.end, dateFnsLocale);
    }
}

/** Resolves the key in the Details panel's URL to the item's title and the filter narrowing the chart's query to it. */
function resolveInsightsDetailsItem({groupBy, itemKey, periodEnd, member, dateFnsLocale, translate}: ResolveInsightsDetailsItemParams): InsightsDetailsItem | undefined {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.FROM: {
            const name = member?.displayName ?? member?.login;
            if (!name) {
                return undefined;
            }
            return {title: name, filterQuery: `from:${itemKey}`};
        }
        case CONST.SEARCH.GROUP_BY.MERCHANT: {
            const isEmptyMerchant = !itemKey || itemKey === CONST.SEARCH.MERCHANT_EMPTY_VALUE || itemKey === CONST.TRANSACTION.UNKNOWN_MERCHANT || isInvalidMerchantValue(itemKey);
            return {title: isEmptyMerchant ? translate('search.noMerchant') : itemKey, filterQuery: `merchant="${itemKey}"`};
        }
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return {
                title: !itemKey || itemKey === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? itemKey : getDecodedCategoryName(itemKey),
                filterQuery: `category:"${itemKey}"`,
            };
        default: {
            if (!periodEnd || !isValidDate(itemKey) || !isValidDate(periodEnd)) {
                return undefined;
            }
            const range = {start: itemKey, end: periodEnd};
            return {title: getPeriodTitle(groupBy, range, dateFnsLocale), filterQuery: `date>=${range.start} date<=${range.end}`};
        }
    }
}

export {getInsightsDetailsItemParams, resolveInsightsDetailsItem};
