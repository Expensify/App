/** Keeps Insights navigation accessible while dashboard controls scroll away in either phone orientation. */
import {render, screen, within} from '@testing-library/react-native';

import ScrollView from '@components/ScrollView';
import MockText from '@components/Text';

import * as useMultipleSnapshotsModule from '@hooks/useMultipleSnapshots';
import * as useNetworkModule from '@hooks/useNetwork';
import * as useOnyxModule from '@hooks/useOnyx';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';

import * as chartWidgetModule from '@pages/Insights/charts/InsightsChartWidget';
import InsightsDashboard from '@pages/Insights/InsightsDashboard';
import DEFAULT_INSIGHTS_FILTERS from '@pages/Insights/insightsFilters';
import buildInsightsJsonQuery from '@pages/Insights/insightsQueries';
import * as dashboardState from '@pages/Insights/resolveDashboardState';
import * as useInsightsFiltersModule from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboard as InsightsDashboardRecord, SearchResults} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type {ScrollViewProps, View as NativeView} from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/ScreenWrapper', () => jest.requireActual<{View: typeof NativeView}>('react-native').View);
jest.mock('@components/ScrollView', () => jest.requireActual<{ScrollView: React.ComponentType<ScrollViewProps>}>('react-native').ScrollView);
jest.mock('@components/Navigation/TopBar', () => () => <MockText>Insights header</MockText>);
jest.mock('@components/Navigation/TabBarBottomContent/TabRootScrollViewMarker', () => jest.requireActual<{View: typeof NativeView}>('react-native').View);
jest.mock('@components/Navigation/TabBarBottomContent/useTabRootScreenWrapperProps', () => () => ({}));
jest.mock('@components/Navigation/TabBarBottomContent/useTabRootScrollProps', () => (contentContainerStyle: unknown) => ({contentContainerStyle}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({}));
jest.mock('@hooks/useIsTabVisible', () => () => false);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, numberFormat: String}));
jest.mock('@hooks/useMultipleSnapshots', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/useScrollEventEmitter', () => () => jest.fn());
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));
jest.mock('@pages/Insights/charts/InsightsChartWidget', () => ({__esModule: true, default: () => <MockText>Chart</MockText>}));
jest.mock('@pages/Insights/controls/InsightsPageControls', () => () => <MockText>Page controls</MockText>);
jest.mock('@pages/Insights/InsightsTabSelector', () => () => <MockText>Dashboard tabs</MockText>);
jest.mock('@pages/Insights/InsightsTagPolicyLoader', () => () => null);
jest.mock('@pages/Insights/states/InsightsEmptyState', () => () => <MockText>No chart data</MockText>);
jest.mock('@pages/Insights/states/InsightsUpsellState', () => () => <MockText>Upgrade</MockText>);
jest.mock('@pages/Insights/useInsightsFilters', () => ({__esModule: true, default: () => ({filters: {policyIDs: []}, isResolved: false, tagLevelOptions: []})}));
jest.mock('@pages/Insights/useInsightsExport', () => () => ({}));

const DASHBOARDS = [CONST.INSIGHTS.DASHBOARD.SPEND, CONST.INSIGHTS.DASHBOARD.COMPLIANCE];

function getDashboard() {
    return (
        <InsightsDashboard
            dashboardID={CONST.INSIGHTS.DASHBOARD.SPEND}
            accessibleDashboards={DASHBOARDS}
        />
    );
}

function mockLayout(isInLandscapeMode: boolean, shouldUseNarrowLayout = true) {
    jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue(createMock<ReturnType<typeof useResponsiveLayoutModule.default>>({shouldUseNarrowLayout, isInLandscapeMode}));
}

function expectHeaderPlacement(shouldScroll: boolean) {
    const scrollView = screen.UNSAFE_getByType(ScrollView);
    expect(screen.getAllByText('Insights header')).toHaveLength(1);
    expect(within(scrollView).queryByText('Insights header')).toBeNull();
    for (const label of ['Dashboard tabs', 'Page controls']) {
        expect(screen.getAllByText(label)).toHaveLength(1);
        if (shouldScroll) {
            expect(within(scrollView).getByText(label)).toBeOnTheScreen();
        } else {
            expect(within(scrollView).queryByText(label)).toBeNull();
        }
    }
}

describe('Insights dashboard header layout', () => {
    afterEach(() => jest.restoreAllMocks());

    it.each([dashboardState.INSIGHTS_DASHBOARD_STATE.READY, dashboardState.INSIGHTS_DASHBOARD_STATE.EMPTY, dashboardState.INSIGHTS_DASHBOARD_STATE.UPSELL])(
        'scrolls only dashboard controls in the %s state in both phone orientations',
        (state) => {
            // Given a phone in portrait, where tabs and filters must not reduce chart space
            mockLayout(false);
            jest.spyOn(dashboardState, 'getDashboardState').mockReturnValue(state);
            const {rerender} = render(getDashboard());
            expectHeaderPlacement(true);

            // When the phone rotates to landscape
            mockLayout(true);
            rerender(getDashboard());

            // Then tabs and filters free vertical space without hiding the main navigation
            expectHeaderPlacement(true);

            // When the phone returns to portrait
            mockLayout(false);
            rerender(getDashboard());

            // Then only the main navigation remains fixed, just as in landscape
            expectHeaderPlacement(true);
        },
    );

    it.each([false, true])('keeps the header and controls fixed on a wide layout with landscape=%s', (isInLandscapeMode) => {
        // Given a wide dashboard, which must not gain the phone-only scroll-away treatment
        mockLayout(isInLandscapeMode, false);
        jest.spyOn(dashboardState, 'getDashboardState').mockReturnValue(dashboardState.INSIGHTS_DASHBOARD_STATE.READY);

        // When the dashboard renders
        render(getDashboard());

        // Then its header stays outside the chart scroller
        expectHeaderPlacement(false);
    });
});

