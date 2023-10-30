import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import LogInWithShortLivedAuthTokenPage from '@pages/LogInWithShortLivedAuthTokenPage';
import AppleSignInDesktopPage from '@pages/signin/AppleSignInDesktopPage';
import GoogleSignInDesktopPage from '@pages/signin/GoogleSignInDesktopPage';
import SAMLSignInPage from '@pages/signin/SAMLSignInPage';
import SignInPage from '@pages/signin/SignInPage';
import UnlinkLoginPage from '@pages/UnlinkLoginPage';
import ValidateLoginPage from '@pages/ValidateLoginPage';
import SCREENS from '@src/SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator();

function PublicScreens() {
    return (
        <RootStack.Navigator>
            <RootStack.Screen
                name={SCREENS.HOME}
                options={defaultScreenOptions}
                component={SignInPage}
            />
            <RootStack.Screen
                name={SCREENS.TRANSITION_BETWEEN_APPS}
                options={defaultScreenOptions}
                component={LogInWithShortLivedAuthTokenPage}
            />
            <RootStack.Screen
                name="ValidateLogin"
                options={defaultScreenOptions}
                component={ValidateLoginPage}
            />
            <RootStack.Screen
                name="UnlinkLogin"
                options={defaultScreenOptions}
                component={UnlinkLoginPage}
            />
            <RootStack.Screen
                name="AppleSignInDesktop"
                options={defaultScreenOptions}
                component={AppleSignInDesktopPage}
            />
            <RootStack.Screen
                name="GoogleSignInDesktop"
                options={defaultScreenOptions}
                component={GoogleSignInDesktopPage}
            />
            <RootStack.Screen
                name="SAMLSignIn"
                options={defaultScreenOptions}
                component={SAMLSignInPage}
            />
        </RootStack.Navigator>
    );
}

PublicScreens.displayName = 'PublicScreens';
export default PublicScreens;
