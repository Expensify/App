import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import {getQueryWithSubstitutions} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import {getContextualReportData, getContextualSearchAutocompleteKey, getContextualSearchQuery} from '@components/Search/SearchRouter/SearchRouterUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {NavigationState} from '@react-navigation/native';
import type {OnyxCollection} from 'react-native-onyx';
import type {PartialDeep} from 'type-fest';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

// Helper to create minimal navigation state for testing
// The function only uses index, routes, and nested state properties
type MockNavigationRoute = PartialDeep<Omit<NavigationState['routes'][number], 'name' | 'state'>, {recurseIntoArrays: true}> &
    Pick<NavigationState['routes'][number], 'name'> & {
        state?: MockNavigationState;
    };

type MockNavigationState = PartialDeep<Omit<NavigationState, 'index' | 'routes'>, {recurseIntoArrays: true}> &
    Pick<NavigationState, 'index'> & {
        routes: MockNavigationRoute[];
    };

function createMockState(partialState: MockNavigationState): NavigationState {
    return createMock<NavigationState>(partialState);
}

describe('SearchRouterUtils', () => {
    describe('getContextualReportData', () => {
        it('returns undefined contextualReportID and false isSearchRouterScreen when state is undefined', () => {
            const result = getContextualReportData(undefined);

            expect(result).toEqual({
                contextualReportID: undefined,
                isSearchRouterScreen: false,
            });
        });

        it('returns reportID when focused on a Report screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: SCREENS.REPORT,
                        params: {reportID: '12345'},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '12345',
                isSearchRouterScreen: false,
            });
        });

        it('returns reportID when focused on ExpenseReport screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
                        params: {reportID: '67890'},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '67890',
                isSearchRouterScreen: false,
            });
        });

        it('returns isSearchRouterScreen true and extracts reportID from previous route when SearchRouter is open over a Report', () => {
            const state = createMockState({
                index: 1,
                routes: [
                    {
                        name: SCREENS.REPORT,
                        params: {reportID: '11111'},
                    },
                    {
                        name: SCREENS.SEARCH_ROUTER.ROOT,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '11111',
                isSearchRouterScreen: true,
            });
        });

        it('returns undefined contextualReportID when SearchRouter is open but no report underneath', () => {
            const state = createMockState({
                index: 1,
                routes: [
                    {
                        name: SCREENS.HOME,
                        params: {},
                    },
                    {
                        name: SCREENS.SEARCH_ROUTER.ROOT,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: undefined,
                isSearchRouterScreen: true,
            });
        });

        it('returns undefined contextualReportID when on a non-report screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: SCREENS.HOME,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: undefined,
                isSearchRouterScreen: false,
            });
        });

        it('handles nested navigation state with Report screen', () => {
            const state = createMockState({
                index: 0,
                routes: [
                    {
                        name: 'RootNavigator',
                        state: {
                            index: 0,
                            routes: [
                                {
                                    name: SCREENS.REPORT,
                                    params: {reportID: '55555'},
                                },
                            ],
                        },
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '55555',
                isSearchRouterScreen: false,
            });
        });

        it('extracts reportID from ExpenseReport when SearchRouter is open over it', () => {
            const state = createMockState({
                index: 1,
                routes: [
                    {
                        name: SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
                        params: {reportID: '99999'},
                    },
                    {
                        name: SCREENS.SEARCH_ROUTER.ROOT,
                        params: {},
                    },
                ],
            });

            const result = getContextualReportData(state);

            expect(result).toEqual({
                contextualReportID: '99999',
                isSearchRouterScreen: true,
            });
        });
    });

    describe('contextual search suggestion', () => {
        const POLICY_ID = '26BE5C4005E188DB';

        function buildPolicies(name: string): OnyxCollection<OnyxTypes.Policy> {
            return {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: {...createRandomPolicy(1, undefined, name), id: POLICY_ID}};
        }

        function submitContextualSuggestion(item: SearchQueryItem, policies: OnyxCollection<OnyxTypes.Policy>) {
            const seededQuery = getContextualSearchQuery(item, policies);
            const autocompleteKey = getContextualSearchAutocompleteKey(item, policies);
            const substitutions = autocompleteKey && item.autocompleteID ? {[autocompleteKey]: item.autocompleteID} : {};

            return {seededQuery, submittedQuery: getQueryWithSubstitutions(seededQuery, substitutions)};
        }

        it('keeps a workspace name containing both a quote and a comma, and resolves it to its policy ID', () => {
            const item: SearchQueryItem = {
                keyForList: POLICY_ID,
                roomType: CONST.SEARCH.DATA_TYPES.EXPENSE,
                policyID: POLICY_ID,
                autocompleteID: POLICY_ID,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
            };

            const {seededQuery, submittedQuery} = submitContextualSuggestion(item, buildPolicies('Acme "US",Inc'));

            expect(seededQuery).toBe('type:expense workspace:"Acme \\"US\\",Inc"');
            expect(submittedQuery).toBe(`type:expense workspace:${POLICY_ID}`);
        });

        it('keeps a workspace name containing a quote and a space, and resolves it to its policy ID', () => {
            const item: SearchQueryItem = {
                keyForList: POLICY_ID,
                roomType: CONST.SEARCH.DATA_TYPES.EXPENSE,
                policyID: POLICY_ID,
                autocompleteID: POLICY_ID,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
            };

            const {seededQuery, submittedQuery} = submitContextualSuggestion(item, buildPolicies('Acme "US" Inc'));

            expect(seededQuery).toBe('type:expense workspace:"Acme \\"US\\" Inc"');
            expect(submittedQuery).toBe(`type:expense workspace:${POLICY_ID}`);
        });

        it('resolves a room name containing a comma to its report ID', () => {
            const item: SearchQueryItem = {
                keyForList: '1234',
                roomType: CONST.SEARCH.DATA_TYPES.CHAT,
                searchQuery: 'Alice,Bob',
                autocompleteID: '1234',
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
            };

            const {seededQuery, submittedQuery} = submitContextualSuggestion(item, {});

            expect(seededQuery).toBe('type:chat in:"Alice,Bob"');
            expect(submittedQuery).toBe('type:chat in:1234');
        });

        it('still resolves a workspace name without any delimiter', () => {
            const item: SearchQueryItem = {
                keyForList: POLICY_ID,
                roomType: CONST.SEARCH.DATA_TYPES.EXPENSE,
                policyID: POLICY_ID,
                autocompleteID: POLICY_ID,
                searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION,
            };

            const {seededQuery, submittedQuery} = submitContextualSuggestion(item, buildPolicies('Acme'));

            expect(seededQuery).toBe('type:expense workspace:Acme');
            expect(submittedQuery).toBe(`type:expense workspace:${POLICY_ID}`);
        });
    });
});
