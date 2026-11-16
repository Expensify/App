/**
 * Renders a real navigation tree with a tab navigator, the right modal navigator (RHP) and the create expense
 * (MoneyRequest) stack inside it, so tests can drive steps of a create expense flow through the real navigators.
 * Each step renders the component a test passes in, or nothing.
 */

import {act, render} from '@testing-library/react-native';

import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import type {MoneyRequestNavigatorParamList, RightModalNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import createPlatformStackNavigator from '@navigation/PlatformStackNavigation/createPlatformStackNavigator';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {TupleToUnion} from 'type-fest';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';

/** The create expense steps this tree registers */
const MONEY_REQUEST_TEST_SCREENS = [SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME] as const;

type MoneyRequestTestScreen = TupleToUnion<typeof MONEY_REQUEST_TEST_SCREENS>;

type RenderMoneyRequestNavigationParams = {
    /** The steps open in the create expense stack, from the first one to the one on top */
    openSteps: MoneyRequestTestScreen[];

    /** The component each step renders. Steps left out render nothing. */
    stepComponents?: Partial<Record<MoneyRequestTestScreen, React.ComponentType>>;

    /** The params every open step gets */
    stepParams?: Record<string, unknown>;
};

const RootStack = createRootStackNavigator();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const RightModalNavigatorStack = createSplitNavigator<RightModalNavigatorParamList>();
const MoneyRequestStack = createPlatformStackNavigator<MoneyRequestNavigatorParamList>();

function EmptyScreen() {
    return null;
}

/** The navigation of the RHP route in the root stack. Clicking outside the RHP calls `goBack` on it. */
let rhpNavigation: Pick<ReturnType<typeof useNavigation>, 'goBack'> | undefined;

let stepComponentsForRender: Partial<Record<MoneyRequestTestScreen, React.ComponentType>> = {};

function TestMoneyRequestNavigator() {
    return (
        <MoneyRequestStack.Navigator>
            {MONEY_REQUEST_TEST_SCREENS.map((screenName) => (
                <MoneyRequestStack.Screen
                    key={screenName}
                    name={screenName}
                    getComponent={() => stepComponentsForRender[screenName] ?? EmptyScreen}
                />
            ))}
        </MoneyRequestStack.Navigator>
    );
}

function TestRightModalNavigator() {
    const navigation = useNavigation();

    useEffect(() => {
        rhpNavigation = navigation;
        return () => {
            rhpNavigation = undefined;
        };
    }, [navigation]);

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

function TestTabNavigator() {
    return (
        <TabNav.Navigator screenOptions={{headerShown: false}}>
            <TabNav.Screen
                name={SCREENS.HOME}
                component={EmptyScreen}
            />
        </TabNav.Navigator>
    );
}

function renderMoneyRequestNavigation({openSteps, stepComponents = {}, stepParams = {}}: RenderMoneyRequestNavigationParams) {
    stepComponentsForRender = stepComponents;
    return render(
        <NavigationContainer
            ref={navigationRef}
            initialState={{
                index: 1,
                routes: [
                    {name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.HOME}]}},
                    {
                        name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                        state: {
                            index: 0,
                            routes: [
                                {
                                    name: SCREENS.RIGHT_MODAL.MONEY_REQUEST,
                                    state: {index: openSteps.length - 1, routes: openSteps.map((name) => ({name, params: stepParams}))},
                                },
                            ],
                        },
                    },
                ],
            }}
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

/** Sends the same action as clicking the overlay outside the RHP: a back without a target from the RHP route */
function clickOutsideRHP() {
    act(() => {
        rhpNavigation?.goBack();
    });
}

function getRootRouteNames() {
    return navigationRef.current?.getRootState().routes.map((route) => route.name);
}

function getMoneyRequestStepNames() {
    return navigationRef.current
        ?.getRootState()
        .routes.find((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)
        ?.state?.routes.at(0)
        ?.state?.routes.map((route) => route.name);
}

export {renderMoneyRequestNavigation, clickOutsideRHP, getRootRouteNames, getMoneyRequestStepNames};
