import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';
import ValidateLoginPage from '@pages/ValidateLoginPage/index.web';
import {handleExitToNavigation} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Controllable deferred so tests can assert the *ordering* guarantee (navigate only after
// protected routes are available) — not just the final args.
const mockWaitForProtectedRoutes = {resolve: () => {}};

// Controllable deferred for isNavigationReady() so tests can resolve it on demand — and, for the
// stale-callback guard, resolve it *after* the page unmounts to prove the reset is skipped.
const mockIsNavigationReady = {resolve: () => {}};

// Standalone fn so assertions don't access `navigationRef.reset` unbound (unbound-method lint rule).
const mockNavigationReset = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(
        () =>
            new Promise<void>((resolve) => {
                mockIsNavigationReady.resolve = resolve;
            }),
    ),
    waitForProtectedRoutes: jest.fn(
        () =>
            new Promise<void>((resolve) => {
                mockWaitForProtectedRoutes.resolve = resolve;
            }),
    ),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isActiveRoute: jest.fn(() => false),
    // Dereference inside the closure (not at factory time) — the factory runs before the const below
    // is initialized, so capturing `mockNavigationReset` directly would freeze `undefined`.
    navigationRef: {
        reset: (...args: unknown[]) => {
            mockNavigationReset(...args);
        },
        isReady: () => true,
    },
}));

// Mock the session actions the page calls so `signInWithValidateCode` doesn't hit the API and the
// deferred `handleExitToNavigation` handoff can be asserted.
jest.mock('@userActions/Session', () => ({
    initAutoAuthState: jest.fn(),
    signInWithValidateCode: jest.fn(),
    handleExitToNavigation: jest.fn(),
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
        mockIsNavigationReady.resolve = () => {};
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

    it('Should show the 2FA-required prompt (not an infinite loader) when 2FA is needed and no validate code is cached', async () => {
        // Genuinely-stuck fallback: 2FA is required but there's no cached `credentials.validateCode`, so
        // the sign-in page can't render the authenticator stage and there's nowhere to send the user.
        // Surface the informational "2FA required" prompt and never redirect Home or loop on a loader.
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
            await Onyx.set(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN,
            });
        });

        renderPage({accountID: '1', validateCode: '123456'});
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('validate-login-loading')).toBeNull();
        expect(mockNavigationReset).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.HOME, {forceReplace: true});
    });

    it('Should redirect to the sign-in page to enter the 2FA code when a validate code is cached', async () => {
        // Initiating browser: the magic-link attempt stored `credentials.validateCode` and 2FA is
        // required. SignInPage reuses that code to render the authenticator-code stage, so we replace
        // the consumed /v/ route with the sign-in page instead of the dead-end "2FA required" modal.
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
            await Onyx.set(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN,
            });
            await Onyx.set(ONYXKEYS.CREDENTIALS, {
                accountID: 1,
                validateCode: '123456',
            });
        });

        renderPage({accountID: '1', validateCode: '123456'});
        await waitForBatchedUpdatesWithAct();

        // Resolve the navigation-ready gate, then the effect resets the public stack to the SignInPage.
        await act(async () => {
            mockIsNavigationReady.resolve();
            await Promise.resolve();
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigationReset).toHaveBeenCalledWith({index: 0, routes: [{name: SCREENS.HOME}]});
    });

    it('Should route an exitTo 2FA magic link to the sign-in page AND keep the deferred exitTo navigation', async () => {
        // exitTo deep link on a 2FA account: the user must still reach the authenticator form (not the
        // dead-end "2FA required" modal), so we reset to the sign-in page. We also register
        // handleExitToNavigation so that once 2FA completes and the authToken lands, the user is taken
        // to their deep-link destination instead of being dropped on Home.
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
            await Onyx.set(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN,
            });
            await Onyx.set(ONYXKEYS.CREDENTIALS, {
                accountID: 1,
                validateCode: '123456',
            });
        });

        renderPage({accountID: '1', validateCode: '123456', exitTo: 'concierge'});
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            mockIsNavigationReady.resolve();
            await Promise.resolve();
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigationReset).toHaveBeenCalledWith({index: 0, routes: [{name: SCREENS.HOME}]});
        expect(handleExitToNavigation).toHaveBeenCalledWith('concierge');
    });

    it('Should not reset to the sign-in page when the page unmounts before navigation is ready (stale-callback guard)', async () => {
        // PERF-15 cleanup: if the effect tears down (deps change / unmount) before isNavigationReady()
        // resolves, the pending callback must bail instead of resetting the stack out from under the
        // screen that replaced it.
        await act(async () => {
            await Onyx.set(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
            await Onyx.set(ONYXKEYS.SESSION, {
                autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN,
            });
            await Onyx.set(ONYXKEYS.CREDENTIALS, {
                accountID: 1,
                validateCode: '123456',
            });
        });

        const {unmount} = renderPage({accountID: '1', validateCode: '123456'});
        await waitForBatchedUpdatesWithAct();

        // isNavigationReady() is still pending. Unmounting runs the effect cleanup (sets `ignore = true`).
        await act(async () => {
            unmount();
        });

        // Resolving now fires the stale callback, which must skip the reset.
        await act(async () => {
            mockIsNavigationReady.resolve();
            await Promise.resolve();
        });

        expect(mockNavigationReset).not.toHaveBeenCalled();
    });
});
