import {render, screen} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import ScreenFreezeWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenFreezeWrapper';

import CONST from '@src/CONST';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

const SIDEBAR = 'Sidebar';
const COVERED_CENTRAL = 'CoveredCentral';
const TOP_CENTRAL = 'TopCentral';

type TestSplitNavigatorParamList = {
    [SIDEBAR]: undefined;
    [COVERED_CENTRAL]: undefined;
    [TOP_CENTRAL]: undefined;
};

const Split = createSplitNavigator<TestSplitNavigatorParamList>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

function SidebarScreen() {
    return <View testID="sidebar-content" />;
}

function CoveredCentralScreen() {
    return <View testID="covered-content" />;
}

function TopCentralScreen() {
    return <View testID="top-content" />;
}

const INITIAL_STATE = {
    index: 2,
    routes: [{name: SIDEBAR}, {name: COVERED_CENTRAL}, {name: TOP_CENTRAL}],
};

/**
 * Walks up from a screen's content to the wrapper the navigator picked for it, so the assertions read the behavior
 * that survived the whole option resolution instead of a hand-built descriptor.
 */
function getNonTopScreenWrapperOf(testID: string) {
    let node: ReturnType<typeof screen.getByTestId> | null = screen.getByTestId(testID, {includeHiddenElements: true});
    while (node) {
        if (node.type === ScreenFreezeWrapper || node.type === ScreenActivityWrapper) {
            return {wrapper: node.type, isScreenBlurred: typeof node.props.isScreenBlurred === 'boolean' ? node.props.isScreenBlurred : undefined};
        }
        node = node.parent;
    }
    return undefined;
}

function renderSplitNavigator() {
    render(
        <NavigationContainer
            ref={navigationRef}
            initialState={INITIAL_STATE}
        >
            <Split.Navigator
                sidebarScreen={SIDEBAR}
                defaultCentralScreen={COVERED_CENTRAL}
                parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
            >
                <Split.Screen
                    name={SIDEBAR}
                    component={SidebarScreen}
                />
                <Split.Screen
                    name={COVERED_CENTRAL}
                    component={CoveredCentralScreen}
                />
                <Split.Screen
                    name={TOP_CENTRAL}
                    component={TopCentralScreen}
                    options={{nonTopScreenBehavior: 'activity'}}
                />
            </Split.Navigator>
        </NavigationContainer>,
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    mockedGetIsNarrowLayout.mockReturnValue(false);
    mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});
});

describe('SplitNavigator non-top screen behavior', () => {
    it('freezes every covered screen that took the navigator default', () => {
        renderSplitNavigator();

        expect(getNonTopScreenWrapperOf('covered-content')).toEqual({wrapper: ScreenFreezeWrapper, isScreenBlurred: true});
        expect(getNonTopScreenWrapperOf('sidebar-content')).toEqual({wrapper: ScreenFreezeWrapper, isScreenBlurred: true});
    });

    it('lets a screen override the navigator default with its own option', () => {
        renderSplitNavigator();

        expect(getNonTopScreenWrapperOf('top-content')?.wrapper).toBe(ScreenActivityWrapper);
    });

    it('marks the top screen as not covered', () => {
        renderSplitNavigator();

        expect(getNonTopScreenWrapperOf('top-content')?.isScreenBlurred).toBe(false);
    });
});
