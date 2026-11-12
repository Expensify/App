import {act, render, screen} from '@testing-library/react-native';

import {cleanupSession} from '@libs/actions/Session';
import PublicScreens from '@libs/Navigation/AppNavigator/PublicScreens';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// SignInPage is the initial (and only rendered) public route, so it gets a findable testID. The `mock`
// prefix is required for the hoisted jest.mock factory to reference it; a function declaration hoists too,
// so there's no temporal-dead-zone risk when the factory runs.
function mockSignInPage() {
    return <View testID="sign-in-page" />;
}

// Stub the public pages so the test can mount the real PublicScreens navigator without their provider trees.
jest.mock('@pages/signin/SignInPage', () => mockSignInPage);
jest.mock('@pages/ConnectionCompletePage', () => () => null);
jest.mock('@pages/LogInWithShortLivedAuthTokenPage', () => () => null);
jest.mock('@pages/signin/SAMLSignInPage', () => () => null);
jest.mock('@pages/UnlinkLoginPage', () => () => null);
jest.mock('@pages/ValidateLoginPage', () => () => null);
jest.mock('@libs/Navigation/AppNavigator/Navigators/TestToolsModalNavigator', () => () => null);
jest.mock('@libs/Navigation/AppNavigator/useRootNavigatorScreenOptions', () => () => ({basicModalNavigator: {}}));
jest.mock('@hooks/useTheme', () => () => ({overlay: '#000000'}));
jest.mock('@hooks/useStyleUtils', () => () => ({getBackgroundColorWithOpacityStyle: () => ({})}));

describe('Logged-out sign-in page URL', () => {
    it('returns to sign-in without an unhandled reset when session cleanup settles after public navigation mounts', async () => {
        // Given session teardown waits for navigation while the logged-out navigator is already active
        const ready = Promise.withResolvers<void>();
        const readiness = jest.spyOn(Navigation, 'isNavigationReady').mockReturnValueOnce(ready.promise);
        const onUnhandledAction = jest.fn();
        render(
            <NavigationContainer
                ref={navigationRef}
                initialState={{index: 0, routes: [{name: SCREENS.SAML_SIGN_IN}]}}
                onUnhandledAction={onUnhandledAction}
            >
                <PublicScreens />
            </NavigationContainer>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the real session cleanup completes its queued navigation reset
        cleanupSession();
        await act(async () => ready.resolve());
        await waitForBatchedUpdatesWithAct();
        readiness.mockRestore();

        // Then the registered sign-in root is shown at the canonical URL without dispatching an invalid reset
        expect(onUnhandledAction).not.toHaveBeenCalled();
        expect(screen.getByTestId('sign-in-page')).toBeOnTheScreen();
        expect(navigationRef.getRootState().routes.at(0)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(getPathFromState(navigationRef.getRootState())).toBe('/');
    });

    it('renders the SignInPage at the root "/" (registered under TAB_NAVIGATOR, which has no path)', () => {
        render(
            <NavigationContainer ref={navigationRef}>
                <PublicScreens />
            </NavigationContainer>,
        );

        expect(screen.getByTestId('sign-in-page')).toBeOnTheScreen();

        const rootState = navigationRef.getRootState();
        expect(rootState.routes.at(0)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(getPathFromState(rootState)).toBe('/');
    });

    it('redirects a legacy "/Home" URL to the canonical "/home"', () => {
        expect(getPathFromState(getAdaptedStateFromPath('/Home', undefined))).toBe('/home');
    });
});
