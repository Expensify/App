import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SignInPage from '../../../pages/signin/SignInPage';
import ValidateLoginPage from '../../../pages/ValidateLoginPage';
import LogInWithShortLivedAuthTokenPage from '../../../pages/LogInWithShortLivedAuthTokenPage';
import SCREENS from '../../../SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import UnlinkLoginPage from '../../../pages/UnlinkLoginPage';
import AppleSignInDesktopPage from '../../../pages/signin/AppleSignInDesktopPage';
import GoogleSignInDesktopPage from '../../../pages/signin/GoogleSignInDesktopPage';
import {PublicScreensStackParamList} from './types';

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
        </RootStack.Navigator>
    );
}

PublicScreens.displayName = 'PublicScreens';
export default PublicScreens;
