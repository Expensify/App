/** Verifies the expense searches behind a Compliance chart point. */
import {render, waitFor} from '@testing-library/react-native';

import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsDetailsParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON, getFilterFromQuery} from '@libs/SearchQueryUtils';

import InsightsDetailsPage from '@pages/Insights/details/InsightsDetailsPage';
import InsightsTopExpenses from '@pages/Insights/details/InsightsTopExpenses';
import useRequestInsightsDetails from '@pages/Insights/details/useRequestInsightsDetails';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/Header', () => Object.assign(() => null, {BackButton: () => null, Title: () => null}));
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(() => null));
jest.mock('@pages/Insights/details/InsightsTopExpenses', () => jest.fn(() => null));
jest.mock('@pages/Insights/details/useRequestInsightsDetails', () => jest.fn());

const member = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    role: CONST.POLICY.ROLE.USER,
};
const admin = {
    ...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE),
    role: CONST.POLICY.ROLE.ADMIN,
};
const auditor = {
    ...createRandomPolicy(3, CONST.POLICY.TYPE.CORPORATE),
    role: CONST.POLICY.ROLE.AUDITOR,
};
const navigation = createMock<PlatformStackScreenProps<InsightsDetailsParamList, typeof SCREENS.INSIGHTS_DETAILS>['navigation']>({});
const pickedPeriod = {
    dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE,
    graphKey: CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME,
    item: '2026-09-01',
    end: '2026-09-30',
};

describe('Compliance Details workspace scope', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, Object.fromEntries([member, admin, auditor].map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy])));
    });

    it.each([
        {selection: [], expected: [admin.id, auditor.id]},
        {selection: [member.id, auditor.id], expected: [auditor.id]},
        {selection: [member.id], expected: []},
    ])('limits the flagged expenses and View all to eligible workspaces for selection $selection', async ({selection, expected}) => {
        // Given flagged expenses could be visible to Search in both eligible and member-only workspaces
        const policyFilter = selection.length ? ` policyID:${selection.join(',')}` : '';
        await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {
            [CONST.INSIGHTS.SEARCH_KEY.COMPLIANCE]: {
                query: `groupBy:month date:last-12-months${policyFilter}`,
            },
        });

        // When the September point opens its Details panel
        render(
            <InsightsDetailsPage
                route={{
                    key: 'details',
                    name: SCREENS.INSIGHTS_DETAILS,
                    params: pickedPeriod,
                }}
                navigation={navigation}
            />,
        );

        // Then every request with a resolved query includes the eligible workspaces, even before the panel finishes loading
        if (!expected.length) {
            await waitFor(() => expect(FullPageNotFoundView).toHaveBeenCalled());
            expect(jest.mocked(useRequestInsightsDetails).mock.calls.every(([, query]) => !query)).toBe(true);
            expect(InsightsTopExpenses).not.toHaveBeenCalled();
            return;
        }
        await waitFor(() => expect(InsightsTopExpenses).toHaveBeenCalled());
        const requested = jest.mocked(useRequestInsightsDetails).mock.lastCall?.[1];
        const shown = jest.mocked(InsightsTopExpenses).mock.lastCall?.[0];
        const viewAll = buildSearchQueryJSON(shown?.viewAllQuery ?? '');
        for (const query of [...jest.mocked(useRequestInsightsDetails).mock.calls.flatMap(([, searchQuery]) => (searchQuery ? [searchQuery] : [])), viewAll]) {
            expect(getFilterFromQuery(query, CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID).value).toEqual(expected);
            expect(query?.inputQuery).toContain('has:submitted-violation');
            expect(query?.inputQuery).toContain('anySubmission>=2026-09-01');
            expect(query?.inputQuery).toContain('anySubmission<=2026-09-30');
        }
        expect(shown?.queryJSON.hash).toBe(requested?.hash);
        expect(requested?.limit).toBe(10);
        expect(viewAll?.limit).toBeUndefined();
    });
});
