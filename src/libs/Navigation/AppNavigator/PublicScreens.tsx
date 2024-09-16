import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {NativeModules} from 'react-native';
import type {PublicScreensParamList} from '@navigation/types';
import ConnectionCompletePage from '@pages/ConnectionCompletePage';
import SessionExpiredPage from '@pages/ErrorPage/SessionExpiredPage';
import LogInWithShortLivedAuthTokenPage from '@pages/LogInWithShortLivedAuthTokenPage';
import AppleSignInDesktopPage from '@pages/signin/AppleSignInDesktopPage';
import GoogleSignInDesktopPage from '@pages/signin/GoogleSignInDesktopPage';
import SAMLSignInPage from '@pages/signin/SAMLSignInPage';
import SignInPage from '@pages/signin/SignInPage';
import UnlinkLoginPage from '@pages/UnlinkLoginPage';
import ValidateLoginPage from '@pages/ValidateLoginPage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import defaultScreenOptions from './defaultScreenOptions';

const RootStack = createStackNavigator<PublicScreensParamList>();

function PublicScreens() {
    return (
        <RootStack.Navigator>
            {/* The structure for the HOME route has to be the same in public and auth screens. That's why the name for SignInPage is BOTTOM_TAB_NAVIGATOR. */}
            <RootStack.Screen
                name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
                options={defaultScreenOptions}
                component={NativeModules.HybridAppModule ? SessionExpiredPage : SignInPage}
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
                name={SCREENS.CONNECTION_COMPLETE}
                options={defaultScreenOptions}
                component={ConnectionCompletePage}
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
                name={SCREENS.SAML_SIGN_IN}
                options={defaultScreenOptions}
                component={SAMLSignInPage}
            />
        </RootStack.Navigator>
    );
}

PublicScreens.displayName = 'PublicScreens';

export default PublicScreens;
