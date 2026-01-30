import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import * as SearchUIUtils from '@src/libs/SearchUIUtils';
import type * as OnyxTypes from '@src/types/onyx';

const adminAccountID = 18439984;
const adminEmail = 'admin@policy.com';
const auditorEmail = 'auditor@policy.com';
const approverEmail = 'approver@policy.com';
const userEmail = 'user@policy.com';
const policyID = 'A1B2C3';

describe('Test Spend Over Time Search', () => {

    describe('Test getSuggestedSearchesVisibility for Spend Over Time', () => {
        test('Should show Spend Over Time for Admin role in paid policy', () => {
            const policyKey = `policy_${policyID}`;

            const policies: OnyxCollection<OnyxTypes.Policy> = {
                [policyKey]: {
                    id: policyID,
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.ADMIN,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(adminEmail, {}, policies, undefined);
            expect(response.spendOverTime).toBe(true);
        });

        test('Should show Spend Over Time for Auditor role in paid policy', () => {
            const policyKey = `policy_${policyID}`;

            const policies: OnyxCollection<OnyxTypes.Policy> = {
                [policyKey]: {
                    id: policyID,
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.AUDITOR,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(auditorEmail, {}, policies, undefined);
            expect(response.spendOverTime).toBe(true);
        });

        test('Should show Spend Over Time for Approver role in paid policy', () => {
            const policyKey = `policy_${policyID}`;

            const policies: OnyxCollection<OnyxTypes.Policy> = {
                [policyKey]: {
                    id: policyID,
                    type: CONST.POLICY.TYPE.TEAM,
                    approver: approverEmail,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(approverEmail, {}, policies, undefined);
            expect(response.spendOverTime).toBe(true);
        });

        test('Should hide Spend Over Time for User role in paid policy', () => {
            const policyKey = `policy_${policyID}`;

            const policies: OnyxCollection<OnyxTypes.Policy> = {
                [policyKey]: {
                    id: policyID,
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.USER,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(userEmail, {}, policies, undefined);
            expect(response.spendOverTime).toBe(false);
        });

        test('Should hide Spend Over Time for free policies even with Admin role', () => {
            const policyKey = `policy_${policyID}`;

            const policies: OnyxCollection<OnyxTypes.Policy> = {
                [policyKey]: {
                    id: policyID,
                    type: CONST.POLICY.TYPE.PERSONAL,
                    role: CONST.POLICY.ROLE.ADMIN,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(adminEmail, {}, policies, undefined);
            expect(response.spendOverTime).toBe(false);
        });

        test('Should show Spend Over Time if at least one policy has Admin/Auditor/Approver role', () => {
            const policies: OnyxCollection<OnyxTypes.Policy> = {
                policyOne: {
                    id: 'policyOne',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.USER,
                } as OnyxTypes.Policy,
                policyTwo: {
                    id: 'policyTwo',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.ADMIN,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(adminEmail, {}, policies, undefined);
            expect(response.spendOverTime).toBe(true);
        });

        test('Should hide Spend Over Time if all policies have User role', () => {
            const policies: OnyxCollection<OnyxTypes.Policy> = {
                policyOne: {
                    id: 'policyOne',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.USER,
                } as OnyxTypes.Policy,
                policyTwo: {
                    id: 'policyTwo',
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.USER,
                } as OnyxTypes.Policy,
            };

            const response = SearchUIUtils.getSuggestedSearchesVisibility(userEmail, {}, policies, undefined);
            expect(response.spendOverTime).toBe(false);
        });
    });

    describe('Test getSuggestedSearches for Spend Over Time', () => {
        test('Should return Spend Over Time search with correct properties', () => {
            const suggestedSearches = SearchUIUtils.getSuggestedSearches(adminAccountID, undefined, undefined);
            const spendOverTimeSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];

            expect(spendOverTimeSearch).toBeDefined();
            expect(spendOverTimeSearch.key).toBe(CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME);
            expect(spendOverTimeSearch.translationPath).toBe('search.spendOverTime');
            expect(spendOverTimeSearch.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
            expect(spendOverTimeSearch.icon).toBe('Receipt');
        });

        test('Should return Spend Over Time search query with correct parameters', () => {
            const suggestedSearches = SearchUIUtils.getSuggestedSearches(adminAccountID, undefined, undefined);
            const spendOverTimeSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];
            const searchQueryJSON = spendOverTimeSearch.searchQueryJSON;

            expect(searchQueryJSON).toBeDefined();
            expect(searchQueryJSON?.type).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
            expect(searchQueryJSON?.groupBy).toBe(CONST.SEARCH.GROUP_BY.MONTH);
            
            // Check that date filter with year-to-date preset exists in flatFilters
            const dateFilter = searchQueryJSON?.flatFilters?.find((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
            expect(dateFilter).toBeDefined();
            expect(dateFilter?.filters?.some((f) => f.value === CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE)).toBe(true);
            
            expect(searchQueryJSON?.view).toBe(CONST.SEARCH.VIEW.BAR);
            expect(searchQueryJSON?.sortBy).toBe(CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH);
            expect(searchQueryJSON?.sortOrder).toBe(CONST.SEARCH.SORT_ORDER.DESC);
        });

        test('Should return Spend Over Time search with valid hash', () => {
            const suggestedSearches = SearchUIUtils.getSuggestedSearches(adminAccountID, undefined, undefined);
            const spendOverTimeSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];

            expect(spendOverTimeSearch.hash).toBeGreaterThan(0);
            expect(spendOverTimeSearch.similarSearchHash).toBeGreaterThan(0);
        });

        test('Should return Spend Over Time search query string with correct format', () => {
            const suggestedSearches = SearchUIUtils.getSuggestedSearches(adminAccountID, undefined, undefined);
            const spendOverTimeSearch = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];
            const searchQuery = spendOverTimeSearch.searchQuery;

            expect(searchQuery).toContain(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);
            expect(searchQuery).toContain(`groupBy:${CONST.SEARCH.GROUP_BY.MONTH}`);
            expect(searchQuery).toContain(`date:${CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE}`);
            expect(searchQuery).toContain(`view:${CONST.SEARCH.VIEW.BAR}`);
            expect(searchQuery).toContain(`sortBy:${CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH}`);
            expect(searchQuery).toContain(`sortOrder:${CONST.SEARCH.SORT_ORDER.DESC}`);
        });
    });
});