describe('Insights Spend headline cache', () => {
    afterEach(() => jest.restoreAllMocks());

    it.each([false, true])('switches back offline after level two refreshes (legacy level one: %s)', (isLegacy) => {
        // Given level one was cached before level two loaded a higher Spend total
        const dashboardID = CONST.INSIGHTS.DASHBOARD.SPEND;
        const levelOneFilters = {...DEFAULT_INSIGHTS_FILTERS[dashboardID], tagLevel: 1, groupCurrency: CONST.CURRENCY.USD};
        const levelTwoFilters = {...levelOneFilters, tagLevel: 2};
        const levelOne = buildInsightsJsonQuery(dashboardID, levelOneFilters, []);
        const levelTwo = buildInsightsJsonQuery(dashboardID, levelTwoFilters, []);
        const snapshotHash = levelTwo?.headlineChart.queryJSON?.hash;
        const previousPeriodSnapshotHash = levelTwo?.headlineChart.previousPeriodQueryJSON?.hash;
        const levelTwoResponseID = 'level-two';
        const levelOneSummary = {current: {total: 10000, expenseCount: 2}};
        const levelTwoSummary = {current: {total: 20000, expenseCount: 3}, previous: {total: 30000, expenseCount: 4}};
        const graphs = {
            [`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}_${levelOne?.hash}`]: {
                inputQuery: 'tagLevel:1',
                insightsResponseID: isLegacy ? undefined : 'level-one',
                graphs: {[CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME]: {snapshotHash, headlineSummary: levelOneSummary}},
            },
            [`${ONYXKEYS.COLLECTION.INSIGHTS}${dashboardID}_${levelTwo?.hash}`]: {
                inputQuery: 'tagLevel:2',
                insightsResponseID: levelTwoResponseID,
                graphs: {[CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME]: {snapshotHash, previousPeriodSnapshotHash, headlineSummary: levelTwoSummary}},
            },
        } satisfies Record<string, InsightsDashboardRecord>;
        const monthGroup = `${CONST.SEARCH.GROUP_PREFIX}january` as const;
        const snapshot = createMock<SearchResults>({
            insightsResponseID: levelTwoResponseID,
            search: {hash: snapshotHash, type: CONST.SEARCH.DATA_TYPES.EXPENSE, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED},
            data: {[monthGroup]: {total: 20000, count: 3}},
        });
        const previousPeriodSnapshot = createMock<SearchResults>({insightsResponseID: levelTwoResponseID});
        const snapshots = {[String(snapshotHash)]: snapshot, [String(previousPeriodSnapshotHash)]: previousPeriodSnapshot};
        let filters = levelTwoFilters;
        mockLayout(false);
        jest.spyOn(useNetworkModule, 'default').mockReturnValue(createMock<ReturnType<typeof useNetworkModule.default>>({isOffline: true}));
        jest.spyOn(useInsightsFiltersModule, 'default').mockImplementation(() =>
            createMock<ReturnType<typeof useInsightsFiltersModule.default>>({filters, isResolved: true, tagLevelOptions: []}),
        );
        jest.spyOn(useOnyxModule, 'default').mockImplementation((key) => createMock<ReturnType<typeof useOnyxModule.default>>([key === ONYXKEYS.COLLECTION.POLICY ? {} : graphs[key]]));
        jest.spyOn(useMultipleSnapshotsModule, 'default').mockImplementation((hashes) =>
            Object.fromEntries(hashes.filter((hash) => hash in snapshots).map((hash) => [hash, snapshots[hash]])),
        );
        const renderChart = jest.spyOn(chartWidgetModule, 'default');
        const {rerender} = render(getDashboard());
        const getHeadline = () => renderChart.mock.calls.findLast(([props]) => props.isHeadline)?.[0];
        expect(getHeadline()?.snapshot).toBe(snapshot);
        expect(getHeadline()?.headlineSummary).toEqual(levelTwoSummary);

        // When the user switches back to level one offline
        filters = levelOneFilters;
        rerender(getDashboard());

        // Then the shared chart stays visible without level one's stale summary
        expect(getHeadline()?.snapshot).toBe(snapshot);
        expect(getHeadline()?.headlineSummary).toBeUndefined();

        // When only the previous-period rows no longer match
        filters = levelTwoFilters;
        snapshots[String(previousPeriodSnapshotHash)] = {...previousPeriodSnapshot, insightsResponseID: 'earlier-response'};
        rerender(getDashboard());

        // Then the current total remains without a comparison against those rows
        expect(getHeadline()?.headlineSummary).toEqual({current: levelTwoSummary.current});
    });
});
