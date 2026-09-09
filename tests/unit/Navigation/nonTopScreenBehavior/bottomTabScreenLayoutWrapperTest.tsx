import {render, screen} from '@testing-library/react-native';

import createTabNavigator from '@libs/Navigation/AppNavigator/Navigators/createTabNavigator';
import HOME_TAB_SCREEN_OPTIONS from '@libs/Navigation/AppNavigator/Navigators/HOME_TAB_SCREEN_OPTIONS';
import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import findAncestorByType from '../../../utils/findAncestorByType';

const Tab = createTabNavigator();

function HomeScreen() {
    return <View testID="home-content" />;
}

function InboxScreen() {
    return <View testID="inbox-content" />;
}

function SearchScreen() {
    return <View testID="search-content" />;
}

function SettingsScreen() {
    return <View testID="settings-content" />;
}

function WorkspacesScreen() {
    return <View testID="workspaces-content" />;
}

function renderEmptyTabBar() {
    return null;
}

// Every tab is mounted at once (lazy: false), so the blurred ones are read among the hidden elements.
function getActivityWrapperOf(testID: string) {
    const wrapper = findAncestorByType(screen.getByTestId(testID, {includeHiddenElements: true}), [ScreenActivityWrapper]);
    if (!wrapper) {
        return undefined;
    }
    return {isScreenBlurred: typeof wrapper.props.isScreenBlurred === 'boolean' ? wrapper.props.isScreenBlurred : undefined};
}

describe('bottomTabScreenLayoutWrapper', () => {
    it('renders the Home tab inside ScreenActivityWrapper as a screen that is never blurred inside its own navigator', () => {
        // Given the tab navigator with the Home tab carrying its real options
        // When it is rendered through the bottom-tab screen layout
        render(
            <NavigationContainer>
                <Tab.Navigator
                    tabBar={renderEmptyTabBar}
                    screenOptions={{lazy: false}}
                    screenLayout={bottomTabScreenLayoutWrapper}
                >
                    <Tab.Screen
                        name={SCREENS.HOME}
                        component={HomeScreen}
                        options={HOME_TAB_SCREEN_OPTIONS}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                        component={InboxScreen}
                    />
                </Tab.Navigator>
            </NavigationContainer>,
        );

        // Then the Home content sits inside the activity wrapper, and the wrapper reads the cover state from the navigation context alone
        expect(getActivityWrapperOf('home-content')).toEqual({isScreenBlurred: false});
    });

    it('leaves the other tabs outside ScreenActivityWrapper', () => {
        // Given the tab navigator with the four other tabs carrying no options, as in the app
        // When it is rendered through the bottom-tab screen layout
        render(
            <NavigationContainer>
                <Tab.Navigator
                    tabBar={renderEmptyTabBar}
                    screenOptions={{lazy: false}}
                    screenLayout={bottomTabScreenLayoutWrapper}
                >
                    <Tab.Screen
                        name={SCREENS.HOME}
                        component={HomeScreen}
                        options={HOME_TAB_SCREEN_OPTIONS}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                        component={InboxScreen}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                        component={SearchScreen}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                        component={SettingsScreen}
                    />
                    <Tab.Screen
                        name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                        component={WorkspacesScreen}
                    />
                </Tab.Navigator>
            </NavigationContainer>,
        );

        // Then none of them is wrapped, because their split navigators keep persistent sidebars that must stay live
        for (const testID of ['inbox-content', 'search-content', 'settings-content', 'workspaces-content']) {
            expect(getActivityWrapperOf(testID)).toBeUndefined();
        }
    });
});
