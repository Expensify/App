import type {SearchQueryJSON} from '@components/Search/types';

import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {buildSearchQueryJSON, getEmptyDateValues, getFilterFromQuery, getRangeBoundariesFromFormValue, getRangeQueryValue, isSearchDatePreset} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import type {InsightsFilters} from './insightsFilters';

import {INSIGHTS_GROUP_BY_OPTIONS} from './insightsFilters';

function parseDate(queryJSON: SearchQueryJSON): Pick<InsightsFilters, 'date'> | undefined {
    const dateFilters = queryJSON.flatFilters.filter(({key}) => key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE).flatMap(({filters}) => filters);

    const on = dateFilters.find(({operator}) => operator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO)?.value.toString();
    if (on) {
        return {date: isSearchDatePreset(on) ? {preset: on} : {on}};
    }

    const from = dateFilters.find(({operator}) => operator === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO)?.value.toString();
    const to = dateFilters.find(({operator}) => operator === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO)?.value.toString();
    if (from && to) {
        return {date: {from, to}};
    }

    return undefined;
}

function parsePolicyIDs(queryJSON: SearchQueryJSON): Pick<InsightsFilters, 'policyIDs'> | undefined {
    const {value, isNegated} = getFilterFromQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID);
    return value?.length && !isNegated ? {policyIDs: value} : undefined;
}

function parseGroupCurrency(queryJSON: SearchQueryJSON): Pick<InsightsFilters, 'groupCurrency'> | undefined {
    const {value, isNegated} = getFilterFromQuery(queryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY);
    const groupCurrency = value?.at(0);
    return groupCurrency && !isNegated ? {groupCurrency} : undefined;
}

function parseGroupBy(queryJSON: SearchQueryJSON): Pick<InsightsFilters, 'groupBy'> | undefined {
    const groupBy = INSIGHTS_GROUP_BY_OPTIONS.find((option) => option === queryJSON.groupBy);
    return groupBy ? {groupBy} : undefined;
}

/** Reads a dashboard's stored selections. Anything the query doesn't carry is left out, so the caller's defaults show through. */
function parseInsightsFilters(query: string | undefined): Partial<InsightsFilters> {
    const queryJSON = query ? buildSearchQueryJSON(query) : undefined;
    if (!queryJSON) {
        return {};
    }

    return {
        ...parseDate(queryJSON),
        ...parsePolicyIDs(queryJSON),
        ...parseGroupCurrency(queryJSON),
        ...parseGroupBy(queryJSON),
    };
}

/** Describes the date filter the way the date picker reads it. */
function toSearchDateValues(date: InsightsFilters['date']): SearchDateValues {
    if ('preset' in date) {
        return {...getEmptyDateValues(), [CONST.SEARCH.DATE_MODIFIERS.ON]: date.preset};
    }
    if ('on' in date) {
        return {...getEmptyDateValues(), [CONST.SEARCH.DATE_MODIFIERS.ON]: date.on};
    }
    return {...getEmptyDateValues(), [CONST.SEARCH.DATE_MODIFIERS.RANGE]: getRangeQueryValue(date.from, date.to)};
}

function fromSearchDateValues(values: SearchDateValues): InsightsFilters['date'] | undefined {
    const {from, to} = getRangeBoundariesFromFormValue(values[CONST.SEARCH.DATE_MODIFIERS.RANGE]);
    if (from && to) {
        return {from, to};
    }

    const on = values[CONST.SEARCH.DATE_MODIFIERS.ON];
    if (!on) {
        return undefined;
    }

    return isSearchDatePreset(on) ? {preset: on} : {on};
}

export {fromSearchDateValues, parseInsightsFilters, toSearchDateValues};
