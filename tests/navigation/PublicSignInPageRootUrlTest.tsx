import {render, screen} from '@testing-library/react-native';

import PublicScreens from '@libs/Navigation/AppNavigator/PublicScreens';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

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

    it('redirects a legacy "/Home" URL to the root "/"', () => {
        expect(getPathFromState(getAdaptedStateFromPath('/Home', undefined))).toBe('/');
    });
});
