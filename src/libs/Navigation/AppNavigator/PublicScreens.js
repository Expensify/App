import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordForm from '../../../pages/SetPasswordForm';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';

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
        <RootStack.Screen
            name="ValidateLogin"
            options={defaultScreenOptions}
            component={ValidateLoginPage}
        />
        <RootStack.Screen
            name="SetPassword"
            options={defaultScreenOptions}
            component={SetPasswordForm}
        />
    </RootStack.Navigator>
);
