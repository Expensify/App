import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
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
            name={SCREENS.LOG_IN_WITH_SHORT_LIVED_TOKEN}
            options={defaultScreenOptions}
            component={LogInWithShortLivedTokenPage}
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
