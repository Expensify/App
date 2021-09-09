import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import SetPasswordPage from '../../../pages/SetPasswordPage';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import SCREENS from '../../../SCREENS';
import LoginWithValidateCodePage from '../../../pages/LoginWithValidateCodePage';
import LoginWithValidateCode2FAPage from '../../../pages/LoginWithValidateCode2FAPage';
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
            name={SCREENS.LOGIN_WITH_VALIDATE_CODE_NEW_WORKSPACE}
            options={defaultScreenOptions}
            component={LoginWithValidateCodePage}
        />
        <RootStack.Screen
            name={SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE}
            options={defaultScreenOptions}
            component={LoginWithValidateCode2FAPage}
        />
        <RootStack.Screen
            name={SCREENS.LOGIN_WITH_VALIDATE_CODE_WORKSPACE_CARD}
            options={defaultScreenOptions}
            component={LoginWithValidateCodePage}
        />
        <RootStack.Screen
            name={SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_WORKSPACE_CARD}
            options={defaultScreenOptions}
            component={LoginWithValidateCode2FAPage}
        />
    </RootStack.Navigator>
);
