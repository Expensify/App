import {act, render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import {handleExitToNavigation} from '@userActions/Session';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {InitialState} from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import TestNavigationContainer from '../utils/TestNavigationContainer';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@pages/inbox/sidebar/NavigationTabBarAvatar');

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

const REPORT_ID = '1';

function getRoutesWithTabNavigatorUnderValidateLogin(activeTabIndex: number): InitialState['routes'] {
    return [
        {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {
                index: activeTabIndex,
                routes: [
                    {name: SCREENS.HOME},
                    {
                        name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                        state: {index: 0, routes: [{name: SCREENS.INBOX}]},
                    },
                    {
                        name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                        state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]},
                    },
                    {name: SCREENS.INSIGHTS},
                    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                ],
            },
        },
        {name: SCREENS.VALIDATE_LOGIN},
    ];
}

function getTabNavigatorStates() {
    return navigationRef.current
        ?.getRootState()
        .routes.filter((route) => route.name === NAVIGATORS.TAB_NAVIGATOR)
        .map((route) => route.state);
}

function hasValidateLoginRoute() {
    return !!navigationRef.current?.getRootState().routes.some((route) => route.name === SCREENS.VALIDATE_LOGIN);
}

async function runHandleExitToNavigation() {
    await act(async () => {
        handleExitToNavigation(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
        await waitForBatchedUpdates();
    });
}

describe('handleExitToNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
            shouldUseNarrowLayout: true,
        });
        jest.spyOn(Navigation, 'waitForProtectedRoutes').mockResolvedValue();
        await Onyx.set(ONYXKEYS.SESSION, {authToken: 'authToken', accountID: 1});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
    });

    it('opens the report inside the Inbox tab when the link is opened from Inbox', async () => {
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
                    routes: getRoutesWithTabNavigatorUnderValidateLogin(1),
                }}
            />,
        );

        await runHandleExitToNavigation();

        expect(hasValidateLoginRoute()).toBe(false);
        const tabState = getTabNavigatorStates()?.at(-1);
        const focusedTab = tabState?.routes.at(tabState.index ?? 0);
        expect(focusedTab?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(focusedTab?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
    });

    it('keeps Spend under the report when the link is opened from Spend', async () => {
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
                    routes: getRoutesWithTabNavigatorUnderValidateLogin(2),
                }}
            />,
        );

        await runHandleExitToNavigation();

        expect(hasValidateLoginRoute()).toBe(false);
        const tabStates = getTabNavigatorStates();
        const focusedTabState = tabStates?.at(-1);
        const focusedTab = focusedTabState?.routes.at(focusedTabState.index ?? 0);
        expect(focusedTab?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(focusedTab?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
        expect(tabStates?.at(0)?.index).toBe(2);
    });

    it('removes ValidateLogin even when a pop to sidebar is pending', async () => {
        render(
            <TestNavigationContainer
                initialState={{
                    index: 1,
                    routes: getRoutesWithTabNavigatorUnderValidateLogin(1),
                }}
            />,
        );
        Navigation.setShouldPopToSidebar(true);

        await runHandleExitToNavigation();

        expect(hasValidateLoginRoute()).toBe(false);
        const tabState = getTabNavigatorStates()?.at(-1);
        const focusedTab = tabState?.routes.at(tabState.index ?? 0);
        expect(focusedTab?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(focusedTab?.state?.routes.at(-1)?.name).toBe(SCREENS.REPORT);
        Navigation.setShouldPopToSidebar(false);
    });

    it('goes back to Home when ValidateLogin is the only route', async () => {
        const goBackSpy = jest.spyOn(Navigation, 'goBack');
        render(<TestNavigationContainer initialState={{index: 0, routes: [{name: SCREENS.VALIDATE_LOGIN}]}} />);

        await runHandleExitToNavigation();

        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.HOME, {
            waitForTransition: true,
        });
    });
});
