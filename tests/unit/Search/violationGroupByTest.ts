import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {TransactionViolationGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import * as SearchUIUtils from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type * as OnyxTypes from '@src/types/onyx';

import {convertToDisplayString, formatPhoneNumber, localeCompare, translateLocal} from '../../utils/TestHelper';

// Auth returns each violation group keyed by its internal name, which isn't in label order
const searchResultsGroupByViolation: OnyxTypes.SearchResults = {
    data: {
        [`${CONST.SEARCH.GROUP_PREFIX}${CONST.VIOLATIONS.OVER_LIMIT}` as const]: {violation: CONST.VIOLATIONS.OVER_LIMIT, count: 2, currency: 'USD', total: 400},
        [`${CONST.SEARCH.GROUP_PREFIX}${CONST.VIOLATIONS.MISSING_CATEGORY}` as const]: {violation: CONST.VIOLATIONS.MISSING_CATEGORY, count: 3, currency: 'USD', total: 150},
    },
    search: {
        count: 5,
        currency: 'USD',
        hasMoreResults: false,
        hasResults: true,
        offset: 0,
        hash: 0,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION,
        sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
        total: 550,
        isLoading: false,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    },
};

function getQueryJSON(query: string): SearchQueryJSON {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error(`Failed to parse ${query}`);
    }
    return queryJSON;
}

function getViolationSections(queryJSON: SearchQueryJSON): TransactionViolationGroupListItemType[] {
    const [sections] = SearchUIUtils.getSections({
        dateFnsLocale: undefined,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        data: searchResultsGroupByViolation.data,
        currentAccountID: 1,
        currentUserEmail: '',
        translate: translateLocal,
        formatPhoneNumber,
        bankAccountList: {},
        rules: undefined,
        groupBy: CONST.SEARCH.GROUP_BY.VIOLATION,
        conciergeReportID: undefined,
        convertToDisplayString,
        reportAttributesDerivedValue: {},
        queryJSON,
    });
    return sections.filter(SearchUIUtils.isTransactionViolationGroupListItemType);
}

function getViolationSection(queryJSON: SearchQueryJSON, violation: string): TransactionViolationGroupListItemType {
    const section = getViolationSections(queryJSON).find((item) => item.violation === violation);
    if (!section) {
        throw new Error(`Expected a ${violation} group section`);
    }
    return section;
}

