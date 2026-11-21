/** Keeps Insights navigation accessible while dashboard controls scroll away in phone landscape. */
import {render, screen, within} from '@testing-library/react-native';

import ScrollView from '@components/ScrollView';
import MockText from '@components/Text';

import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';

import InsightsDashboard from '@pages/Insights/InsightsDashboard';
import * as dashboardState from '@pages/Insights/resolveDashboardState';

import CONST from '@src/CONST';

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
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useMultipleSnapshots', () => () => ({}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/useScrollEventEmitter', () => () => jest.fn());
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));
jest.mock('@pages/Insights/charts/InsightsChartWidget', () => () => <MockText>Chart</MockText>);
jest.mock('@pages/Insights/controls/InsightsPageControls', () => () => <MockText>Page controls</MockText>);
jest.mock('@pages/Insights/InsightsTabSelector', () => () => <MockText>Dashboard tabs</MockText>);
jest.mock('@pages/Insights/InsightsTagPolicyLoader', () => () => null);
jest.mock('@pages/Insights/states/InsightsEmptyState', () => () => <MockText>No chart data</MockText>);
jest.mock('@pages/Insights/states/InsightsUpsellState', () => () => <MockText>Upgrade</MockText>);
jest.mock('@pages/Insights/useInsightsFilters', () => () => ({filters: {policyIDs: []}, isResolved: false, tagLevelOptions: []}));
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
        'scrolls only dashboard controls in the %s state in landscape and restores them in portrait',
        (state) => {
            // Given a phone in portrait, with the main header fixed above the content
            mockLayout(false);
            jest.spyOn(dashboardState, 'getDashboardState').mockReturnValue(state);
            const {rerender} = render(getDashboard());
            expectHeaderPlacement(false);

            // When the phone rotates to landscape
            mockLayout(true);
            rerender(getDashboard());

            // Then tabs and filters free vertical space without hiding the main navigation
            expectHeaderPlacement(true);

            // When the phone returns to portrait
            mockLayout(false);
            rerender(getDashboard());

            // Then the original fixed header is restored
            expectHeaderPlacement(false);
        },
    );

    it('keeps the header fixed on a wide layout', () => {
        // Given a wide dashboard, which must not gain the phone-only scroll-away treatment
        mockLayout(true, false);
        jest.spyOn(dashboardState, 'getDashboardState').mockReturnValue(dashboardState.INSIGHTS_DASHBOARD_STATE.READY);

        // When the dashboard renders
        render(getDashboard());

        // Then its header stays outside the chart scroller
        expectHeaderPlacement(false);
    });
});
