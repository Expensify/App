import {act, render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {InitialState} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';
import React from 'react';

import TestNavigationContainer from '../utils/TestNavigationContainer';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

/** The TabNavigator of a warm app sitting on the Inbox. */
const WARM_APP_TAB_ROUTE = {
    name: NAVIGATORS.TAB_NAVIGATOR,
    state: {
        index: 1,
        routes: [
            {name: SCREENS.HOME},
            {
                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [{name: SCREENS.INBOX}],
                },
            },
            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
            {name: SCREENS.INSIGHTS},
            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
            {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
        ],
    },
} satisfies NonNullable<InitialState['routes']>[number];

const WARM_APP_STATE: InitialState = {
    index: 0,
    routes: [WARM_APP_TAB_ROUTE],
};

/**
 * A deep link to /r/<reportID>/details is adapted into a root RESET that puts the RightModalNavigator on top of a
 * TabNavigator whose ReportsSplitNavigator only holds the Report screen. Because the routes are keyless, the split
 * navigator is created from scratch while the root state already holds the side modal.
 */
function dispatchReportDetailsDeepLink(reportID: string) {
    navigationRef.current?.dispatch(
        CommonActions.reset({
            index: 1,
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [
                            {name: SCREENS.HOME},
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {
                                    index: 0,
                                    routes: [{name: SCREENS.REPORT, params: {reportID}}],
                                },
                            },
                            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                            {name: SCREENS.INSIGHTS},
                            {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                            {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                        ],
                    },
                },
                {
                    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [{name: SCREENS.RIGHT_MODAL.SETTINGS}],
                    },
                },
            ],
        }),
    );
}

function getReportsSplitState() {
    const tabNavigatorState = navigationRef.current?.getRootState().routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR)?.state;
    return tabNavigatorState?.routes.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)?.state;
}

describe('Split navigator sidebar with a side modal on the root stack', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('keeps the sidebar under a split navigator created while a side modal is on the root stack', () => {
        // Given an already running app on a narrow layout
        render(<TestNavigationContainer initialState={WARM_APP_STATE} />);

        // When a deep link recreates the reports split navigator underneath a right modal
        act(() => {
            dispatchReportDetailsDeepLink('1234');
        });

        // Then the Inbox sidebar is kept underneath the report, so there is something to go back to
        expect(navigationRef.current?.getRootState().routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
        expect(getReportsSplitState()?.routes.map((route) => route.name)).toEqual([SCREENS.INBOX, SCREENS.REPORT]);
    });

    it('goes back to the Inbox from a report opened underneath a side modal', () => {
        // Given an already running app on a narrow layout that received the deep link
        render(<TestNavigationContainer initialState={WARM_APP_STATE} />);
        act(() => {
            dispatchReportDetailsDeepLink('1234');
        });

        // When the right modal is dismissed and the user goes back from the report
        act(() => {
            Navigation.goBack();
        });
        act(() => {
            Navigation.goBack();
        });

        // Then the user lands on the Inbox instead of being stranded on the report
        expect(getReportsSplitState()?.routes.at(-1)?.name).toBe(SCREENS.INBOX);
    });

    it('still treats a second full screen route on the root stack as a non-initial route', () => {
        // Given an already running app on a narrow layout with two TabNavigators on the root stack
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
                    routes: [
                        WARM_APP_TAB_ROUTE,
                        {
                            name: NAVIGATORS.TAB_NAVIGATOR,
                            state: {
                                index: 2,
                                routes: [
                                    {name: SCREENS.HOME},
                                    {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                                    {
                                        name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                                        state: {
                                            index: 0,
                                            routes: [{name: SCREENS.SEARCH.ROOT}],
                                        },
                                    },
                                    {name: SCREENS.INSIGHTS},
                                    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                                    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                                ],
                            },
                        },
                    ],
                }}
            />,
        );

        // When a settings split navigator is created on the narrow layout
        act(() => {
            Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute());
        });

        // Then the sidebar is not added, because the TabNavigator is not the only full screen root route
        const tabNavigatorState = navigationRef.current?.getRootState().routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR)?.state;
        const settingsSplitState = tabNavigatorState?.routes.findLast((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)?.state;
        expect(settingsSplitState?.routes.some((route) => route.name === SCREENS.SETTINGS.ROOT)).toBe(false);
        expect(settingsSplitState?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.PROFILE.ROOT);
    });
});
