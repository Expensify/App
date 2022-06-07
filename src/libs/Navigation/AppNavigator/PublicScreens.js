import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import LogInWithShortLivedTokenPage from '../../../pages/LogInWithShortLivedTokenPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator();

const PublicScreens = () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name={SCREENS.HOME}
            options={defaultScreenOptions}
            component={SignInPage}
        />
        <RootStack.Screen
            name={SCREENS.TRANSITION_FROM_OLD_DOT}
            options={defaultScreenOptions}
            component={LogInWithShortLivedTokenPage}
        />
        <RootStack.Screen
            name="ValidateLogin"
            options={defaultScreenOptions}
            component={ValidateLoginPage}
        />
        <RootStack.Screen
            name="SetPassword"
            options={defaultScreenOptions}
            component={SetPasswordPage}
        />
    </RootStack.Navigator>
);

PublicScreens.displayName = 'PublicScreens';
export default PublicScreens;
