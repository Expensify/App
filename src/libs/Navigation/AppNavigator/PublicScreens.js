import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
import PublicWorkspaceNewView from '../../../pages/workspace/PublicWorkspaceNewView';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import SCREENS from '../../../SCREENS';
import ValidateLoginNewWorkspacePage from '../../../pages/ValidateLoginNewWorkspacePage';
import ValidateLogin2FANewWorkspacePage from '../../../pages/ValidateLogin2FANewWorkspacePage';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator();

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
        <RootStack.Screen
            name={SCREENS.VALIDATE_LOGIN_NEW_WORKSPACE}
            options={defaultScreenOptions}
            component={ValidateLoginNewWorkspacePage}
        />
        <RootStack.Screen
            name={SCREENS.VALIDATE_LOGIN_2FA_NEW_WORKSPACE}
            options={defaultScreenOptions}
            component={ValidateLogin2FANewWorkspacePage}
        />
        <RootStack.Screen
            name={SCREENS.VALIDATE_LOGIN_WORKSPACE_CARD}
            options={defaultScreenOptions}
            component={ValidateLoginNewWorkspacePage}
        />
        <RootStack.Screen
            name={SCREENS.VALIDATE_LOGIN_2FA_WORKSPACE_CARD}
            options={defaultScreenOptions}
            component={ValidateLogin2FANewWorkspacePage}
        />
    </RootStack.Navigator>
);
