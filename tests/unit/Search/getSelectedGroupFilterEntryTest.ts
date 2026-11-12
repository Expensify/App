import {getSelectedGroupFilterEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchGroupBase} from '@src/types/onyx/SearchResults';

const groupBase: SearchGroupBase = {count: 1, total: 100, currency: CONST.CURRENCY.USD};

describe('getSelectedGroupFilterEntry', () => {
    it.each([
        [CONST.SEARCH.GROUP_BY.DAY, {...groupBase, day: '2026-09-11'}, {start: '2026-09-11', end: '2026-09-11'}],
        [CONST.SEARCH.GROUP_BY.WEEK, {...groupBase, week: '2026-09-07'}, {start: '2026-09-07', end: '2026-09-13'}],
        [CONST.SEARCH.GROUP_BY.MONTH, {...groupBase, year: 2026, month: 2}, {start: '2026-02-01', end: '2026-02-28'}],
        [CONST.SEARCH.GROUP_BY.QUARTER, {...groupBase, year: 2026, quarter: 3}, {start: '2026-07-01', end: '2026-09-30'}],
        [CONST.SEARCH.GROUP_BY.YEAR, {...groupBase, year: 2026}, {start: '2026-01-01', end: '2026-12-31'}],
    ])('scopes a %s group by the whole date range it covers', (groupBy, group, dateRange) => {
        // Given a time-based group as it arrives in the search snapshot

        // When the filter that scopes an export to that group is built
        const entry = getSelectedGroupFilterEntry(groupBy, group);

        // Then it is the group's inclusive date range, because the search syntax has no exact-match filter for a period
        expect(entry).toEqual({kind: 'dateRange', dateRange});
    });

    it('returns no filter for a time-based group that is missing its date fields', () => {
        // Given a month-grouped search whose group has no month
        const group = {...groupBase, year: 2026};

        // When the filter that scopes an export to that group is built
        const entry = getSelectedGroupFilterEntry(CONST.SEARCH.GROUP_BY.MONTH, group);

        // Then there is none, so the export shows an error instead of scoping to a guessed range
        expect(entry).toBeUndefined();
    });

    it.each([
        [CONST.SEARCH.GROUP_BY.MONTH, {...groupBase, year: 2026, month: 13}],
        [CONST.SEARCH.GROUP_BY.MONTH, {...groupBase, year: 2026, month: 0}],
        [CONST.SEARCH.GROUP_BY.QUARTER, {...groupBase, year: 2026, quarter: 5}],
    ])('returns no filter for a %s group outside its year', (groupBy, group) => {
        // Given a group whose period number does not exist, which `Date` would roll into another year

        // When the filter that scopes an export to that group is built
        const entry = getSelectedGroupFilterEntry(groupBy, group);

        // Then there is none, so the export fails instead of covering dates the user never selected
        expect(entry).toBeUndefined();
    });

    it.each([
        [CONST.SEARCH.GROUP_BY.FROM, {...groupBase, accountID: 42}, CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, 42],
        [CONST.SEARCH.GROUP_BY.APPROVER, {...groupBase, accountID: 42}, CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVER, 42],
        [CONST.SEARCH.GROUP_BY.CARD, {...groupBase, accountID: 42, bank: 'vcf', cardName: 'Business card', cardID: 7, lastFourPAN: '1234'}, CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, 7],
        [
            CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
            {...groupBase, entryID: 9, accountNumber: '1234', bankName: CONST.BANK_NAMES.CHASE, debitPosted: '2026-09-11', state: 1},
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
            9,
        ],
        [CONST.SEARCH.GROUP_BY.CATEGORY, {...groupBase, category: 'Travel'}, CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, 'Travel'],
        [CONST.SEARCH.GROUP_BY.CATEGORY, {...groupBase, category: ''}, CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, CONST.SEARCH.CATEGORY_EMPTY_VALUE],
        [CONST.SEARCH.GROUP_BY.MERCHANT, {...groupBase, merchant: 'Amazon'}, CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, 'Amazon'],
        [CONST.SEARCH.GROUP_BY.MERCHANT, {...groupBase, merchant: ''}, CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, CONST.SEARCH.MERCHANT_EMPTY_VALUE],
        [CONST.SEARCH.GROUP_BY.TAG, {...groupBase, tag: 'Project A'}, CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, 'Project A'],
        [CONST.SEARCH.GROUP_BY.TAG, {...groupBase, tag: ''}, CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, CONST.SEARCH.TAG_EMPTY_VALUE],
        [CONST.SEARCH.GROUP_BY.TAG, {...groupBase, tag: '(untagged)'}, CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, CONST.SEARCH.TAG_EMPTY_VALUE],
    ])('scopes a %s group by its value', (groupBy, group, key, value) => {
        // Given a value group as it arrives in the search snapshot

        // When the filter that scopes an export to that group is built
        const entry = getSelectedGroupFilterEntry(groupBy, group);

        // Then it filters on the group's value, with an empty value mapped to the search syntax's "none"
        expect(entry).toEqual({kind: 'value', key, value});
    });

    it.each([
        CONST.SEARCH.GROUP_BY.FROM,
        CONST.SEARCH.GROUP_BY.APPROVER,
        CONST.SEARCH.GROUP_BY.CARD,
        CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
        CONST.SEARCH.GROUP_BY.CATEGORY,
        CONST.SEARCH.GROUP_BY.MERCHANT,
        CONST.SEARCH.GROUP_BY.TAG,
    ])('returns no filter for a %s group that is missing its field', (groupBy) => {
        // Given a value-grouped search whose group is a violation group, which has none of the value fields
        const group = {...groupBase, violation: 'missingCategory'};

        // When the filter that scopes an export to that group is built
        const entry = getSelectedGroupFilterEntry(groupBy, group);

        // Then there is none, so the export fails instead of filtering on an undefined value
        expect(entry).toBeUndefined();
    });
});
