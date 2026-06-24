import React from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations, {InternalPlatformAnimations} from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PublicScreensParamList} from '@navigation/types';
import ConnectionCompletePage from '@pages/ConnectionCompletePage';
import LogInWithShortLivedAuthTokenPage from '@pages/LogInWithShortLivedAuthTokenPage';
import SAMLSignInPage from '@pages/signin/SAMLSignInPage';
import SignInPage from '@pages/signin/SignInPage';
import UnlinkLoginPage from '@pages/UnlinkLoginPage';
import ValidateLoginPage from '@pages/ValidateLoginPage';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import defaultScreenOptions from './defaultScreenOptions';
import TestToolsModalNavigator from './Navigators/TestToolsModalNavigator';
import useRootNavigatorScreenOptions from './useRootNavigatorScreenOptions';

const RootStack = createPlatformStackNavigator<PublicScreensParamList>();

function PublicScreens() {
    const rootNavigatorScreenOptions = useRootNavigatorScreenOptions();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    return (
        <RootStack.Navigator screenOptions={defaultScreenOptions}>
            {/* SignInPage is registered under TAB_NAVIGATOR (the authenticated top-level navigator name) so the public and auth */}
            {/* root structures match. TAB_NAVIGATOR has no path of its own, so the logged-out URL stays at the root "/". */}
            <RootStack.Screen
                name={NAVIGATORS.TAB_NAVIGATOR}
                options={{
                    ...defaultScreenOptions,
                    // If you want to change this, make sure there aren't any animation bugs when signing out.
                    // This was put here to prevent excessive animations when resetting the navigation state in `resetNavigationState`
                    animation: Animations.NONE,
                }}
                component={SignInPage}
            />
            <RootStack.Screen
                name={SCREENS.TRANSITION_BETWEEN_APPS}
                component={LogInWithShortLivedAuthTokenPage}
            />
            <RootStack.Screen
                name={SCREENS.VALIDATE_LOGIN}
                options={defaultScreenOptions}
                component={ValidateLoginPage}
            />
            <RootStack.Screen
                name={SCREENS.CONNECTION_COMPLETE}
                component={ConnectionCompletePage}
            />
            <RootStack.Screen
                name={SCREENS.BANK_CONNECTION_COMPLETE}
                component={ConnectionCompletePage}
            />
            <RootStack.Screen
                name={SCREENS.UNLINK_LOGIN}
                component={UnlinkLoginPage}
            />
            <RootStack.Screen
                name={SCREENS.SAML_SIGN_IN}
                options={{gestureEnabled: false}}
                component={SAMLSignInPage}
            />
            <RootStack.Screen
                name={NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR}
                options={{
                    ...rootNavigatorScreenOptions.basicModalNavigator,
                    native: {
                        contentStyle: {
                            ...StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, 0.72),
                        },
                        animation: InternalPlatformAnimations.FADE,
                    },
                    web: {
                        cardStyle: {
                            ...StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, 0.72),
                        },
                        animation: InternalPlatformAnimations.FADE,
                    },
                }}
                component={TestToolsModalNavigator}
            />
        </RootStack.Navigator>
    );
}

export default PublicScreens;
