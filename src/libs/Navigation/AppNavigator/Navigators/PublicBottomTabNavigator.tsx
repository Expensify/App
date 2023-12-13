import {StackNavigationOptions} from '@react-navigation/stack';
import React from 'react';
import createCustomBottomTabNavigator from '@libs/Navigation/AppNavigator/createCustomBottomTabNavigator';
import {BottomTabNavigatorParamList} from '@libs/Navigation/types';
import SignInPage from '@pages/signin/SignInPage';
import SCREENS from '@src/SCREENS';

// This type is not exactly right because we are using the same route in public and auth screens.
const Tab = createCustomBottomTabNavigator<BottomTabNavigatorParamList>();

const screenOptions: StackNavigationOptions = {
    headerShown: false,
};

// The structure for the HOME route have to be the same in public and auth screens. That's why we need to wrap the HOME screen with "fake" bottomTabNavigator.
function PublicBottomTabNavigator() {
    return (
        <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen
                name={SCREENS.HOME}
                component={SignInPage}
            />
        </Tab.Navigator>
    );
}

PublicBottomTabNavigator.displayName = 'BottomTabNavigator';

export default PublicBottomTabNavigator;
