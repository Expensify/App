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

    it('returns the drill-down search of an approver group, scoped to that approver', () => {
        // Given a search grouped by approver with one approver in the snapshot
        const queryJSON = buildSearchQueryJSON(`type:expense groupBy:${CONST.SEARCH.GROUP_BY.APPROVER}`);
        const data: OnyxTypes.SearchResults['data'] = {
            personalDetailsList: {},
            [`${CONST.SEARCH.GROUP_PREFIX}42` as const]: {accountID: 42, count: 1, currency: CONST.CURRENCY.USD, total: 100},
        };

        // When the searches backing the visible groups are collected
        const hashes = getActiveGroupSearchHashes(data, queryJSON);

        // Then the group's search is the ungrouped expense search limited to that approver, the one opening the group runs
        expect(hashes).toEqual([buildSearchQueryJSON('type:expense approver:42')?.hash]);
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

    it.each([
        [CONST.SEARCH.GROUP_BY.FROM, {accountID: 42}],
        [CONST.SEARCH.GROUP_BY.FROM, {accountID: 0}],
        [CONST.SEARCH.GROUP_BY.APPROVER, {accountID: 0}],
        [CONST.SEARCH.GROUP_BY.CARD, {accountID: 42, cardID: 7, bank: 'vcf', cardName: 'Card', lastFourPAN: '1234'}],
        [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID, {entryID: 5, accountNumber: '1234', bankName: CONST.BANK_NAMES.GENERIC_BANK, debitPosted: '2026-09-11', state: 1}],
        [CONST.SEARCH.GROUP_BY.CATEGORY, {category: ''}],
        [CONST.SEARCH.GROUP_BY.MERCHANT, {merchant: 'Acme'}],
        [CONST.SEARCH.GROUP_BY.TAG, {tag: CONST.SEARCH.TAG_UNTAGGED_GROUP_VALUE}],
    ])('returns the same search a %s section opens for %o', (groupBy, groupFields) => {
        // Given a value-grouped search with one group in the snapshot, including an ID of 0, which only a presence check keeps
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

    it('gives a paid-by section no search to open', () => {
        // Given a paid-by grouping, which only Insights tables use because Search can't group by it yet
        const queryJSON = buildSearchQueryJSON(`type:expense groupBy:${CONST.SEARCH.GROUP_BY.PAID_BY}`);
        const data: OnyxTypes.SearchResults['data'] = {
            personalDetailsList: {},
            [`${CONST.SEARCH.GROUP_PREFIX}42` as const]: {accountID: 42, count: 1, currency: CONST.CURRENCY.USD, total: 100},
        };

        // When the section is built
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
            groupBy: CONST.SEARCH.GROUP_BY.PAID_BY,
            queryJSON,
            conciergeReportID: undefined,
            convertToDisplayString,
            reportAttributesDerivedValue: {},
        });
        const section = sections.at(0);

        // Then it is still listed but has no query, like a violation group, since nothing in Search could open it
        expect(section).toBeDefined();
        expect(section && 'transactionsQueryJSON' in section ? section.transactionsQueryJSON : undefined).toBeUndefined();
    });
});
