import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
import PublicWorkspaceNewView from '../../../pages/workspace/PublicWorkspaceNewView';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import SCREENS from '../../../SCREENS';

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
            name={SCREENS.HOME}
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
            component={SetPasswordPage}
        />
        <RootStack.Screen
            name="NewWorkspace"
            component={PublicWorkspaceNewView}
        />
    </RootStack.Navigator>
);
