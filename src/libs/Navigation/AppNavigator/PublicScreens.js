import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';

const RootStack = createStackNavigator();
const defaultScreenOptions = {
    cardStyle: {
        overflow: 'visible',
    },
    headerShown: false,
    animationTypeForReplace: 'pop',
};

export default () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name="SignIn"
            options={defaultScreenOptions}
            component={SignInPage}
        />
        {/* If we have a validation code but we're unauthenticated, route to the signin page */}
        <RootStack.Screen
            name="ValidateLogin"
            options={defaultScreenOptions}
            component={SignInPage}
        />
        <RootStack.Screen
            name="SetPassword"
            options={defaultScreenOptions}
            component={SetPasswordPage}
        />
    </RootStack.Navigator>
);
