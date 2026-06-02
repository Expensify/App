import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import ValidateLoginPage from '@pages/ValidateLoginPage/index.web';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Controllable deferred so tests can assert the *ordering* guarantee (navigate only after
// protected routes are available) — not just the final args.
const mockWaitForProtectedRoutes = {resolve: () => {}};

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    waitForProtectedRoutes: jest.fn(
        () =>
            new Promise<void>((resolve) => {
                mockWaitForProtectedRoutes.resolve = resolve;
            }),
    ),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isActiveRoute: jest.fn(() => false),
}));

const RootStack = createPlatformStackNavigator<PublicScreensParamList>();

const renderPage = (initialParams: PublicScreensParamList[typeof SCREENS.VALIDATE_LOGIN]) => {
    return render(
        <NavigationContainer>
            <RootStack.Navigator>
                <RootStack.Screen
                    name={SCREENS.VALIDATE_LOGIN}
                    component={ValidateLoginPage}
                    initialParams={initialParams}
                />
            </RootStack.Navigator>
        </NavigationContainer>,
    );
};

describe('ValidateLoginPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockWaitForProtectedRoutes.resolve = () => {};
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('Should show not found view when the magic code is invalid and there is an exitTo param', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.NOT_STARTED,
            });
        });

        renderPage({accountID: '1', validateCode: 'ABCDEF', exitTo: 'concierge'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('validate-code-not-found')).not.toBeNull();
    });

    it('Should not show ValidateCodeModal when signed in and there is an exitTo param', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                authToken: 'abcd',
                autoAuthState: CONST.AUTO_AUTH_STATE.NOT_STARTED,
            });
        });

        renderPage({accountID: '1', validateCode: '123456', exitTo: 'concierge'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('validate-code')).toBeNull();
    });

    it('Should navigate to home only AFTER protected routes are available (separate-session magic link)', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                authToken: 'abcd',
                autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN,
            });
            await Onyx.set(ONYXKEYS.CREDENTIALS, {
                accountID: 1,
                validateCode: '123456',
            });
        });

        renderPage({accountID: '1', validateCode: '123456'});
        await waitForBatchedUpdatesWithAct();

        // Protected routes have not mounted yet: navigating now is the exact race,
        // so navigate must NOT have been called. (This assertion fails for both the old
        // isNavigationReady().then(goBack) and an unguarded navigate.)
        expect(Navigation.navigate).not.toHaveBeenCalled();

        await act(async () => {
            mockWaitForProtectedRoutes.resolve();
            await Promise.resolve();
        });
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME, {forceReplace: true});
    });

    it('Should not navigate to home when a signed-in session opens /v/ to view the code (autoAuthState !== JUST_SIGNED_IN)', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                authToken: 'abcd',
                autoAuthState: CONST.AUTO_AUTH_STATE.NOT_STARTED,
            });
        });

        renderPage({accountID: '1', validateCode: '123456'});
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.HOME, {forceReplace: true});
        expect(screen.getByTestId('validate-code')).toBeOnTheScreen();
    });

    it('Should keep the loading indicator (not blank) when JUST_SIGNED_IN but authToken has not landed yet', async () => {
        // autoAuthState arrives before authToken (separate Onyx broadcasts), so there is a tick
        // where autoAuthState === JUST_SIGNED_IN but isSignedIn is false. Without the fix every
        // guard fails and the page is blank; the loader must stay up.
        await act(async () => {
            await Onyx.set(ONYXKEYS.CREDENTIALS, {
                accountID: 1,
                validateCode: '123456',
            });
        });

        // Mount first (autoAuthState NOT_STARTED → shows the magic-code screen).
        renderPage({accountID: '1', validateCode: '123456'});
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('validate-code')).toBeOnTheScreen();

        // First cross-tab broadcast: autoAuthState flips, authToken not delivered yet.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN,
            });
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('validate-login-loading')).toBeOnTheScreen();
        expect(screen.queryByTestId('validate-code')).toBeNull();
        // Not signed in yet, so we must not redirect prematurely.
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.HOME, {forceReplace: true});
    });

    it('Should show the 2FA-required prompt (not an infinite loader) for a separate-session sign-in needing 2FA', async () => {
        // Separate session: no cached `login`, signed in via the link but 2FA is required so authToken
        // never lands. Without the fix isCompletingDirectSignIn keeps the loader up forever; instead we
        // must surface the "2FA required" prompt and never redirect Home.
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
            await Onyx.set(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN,
            });
        });

        renderPage({accountID: '1', validateCode: '123456'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('validate-login-loading')).toBeNull();
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.HOME, {forceReplace: true});
    });
});
