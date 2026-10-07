import {act, render} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {MoneyRequestNavigatorParamList, ReportsSplitNavigatorParamList, RightModalNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import createPlatformStackNavigator from '@navigation/PlatformStackNavigation/createPlatformStackNavigator';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {InitialState} from '@react-navigation/native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

/** Report the per diem flow was started from (global create), which stays on the start route underneath. */
const START_REPORT_ID = '111';

/** Expense chat of the workspace picked in the per diem workspace selector, which the deeper steps are targeted at. */
const WORKSPACE_EXPENSE_CHAT_ID = '222';

const TRANSACTION_ID = '333';

const ACTION = CONST.IOU.ACTION.CREATE;
const IOU_TYPE = CONST.IOU.TYPE.CREATE;

const RootStack = createRootStackNavigator();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const ReportsSplit = createSplitNavigator<ReportsSplitNavigatorParamList>();
const RightModalNavigatorStack = createSplitNavigator<RightModalNavigatorParamList>();
const MoneyRequestStack = createPlatformStackNavigator<MoneyRequestNavigatorParamList>();

const getEmptyComponent = () => jest.fn();

// The shared TestNavigationContainer only registers the settings modal inside the right modal navigator, so a money
// request state passed to it collapses to the settings screen. This file registers the per diem screens it asserts on.
function TestMoneyRequestNavigator() {
    return (
        <MoneyRequestStack.Navigator>
            <MoneyRequestStack.Screen
                name={SCREENS.MONEY_REQUEST.CREATE}
                getComponent={getEmptyComponent}
            />
            <MoneyRequestStack.Screen
                name={SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION}
                getComponent={getEmptyComponent}
            />
            <MoneyRequestStack.Screen
                name={SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME}
                getComponent={getEmptyComponent}
            />
        </MoneyRequestStack.Navigator>
    );
}

function TestRightModalNavigator() {
    return (
        <RightModalNavigatorStack.Navigator
            defaultCentralScreen={SCREENS.RIGHT_MODAL.MONEY_REQUEST}
            parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
        >
            <RightModalNavigatorStack.Screen
                name={SCREENS.RIGHT_MODAL.MONEY_REQUEST}
                component={TestMoneyRequestNavigator}
            />
        </RightModalNavigatorStack.Navigator>
    );
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
        </TabNav.Navigator>
    );
}

function renderNavigation(initialState: InitialState) {
    render(
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
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
        </NavigationContainer>,
    );
}

/**
 * Renders the wizard as it exists after the workspace selector: the destination and time steps point at the picked
 * workspace's expense chat, while the start route beneath them still points at the report the flow started from.
 */
function renderTimeStepOverWorkspaceDestination() {
    renderNavigation({
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
                                index: 1,
                                routes: [{name: SCREENS.INBOX}, {name: SCREENS.REPORT, params: {reportID: START_REPORT_ID}}],
                            },
                        },
                    ],
                },
            },
            {
                name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [
                        {
                            name: SCREENS.RIGHT_MODAL.MONEY_REQUEST,
                            state: {
                                index: 2,
                                routes: [
                                    {
                                        name: SCREENS.MONEY_REQUEST.CREATE,
                                        params: {action: ACTION, iouType: IOU_TYPE, transactionID: TRANSACTION_ID, reportID: START_REPORT_ID},
                                    },
                                    {
                                        name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION,
                                        params: {action: ACTION, iouType: IOU_TYPE, transactionID: TRANSACTION_ID, reportID: WORKSPACE_EXPENSE_CHAT_ID},
                                    },
                                    {
                                        name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME,
                                        params: {action: ACTION, iouType: IOU_TYPE, transactionID: TRANSACTION_ID, reportID: WORKSPACE_EXPENSE_CHAT_ID},
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    });
}

function getMoneyRequestStackRoutes() {
    return navigationRef.current
        ?.getRootState()
        .routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)
        ?.state?.routes.at(0)?.state?.routes;
}

describe('Going back from the per diem time step', () => {
    beforeEach(() => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('Should pop to the destination step when the back path is rebuilt from the time route params', () => {
        // Given the time step opened on top of a destination step targeted at the picked workspace's expense chat
        renderTimeStepOverWorkspaceDestination();

        const routesBeforeGoBack = getMoneyRequestStackRoutes();
        expect(routesBeforeGoBack).toHaveLength(3);
        expect(routesBeforeGoBack?.at(-1)?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME);

        // When going back to the destination step rebuilt from the time route's own params, as the time step does
        act(() => {
            Navigation.goBack(
                createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION.path, ROUTES.MONEY_REQUEST_CREATE.getRoute(ACTION, IOU_TYPE, TRANSACTION_ID, WORKSPACE_EXPENSE_CHAT_ID)),
            );
        });

        // Then the time step is popped and the destination step already in the stack becomes the topmost one
        const routesAfterGoBack = getMoneyRequestStackRoutes();
        expect(routesAfterGoBack).toHaveLength(2);
        expect(routesAfterGoBack?.at(-1)?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION);
        expect(routesAfterGoBack?.at(-1)?.params).toMatchObject({reportID: WORKSPACE_EXPENSE_CHAT_ID});
    });

    it('Should not match the destination step when the back path carries the start route reportID', () => {
        // Given the same stack, where the start route underneath still points at the report the flow was started from
        renderTimeStepOverWorkspaceDestination();

        // When going back to a destination step built on that start route, which is what deriving the back path from the
        // current URL produces because the dynamic suffixes carry no `:reportID` of their own
        act(() => {
            Navigation.goBack(
                createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION.path, ROUTES.MONEY_REQUEST_CREATE.getRoute(ACTION, IOU_TYPE, TRANSACTION_ID, START_REPORT_ID)),
            );
        });

        // Then no route in the stack matches, so the time step is replaced with another destination step instead of
        // being popped - the duplicated suffix that made back land on a not found page in #97558
        const routesAfterGoBack = getMoneyRequestStackRoutes();
        expect(routesAfterGoBack).toHaveLength(3);
        expect(routesAfterGoBack?.at(-1)?.name).toBe(SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION);
        expect(routesAfterGoBack?.at(-1)?.params).toMatchObject({reportID: START_REPORT_ID});
    });
});
