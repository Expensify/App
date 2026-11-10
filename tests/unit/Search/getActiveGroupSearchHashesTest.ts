import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getActiveGroupSearchHashes, getSections} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import {convertToDisplayString, formatPhoneNumber, translateLocal} from '../../utils/TestHelper';

describe('getActiveGroupSearchHashes', () => {
    it('returns the drill-down search of a day group, scoped to that day', () => {
        // Given a search grouped by day with one day in the snapshot
        const queryJSON = buildSearchQueryJSON(`type:expense groupBy:${CONST.SEARCH.GROUP_BY.DAY}`);
        const data: OnyxTypes.SearchResults['data'] = {
            personalDetailsList: {},
            [`${CONST.SEARCH.GROUP_PREFIX}2026-09-11` as const]: {day: '2026-09-11', count: 1, currency: 'USD', total: 100},
        };

        // When the searches backing the visible groups are collected
        const hashes = getActiveGroupSearchHashes(data, queryJSON);

        // Then the group's search is the ungrouped expense search limited to that day, the one opening the group runs
        expect(hashes).toEqual([buildSearchQueryJSON('type:expense date>=2026-09-11 date<=2026-09-11')?.hash]);
    });

    it('returns the drill-down search of a month group, scoped to the whole month', () => {
        // Given a search grouped by month with one month in the snapshot
        const queryJSON = buildSearchQueryJSON(`type:expense groupBy:${CONST.SEARCH.GROUP_BY.MONTH}`);
        const data: OnyxTypes.SearchResults['data'] = {
            personalDetailsList: {},
            [`${CONST.SEARCH.GROUP_PREFIX}2026_9` as const]: {year: 2026, month: 9, count: 1, currency: 'USD', total: 100},
        };

        // When the searches backing the visible groups are collected
        const hashes = getActiveGroupSearchHashes(data, queryJSON);

        // Then the group's search is the ungrouped expense search limited to September, the one opening the group runs
        expect(hashes).toEqual([buildSearchQueryJSON('type:expense date>=2026-09-01 date<=2026-09-30')?.hash]);
    });

    it.each([
        [CONST.SEARCH.GROUP_BY.DAY, {day: '2026-09-11'}],
        [CONST.SEARCH.GROUP_BY.WEEK, {week: '2026-09-07'}],
        [CONST.SEARCH.GROUP_BY.MONTH, {year: 2026, month: 9}],
        [CONST.SEARCH.GROUP_BY.QUARTER, {year: 2026, quarter: 3}],
        [CONST.SEARCH.GROUP_BY.YEAR, {year: 2026}],
    ])('returns the same search a %s section opens', (groupBy, groupFields) => {
        // Given a time-grouped search with one group in the snapshot
        const queryJSON = buildSearchQueryJSON(`type:expense groupBy:${groupBy}`);
        const data: OnyxTypes.SearchResults['data'] = {
            personalDetailsList: {},
            [`${CONST.SEARCH.GROUP_PREFIX}group` as const]: {...groupFields, count: 1, currency: CONST.CURRENCY.USD, total: 100},
        };

        // When the active hashes and the section the user taps are both built from it
        const hashes = getActiveGroupSearchHashes(data, queryJSON);
        const [sections] = getSections({
            dateFnsLocale: undefined,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data,
            currentAccountID: 1,
            currentUserEmail: '',
            translate: translateLocal,
            formatPhoneNumber,
            bankAccountList: {},
            rules: undefined,
            groupBy,
            queryJSON,
            conciergeReportID: undefined,
            convertToDisplayString,
            reportAttributesDerivedValue: {},
        });
        const section = sections.at(0);
        const sectionHash = section && 'transactionsQueryJSON' in section ? section.transactionsQueryJSON?.hash : undefined;

        // Then they name the same search, because the snapshot kept for the group must be the one opening it reads
        expect(sectionHash).toBeDefined();
        expect(hashes).toEqual([sectionHash]);
    });
});
