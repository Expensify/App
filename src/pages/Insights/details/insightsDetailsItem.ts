/** Converts a clicked chart group to the URL params the Details panel names it by, and back to its title and Spend filter. */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CHART_GROUP_BY_CONFIG, {buildCategoryFilterQuery, buildMerchantFilterQuery, buildTagFilterQuery} from '@components/Search/chartGroupByConfig';
import type {GroupedItem, SearchDateFilterKeys, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import DateUtils from '@libs/DateUtils';
import {getViolationDisplayName} from '@libs/SearchQueryUtils';
import {adjustTimeRangeToDateFilters, getTagGroupLabel} from '@libs/SearchUIUtils';
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
    /** The member's account ID, the merchant, the category, the tag, the violation, or the first day of the period */
    itemKey: string;

    /** Last day of the period, trimmed to the date range like the chart's label */
    periodEnd?: string;

    /** Tag level of a tag, undefined when the chart groups by every level of the tag together */
    tagLevel?: number;

    /** Encoded parent tags of a dependent tag */
    parentTagPath?: string;
};

type ResolveInsightsDetailsItemParams = InsightsDetailsItemParams & {
    groupBy: SearchGroupBy;

    /** The date a period narrows, the expense date unless the chart counts by an action's date */
    dateFilterKey?: SearchDateFilterKeys;

    /** The member a submitter or approver item names */
    member: OnyxEntry<PersonalDetails>;
    dateFnsLocale: DateFnsLocale | undefined;
    translate: LocalizedTranslate;
};

/** Fields a ranking graph's group is named by, as the chart's snapshot and its grouped rows both hold them */
type RankingGroup = {
    accountID?: number | null;
    merchant?: string;
    category?: string;
    violation?: string;
};

/** Returns the key the Details panel's URL names a ranking graph's group by, or undefined for a group that isn't ranked by a single value. */
function getRankingItemKey(groupBy: SearchGroupBy, group: RankingGroup): string | undefined {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.FROM:
        case CONST.SEARCH.GROUP_BY.APPROVER:
            return group.accountID === undefined || group.accountID === null ? undefined : String(group.accountID);
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return group.merchant;
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return group.category;
        case CONST.SEARCH.GROUP_BY.VIOLATION:
            return group.violation;
        default:
            return undefined;
    }
}

/** Returns the URL params the Details panel names a clicked group by. A period is trimmed to the chart's date range, as the chart labels it. */
function getInsightsDetailsItemParams(
    item: GroupedItem,
    queryJSON: Readonly<SearchQueryJSON>,
    dateFilterKey: SearchDateFilterKeys = CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
): InsightsDetailsItemParams | undefined {
    const rankingItemKey = getRankingItemKey(item.groupedBy, item);
    if (rankingItemKey !== undefined) {
        return {itemKey: rankingItemKey};
    }

    switch (item.groupedBy) {
        case CONST.SEARCH.GROUP_BY.TAG:
            return {itemKey: item.tag, tagLevel: item.tagLevel, parentTagPath: item.parentTagPath};
        default:
            break;
    }

    const range = CHART_GROUP_BY_CONFIG[item.groupedBy].getDateRange?.(item);
    if (!range) {
        return undefined;
    }
    const {start, end} = adjustTimeRangeToDateFilters(
        range,
        queryJSON.flatFilters.filter((filter) => filter.key === dateFilterKey),
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
function resolveInsightsDetailsItem({
    groupBy,
    itemKey,
    periodEnd,
    parentTagPath,
    tagLevel,
    dateFilterKey = CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
    member,
    dateFnsLocale,
    translate,
}: ResolveInsightsDetailsItemParams): InsightsDetailsItem | undefined {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.FROM:
        case CONST.SEARCH.GROUP_BY.APPROVER: {
            const name = member?.displayName ?? member?.login;
            if (!name) {
                return undefined;
            }
            return {title: name, filterQuery: `${groupBy}:${itemKey}`};
        }
        case CONST.SEARCH.GROUP_BY.VIOLATION:
            if (!itemKey) {
                return undefined;
            }
            return {title: getViolationDisplayName(itemKey, translate), filterQuery: `${CONST.SEARCH.SYNTAX_FILTER_KEYS.VIOLATION}:${itemKey}`};
        case CONST.SEARCH.GROUP_BY.MERCHANT: {
            const isEmptyMerchant = !itemKey || itemKey === CONST.SEARCH.MERCHANT_EMPTY_VALUE || itemKey === CONST.TRANSACTION.UNKNOWN_MERCHANT || isInvalidMerchantValue(itemKey);
            return {title: isEmptyMerchant ? translate('search.noMerchant') : itemKey, filterQuery: buildMerchantFilterQuery(itemKey)};
        }
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return {
                title: !itemKey || itemKey === CONST.SEARCH.CATEGORY_EMPTY_VALUE ? itemKey : getDecodedCategoryName(itemKey),
                filterQuery: buildCategoryFilterQuery(itemKey),
            };
        case CONST.SEARCH.GROUP_BY.TAG: {
            if (tagLevel !== undefined && (!Number.isSafeInteger(tagLevel) || tagLevel < 1)) {
                return undefined;
            }
            const tagGroup = {tag: itemKey, tagLevel, parentTagPath};
            return {title: getTagGroupLabel(tagGroup, translate), filterQuery: buildTagFilterQuery(tagGroup)};
        }
        default: {
            if (!periodEnd || !isValidDate(itemKey) || !isValidDate(periodEnd)) {
                return undefined;
            }
            const range = {start: itemKey, end: periodEnd};
            return {title: getPeriodTitle(groupBy, range, dateFnsLocale), filterQuery: `${dateFilterKey}>=${range.start} ${dateFilterKey}<=${range.end}`};
        }
    }
}

export {getInsightsDetailsItemParams, getPeriodTitle, getRankingItemKey, resolveInsightsDetailsItem};
export type {RankingGroup};
