import {act, render, waitFor} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PublicScreensParamList} from '@libs/Navigation/types';

import UnlinkLoginPage from '@pages/UnlinkLoginPage';

import {unlinkLogin} from '@userActions/Session';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Controllable deferred for isNavigationReady() so tests can resolve it on demand — and, for the
// stale-callback guard, resolve it *after* the page unmounts to prove the reset is skipped.
const mockIsNavigationReady = {resolve: () => {}};

// Standalone fn so assertions don't access `navigationRef.reset` unbound (unbound-method lint rule).
const mockNavigationReset = jest.fn();

// Standalone fn so `navigationRef.current.canGoBack` can be reconfigured per test.
const mockCanGoBack = jest.fn(() => false);

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    isNavigationReady: jest.fn(
        () =>
            new Promise<void>((resolve) => {
                mockIsNavigationReady.resolve = resolve;
            }),
    ),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isActiveRoute: jest.fn(() => false),
    // Dereference inside the closures (not at factory time) — the factory runs before the consts
    // above are initialized, so capturing them directly would freeze `undefined`.
    navigationRef: {
        current: {
            canGoBack: () => mockCanGoBack(),
        },
        reset: (...args: unknown[]) => {
            mockNavigationReset(...args);
        },
        isReady: () => true,
    },
}));

jest.mock('@userActions/Session', () => ({
    unlinkLogin: jest.fn(),
}));

const RootStack = createPlatformStackNavigator<PublicScreensParamList>();

const renderPage = (initialParams: PublicScreensParamList[typeof SCREENS.UNLINK_LOGIN]) => {
    return render(
        <NavigationContainer>
            <RootStack.Navigator>
                <RootStack.Screen
                    name={SCREENS.UNLINK_LOGIN}
                    component={UnlinkLoginPage}
                    initialParams={initialParams}
                />
            </RootStack.Navigator>
        </NavigationContainer>,
    );
};

describe('UnlinkLoginPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsNavigationReady.resolve = () => {};
        mockCanGoBack.mockReturnValue(false);
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('calls unlinkLogin on mount with the route params', async () => {
        renderPage({accountID: '1', validateCode: 'ABCDEF'});
        await waitForBatchedUpdatesWithAct();

        expect(unlinkLogin).toHaveBeenCalledWith(1, 'ABCDEF');
    });

    it('resets the stack to TAB_NAVIGATOR when the request settles on a fresh tab (canGoBack is false)', async () => {
        // Fresh tab opened from the unlink email: UNLINK_LOGIN is the only route, so canGoBack() is false.
        renderPage({accountID: '1', validateCode: 'ABCDEF'});
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
        });
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, message: 'unlinkLoginForm.successfullyUnlinkedLogin'});
        });
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.goBack).not.toHaveBeenCalled();

        // Resolve the navigation-ready gate, then the effect resets the public stack to SignInPage.
        await act(async () => {
            mockIsNavigationReady.resolve();
            await Promise.resolve();
        });
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigationReset).toHaveBeenCalledWith({index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]});
    });

    it('calls goBack instead of resetting when a pop is possible (native/pushed-stack behaviour)', async () => {
        // A native deep link pushes UNLINK_LOGIN onto the app's existing stack, so canGoBack() is true.
        mockCanGoBack.mockReturnValue(true);

        renderPage({accountID: '1', validateCode: 'ABCDEF'});
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
        });
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, message: 'unlinkLoginForm.successfullyUnlinkedLogin'});
        });
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(Navigation.goBack).toHaveBeenCalled();
        });
        expect(mockNavigationReset).not.toHaveBeenCalled();
    });

    it('does not reset the stack when the page unmounts before navigation is ready (stale-callback guard)', async () => {
        const {unmount} = renderPage({accountID: '1', validateCode: 'ABCDEF'});
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
        });
        await waitForBatchedUpdatesWithAct();

        // Transition to settled: this fires the completion effect, which calls isNavigationReady()
        // and starts the pending promise.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});
        });
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
