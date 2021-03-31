import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/setpassword';

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
            name="SetPassword"
            options={defaultScreenOptions}
            component={SetPasswordPage}
        />
    </RootStack.Navigator>
);