describe('group-by:violation', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });

    it('labels each group with the translated violation name and drills down with violation:<name>', () => {
        // Given a search grouped by violation whose limit bounds how many groups are shown
        const queryJSON = getQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.VIOLATION} limit:10`);

        // When the violation sections are built
        const section = getViolationSection(queryJSON, CONST.VIOLATIONS.MISSING_CATEGORY);

        // Then the group shows the name users see elsewhere, and opening it lists that violation's expenses ungrouped
        expect(section.formattedViolation).toBe(translateLocal('violations.shortName.missingCategory'));
        expect(section.transactionsQueryJSON?.groupBy).toBeUndefined();
        expect(section.transactionsQueryJSON?.limit).toBeUndefined();
        expect(section.transactionsQueryJSON?.filters).toEqual({
            operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            left: CONST.SEARCH.SYNTAX_FILTER_KEYS.VIOLATION,
            right: CONST.VIOLATIONS.MISSING_CATEGORY,
        });
    });

    it('keeps a violation exclusion from the parent query when drilling into a group', () => {
        // Given a violation grouping that hides Missing category. An expense with both Over limit and Missing category
        // is in the Over limit group's results only if the exclusion is dropped
        const queryJSON = getQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.VIOLATION} has:approved-violation -violation:${CONST.VIOLATIONS.MISSING_CATEGORY}`);

        // When the Over limit group is opened
        const section = getViolationSection(queryJSON, CONST.VIOLATIONS.OVER_LIMIT);
        const drillDownQuery = section.transactionsQueryJSON && buildSearchQueryString(section.transactionsQueryJSON);

        // Then the drill-down asks for Over limit and still leaves out expenses with Missing category
        expect(drillDownQuery).toContain(`-${CONST.SEARCH.SYNTAX_FILTER_KEYS.VIOLATION}:${CONST.VIOLATIONS.MISSING_CATEGORY}`);
        expect(drillDownQuery).toContain(` ${CONST.SEARCH.SYNTAX_FILTER_KEYS.VIOLATION}:${CONST.VIOLATIONS.OVER_LIMIT}`);
    });

    it('sorts groups by translated label, ascending by default', () => {
        // Given a group-by:violation query, which defaults to sorting by the violation column
        const queryJSON = getQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.VIOLATION}`);
        expect(queryJSON.sortBy).toBe(CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION);
        expect(queryJSON.sortOrder).toBe(CONST.SEARCH.SORT_ORDER.ASC);

        // When the sections are sorted on the client, since Auth can only sort by the internal name
        const sorted = SearchUIUtils.getSortedSections(
            CONST.SEARCH.DATA_TYPES.EXPENSE,
            getViolationSections(queryJSON),
            localeCompare,
            translateLocal,
            queryJSON.sortBy,
            queryJSON.sortOrder,
            CONST.SEARCH.GROUP_BY.VIOLATION,
        ).filter(SearchUIUtils.isTransactionViolationGroupListItemType);

        // Then "Missing category" comes before "Over limit", the reverse of their internal names' order in the data
        const labels = sorted.map((section) => section.formattedViolation);
        expect(labels).toEqual([...labels].sort(localeCompare));
        expect(sorted.at(0)?.violation).toBe(CONST.VIOLATIONS.MISSING_CATEGORY);
    });

    it('shows Violation, Expenses and Total by default and requires the Violation column', () => {
        // Given the column settings for a violation grouping
        // When reading its default and required columns
        const defaultColumns = SearchUIUtils.getCustomColumnDefault(CONST.SEARCH.GROUP_BY.VIOLATION);

        // Then the table shows the violation name with the counts every group has, and the name can't be removed
        expect(defaultColumns).toEqual([CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION, CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES, CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]);
        expect(SearchUIUtils.getRequiredSearchColumns(false).has(CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION)).toBe(true);
        expect(SearchUIUtils.getSearchColumnTranslationKey(CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION)).toBe('search.filters.groupBy.violation');
    });

    it('offers the violation grouping only when Rules are available', () => {
        // Given the Display menu's group-by options
        const getValues = (hasRulesEnabledPolicy: boolean) =>
            SearchUIUtils.getGroupBySections(translateLocal, hasRulesEnabledPolicy)
                .flatMap((section) => section.options)
                .map((option) => option.value);

        // When they're built with and without a workspace that has Rules on
        // Then Violation is only offered when it can return results
        expect(getValues(true)).toContain(CONST.SEARCH.GROUP_BY.VIOLATION);
        expect(getValues(false)).not.toContain(CONST.SEARCH.GROUP_BY.VIOLATION);
    });

    it('tracks each group drill-down hash as an active search', () => {
        // Given a search grouped by violation
        const queryJSON = getQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.VIOLATION}`);

        // When collecting the hashes of the searches its groups open
        const hashes = SearchUIUtils.getActiveGroupSearchHashes(searchResultsGroupByViolation.data, queryJSON);

        // Then each group's drill-down is included, so its cached results stay in sync
        const section = getViolationSection(queryJSON, CONST.VIOLATIONS.OVER_LIMIT);
        expect(hashes).toContain(section.transactionsQueryJSON?.hash);
        expect(hashes).toHaveLength(2);
    });

    it('drills into the same query from the Insights Top violations chart and the Search group', () => {
        // Given the Top violations chart's query, which reads the same violation groups as the Search table
        const queryJSON = getQueryJSON(
            `type:expense group-by:${CONST.SEARCH.GROUP_BY.VIOLATION} has:${CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION},${CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION} date>=2026-01-01 date<=2026-01-31 limit:15`,
        );
        const section = getViolationSection(queryJSON, CONST.VIOLATIONS.MISSING_CATEGORY);

        // When the chart slice and the Search group for one violation are opened
        const chartQuery = buildChartDrillDownQuery(queryJSON, CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.VIOLATION].getFilterQuery(section));
        const searchQuery = section.transactionsQueryJSON && buildSearchQueryString(section.transactionsQueryJSON);

        // Then both land on the same expenses, so the two surfaces can't drift apart
        expect(chartQuery).toBeDefined();
        expect(chartQuery).toBe(searchQuery);
    });
});
