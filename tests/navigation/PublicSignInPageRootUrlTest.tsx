import {NavigationContainer} from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import PublicScreens from '@libs/Navigation/AppNavigator/PublicScreens';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Stub every public page so the test mounts the real `PublicScreens` navigator (the thing under test)
 * without dragging in each page's provider tree. Only the route-name → component wiring matters here.
 */
const makeStub = (testID: string) => () => <View testID={testID} />;

jest.mock('@pages/signin/SignInPage', () => makeStub('sign-in-page'));
jest.mock('@pages/ConnectionCompletePage', () => makeStub('connection-complete-page'));
jest.mock('@pages/LogInWithShortLivedAuthTokenPage', () => makeStub('login-with-short-lived-token-page'));
jest.mock('@pages/signin/SAMLSignInPage', () => makeStub('saml-sign-in-page'));
jest.mock('@pages/UnlinkLoginPage', () => makeStub('unlink-login-page'));
jest.mock('@pages/ValidateLoginPage', () => makeStub('validate-login-page'));
jest.mock('@libs/Navigation/AppNavigator/Navigators/TestToolsModalNavigator', () => makeStub('test-tools-modal-navigator'));

// The navigator-level hooks reach for theme/style context; stub them so we don't need the provider tree.
jest.mock('@libs/Navigation/AppNavigator/useRootNavigatorScreenOptions', () => () => ({basicModalNavigator: {}}));
jest.mock('@hooks/useTheme', () => () => ({overlay: '#000000'}));
jest.mock('@hooks/useStyleUtils', () => () => ({getBackgroundColorWithOpacityStyle: () => ({})}));

/**
 * Regression guard for the logged-out sign-in page URL.
 *
 * `PublicScreens` registers the SignInPage under NAVIGATORS.TAB_NAVIGATOR (mirroring the authenticated
 * top-level navigator) instead of SCREENS.HOME. Because TAB_NAVIGATOR has no path of its own, the
 * logged-out URL resolves to the root "/" instead of "/Home".
 *
 * Before the fix the SignInPage was registered as the top-level SCREENS.HOME, which has no root-level
 * path mapping, so React Navigation derived "/Home" from the screen name.
 */
describe('PublicScreens - sign-in page root URL', () => {
    it('renders the SignInPage for the TAB_NAVIGATOR root route and keeps the URL at "/"', () => {
        render(
            <NavigationContainer ref={navigationRef}>
                <PublicScreens />
            </NavigationContainer>,
        );

        // The public root route is named TAB_NAVIGATOR and renders the SignInPage component.
        expect(screen.getByTestId('sign-in-page')).toBeOnTheScreen();

        const rootState = navigationRef.getRootState();
        expect(rootState.routes.at(0)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);

        // TAB_NAVIGATOR has no path of its own, so the logged-out address bar stays at the root.
        expect(getPathFromState(rootState)).toBe('/');
    });

    it('does NOT register the SignInPage under SCREENS.HOME (the source of the old "/Home" URL)', () => {
        render(
            <NavigationContainer ref={navigationRef}>
                <PublicScreens />
            </NavigationContainer>,
        );

        expect(navigationRef.getRootState().routeNames).not.toContain(SCREENS.HOME);
    });
});
