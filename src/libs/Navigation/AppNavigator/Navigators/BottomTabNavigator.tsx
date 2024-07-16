import {useNavigationState} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePrevious from '@hooks/usePrevious';
import {updateLastAccessedWorkspace} from '@libs/actions/Policy/Policy';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {BottomTabNavigatorParamList, BottomTabScreensParamList, NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import {isBottomTabName} from '@libs/NavigationUtils';
import SidebarScreen from '@pages/home/sidebar/SidebarScreen';
import SearchPageBottomTab from '@pages/Search/SearchPageBottomTab';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import ActiveBottomTabRouteContext from './ActiveBottomTabRouteContext';

const loadInitialSettingsPage = () => require<ReactComponentModule>('../../../../pages/settings/InitialSettingsPage').default;
const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

const screenOptions: StackNavigationOptions = {
    headerShown: false,
    animationEnabled: false,
};

function BottomTabNavigator() {
    const activeRoute = useNavigationState<RootStackParamList, NavigationPartialRoute<keyof BottomTabScreensParamList> | undefined>((state) => {
        if (!state) {
            return undefined;
        }
        let route: NavigationPartialRoute<keyof BottomTabScreensParamList> | undefined;
        for (const selector of [getTopmostBottomTabRoute, getTopmostCentralPaneRoute]) {
            const selectedRoute = selector(state);
            if (isBottomTabName(selectedRoute?.name)) {
                route = selectedRoute as NavigationPartialRoute<keyof BottomTabScreensParamList>;
            }
        }

        return route;
    });

    const {activeWorkspaceID} = useActiveWorkspace();
    const [selectedPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activeWorkspaceID ?? -1}`);
    const prevSelectedPolicy = usePrevious(selectedPolicy);
    useEffect(() => {
        if (!selectedPolicy && !prevSelectedPolicy) {
            return;
        }
        if (prevSelectedPolicy && !selectedPolicy && activeWorkspaceID !== undefined) {
            Navigation.navigateWithSwitchPolicyID({policyID: undefined});
            updateLastAccessedWorkspace(undefined);
        }
    }, [prevSelectedPolicy, selectedPolicy, activeWorkspaceID]);

    return (
        <ActiveBottomTabRouteContext.Provider value={activeRoute}>
            <Tab.Navigator screenOptions={screenOptions}>
                <Tab.Screen
                    name={SCREENS.HOME}
                    component={SidebarScreen}
                />
                <Tab.Screen
                    name={SCREENS.SEARCH.BOTTOM_TAB}
                    component={SearchPageBottomTab}
                />
                <Tab.Screen
                    name={SCREENS.SETTINGS.ROOT}
                    getComponent={loadInitialSettingsPage}
                />
            </Tab.Navigator>
        </ActiveBottomTabRouteContext.Provider>
    );
}

BottomTabNavigator.displayName = 'BottomTabNavigator';

export default BottomTabNavigator;
