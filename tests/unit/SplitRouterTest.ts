import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import SplitRouter from '@libs/Navigation/AppNavigator/createSplitNavigator/SplitRouter';

import SCREENS from '@src/SCREENS';

import type {ParamListBase, StackNavigationState} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

describe('SplitRouter', () => {
    it('handles navigating to the sidebar on a narrow layout when the sidebar is already the only screen', () => {
        // Given a narrow layout split navigator that shows only its sidebar, as the Inbox tab does at its chat list
        jest.mocked(getIsNarrowLayout).mockReturnValue(true);
        const router = SplitRouter({sidebarScreen: SCREENS.INBOX, defaultCentralScreen: SCREENS.REPORT, parentRoute: {key: 'split-key', name: 'ReportsSplitNavigator'}});
        const routeNames = [SCREENS.INBOX, SCREENS.REPORT];
        const state: StackNavigationState<ParamListBase> = {
            stale: false,
            type: 'stack',
            key: 'stack-key',
            index: 0,
            routeNames,
            preloadedRoutes: [],
            routes: [{key: 'inbox-key', name: SCREENS.INBOX}],
        };

        // When the sidebar is navigated to again, which happens when the tab's navigation params are applied to an already mounted navigator
        const result = router.getStateForAction(state, CommonActions.navigate(SCREENS.INBOX, undefined, {pop: true}), {routeNames, routeParamList: {}, routeGetIdList: {}});

        // Then the action is handled without changes, because an unhandled (null) result makes React Navigation log an error and ignore the navigation
        expect(result).toBe(state);
    });
});
