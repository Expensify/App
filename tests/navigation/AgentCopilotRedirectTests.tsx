import {act, render, waitFor} from '@testing-library/react-native';

import useIsAgentAccount from '@hooks/useIsAgentAccount';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import withAgentAccessDenied from '@libs/Navigation/AppNavigator/withAgentAccessDenied';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, ReportsSplitNavigatorParamList, RightModalNavigatorParamList, SettingsSplitNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {InitialState, NavigatorScreenParams} from '@react-navigation/native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

jest.mock('@hooks/useIsAgentAccount', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

const mockedUseIsAgentAccount = jest.mocked(useIsAgentAccount);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);

type TestRootParamList = AuthScreensParamList & {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NavigatorScreenParams<ReportsSplitNavigatorParamList>;
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NavigatorScreenParams<SettingsSplitNavigatorParamList>;
};

const RootStack = createRootStackNavigator<TestRootParamList>();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const ReportsSplit = createSplitNavigator<ReportsSplitNavigatorParamList>();
const SettingsSplit = createSplitNavigator<SettingsSplitNavigatorParamList>();
const RightModalStack = createSplitNavigator<RightModalNavigatorParamList>();

const getEmptyComponent = () => jest.fn();

function AgentsPageStub() {
    return null;
}

function TestReportsSplitNavigator() {
    return (
        <ReportsSplit.Navigator
            sidebarScreen={SCREENS.INBOX}
            defaultCentralScreen={SCREENS.REPORT}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <ReportsSplit.Screen
                name={SCREENS.INBOX}
                getComponent={getEmptyComponent}
            />
            <ReportsSplit.Screen
                name={SCREENS.REPORT}
                getComponent={getEmptyComponent}
            />
        </ReportsSplit.Navigator>
    );
}

function TestSettingsSplitNavigator() {
    return (
        <SettingsSplit.Navigator
            sidebarScreen={SCREENS.SETTINGS.ROOT}
            defaultCentralScreen={SCREENS.SETTINGS.PROFILE.ROOT}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.ROOT}
                getComponent={getEmptyComponent}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.PROFILE.ROOT}
                getComponent={getEmptyComponent}
            />
            <SettingsSplit.Screen
                name={SCREENS.SETTINGS.AGENTS.ROOT}
                getComponent={withAgentAccessDenied(() => AgentsPageStub)}
            />
        </SettingsSplit.Navigator>
    );
}

function TestRightModalNavigator() {
    return (
        <RightModalStack.Navigator
            defaultCentralScreen={SCREENS.RIGHT_MODAL.SETTINGS}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <RightModalStack.Screen
                name={SCREENS.RIGHT_MODAL.SETTINGS}
                getComponent={getEmptyComponent()}
            />
            <RightModalStack.Screen
                name={SCREENS.RIGHT_MODAL.PROFILE}
                getComponent={getEmptyComponent()}
            />
        </RightModalStack.Navigator>
    );
}

function TestTabNavigator() {
    return (
        <TabNav.Navigator screenOptions={{headerShown: false}}>
            <TabNav.Screen
                name={SCREENS.HOME}
                component={getEmptyComponent()}
            />
            <TabNav.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={TestReportsSplitNavigator}
            />
            <TabNav.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={TestSettingsSplitNavigator}
            />
        </TabNav.Navigator>
    );
}

function TestContainer({initialState}: {initialState: InitialState}) {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
            onReady={Navigation.setIsNavigationReady}
        >
            <RootStack.Navigator>
                <RootStack.Screen
                    name={NAVIGATORS.TAB_NAVIGATOR}
                    component={TestTabNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                    component={TestRightModalNavigator}
                />
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

const settingsTabWithAgents = {
    name: NAVIGATORS.TAB_NAVIGATOR,
    state: {
        index: 2,
        routes: [
            {name: SCREENS.HOME},
            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            {
                name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                state: {
                    index: 1,
                    routes: [{name: SCREENS.SETTINGS.ROOT}, {name: SCREENS.SETTINGS.AGENTS.ROOT}],
                },
            },
        ],
    },
};

const agentEditModal = {
    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    state: {
        index: 0,
        routes: [{name: SCREENS.RIGHT_MODAL.SETTINGS}],
    },
};

const agentChatTab = {
    name: NAVIGATORS.TAB_NAVIGATOR,
    state: {
        index: 1,
        routes: [
            {name: SCREENS.HOME},
            {
                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                state: {
                    index: 1,
                    routes: [{name: SCREENS.INBOX}, {name: SCREENS.REPORT, params: {reportID: '1'}}],
                },
            },
        ],
    },
};

const profileModal = {
    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    state: {
        index: 0,
        routes: [{name: SCREENS.RIGHT_MODAL.PROFILE}],
    },
};

function getRootState() {
    return navigationRef.current?.getRootState();
}

function getSettingsSplitState() {
    const tabState = getRootState()?.routes.at(0)?.state;
    return tabState?.routes.find((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)?.state;
}

async function expectAgentLandedOnProfileWithAccountUnderneath() {
    // Then every root entry created during the owner's session is gone, so no guarded route is left to re-fire the redirect
    await waitFor(
        () => {
            expect(getRootState()?.routes.length).toBe(1);
        },
        {timeout: CONST.MAX_TRANSITION_START_WAIT_MS * 3},
    );

    // Then the guarded agents route is replaced by Profile instead of Profile being pushed on top of it
    await waitFor(
        () => {
            expect(getSettingsSplitState()?.routes.map((route) => route.name)).toEqual([SCREENS.SETTINGS.ROOT, SCREENS.SETTINGS.PROFILE.ROOT]);
        },
        {timeout: CONST.MAX_TRANSITION_START_WAIT_MS * 3},
    );

    // Then going back from Profile lands on the Account page rather than looping back into Profile
    act(() => {
        Navigation.goBack();
    });
    expect(getSettingsSplitState()?.routes.at(-1)?.name).toBe(SCREENS.SETTINGS.ROOT);
}

describe('Agent copilot redirect', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({
            ...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE,
            shouldUseNarrowLayout: true,
        });
        mockedUseIsAgentAccount.mockReturnValue(true);
    });

    it('lands the agent on Profile with the Account page underneath when copiloting from the agent chat profile', async () => {
        // Given the stack built by Agents > agent > chat with agent > chat header, at the moment "Copilot into account" is tapped
        render(
            <TestContainer
                initialState={{
                    index: 3,
                    routes: [settingsTabWithAgents, agentEditModal, agentChatTab, profileModal],
                }}
            />,
        );

        // When the session flips to an agent and the guard redirects
        await expectAgentLandedOnProfileWithAccountUnderneath();
    });

    it('lands the agent on Profile with the Account page underneath when copiloting straight from the agent page', async () => {
        // Given the shorter stack built by Agents > agent, at the moment "Copilot into account" is tapped
        render(
            <TestContainer
                initialState={{
                    index: 1,
                    routes: [settingsTabWithAgents, agentEditModal],
                }}
            />,
        );

        // When the session flips to an agent and the guard redirects
        await expectAgentLandedOnProfileWithAccountUnderneath();
    });
});
