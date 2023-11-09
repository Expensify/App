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
import type {PublicScreensStackParamList} from './types';

const RootStack = createStackNavigator<PublicScreensStackParamList>();

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
                name={SCREENS.VALIDATE_LOGIN}
                options={defaultScreenOptions}
                component={ValidateLoginPage}
            />
            <RootStack.Screen
                name={SCREENS.UNLINK_LOGIN}
                options={defaultScreenOptions}
                component={UnlinkLoginPage}
            />
            <RootStack.Screen
                name={SCREENS.SIGN_IN_WITH_APPLE_DESKTOP}
                options={defaultScreenOptions}
                component={AppleSignInDesktopPage}
            />
            <RootStack.Screen
                name={SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP}
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
