/**
 * Creates the bottom-tab navigator of the app with screen options that also carry nonTopScreenBehavior, so a tab
 * can opt into React <Activity> the same way a stack screen does.
 */
import type {BottomTabScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import type {BottomTabNavigationEventMap, BottomTabNavigationProp, BottomTabNavigatorProps} from '@react-navigation/bottom-tabs';
import type {TabNavigationState} from '@react-navigation/native';
import type {ComponentType} from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

type TabNavigatorID = string | undefined;

// The default type bag of createBottomTabNavigator, with BottomTabScreenOptions in place of BottomTabNavigationOptions.
type TabNavigatorTypeBag = {
    ParamList: TabNavigatorParamList;
    NavigatorID: TabNavigatorID;
    State: TabNavigationState<TabNavigatorParamList>;
    ScreenOptions: BottomTabScreenOptions;
    EventMap: BottomTabNavigationEventMap;
    NavigationList: {
        [RouteName in keyof TabNavigatorParamList]: BottomTabNavigationProp<TabNavigatorParamList, RouteName, TabNavigatorID>;
    };
    Navigator: ComponentType<BottomTabNavigatorProps>;
};

function createTabNavigator() {
    return createBottomTabNavigator<TabNavigatorParamList, TabNavigatorID, TabNavigatorTypeBag>();
}

export default createTabNavigator;
